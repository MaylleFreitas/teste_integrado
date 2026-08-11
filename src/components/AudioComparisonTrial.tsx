import React, { useState, useEffect } from 'react';
import { AudioPairTrial, AudioPairResponse } from '../types';
import { AudioPlayerBox } from './AudioPlayerBox';
import { preloadAudio } from '../utils/audioGenerator';
import { Volume2, ArrowRight, ArrowLeft, AlertCircle, Sparkles, CheckCircle } from 'lucide-react';

interface AudioComparisonTrialProps {
  trials: AudioPairTrial[];
  onComplete: (responses: AudioPairResponse[]) => void;
}

export const AudioComparisonTrial: React.FC<AudioComparisonTrialProps> = ({
  trials,
  onComplete
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<AudioPairResponse[]>([]);
  
  // Trial specific states
  const [sliderValue, setSliderValue] = useState<number>(50); // Starts at neutral 50
  const [audio1Count, setAudio1Count] = useState<number>(0);
  const [audio2Count, setAudio2Count] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Random order per pair (Audio A vs Audio B position swap)
  const [isSwapped, setIsSwapped] = useState<boolean>(() => Math.random() < 0.5);

  const currentTrial = trials[currentIndex] || trials[0];

  useEffect(() => {
    // Reset state and randomize left/right presentation on trial change
    setIsSwapped(Math.random() < 0.5);
    setSliderValue(50);
    setAudio1Count(0);
    setAudio2Count(0);
    setStartTime(Date.now());
    setValidationError(null);

    // Preload current and next trial audio
    if (currentTrial) {
      preloadAudio(currentTrial.audio1Url);
      preloadAudio(currentTrial.audio2Url);
    }
    const nextTrial = trials[currentIndex + 1];
    if (nextTrial) {
      preloadAudio(nextTrial.audio1Url);
      preloadAudio(nextTrial.audio2Url);
    }
  }, [currentIndex, trials, currentTrial]);

  const canProceed = audio1Count > 0 && audio2Count > 0;

  const handleNext = () => {
    if (!canProceed) {
      setValidationError('Por favor, ouça ambas as gravações antes de registrar sua resposta.');
      return;
    }

    const timeTaken = Date.now() - startTime;
    const newResponse: AudioPairResponse = {
      trialId: currentTrial.id,
      pairIndex: currentTrial.pairIndex,
      differenceScore: sliderValue,
      listenedAudio1Count: audio1Count,
      listenedAudio2Count: audio2Count,
      timeTakenMs: timeTaken
    };

    const updatedResponses = [...responses, newResponse];
    setResponses(updatedResponses);

    if (currentIndex < trials.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(updatedResponses);
    }
  };

  // Define left and right player configurations based on randomized swap
  const leftAudioProps = !isSwapped
    ? {
        id: `${currentTrial.id}-1`,
        title: currentTrial.title1,
        url: currentTrial.audio1Url,
        speechText: currentTrial.speechText1,
        pitchShift: currentTrial.pitchShift1,
        rate: currentTrial.rate1,
        count: audio1Count,
        onPlayed: () => {
          setAudio1Count((prev) => prev + 1);
          setValidationError(null);
        }
      }
    : {
        id: `${currentTrial.id}-2`,
        title: currentTrial.title2,
        url: currentTrial.audio2Url,
        speechText: currentTrial.speechText2,
        pitchShift: currentTrial.pitchShift2,
        rate: currentTrial.rate2,
        count: audio2Count,
        onPlayed: () => {
          setAudio2Count((prev) => prev + 1);
          setValidationError(null);
        }
      };

  const rightAudioProps = !isSwapped
    ? {
        id: `${currentTrial.id}-2`,
        title: currentTrial.title2,
        url: currentTrial.audio2Url,
        speechText: currentTrial.speechText2,
        pitchShift: currentTrial.pitchShift2,
        rate: currentTrial.rate2,
        count: audio2Count,
        onPlayed: () => {
          setAudio2Count((prev) => prev + 1);
          setValidationError(null);
        }
      }
    : {
        id: `${currentTrial.id}-1`,
        title: currentTrial.title1,
        url: currentTrial.audio1Url,
        speechText: currentTrial.speechText1,
        pitchShift: currentTrial.pitchShift1,
        rate: currentTrial.rate1,
        count: audio1Count,
        onPlayed: () => {
          setAudio1Count((prev) => prev + 1);
          setValidationError(null);
        }
      };

  return (
    <div className="max-w-3xl mx-auto my-6 px-4">
      {/* Top Banner & Question Prompt */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              2
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Par {currentIndex + 1} de {trials.length}
            </span>
          </div>
          {/* Progress Pill */}
          <div className="w-28 sm:w-36 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / trials.length) * 100}%` }}
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
          O quanto essas amostras de fala parecem diferentes para você?
        </h2>
        <p className="text-sm text-slate-500">
          Ouça as duas amostras de fala e indique o quão diferentes elas soam.
        </p>
      </div>

      {/* Two Audio Boxes Row (Randomized order per trial) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <AudioPlayerBox
          id={leftAudioProps.id}
          title={leftAudioProps.title}
          url={leftAudioProps.url}
          speechText={leftAudioProps.speechText}
          pitchShift={leftAudioProps.pitchShift}
          rate={leftAudioProps.rate}
          accentColor="indigo"
          playCount={leftAudioProps.count}
          onPlayed={leftAudioProps.onPlayed}
        />

        <AudioPlayerBox
          id={rightAudioProps.id}
          title={rightAudioProps.title}
          url={rightAudioProps.url}
          speechText={rightAudioProps.speechText}
          pitchShift={rightAudioProps.pitchShift}
          rate={rightAudioProps.rate}
          accentColor="indigo"
          playCount={rightAudioProps.count}
          onPlayed={rightAudioProps.onPlayed}
        />
      </div>

      {/* Continuous Slider Scale */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <label htmlFor="continuous-difference-slider" className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <span>Sobre os áudios:</span>
            <span className="text-xs text-slate-500 font-normal">
              (Deslize o marcador)
            </span>
          </label>
        </div>

        {/* Continuous Range Slider */}
        <div className="px-2 py-4">
          <input
            id="continuous-difference-slider"
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderValue}
            onChange={(e) => setSliderValue(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>

        {/* Continuous Scale Endpoint Visual Anchors (Without numbers) */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold pt-2 border-t border-slate-100">
          <span className="text-slate-700 max-w-[180px] text-left">
            Não há diferença
          </span>
          <span className="text-slate-700 max-w-[180px] text-right">
            Completamente diferentes
          </span>
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="text-xs text-slate-500 font-mono">
          {!canProceed && (
            <span className="text-amber-700 flex items-center gap-1.5 font-sans font-medium">
              <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
              Ouça ambas as gravações para habilitar o botão
            </span>
          )}
        </div>

        <button
          id="btn-next-audio-trial"
          onClick={handleNext}
          disabled={!canProceed}
          className={`px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            canProceed
              ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-md cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
          }`}
        >
          <span>{currentIndex === trials.length - 1 ? 'Concluir Parte 2' : 'Próximo Par'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
