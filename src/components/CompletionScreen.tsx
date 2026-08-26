import React from 'react';
import { ParticipantSession } from '../types';
import { generateWideCSV, downloadCSVFile } from '../utils/csvExport';
import { CheckCircle2, Download, RefreshCw, Database, Sparkles, CloudCheck, ShieldCheck } from 'lucide-react';

interface CompletionScreenProps {
  sessionData: ParticipantSession;
  onRestart: () => void;
  submissionStatus?: 'pending' | 'submitting' | 'success' | 'error';
  submissionMessage?: string;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  sessionData,
  onRestart,
  submissionStatus = 'success',
  submissionMessage
}) => {
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
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 text-center shadow-sm relative overflow-hidden space-y-6">
        {/* Top Icon */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Participação Concluída com Sucesso
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
            Muito obrigado pela sua participação!
          </h2>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Suas respostas foram registradas no banco de dados da pesquisa e contribuirão diretamente para o estudo fonético do Português Brasileiro.
          </p>
        </div>

        {/* Sync Status Badge */}
        {submissionStatus === 'success' && (
          <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium max-w-md mx-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{submissionMessage || 'Dados transmitidos e salvos na planilha da pesquisa.'}</span>
          </div>
        )}

        {/* Stats summary badge list */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">PARES DE ÁUDIO</span>
            <span className="text-lg font-bold text-indigo-700">
              {sessionData.audioPairResponses.length} avaliados
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">LOCALIZAÇÃO NO MAPA</span>
            <span className="text-lg font-bold text-indigo-700">
              {sessionData.mapClickResponses.length} marcações
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-[11px] font-mono text-slate-400 font-bold block">ORDEM ALEATÓRIA</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-1 font-mono">
              Registrada p/ análise
            </span>
          </div>
        </div>

        {/* Download copy for participant record */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-mono font-semibold">
              <Database className="w-4 h-4 text-indigo-600" />
              Código da Sessão: {sessionData.sessionId}
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-400">Comprovante / Backup</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={downloadCSV}
              id="btn-download-csv"
              className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Baixar Comprovante (.CSV)</span>
            </button>

            <button
              onClick={downloadJSON}
              id="btn-download-json"
              className="flex-1 py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Baixar JSON Completo</span>
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
          <span>Novo Teste (Reiniciar)</span>
        </button>
      </div>
    </div>
  );
};
