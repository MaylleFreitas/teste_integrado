import React, { useState, useEffect } from 'react';
import {
  ExperimentStage,
  ParticipantSession,
  AudioPairResponse,
  MapClickResponse,
  SociodemographicData,
  AudioPairTrial,
  MapAudioTrial,
  GasExperimentConfig
} from './types';
import { DEFAULT_AUDIO_PAIRS, DEFAULT_MAP_TRIALS } from './data/defaultExperiment';
import { Navbar } from './components/Navbar';
import { LoadingScreen } from './components/LoadingScreen';
import { ClosedExperimentScreen } from './components/ClosedExperimentScreen';
import { TCLE } from './components/TCLE';
import { AudioComparisonTrial } from './components/AudioComparisonTrial';
import { BrazilMapTask } from './components/BrazilMapTask';
import { SociodemographicQuestionnaire } from './components/SociodemographicQuestionnaire';
import { CompletionScreen } from './components/CompletionScreen';
import { fetchExperimentConfigAndQuestions, submitParticipantSession } from './utils/googleAppsScript';

/**
 * Fisher-Yates shuffle algorithm to generate a randomized copy of trials
 */
function shuffleList<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = copy[i];
    copy[i] = copy[j];
    copy[j] = temp;
  }
  return copy;
}

export default function App() {
  // App initialization states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isClosed, setIsClosed] = useState<boolean>(false);
  const [experimentConfig, setExperimentConfig] = useState<GasExperimentConfig>({
    status: 'aberto',
    tituloPesquisa: 'Experimento de Percepção Auditiva',
    instituicao: 'Universidade Estadual de Campinas (UNICAMP)',
    mensagemFechado: 'Esta pesquisa foi encerrada e não está mais recebendo novas respostas. Agradecemos pelo seu interesse e colaboração!',
    contatoPesquisador: 'contato.experimento.linguistica@unicamp.br'
  });

  // Current participant progression stage (fixed section order)
  const [currentStage, setCurrentStage] = useState<ExperimentStage>('tcle');

  // Master questions fetched dynamically from Google Sheets
  const [audioPairsMaster, setAudioPairsMaster] = useState<AudioPairTrial[]>(DEFAULT_AUDIO_PAIRS);
  const [mapTrialsMaster, setMapTrialsMaster] = useState<MapAudioTrial[]>(DEFAULT_MAP_TRIALS);

  // Active session trial sequences (randomized WITHIN each section per participant)
  const [sessionAudioPairs, setSessionAudioPairs] = useState<AudioPairTrial[]>([]);
  const [sessionMapTrials, setSessionMapTrials] = useState<MapAudioTrial[]>([]);

  // Submission status to Google Apps Script
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'submitting' | 'success' | 'error'>('pending');
  const [submissionMessage, setSubmissionMessage] = useState<string>('');

  // Active session state
  const [sessionData, setSessionData] = useState<ParticipantSession>(() => ({
    sessionId: `part-${Math.random().toString(36).substring(2, 9)}`,
    startTime: new Date().toISOString(),
    tcleAccepted: false,
    presentedOrderAudioPairs: [],
    presentedOrderMapTrials: [],
    audioPairResponses: [],
    mapClickResponses: [],
    sociodemographic: {}
  }));

  // Initial load: Fetch settings ("Configurações") and questions ("Perguntas") from Google Apps Script
  useEffect(() => {
    let isMounted = true;

    async function initializeExperiment() {
      setIsLoading(true);
      try {
        const payload = await fetchExperimentConfigAndQuestions();
        if (!isMounted) return;

        setExperimentConfig(payload.config);

        if (payload.config.status === 'fechado') {
          setIsClosed(true);
          setIsLoading(false);
          return;
        }

        if (payload.sections.audioPairs && payload.sections.audioPairs.length > 0) {
          setAudioPairsMaster(payload.sections.audioPairs);
        }
        if (payload.sections.mapTrials && payload.sections.mapTrials.length > 0) {
          setMapTrialsMaster(payload.sections.mapTrials);
        }
      } catch (err) {
        console.error('Failed to initialize experiment configuration:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initializeExperiment();

    return () => {
      isMounted = false;
    };
  }, []);

  // Section 1: TCLE Accepted Handler
  const handleAcceptTCLE = () => {
    // 1. Randomize order of Audio Pairs WITHIN Section 2
    const shuffledPairs = shuffleList<AudioPairTrial>(audioPairsMaster).map((pair, idx): AudioPairTrial => ({
      ...pair,
      pairIndex: idx + 1
    }));
    setSessionAudioPairs(shuffledPairs);
    const audioOrderIds = shuffledPairs.map((p) => p.id);

    // 2. Randomize order of Map Trials WITHIN Section 3
    const shuffledMaps = shuffleList<MapAudioTrial>(mapTrialsMaster).map((m, idx): MapAudioTrial => ({
      ...m,
      trialIndex: idx + 1
    }));
    setSessionMapTrials(shuffledMaps);
    const mapOrderIds = shuffledMaps.map((m) => m.id);

    // 3. Record exact presentation order in session state for statistical control
    setSessionData((prev) => ({
      ...prev,
      tcleAccepted: true,
      tcleAcceptedAt: new Date().toISOString(),
      presentedOrderAudioPairs: audioOrderIds,
      presentedOrderMapTrials: mapOrderIds
    }));

    // Proceed to Section 2
    setCurrentStage('linguistic_pairs');
  };

  const handleDeclineTCLE = () => {
    // Participant decided not to proceed
  };

  // Section 2: Audio Comparison handler
  const handleAudioPairsComplete = (responses: AudioPairResponse[]) => {
    setSessionData((prev) => ({
      ...prev,
      audioPairResponses: responses
    }));
    // Proceed to Section 3 (Map)
    setCurrentStage('map_geolocation');
  };

  // Section 3: Map Geolocation handler
  const handleMapTaskComplete = (responses: MapClickResponse[]) => {
    setSessionData((prev) => ({
      ...prev,
      mapClickResponses: responses
    }));
    // Proceed to Section 4 (Sociodemographic)
    setCurrentStage('sociodemographic');
  };

  // Section 4: Sociodemographic Questionnaire handler -> POST to Google Sheets
  const handleSociodemographicComplete = async (socData: SociodemographicData) => {
    const completedSession: ParticipantSession = {
      ...sessionData,
      endTime: new Date().toISOString(),
      sociodemographic: socData
    };

    setSessionData(completedSession);
    setCurrentStage('completed');
    setSubmissionStatus('submitting');

    // Transmit complete responses and randomized order to Google Apps Script (tab "Respostas")
    try {
      const result = await submitParticipantSession(completedSession);
      if (result.success) {
        setSubmissionStatus('success');
        setSubmissionMessage(result.message || 'Dados registrados com sucesso na planilha da pesquisa.');
      } else {
        setSubmissionStatus('error');
        setSubmissionMessage(result.message || 'Dados salvos localmente.');
      }
    } catch {
      setSubmissionStatus('error');
      setSubmissionMessage('Respostas arquivadas no dispositivo do participante.');
    }

    // Also persist in localStorage as a resilient secondary client-side backup
    try {
      const previousRaw = localStorage.getItem('auditory_experiment_sessions');
      const previousList = previousRaw ? JSON.parse(previousRaw) : [];
      localStorage.setItem('auditory_experiment_sessions', JSON.stringify([completedSession, ...previousList]));
    } catch {
      // ignore
    }
  };

  // Restart for a new participant session
  const handleRestart = () => {
    setSessionData({
      sessionId: `part-${Math.random().toString(36).substring(2, 9)}`,
      startTime: new Date().toISOString(),
      tcleAccepted: false,
      presentedOrderAudioPairs: [],
      presentedOrderMapTrials: [],
      audioPairResponses: [],
      mapClickResponses: [],
      sociodemographic: {}
    });
    setSessionAudioPairs([]);
    setSessionMapTrials([]);
    setSubmissionStatus('pending');
    setCurrentStage('tcle');
  };

  // 1. Initial Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
        <Navbar currentStage="tcle" title={experimentConfig.tituloPesquisa} institution={experimentConfig.instituicao} />
        <main className="flex-1 flex items-center justify-center p-4">
          <LoadingScreen />
        </main>
      </div>
    );
  }

  // 2. Closed Experiment Screen (when spreadsheet status is "fechado")
  if (isClosed) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
        <Navbar currentStage="tcle" title={experimentConfig.tituloPesquisa} institution={experimentConfig.instituicao} />
        <main className="flex-1 flex items-center justify-center p-4">
          <ClosedExperimentScreen
            message={experimentConfig.mensagemFechado}
            institution={experimentConfig.instituicao}
            contactEmail={experimentConfig.contatoPesquisador}
            title={experimentConfig.tituloPesquisa}
          />
        </main>
      </div>
    );
  }

  // 3. Open Experiment Interface (Exclusively Participant Experience)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Participant Progress Header */}
      <Navbar
        currentStage={currentStage}
        title={experimentConfig.tituloPesquisa}
        institution={experimentConfig.instituicao}
      />

      {/* Main Sequential Stage Container */}
      <main className="flex-1 pb-16">
        {currentStage === 'tcle' && (
          <TCLE onAccept={handleAcceptTCLE} onDecline={handleDeclineTCLE} />
        )}

        {currentStage === 'linguistic_pairs' && (
          <AudioComparisonTrial
            trials={sessionAudioPairs.length > 0 ? sessionAudioPairs : audioPairsMaster}
            onComplete={handleAudioPairsComplete}
          />
        )}

        {currentStage === 'map_geolocation' && (
          <BrazilMapTask
            trials={sessionMapTrials.length > 0 ? sessionMapTrials : mapTrialsMaster}
            onComplete={handleMapTaskComplete}
          />
        )}

        {currentStage === 'sociodemographic' && (
          <SociodemographicQuestionnaire
            onComplete={handleSociodemographicComplete}
          />
        )}

        {currentStage === 'completed' && (
          <CompletionScreen
            sessionData={sessionData}
            onRestart={handleRestart}
            submissionStatus={submissionStatus}
            submissionMessage={submissionMessage}
          />
        )}
      </main>

      {/* Clean Academic Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        {experimentConfig.instituicao || 'Universidade Estadual de Campinas (UNICAMP)'} — Experimento de Percepção Fonética
      </footer>
    </div>
  );
}
