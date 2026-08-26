import React from 'react';
import { Volume2, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Carregando ambiente experimental e verificando parâmetros da pesquisa...'
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6 p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
        {/* Animated App Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md relative">
          <Volume2 className="w-8 h-8" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center">
            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Inicializando Experimento
          </h2>
          <p className="text-sm text-slate-500 font-sans leading-relaxed">
            {message}
          </p>
        </div>

        {/* Progress bar visual indicator */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-indigo-600 rounded-full w-2/3 animate-pulse" />
        </div>

        <div className="text-[11px] text-slate-400 font-mono">
          Laboratório de Estudos Linguísticos e Fonéticos — UNICAMP
        </div>
      </div>
    </div>
  );
};
