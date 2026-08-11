import React, { useState, useRef, useEffect } from 'react';
import { MapAudioTrial, MapClickResponse } from '../types';
import { playAudioItem, stopCurrentAudio, preloadAudio } from '../utils/audioGenerator';
import { MapPin, Play, Pause, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import brazilMapImage from '../assets/images/brazil_map_outline_png_1786371761327.jpg';

interface BrazilMapTaskProps {
  trials: MapAudioTrial[];
  onComplete: (responses: MapClickResponse[]) => void;
}

export const BrazilMapTask: React.FC<BrazilMapTaskProps> = ({ trials, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<MapClickResponse[]>([]);

  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [listenCount, setListenCount] = useState(0);

  // Click position (X, Y percentages)
  const [clickPos, setClickPos] = useState<{ x: number; y: number } | null>(null);

  const [startTime, setStartTime] = useState<number>(Date.now());
  const [validationError, setValidationError] = useState<string | null>(null);

  const cleanAudioTitle = (rawTitle?: string): string => {
    if (!rawTitle) return '';
    let cleaned = rawTitle.trim().replace(/\.(mp3|ogg|wav|m4a|aac|webm|flac)$/i, '');
    if (cleaned.includes('/')) {
      const parts = cleaned.split('/');
      cleaned = parts[parts.length - 1] || cleaned;
      cleaned = cleaned.replace(/\.(mp3|ogg|wav|m4a|aac|webm|flac)$/i, '');
    }
    return cleaned;
  };

  const currentTrial = trials[currentIndex] || trials[0];
  const displayTitle = cleanAudioTitle(currentTrial?.title);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when switching trial
    setIsPlaying(false);
    setListenCount(0);
    setClickPos(null);
    setStartTime(Date.now());
    setValidationError(null);
    stopCurrentAudio();

    if (currentTrial) {
      preloadAudio(currentTrial.audioUrl);
    }
    const nextTrial = trials[currentIndex + 1];
    if (nextTrial) {
      preloadAudio(nextTrial.audioUrl);
    }
  }, [currentIndex, trials, currentTrial]);

  const handlePlayAudio = async () => {
    if (isPlaying) {
      stopCurrentAudio();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setListenCount((prev) => prev + 1);
    setValidationError(null);

    await playAudioItem({
      url: currentTrial.audioUrl,
      text: currentTrial.speechText,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapContainerRef.current) return;
    const rect = mapContainerRef.current.getBoundingClientRect();
    const xPct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    setClickPos({ x: xPct, y: yPct });
    setValidationError(null);
  };

  const handleNext = () => {
    if (listenCount === 0) {
      setValidationError('Por favor, ouça a amostra de fala antes de indicar a localização.');
      return;
    }

    if (!clickPos) {
      setValidationError('Clique no mapa do Brasil para marcar onde você acha que é a origem do falante.');
      return;
    }

    const timeTaken = Date.now() - startTime;
    const newResponse: MapClickResponse = {
      trialId: currentTrial.id,
      trialIndex: currentTrial.trialIndex,
      clickX: Number(clickPos.x.toFixed(2)),
      clickY: Number(clickPos.y.toFixed(2)),
      listenedCount: listenCount,
      timeTakenMs: timeTaken
    };

    const updated = [...responses, newResponse];
    setResponses(updated);

    if (currentIndex < trials.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete(updated);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-3 px-3">
      {/* Compact Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 mb-3 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
              3
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Amostra {currentIndex + 1} de {trials.length}
            </span>
          </div>
          <h2 className="text-sm sm:text-base font-bold text-slate-800 tracking-tight">
            Ouça esse áudio e clique de onde você acha que seria esse falante
          </h2>
        </div>

        <div className="w-24 sm:w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className="h-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / trials.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Grid: Audio & Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-3 items-stretch">
        {/* Left Column: Audio Stimulus */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {/* Audio Box */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between flex-1">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono font-bold text-slate-500 uppercase">
                  {displayTitle}
                </span>
                {listenCount > 0 && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Ouvido ({listenCount}x)
                  </span>
                )}
              </div>

              <button
                id={`btn-play-map-audio-${currentTrial.id}`}
                onClick={handlePlayAudio}
                className={`w-full p-3.5 rounded-xl border-2 border-dashed flex items-center gap-3 transition-all cursor-pointer ${
                  isPlaying
                    ? 'bg-indigo-50 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                  {isPlaying ? <Pause className="w-5 h-5 animate-pulse" /> : <Play className="w-5 h-5 ml-0.5" />}
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-slate-800 text-xs sm:text-sm">
                    {isPlaying ? 'Ouvindo amostra...' : 'Clique para ouvir o áudio'}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Amostra de fala
                  </span>
                </div>
              </button>
            </div>

            {/* Quick Clear option when point is selected */}
            {clickPos && (
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end text-xs">
                <button
                  onClick={() => setClickPos(null)}
                  className="text-[11px] text-slate-500 hover:text-slate-900 underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <RefreshCw className="w-3 h-3" />
                  Limpar seleção
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Brazil Map - Large Container */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs flex flex-col justify-between">
          <div className="text-xs text-slate-500 mb-1 flex items-center justify-between px-1">
            <span className="font-mono uppercase tracking-wider text-[10px] font-bold text-slate-700">Mapa do Brasil</span>
            <span className="text-[11px] text-slate-400">Clique para selecionar a localização</span>
          </div>

          {/* SVG Map Container - Maximize size inside white box */}
          <div
            ref={mapContainerRef}
            onClick={handleMapClick}
            className="relative w-full aspect-square max-w-[700px] mx-auto bg-white rounded-lg border border-slate-200 overflow-hidden cursor-crosshair select-none group"
          >
            {/* PNG Line-Art Map of Brazil (Pure black outline, white background, scaled for maximum size) */}
            <img
              src={brazilMapImage}
              alt="Mapa do Brasil"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none p-1 scale-[1.12] transition-transform duration-200"
            />

            {/* Static Circle Marker on Click (2x larger outer blue radius) */}
            {clickPos && (
              <div
                className="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
                style={{
                  left: `${clickPos.x}%`,
                  top: `${clickPos.y}%`
                }}
              >
                {/* Static outer translucent blue halo (2x larger) */}
                <div className="w-40 h-40 rounded-full bg-indigo-500/15 border-2 border-indigo-500/40 absolute" />
                {/* Intermediate translucent ring */}
                <div className="w-24 h-24 rounded-full bg-indigo-500/25 border border-indigo-500/60 absolute" />
                {/* Core solid circle dot */}
                <div className="w-7 h-7 bg-indigo-600 rounded-full border-2 border-white shadow-lg relative z-10" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Validation alert */}
      {validationError && (
        <div className="mb-3 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Footer Navigation */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="text-xs text-slate-500 font-mono">
          {!clickPos ? (
            <span className="text-indigo-600 font-sans font-medium flex items-center gap-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              Clique no mapa para marcar a localização
            </span>
          ) : (
            <span className="text-emerald-700 font-sans font-medium flex items-center gap-1 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Ponto registrado no mapa
            </span>
          )}
        </div>

        <button
          id="btn-next-map-trial"
          onClick={handleNext}
          disabled={!clickPos || listenCount === 0}
          className={`px-5 py-2 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
            clickPos && listenCount > 0
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-70'
          }`}
        >
          <span>{currentIndex === trials.length - 1 ? 'Concluir Parte 3' : 'Próxima Amostra'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

