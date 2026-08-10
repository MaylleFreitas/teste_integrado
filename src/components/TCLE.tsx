import React, { useState } from 'react';
import { ShieldCheck, FileText, CheckCircle, CheckCircle2, AlertCircle, ExternalLink, Download, Volume2 } from 'lucide-react';

interface TCLEProps {
  onAccept: () => void;
  onDecline: () => void;
}

const FULL_TCLE_URL = 'https://drive.google.com/file/d/1yPLCaokCNRcmuL79unzHeg_JDkIqjuLA/view?usp=sharing';

export const TCLE: React.FC<TCLEProps> = ({ onAccept, onDecline }) => {
  const [showDeclinedState, setShowDeclinedState] = useState(false);

  if (showDeclinedState) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl text-center text-slate-700 shadow-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Participação Não Confirmada
        </h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Respeitamos sua decisão de não participar da pesquisa. Nenhuma informação foi registrada.
          Caso deseje participar futuramente, você pode recarregar a página a qualquer momento.
        </p>
        <button
          onClick={() => setShowDeclinedState(false)}
          className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
        >
          Voltar e Revisar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-6 px-4">
      {/* Header & Main Summary Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-4">
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-slate-100">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                1
              </span>
              <span className="text-xs text-slate-500 font-mono">Consentimento</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Termo de Consentimento Livre e Esclarecido (TCLE)
            </h2>
          </div>
        </div>

        {/* Resumo Ultra Conciso */}
        <div className="space-y-4">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-700 text-sm leading-relaxed space-y-2">
            <p className="font-semibold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Resumo do Experimento:
            </p>
            <p>
              Esta pesquisa é um <strong>experimento sobre reconhecimento de padrão de vozes</strong>.
            </p>
            <p className="text-slate-600 text-xs sm:text-sm">
              Sua participação é totalmente voluntária, anônima e consiste em ouvir amostras de áudio, comparar similaridades perceptivas, indicar no mapa a percepção da região de origem dos falantes e responder a um breve perfil sociodemográfico.
            </p>
          </div>

          {/* Banner de Download do TCLE Completo */}
          <div className="p-4 bg-indigo-50/70 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-bold block text-slate-800 text-sm mb-0.5">Documento Completo (TCLE)</span>
              <span className="text-slate-500">Acesse na íntegra todas as informações do termo.</span>
            </div>
            <a
              href={FULL_TCLE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 shadow-2xs hover:shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Baixar / Visualizar TCLE Completo</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400 ml-0.5" />
            </a>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 bg-amber-50/60 border border-amber-100 p-3 rounded-xl">
            <Volume2 className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Recomendamos o uso de fones de ouvido durante a realização do teste.</span>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-3">
        <button
          id="btn-decline-tcle"
          onClick={() => setShowDeclinedState(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors border border-slate-200 cursor-pointer"
        >
          Não Aceito
        </button>
        <button
          id="btn-accept-tcle"
          onClick={onAccept}
          className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Li e Aceito Participar</span>
        </button>
      </div>
    </div>
  );
};

