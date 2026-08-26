import React from 'react';
import { Lock, Mail, Building2, CheckCircle2 } from 'lucide-react';

interface ClosedExperimentScreenProps {
  message?: string;
  institution?: string;
  contactEmail?: string;
  title?: string;
}

export const ClosedExperimentScreen: React.FC<ClosedExperimentScreenProps> = ({
  message = 'Esta pesquisa foi encerrada e não está mais recebendo novas respostas. Agradecemos imensamente pelo seu interesse e colaboração!',
  institution = 'Universidade Estadual de Campinas (UNICAMP)',
  contactEmail = 'contato.experimento.linguistica@unicamp.br',
  title = 'Experimento de Percepção Auditiva'
}) => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-sm text-center space-y-6">
        {/* Top Status Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Coleta de Dados Encerrada
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {title}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed max-w-lg mx-auto">
            {message}
          </p>
        </div>

        {/* Institutional & Ethics Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left space-y-3">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-semibold">
            <Building2 className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>{institution}</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-600">
            <Mail className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Contato: {contactEmail}</span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-500 pt-2 border-t border-slate-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Todas as respostas coletadas anteriormente foram salvas e anonimizadas conforme os protocolos éticos de pesquisa.
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-mono">
          Obrigado pelo seu tempo e apoio à ciência brasileira.
        </p>
      </div>
    </div>
  );
};
