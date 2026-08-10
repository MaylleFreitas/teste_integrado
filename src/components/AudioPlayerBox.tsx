import React, { useState } from 'react';
import { Volume2, VolumeX, CheckCircle, Play, Pause, Activity } from 'lucide-react';
import { playAudioItem, stopCurrentAudio } from '../utils/audioGenerator';

interface AudioPlayerBoxProps {
  id: string;
  title: string;
  subtitle?: string;
  url?: string;
  speechText?: string;
  pitchShift?: number;
  rate?: number;
  accentColor?: 'sky' | 'indigo' | 'emerald' | 'amber';
  onPlayed?: () => void;
  playCount: number;
}

const cleanAudioTitle = (rawTitle?: string): string => {
  if (!rawTitle) return 'Gravação';
  let cleaned = rawTitle.trim();
  // Strip common audio extensions
  cleaned = cleaned.replace(/\.(mp3|ogg|wav|m4a|aac|webm|flac)$/i, '');
  // If it's a URL or path, get filename part
  if (cleaned.includes('/')) {
    const parts = cleaned.split('/');
    cleaned = parts[parts.length - 1] || cleaned;
    cleaned = cleaned.replace(/\.(mp3|ogg|wav|m4a|aac|webm|flac)$/i, '');
  }
  // If title is a filename like porta_h, porta_i, porta_r or contains underscores/extensions
  if (cleaned.toLowerCase().includes('porta_') || cleaned.includes('_') || !cleaned.toLowerCase().startsWith('grava')) {
    return 'Gravação';
  }
  return cleaned;
};

export const AudioPlayerBox: React.FC<AudioPlayerBoxProps> = ({
  id,
  title,
  subtitle,
  url,
  speechText,
  pitchShift = 1.0,
  rate = 1.0,
  accentColor = 'sky',
  onPlayed,
  playCount
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const displayTitle = cleanAudioTitle(title);
  const displaySubtitle = subtitle ? cleanAudioTitle(subtitle) : undefined;

  const handleTogglePlay = async () => {
    if (isPlaying) {
      stopCurrentAudio();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    onPlayed?.();

    await playAudioItem({
      url,
      text: speechText,
      pitch: pitchShift,
      rate,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  const borderStyles = {
    sky: isPlaying
      ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20'
      : playCount > 0
      ? 'border-indigo-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-indigo-50/50'
      : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50',
    indigo: isPlaying
      ? 'border-indigo-500 bg-indigo-50 shadow-md ring-2 ring-indigo-500/20'
      : playCount > 0
      ? 'border-indigo-300 bg-slate-50/80 hover:border-indigo-400 hover:bg-indigo-50/50'
      : 'border-slate-200 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50',
    emerald: isPlaying
      ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-500/20'
      : playCount > 0
      ? 'border-emerald-300 bg-slate-50/80 hover:border-emerald-400 hover:bg-emerald-50/50'
      : 'border-slate-200 bg-slate-50 hover:border-emerald-400 hover:bg-emerald-50/50',
    amber: isPlaying
      ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-500/20'
      : playCount > 0
      ? 'border-amber-300 bg-slate-50/80 hover:border-amber-400 hover:bg-amber-50/50'
      : 'border-slate-200 bg-slate-50 hover:border-amber-400 hover:bg-amber-50/50'
  };

  const buttonStyles = {
    sky: isPlaying ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-md group-hover:scale-105',
    indigo: isPlaying ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-indigo-600 shadow-md group-hover:scale-105',
    emerald: isPlaying ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-emerald-600 shadow-md group-hover:scale-105',
    amber: isPlaying ? 'bg-amber-600 text-white shadow-lg' : 'bg-white text-amber-600 shadow-md group-hover:scale-105'
  };

  return (
    <button
      id={`audio-box-${id}`}
      onClick={handleTogglePlay}
      className={`group w-full p-5 sm:p-6 rounded-xl border-2 border-dashed transition-all text-left relative overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500/40 cursor-pointer ${borderStyles[accentColor]}`}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">
          {displayTitle}
        </span>
        {playCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
            <CheckCircle className="w-3 h-3 text-emerald-600" />
            Ouvido ({playCount}x)
          </span>
        )}
      </div>

      {/* Main player controls row */}
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-all ${buttonStyles[accentColor]}`}>
          {isPlaying ? (
            <Pause className="w-5 h-5 animate-pulse" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800 text-sm sm:text-base truncate">
              {isPlaying ? 'Reproduzindo áudio...' : 'Clique para ouvir'}
            </span>
            {isPlaying && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-indigo-100 text-indigo-700 font-bold animate-bounce">
                <Activity className="w-3 h-3 mr-1 animate-spin" /> EM EXECUÇÃO
              </span>
            )}
          </div>
          {displaySubtitle && (
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {displaySubtitle}
            </p>
          )}
        </div>
      </div>

      {/* Animated Soundwave lines when playing */}
      {isPlaying && (
        <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-center gap-1 h-6">
          <div className="w-1 bg-indigo-500 rounded-full h-3 animate-[ping_1s_infinite_100ms]" />
          <div className="w-1 bg-indigo-500 rounded-full h-5 animate-[ping_1s_infinite_300ms]" />
          <div className="w-1 bg-indigo-600 rounded-full h-2 animate-[ping_1s_infinite_200ms]" />
          <div className="w-1 bg-indigo-500 rounded-full h-6 animate-[ping_1s_infinite_400ms]" />
          <div className="w-1 bg-indigo-600 rounded-full h-3 animate-[ping_1s_infinite_150ms]" />
          <div className="w-1 bg-indigo-500 rounded-full h-4 animate-[ping_1s_infinite_250ms]" />
        </div>
      )}
    </button>
  );
};
