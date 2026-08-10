import React from 'react';
import { ExperimentStage } from '../types';
import { Volume2, MapPin, FileText, User, Settings, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentStage: ExperimentStage;
  onSelectStage?: (stage: ExperimentStage) => void;
  onToggleResearcher: () => void;
  isResearcherMode: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  onToggleResearcher,
  isResearcherMode
}) => {
  const stages: { key: ExperimentStage; label: string; icon: React.ReactNode }[] = [
    { key: 'tcle', label: 'TCLE', icon: <FileText className="w-4 h-4" /> },
    { key: 'linguistic_pairs', label: 'Percepção Auditiva', icon: <Volume2 className="w-4 h-4" /> },
    { key: 'map_geolocation', label: 'Mapa do Brasil', icon: <MapPin className="w-4 h-4" /> },
    { key: 'sociodemographic', label: 'Questionário Social', icon: <User className="w-4 h-4" /> },
  ];

  const stageOrder: ExperimentStage[] = ['tcle', 'linguistic_pairs', 'map_geolocation', 'sociodemographic', 'completed'];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Title & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-wide text-slate-800">
                Experimento de percepção auditiva
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Universidade de Campinas - Unicamp
            </p>
          </div>
        </div>

        {/* Stages Progress Indicator */}
        <nav aria-label="Progresso do Experimento" className="flex items-center gap-2">
          {stages.map((stageItem, idx) => {
            const isActive = currentStage === stageItem.key;
            const isCompleted = currentIndex > idx;

            return (
              <div
                key={stageItem.key}
                title={stageItem.label}
                aria-label={stageItem.label}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                    : isCompleted
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted || isActive ? (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
            );
          })}
        </nav>

        {/* Researcher Mode Button */}
        <button
          id="btn-toggle-researcher-mode"
          onClick={onToggleResearcher}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
            isResearcherMode
              ? 'bg-amber-50 text-amber-800 border-amber-300'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:text-slate-900'
          }`}
          title="Modo Pesquisador / Configurar estímulos e exportar dados"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>{isResearcherMode ? 'Sair Painel' : 'Painel Admin'}</span>
        </button>
      </div>
    </header>
  );
};
