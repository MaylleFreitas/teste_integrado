import React, { useState, useEffect } from 'react';
import { ExperimentStage, ParticipantSession, AudioPairResponse, MapClickResponse, SociodemographicData, AudioPairTrial, MapAudioTrial } from './types';
import { DEFAULT_AUDIO_PAIRS, DEFAULT_MAP_TRIALS } from './data/defaultExperiment';
import { Navbar } from './components/Navbar';
import { TCLE } from './components/TCLE';
import { AudioComparisonTrial } from './components/AudioComparisonTrial';
import { BrazilMapTask } from './components/BrazilMapTask';
import { SociodemographicQuestionnaire } from './components/SociodemographicQuestionnaire';
import { CompletionScreen } from './components/CompletionScreen';
import { ResearcherPanel } from './components/ResearcherPanel';
import { saveStimuliToStorage, loadStimuliFromStorage, clearStimuliFromStorage } from './utils/stimuliStorage';

export default function App() {
  const [currentStage, setCurrentStage] = useState<ExperimentStage>('tcle');
  const [isResearcherMode, setIsResearcherMode] = useState<boolean>(false);

  // Master Stimuli state
  const [audioPairs, setAudioPairs] = useState<AudioPairTrial[]>(DEFAULT_AUDIO_PAIRS);
  const [mapTrials, setMapTrials] = useState<MapAudioTrial[]>(DEFAULT_MAP_TRIALS);
  const [isStimuliLoaded, setIsStimuliLoaded] = useState(false);

  // Active session trial order (shuffled per participant)
  const [sessionAudioPairs, setSessionAudioPairs] = useState<AudioPairTrial[]>([]);

  // Load saved stimuli on initial mount
  useEffect(() => {
    loadStimuliFromStorage().then((saved) => {
      if (saved) {
        if (saved.audioPairs && saved.audioPairs.length > 0) {
          // Keep recorded audio pairs (e.g. data URLs, auto-generated pairs, or Porta recordings)
          const recordedOnly = saved.audioPairs.filter(
            (p) =>
              p.audio1Url?.startsWith('data:') ||
              p.audio2Url?.startsWith('data:') ||
              p.id.includes('auto') ||
              p.title1.toLowerCase().includes('porta') ||
              p.title2.toLowerCase().includes('porta') ||
              p.speechText1 === 'Porta'
          );

          const basePairs = recordedOnly.length > 0 ? recordedOnly : saved.audioPairs;

          const formattedPairs = basePairs.map((pair, idx) => ({
            ...pair,
            pairIndex: idx + 1,
            title1: `Gravação ${idx * 2 + 1}`,
            title2: `Gravação ${idx * 2 + 2}`,
            description: `Combinação de mesma palavra "${pair.speechText1 || 'Porta'}"`
          }));

          setAudioPairs(formattedPairs);
        }
        if (saved.mapTrials && saved.mapTrials.length > 0) {
          setMapTrials(saved.mapTrials);
        }
      }
      setIsStimuliLoaded(true);
    });
  }, []);

  // Save stimuli whenever audioPairs or mapTrials change (after initial mount)
  useEffect(() => {
    if (isStimuliLoaded) {
      saveStimuliToStorage(audioPairs, mapTrials);
    }
  }, [audioPairs, mapTrials, isStimuliLoaded]);

  // Current session state
  const [sessionData, setSessionData] = useState<ParticipantSession>(() => ({
    sessionId: `part-${Math.random().toString(36).substring(2, 9)}`,
    startTime: new Date().toISOString(),
    tcleAccepted: false,
    audioPairResponses: [],
    mapClickResponses: [],
    sociodemographic: {}
  }));

  // Historical sessions stored locally for research
  const [allSessions, setAllSessions] = useState<ParticipantSession[]>(() => {
    try {
      const saved = localStorage.getItem('auditory_experiment_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('auditory_experiment_sessions', JSON.stringify(allSessions));
    } catch {
      // Storage limits or privacy settings
    }
  }, [allSessions]);

  // Stage 1: TCLE handlers
  const handleAcceptTCLE = () => {
    // Shuffle pair trials order randomly for this participant experiment session without mutating master audioPairs
    const shuffled = [...audioPairs];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setSessionAudioPairs(shuffled);

    setSessionData((prev) => ({
      ...prev,
      tcleAccepted: true,
      tcleAcceptedAt: new Date().toISOString()
    }));
    setCurrentStage('linguistic_pairs');
  };

  const handleDeclineTCLE = () => {
    // Handled internally inside TCLE component
  };

  // Stage 2: Audio Comparison handler
  const handleAudioPairsComplete = (responses: AudioPairResponse[]) => {
    setSessionData((prev) => ({
      ...prev,
      audioPairResponses: responses
    }));
    setCurrentStage('map_geolocation');
  };

  // Stage 3: Map Geolocation handler
  const handleMapTaskComplete = (responses: MapClickResponse[]) => {
    setSessionData((prev) => ({
      ...prev,
      mapClickResponses: responses
    }));
    setCurrentStage('sociodemographic');
  };

  // Stage 4: Sociodemographic Questionnaire handler
  const handleSociodemographicComplete = (socData: SociodemographicData) => {
    const completedSession: ParticipantSession = {
      ...sessionData,
      endTime: new Date().toISOString(),
      sociodemographic: socData
    };

    setSessionData(completedSession);
    setAllSessions((prev) => [completedSession, ...prev]);
    setCurrentStage('completed');
  };

  // Restart for new participant
  const handleRestart = () => {
    setSessionData({
      sessionId: `part-${Math.random().toString(36).substring(2, 9)}`,
      startTime: new Date().toISOString(),
      tcleAccepted: false,
      audioPairResponses: [],
      mapClickResponses: [],
      sociodemographic: {}
    });
    setCurrentStage('tcle');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white antialiased">
      {/* Top Navbar */}
      <Navbar
        currentStage={currentStage}
        onSelectStage={(st) => setCurrentStage(st)}
        onToggleResearcher={() => setIsResearcherMode(!isResearcherMode)}
        isResearcherMode={isResearcherMode}
      />

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {currentStage === 'tcle' && (
          <TCLE onAccept={handleAcceptTCLE} onDecline={handleDeclineTCLE} />
        )}

        {currentStage === 'linguistic_pairs' && (
          <AudioComparisonTrial
            trials={sessionAudioPairs.length > 0 ? sessionAudioPairs : audioPairs}
            onComplete={handleAudioPairsComplete}
          />
        )}

        {currentStage === 'map_geolocation' && (
          <BrazilMapTask
            trials={mapTrials}
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
          />
        )}
      </main>

      {/* Researcher Modal Drawer */}
      {isResearcherMode && (
        <ResearcherPanel
          audioPairs={audioPairs}
          setAudioPairs={setAudioPairs}
          mapTrials={mapTrials}
          setMapTrials={setMapTrials}
          allSessions={allSessions}
          onClose={() => setIsResearcherMode(false)}
          onResetDefaultStimuli={async () => {
            if (confirm('Deseja restaurar as amostras de áudio para a configuração padrão inicial?')) {
              await clearStimuliFromStorage();
              setAudioPairs(DEFAULT_AUDIO_PAIRS);
              setMapTrials(DEFAULT_MAP_TRIALS);
              alert('Amostras restauradas para o padrão inicial.');
            }
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 text-center text-xs text-slate-500 font-mono">
        experimento de percepção auditiva
      </footer>
    </div>
  );
}
