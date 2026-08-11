import React from 'react';
import { ParticipantSession } from '../types';
import { generateWideCSV, downloadCSVFile } from '../utils/csvExport';
import { CheckCircle2, Download, RefreshCw, Database, Sparkles } from 'lucide-react';

interface CompletionScreenProps {
  sessionData: ParticipantSession;
  onRestart: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ sessionData, onRestart }) => {
  const downloadCSV = () => {
    const csvContent = generateWideCSV([sessionData]);
    downloadCSVFile(csvContent, `experimento_percepcao_${sessionData.sessionId}.csv`);
  };

  const downloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessionData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `experimento_session_${sessionData.sessionId}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 text-slate-800">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm relative overflow-hidden">
        {/* Top Icon */}
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800 mb-2">
          Experimento Concluído!
        </h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
          Sua participação foi registrada com sucesso. Agradecemos imensamente sua contribuição para esta pesquisa de percepção auditiva.
        </p>

        {/* Stats summary badge list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8 text-left">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">PARES DE ÁUDIO</span>
            <span className="text-lg font-bold text-indigo-700">
              {sessionData.audioPairResponses.length} respostas
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">MARCAÇÕES NO MAPA</span>
            <span className="text-lg font-bold text-indigo-700">
              {sessionData.mapClickResponses.length} amostras
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">CLASSIFICAÇÃO</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-1">
              {sessionData.sociodemographic.classificacaoMigratoria || 'Geral'}
            </span>
          </div>
        </div>

        {/* Export dataset buttons */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-mono font-semibold">
              <Database className="w-4 h-4 text-indigo-600" />
              ID da Sessão: {sessionData.sessionId}
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-400">CSV / JSON</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={downloadCSV}
              id="btn-download-csv"
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Dados (.CSV)</span>
            </button>

            <button
              onClick={downloadJSON}
              id="btn-download-json"
              className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Exportar JSON Completo</span>
            </button>
          </div>
        </div>

        {/* Restart test button */}
        <button
          onClick={onRestart}
          id="btn-restart-experiment"
          className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors inline-flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Iniciar Novo Teste (Novo Participante)</span>
        </button>
      </div>
    </div>
  );
};
