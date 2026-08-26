import React from 'react';
import { ExperimentStage } from '../types';
import { Volume2, MapPin, FileText, User, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  currentStage: ExperimentStage;
  title?: string;
  institution?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  title = 'Experimento de percepção auditiva',
  institution = 'Universidade de Campinas - UNICAMP'
}) => {
  const stages: { key: ExperimentStage; label: string; icon: React.ReactNode }[] = [
    { key: 'tcle', label: '1. Termo de Consentimento', icon: <FileText className="w-4 h-4" /> },
    { key: 'linguistic_pairs', label: '2. Percepção Auditiva', icon: <Volume2 className="w-4 h-4" /> },
    { key: 'map_geolocation', label: '3. Mapa Dialetal', icon: <MapPin className="w-4 h-4" /> },
    { key: 'sociodemographic', label: '4. Perfil do Participante', icon: <User className="w-4 h-4" /> },
  ];

  const stageOrder: ExperimentStage[] = ['tcle', 'linguistic_pairs', 'map_geolocation', 'sociodemographic', 'completed'];
  const currentIndex = stageOrder.indexOf(currentStage);

  return (
    <header className="bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-40 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Title & Institutional Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-sm tracking-wide text-slate-800">
                {title}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              {institution}
            </p>
          </div>
        </div>

        {/* Stages Progress Indicator (Fixed Stage Sequence) */}
        <nav aria-label="Progresso do Experimento" className="flex items-center gap-2">
          {stages.map((stageItem, idx) => {
            const isActive = currentStage === stageItem.key;
            const isCompleted = currentIndex > idx;

            return (
              <div
                key={stageItem.key}
                title={stageItem.label}
                aria-label={stageItem.label}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200'
                    : isCompleted
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-50 text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-white text-indigo-700 font-bold' : 'bg-slate-200 text-slate-600 font-bold'
                  }`}>
                    {idx + 1}
                  </span>
                )}
                <span className="hidden md:inline">{stageItem.label.split('. ')[1]}</span>
              </div>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
