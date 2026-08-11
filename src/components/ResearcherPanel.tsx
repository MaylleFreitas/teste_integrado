import React, { useState } from 'react';
import { AudioPairTrial, MapAudioTrial, ParticipantSession } from '../types';
import { Settings, Plus, Trash2, Download, Volume2, MapPin, Database, RefreshCw, X, Play, CheckCircle, FileSpreadsheet, ExternalLink, Upload, FileJson, Save, Copy } from 'lucide-react';
import { playAudioItem } from '../utils/audioGenerator';
import { signInWithGoogle, createGoogleSpreadsheet, appendSpreadsheetRows, formatSessionRow, getCachedAccessToken } from '../utils/googleSheets';
import { generateWideCSV, downloadCSVFile } from '../utils/csvExport';

interface ResearcherPanelProps {
  audioPairs: AudioPairTrial[];
  setAudioPairs: React.Dispatch<React.SetStateAction<AudioPairTrial[]>>;
  mapTrials: MapAudioTrial[];
  setMapTrials: React.Dispatch<React.SetStateAction<MapAudioTrial[]>>;
  allSessions: ParticipantSession[];
  onClose: () => void;
  onResetDefaultStimuli: () => void;
}

export const ResearcherPanel: React.FC<ResearcherPanelProps> = ({
  audioPairs,
  setAudioPairs,
  mapTrials,
  setMapTrials,
  allSessions,
  onClose,
  onResetDefaultStimuli
}) => {
  const [activeTab, setActiveTab] = useState<'audio_pairs' | 'map_trials' | 'sessions_data'>('audio_pairs');

  // Form states to add new audio pair
  const [newPairTitle1, setNewPairTitle1] = useState('Gravação 13');
  const [newPairTitle2, setNewPairTitle2] = useState('Gravação 14');
  const [newSpeech1, setNewSpeech1] = useState('Exemplo de palavra A');
  const [newSpeech2, setNewSpeech2] = useState('Exemplo de palavra B');
  const [newUrl1, setNewUrl1] = useState('');
  const [newUrl2, setNewUrl2] = useState('');
  const [newPitch1, setNewPitch1] = useState(1.0);
  const [newPitch2, setNewPitch2] = useState(1.2);
  const [newDesc, setNewDesc] = useState('Amostra de áudio personalizada');

  // Form states to add new map trial
  const [newMapTitle, setNewMapTitle] = useState('Amostra de Fala 5');
  const [newMapSpeech, setNewMapSpeech] = useState('Amostra de fala');
  const [newMapUrl, setNewMapUrl] = useState('');
  const [newMapAccent, setNewMapAccent] = useState('Nordeste');

  // Batch audio pairing state
  interface BatchFileItem {
    id: string;
    word: string;
    name: string;
    url: string;
  }
  const [batchItems, setBatchItems] = useState<BatchFileItem[]>([]);
  const [newBatchWord, setNewBatchWord] = useState('Porta');

  const handleFileUpload = (file: File, setUrl: (url: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFilesUpload = (files: FileList) => {
    Array.from(files).forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const fileNameNoExt = file.name.replace(/\.[^/.]+$/, "");
          const guessedWord = newBatchWord.trim() || fileNameNoExt.split('_')[0] || 'Palavra';

          setBatchItems((prev) => [
            ...prev,
            {
              id: `file-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
              word: guessedWord,
              name: file.name,
              url: e.target.result as string
            }
          ]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGenerateWordPairs = () => {
    if (batchItems.length < 2) {
      alert('Selecione pelo menos 2 arquivos de áudio para gerar as combinações.');
      return;
    }

    // Group items by word
    const wordGroups: Record<string, BatchFileItem[]> = {};
    batchItems.forEach((item) => {
      const key = item.word.trim().toLowerCase();
      if (!wordGroups[key]) wordGroups[key] = [];
      wordGroups[key].push(item);
    });

    const generatedPairs: AudioPairTrial[] = [];
    let currentPairCount = audioPairs.length;

    Object.entries(wordGroups).forEach(([, items]) => {
      if (items.length < 2) return;
      const wordDisplayName = items[0].word;

      // Generate all pairwise combinations C(N, 2)
      for (let i = 0; i < items.length - 1; i++) {
        for (let j = i + 1; j < items.length; j++) {
          currentPairCount++;
          generatedPairs.push({
            id: `pair-auto-${Date.now()}-${currentPairCount}`,
            pairIndex: currentPairCount,
            title1: `Gravação ${(currentPairCount - 1) * 2 + 1}`,
            title2: `Gravação ${(currentPairCount - 1) * 2 + 2}`,
            speechText1: wordDisplayName,
            speechText2: wordDisplayName,
            audio1Url: items[i].url,
            audio2Url: items[j].url,
            description: `Combinação de mesma palavra "${wordDisplayName}"`
          });
        }
      }
    });

    if (generatedPairs.length === 0) {
      alert('Certifique-se de indicar a mesma palavra para pelo menos 2 áudios para formar o par.');
      return;
    }

    setAudioPairs((prev) => [...prev, ...generatedPairs]);
    alert(`${generatedPairs.length} par(es) de mesma palavra foram gerados e adicionados com sucesso!`);
    setBatchItems([]);
  };

  const handleAddPair = () => {
    const newPair: AudioPairTrial = {
      id: `pair-${Date.now()}`,
      pairIndex: audioPairs.length + 1,
      title1: newPairTitle1,
      title2: newPairTitle2,
      speechText1: newSpeech1,
      speechText2: newSpeech2,
      audio1Url: newUrl1,
      audio2Url: newUrl2,
      pitchShift1: newPitch1,
      pitchShift2: newPitch2,
      description: newDesc
    };

    setAudioPairs([...audioPairs, newPair]);
    setNewPairTitle1(`Gravação ${audioPairs.length * 2 + 3}`);
    setNewPairTitle2(`Gravação ${audioPairs.length * 2 + 4}`);
    setNewUrl1('');
    setNewUrl2('');
  };

  const handleDeletePair = (id: string) => {
    setAudioPairs(audioPairs.filter((p) => p.id !== id));
  };

  const handleAddMapTrial = () => {
    const newTrial: MapAudioTrial = {
      id: `map-trial-${Date.now()}`,
      trialIndex: mapTrials.length + 1,
      title: newMapTitle,
      speechText: newMapSpeech,
      audioUrl: newMapUrl,
      accentLabel: newMapAccent
    };

    setMapTrials([...mapTrials, newTrial]);
    setNewMapTitle(`Amostra de Fala ${mapTrials.length + 2}`);
    setNewMapUrl('');
  };

  const handleDeleteMapTrial = (id: string) => {
    setMapTrials(mapTrials.filter((mt) => mt.id !== id));
  };

  const handleExportConfigJSON = () => {
    const configData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      audioPairs,
      mapTrials,
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `config_estimulos_audio_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const [copiedConfig, setCopiedConfig] = useState(false);
  const handleCopyConfigJSON = () => {
    const configData = {
      audioPairs,
      mapTrials,
    };
    navigator.clipboard.writeText(JSON.stringify(configData, null, 2));
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 3000);
  };

  const handleImportConfigJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed.audioPairs) && Array.isArray(parsed.mapTrials)) {
          setAudioPairs(parsed.audioPairs);
          setMapTrials(parsed.mapTrials);
          alert('Configuração de áudios importada e salva com sucesso!');
        } else if (Array.isArray(parsed.audioPairs)) {
          setAudioPairs(parsed.audioPairs);
          alert('Pares de áudios importados e salvos com sucesso!');
        } else {
          alert('Formato de arquivo JSON inválido.');
        }
      } catch {
        alert('Erro ao processar o arquivo JSON de configuração.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Google Sheets integration state
  const [googleUser, setGoogleUser] = useState<string | null>(null);
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [sheetIdInput, setSheetIdInput] = useState<string>('');
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [sheetsSyncMsg, setSheetsSyncMsg] = useState<string | null>(null);

  const handleConnectGoogle = async () => {
    try {
      setSheetsSyncMsg('Conectando ao Google...');
      const res = await signInWithGoogle();
      setGoogleUser(res.user.email || res.user.displayName || 'Usuário Autenticado');
      setSheetsSyncMsg('Conectado ao Google Sheets com sucesso!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha na conexão com Google';
      setSheetsSyncMsg(`Erro de login: ${message}`);
    }
  };

  const handleCreateNewSpreadsheet = async () => {
    const token = getCachedAccessToken();
    if (!token) {
      alert('Por favor, clique primeiro em "Conectar Google" para autenticar.');
      return;
    }
    try {
      setIsSyncingSheets(true);
      setSheetsSyncMsg('Criando planilha no Google Drive...');
      const result = await createGoogleSpreadsheet(token, 'Resultados Experimento Fonetico');
      setSheetUrl(result.spreadsheetUrl);
      setSheetIdInput(result.spreadsheetId);
      setSheetsSyncMsg('Planilha criada com sucesso!');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao criar planilha';
      setSheetsSyncMsg(`Erro: ${message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleSyncAllToSheets = async () => {
    const token = getCachedAccessToken();
    if (!token) {
      alert('Por favor, conecte a sua conta do Google primeiro.');
      return;
    }
    const targetId = sheetIdInput.trim() || (sheetUrl ? sheetUrl.split('/d/')[1]?.split('/')[0] : '');
    if (!targetId) {
      alert('Informe o ID ou URL da planilha do Google Sheets ou clique em "Criar Nova Planilha".');
      return;
    }
    if (allSessions.length === 0) {
      alert('Nenhuma sessão para enviar no momento.');
      return;
    }

    try {
      setIsSyncingSheets(true);
      setSheetsSyncMsg('Enviando dados das sessões para o Google Sheets...');
      const rows = allSessions.map(formatSessionRow);
      await appendSpreadsheetRows(token, targetId, rows);
      setSheetsSyncMsg(`${allSessions.length} sessão(ões) sincronizada(s) para o Google Sheets com sucesso!`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro na sincronização';
      setSheetsSyncMsg(`Erro no envio: ${message}`);
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const exportAllSessionsCSV = () => {
    if (allSessions.length === 0) {
      alert('Nenhuma sessão gravada no banco local ainda.');
      return;
    }

    const csvContent = generateWideCSV(allSessions);
    downloadCSVFile(csvContent, `dataset_completo_experimento_${Date.now()}.csv`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                Painel do Pesquisador / Configuração de Estímulos
              </h2>
              <p className="text-xs text-slate-500">
                Gerencie pares de áudios, amostras do mapa e exporte dados da pesquisa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('audio_pairs')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audio_pairs'
                ? 'bg-white border-slate-200 text-indigo-700 font-bold border-b-white'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Pares de Áudios ({audioPairs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('map_trials')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'map_trials'
                ? 'bg-white border-slate-200 text-indigo-700 font-bold border-b-white'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Amostras do Mapa ({mapTrials.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('sessions_data')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-t border-x transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'sessions_data'
                ? 'bg-white border-slate-200 text-indigo-700 font-bold border-b-white'
                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Sessões / Dataset ({allSessions.length})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-white">
          {/* TAB 1: PARES DE ÁUDIO */}
          {activeTab === 'audio_pairs' && (
            <div className="space-y-6">
              {/* Persistence Banner & Backup Controls */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-xl shrink-0">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span>Salvamento Automático Ativo (IndexedDB)</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Seus áudios e pares modificados são salvos automaticamente neste navegador.
                    </p>
                    <p className="text-[10px] text-indigo-700 font-medium mt-0.5">
                      💡 <strong>Para outros dispositivos:</strong> Para que participantes em outros celulares/computadores ouçam seus áudios novos via link, clique em "Exportar JSON" e envie o arquivo ou me peça para definir esses áudios como padrão no código.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyConfigJSON}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    title="Copiar configuração JSON para colar no chat"
                  >
                    {copiedConfig ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-300" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copiar JSON (para o Chat)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleExportConfigJSON}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    title="Exportar configuração em JSON para backup"
                  >
                    <FileJson className="w-4 h-4" />
                    <span>Exportar JSON</span>
                  </button>

                  <label className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs">
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Importar JSON</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportConfigJSON}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={onResetDefaultStimuli}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Restaurar Padrão</span>
                  </button>
                </div>
              </div>

              {/* Existing Pairs List */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Estímulos de Áudio Atuais</h3>
                <div className="space-y-3">
                  {audioPairs.map((pair, idx) => (
                    <div
                      key={pair.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                            Par #{idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {pair.title1} x {pair.title2}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {pair.description || pair.phoneticNotes}
                        </p>
                        <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                          Texto A: "{pair.speechText1}" | Texto B: "{pair.speechText2}"
                          {pair.audio1Url ? ` | URL A: ${pair.audio1Url}` : ''}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            playAudioItem({
                              url: pair.audio1Url,
                              text: pair.speechText1,
                              pitch: pair.pitchShift1
                            })
                          }
                          className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Testar Áudio A"
                        >
                          <Play className="w-3.5 h-3.5" /> A
                        </button>

                        <button
                          onClick={() =>
                            playAudioItem({
                              url: pair.audio2Url,
                              text: pair.speechText2,
                              pitch: pair.pitchShift2
                            })
                          }
                          className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Testar Áudio B"
                        >
                          <Play className="w-3.5 h-3.5" /> B
                        </button>

                        <button
                          onClick={() => handleDeletePair(pair.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                          title="Excluir par"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Pair Form */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Adicionar Novo Par de Áudio
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Título Gravação 1</label>
                    <input
                      type="text"
                      value={newPairTitle1}
                      onChange={(e) => setNewPairTitle1(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Título Gravação 2</label>
                    <input
                      type="text"
                      value={newPairTitle2}
                      onChange={(e) => setNewPairTitle2(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Arquivo ou URL do Áudio 1 (.mp3, .wav)</label>
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setNewUrl1)}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Ou digite a URL: https://exemplo.com/audio1.mp3"
                        value={newUrl1}
                        onChange={(e) => setNewUrl1(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Arquivo ou URL do Áudio 2 (.mp3, .wav)</label>
                    <div className="space-y-1.5">
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setNewUrl2)}
                        className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="Ou digite a URL: https://exemplo.com/audio2.mp3"
                        value={newUrl2}
                        onChange={(e) => setNewUrl2(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Descrição / Nota Interna</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <button
                  onClick={handleAddPair}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Par à Lista</span>
                </button>
              </div>

              {/* Batch Upload & Auto-Combine Pairs Section */}
              <div className="p-5 bg-indigo-50/60 border border-indigo-100 rounded-2xl space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Importação Massiva & Combinação Automática por Palavra
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Envie múltiplos arquivos de áudio da mesma palavra para gerar automaticamente todas as combinações de pares C(n, 2).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Palavra falada nos áudios
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Porta, Menino, Carro"
                      value={newBatchWord}
                      onChange={(e) => setNewBatchWord(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Selecione múltiplos arquivos (.mp3, .wav)
                    </label>
                    <input
                      type="file"
                      multiple
                      accept="audio/*"
                      onChange={(e) => e.target.files && handleMultipleFilesUpload(e.target.files)}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                    />
                  </div>
                </div>

                {batchItems.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-indigo-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Arquivos carregados no lote ({batchItems.length}):
                      </span>
                      <button
                        onClick={() => setBatchItems([])}
                        className="text-[11px] text-rose-600 hover:underline font-semibold"
                      >
                        Limpar Lote
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {batchItems.map((item) => (
                        <div key={item.id} className="p-2 bg-white border border-slate-200 rounded-lg text-xs flex items-center justify-between">
                          <span className="font-mono text-slate-700 truncate max-w-[200px] sm:max-w-[300px]">
                            {item.name}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                            Palavra: {item.word}
                          </span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleGenerateWordPairs}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Gerar Combinações de Pares ({batchItems.length > 1 ? (batchItems.length * (batchItems.length - 1)) / 2 : 0} par/pares)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MAP TRIALS */}
          {activeTab === 'map_trials' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-800 mb-3">Amostras de Fala do Mapa</h3>
                <div className="space-y-3">
                  {mapTrials.map((mt, idx) => (
                    <div key={mt.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                            Amostra #{idx + 1}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {mt.title}
                          </span>
                          {mt.accentLabel && (
                            <span className="text-xs font-mono text-slate-500">
                              ({mt.accentLabel})
                            </span>
                          )}
                        </div>
                        {mt.audioUrl && (
                          <p className="text-[11px] font-mono text-slate-400 truncate">
                            URL: {mt.audioUrl}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => playAudioItem({ url: mt.audioUrl, text: mt.speechText })}
                          className="p-2 bg-white hover:bg-slate-100 border border-slate-200 text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          title="Testar Áudio"
                        >
                          <Play className="w-3.5 h-3.5" /> Ouvir
                        </button>

                        <button
                          onClick={() => handleDeleteMapTrial(mt.id)}
                          className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-lg cursor-pointer transition-colors"
                          title="Excluir amostra"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add New Map Trial Form */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Adicionar Amostra de Fala para o Mapa
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Título da Amostra</label>
                    <input
                      type="text"
                      value={newMapTitle}
                      onChange={(e) => setNewMapTitle(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Região / Sotaque Esperado</label>
                    <input
                      type="text"
                      placeholder="Ex: Nordeste (PE)"
                      value={newMapAccent}
                      onChange={(e) => setNewMapAccent(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Arquivo de Áudio (.mp3, .wav) ou URL</label>
                  <div className="space-y-1.5">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], setNewMapUrl)}
                      className="block w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                    />
                    <input
                      type="text"
                      placeholder="Ou digite a URL: https://exemplo.com/amostra.mp3"
                      value={newMapUrl}
                      onChange={(e) => setNewMapUrl(e.target.value)}
                      className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddMapTrial}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Amostra ao Mapa</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DATASET */}
          {activeTab === 'sessions_data' && (
            <div className="space-y-5">
              {/* Google Sheets Sync Card */}
              <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Integração Automática com Google Sheets
                      </h4>
                      <p className="text-xs text-slate-600">
                        Salve os dados de todos os participantes diretamente em uma planilha online do Google Drive.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleConnectGoogle}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{googleUser ? `Conectado (${googleUser})` : 'Conectar Google Sheets'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ID ou URL da Planilha no Google Sheets
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: 1xABC... ou cole o link da planilha"
                      value={sheetIdInput}
                      onChange={(e) => setSheetIdInput(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-emerald-500 font-mono"
                    />
                  </div>

                  <div className="flex items-end gap-2">
                    <button
                      onClick={handleCreateNewSpreadsheet}
                      disabled={isSyncingSheets}
                      className="flex-1 py-2.5 px-3 bg-white hover:bg-slate-50 border border-emerald-300 text-emerald-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Criar Nova Planilha</span>
                    </button>

                    <button
                      onClick={handleSyncAllToSheets}
                      disabled={isSyncingSheets}
                      className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{isSyncingSheets ? 'Enviando...' : 'Enviar para Planilha'}</span>
                    </button>
                  </div>
                </div>

                {sheetUrl && (
                  <div className="text-xs flex items-center gap-1.5 font-medium text-emerald-800 bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="truncate">Planilha ativa:</span>
                    <a
                      href={sheetUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold underline text-emerald-900 flex items-center gap-1 hover:text-emerald-700"
                    >
                      Abrir no Google Sheets <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}

                {sheetsSyncMsg && (
                  <div className="text-xs font-semibold text-slate-700 bg-emerald-100/60 p-2.5 rounded-xl border border-emerald-200">
                    {sheetsSyncMsg}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    Sessões Gravadas Localmente ({allSessions.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dados brutos das respostas de percepção e questionário armazenados no navegador
                  </p>
                </div>

                <button
                  onClick={exportAllSessionsCSV}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar CSV Local</span>
                </button>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs text-slate-700 border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 font-mono text-slate-500 font-bold">
                      <th className="p-3">Sessão ID</th>
                      <th className="p-3">Início</th>
                      <th className="p-3">Gênero</th>
                      <th className="p-3">Origem</th>
                      <th className="p-3">Migração Campinas</th>
                      <th className="p-3">Pares Respondidos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allSessions.map((s) => (
                      <tr key={s.sessionId} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-indigo-700">{s.sessionId}</td>
                        <td className="p-3 font-mono">{new Date(s.startTime).toLocaleTimeString()}</td>
                        <td className="p-3">{s.sociodemographic.genero || '-'}</td>
                        <td className="p-3">{s.sociodemographic.regiaoOrigem || '-'}</td>
                        <td className="p-3">{s.sociodemographic.classificacaoMigratoria || '-'}</td>
                        <td className="p-3 font-bold">{s.audioPairResponses.length} respostas</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onResetDefaultStimuli}
            className="text-xs text-slate-500 hover:text-amber-700 flex items-center gap-1 font-mono font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
            Restaurar Estímulos Padrão do Experimento
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
