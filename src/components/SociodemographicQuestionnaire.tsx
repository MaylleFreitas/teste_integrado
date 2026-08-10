import React, { useState } from 'react';
import { SociodemographicData, Genero, FaixaEtaria, Escolaridade, RegiaoOrigem, EstadoNordeste, TempoCampinas, IdadeChegadaCampinas } from '../types';
import { User, MapPin, HelpCircle, ArrowRight, CheckCircle2, GitBranch, AlertCircle } from 'lucide-react';

interface SociodemographicQuestionnaireProps {
  onComplete: (data: SociodemographicData) => void;
}

export const SociodemographicQuestionnaire: React.FC<SociodemographicQuestionnaireProps> = ({ onComplete }) => {
  const [formData, setFormData] = useState<SociodemographicData>({
    genero: undefined,
    generoOutro: '',
    faixaEtaria: '18-35',
    idadeAnosExata: '',
    escolaridade: undefined,
    regiaoOrigem: undefined,
    estadoNordeste: undefined,
    estadoNordesteOutro: '',
    resideCampinas: undefined,
    tempoCampinas: undefined,
    tempoCampinasAnos: '',
    idadeChegadaCampinas: undefined,
    idadeChegadaCampinasAnos: '',
    residiuOutrosLocais: undefined,
    outrosLocaisDetalhes: '',
    comentariosExperimento: ''
  });

  const [useExactAgeMode, setUseExactAgeMode] = useState(false);
  const [useExactTempoMode, setUseExactTempoMode] = useState(false);
  const [useExactIdadeChegadaMode, setUseExactIdadeChegadaMode] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Compute conditional triggers
  const isNordeste = formData.regiaoOrigem === 'Nordeste';
  const isSudeste = formData.regiaoOrigem === 'Sudeste';
  const isOutraRegiao = ['Norte', 'Centro-Oeste', 'Sul', 'Exterior'].includes(formData.regiaoOrigem || '');

  // 2.3 Reside em Campinas?
  const resideEmCampinas = formData.resideCampinas === 'sim';
  const naoResideEmCampinas = formData.resideCampinas === 'nao';

  // Derived classification
  const classificacao: SociodemographicData['classificacaoMigratoria'] = isNordeste
    ? resideEmCampinas
      ? 'nordestino_migrante'
      : 'nordestino_nao_migrante'
    : 'outra_regiao';

  // Check if Section 2.6 should be visible:
  // Visible if Sudeste OR (Nordeste and Não Reside em Campinas) OR (Nordeste, Reside em Campinas and completed 2.4/2.5)
  const showSection26 = isSudeste || (isNordeste && naoResideEmCampinas) || (isNordeste && resideEmCampinas);

  // Check if Section 2.7 (outros locais) should be visible
  const showSection27 = showSection26 && formData.residiuOutrosLocais === 'sim';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Basic required fields validation
    if (!formData.genero) {
      setErrorMsg('Por favor, selecione seu gênero (1.1).');
      return;
    }
    if (formData.genero === 'outro' && !formData.generoOutro?.trim()) {
      setErrorMsg('Por favor, especifique o seu gênero no campo de texto.');
      return;
    }
    if (!formData.escolaridade) {
      setErrorMsg('Por favor, selecione sua escolaridade (1.3).');
      return;
    }
    if (!formData.regiaoOrigem) {
      setErrorMsg('Por favor, selecione a região em que você nasceu ou cresceu (2.1).');
      return;
    }

    if (isNordeste) {
      if (!formData.estadoNordeste) {
        setErrorMsg('Por favor, selecione o estado em que nasceu (2.2).');
        return;
      }
      if (formData.estadoNordeste === 'Outro' && !formData.estadoNordesteOutro?.trim()) {
        setErrorMsg('Por favor, especifique o estado no campo "Outro".');
        return;
      }
      if (!formData.resideCampinas) {
        setErrorMsg('Por favor, responda se reside atualmente em Campinas (2.3).');
        return;
      }
      if (resideEmCampinas) {
        if (!useExactTempoMode && !formData.tempoCampinas) {
          setErrorMsg('Por favor, informe há quanto tempo reside em Campinas (2.4).');
          return;
        }
        if (!useExactIdadeChegadaMode && !formData.idadeChegadaCampinas) {
          setErrorMsg('Por favor, informe com quantos anos chegou a Campinas (2.5).');
          return;
        }
      }
    }

    if (showSection26 && !formData.residiuOutrosLocais) {
      setErrorMsg('Por favor, responda se já residiu em outros locais (2.6).');
      return;
    }

    const finalData: SociodemographicData = {
      ...formData,
      classificacaoMigratoria: classificacao
    };

    onComplete(finalData);
  };

  return (
    <div className="max-w-3xl mx-auto my-6 px-4">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 text-xs font-mono font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
            4
          </span>
          <span className="text-xs text-slate-500 font-mono">Questionário Final</span>
        </div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
          Questionário Sociodemográfico e Linguístico
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Estas informações nos ajudam a compreender a diversidade de perfil dos participantes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SEÇÃO 1: SOCIAL */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">1. Questionário Social</h3>
          </div>

          {/* 1.1 Gênero */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              1.1 Qual é o seu gênero?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'feminino', label: 'Feminino' },
                { id: 'masculino', label: 'Masculino' },
                { id: 'nao_binario', label: 'Não binário' },
                { id: 'outro', label: 'Outro' },
                { id: 'prefiro_nao_responder', label: 'Prefiro não responder' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    formData.genero === item.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="genero"
                    value={item.id}
                    checked={formData.genero === item.id}
                    onChange={() => setFormData({ ...formData, genero: item.id as Genero })}
                    className="accent-indigo-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {formData.genero === 'outro' && (
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Por favor, especifique seu gênero..."
                  value={formData.generoOutro}
                  onChange={(e) => setFormData({ ...formData, generoOutro: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            )}
          </div>

          {/* 1.2 Faixa etária */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-semibold text-slate-800">
                1.2 Qual é a sua faixa etária?
              </label>
              <button
                type="button"
                onClick={() => setUseExactAgeMode(!useExactAgeMode)}
                className="text-xs text-indigo-600 hover:underline font-mono font-semibold"
              >
                {useExactAgeMode ? 'Alternar para categorias' : 'Alternar para idade exata (anos)'}
              </button>
            </div>

            {!useExactAgeMode ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: '18-35', label: '18–35 anos' },
                  { id: '36-59', label: '36–59 anos' },
                  { id: '60+', label: '60 anos ou mais' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                      formData.faixaEtaria === item.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="faixaEtaria"
                      value={item.id}
                      checked={formData.faixaEtaria === item.id}
                      onChange={() => setFormData({ ...formData, faixaEtaria: item.id })}
                      className="accent-indigo-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            ) : (
              <input
                type="number"
                min={18}
                max={120}
                placeholder="Informe sua idade em anos (ex: 28)..."
                value={formData.idadeAnosExata}
                onChange={(e) => setFormData({ ...formData, idadeAnosExata: e.target.value })}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            )}
          </div>

          {/* 1.3 Escolaridade */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-800">
              1.3 Qual é a sua escolaridade?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { id: 'fundamental', label: 'Até o ensino fundamental' },
                { id: 'medio', label: 'Ensino médio' },
                { id: 'superior_incompleto', label: 'Ensino superior incompleto' },
                { id: 'superior_completo', label: 'Ensino superior completo' },
                { id: 'pos_graduacao', label: 'Pós-graduação' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    formData.escolaridade === item.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="escolaridade"
                    value={item.id}
                    checked={formData.escolaridade === item.id}
                    onChange={() => setFormData({ ...formData, escolaridade: item.id as Escolaridade })}
                    className="accent-indigo-600"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: RESIDÊNCIA E MIGRAÇÃO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-base">2. Residência e Migração</h3>
          </div>

          {/* 2.1 Região de origem */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-800">
              2.1 Em qual região do Brasil você nasceu ou cresceu?
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                (Caso sejam diferentes, considere onde passou a maior parte da infância)
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul', 'Exterior'].map((reg) => (
                <label
                  key={reg}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                    formData.regiaoOrigem === reg
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="regiaoOrigem"
                    value={reg}
                    checked={formData.regiaoOrigem === reg}
                    onChange={() =>
                      setFormData({
                        ...formData,
                        regiaoOrigem: reg as RegiaoOrigem,
                        estadoNordeste: undefined,
                        resideCampinas: undefined
                      })
                    }
                    className="accent-indigo-600"
                  />
                  <span>{reg}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Lógica condicional 2.1 banner feedback */}
          {formData.regiaoOrigem && (
            <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-100 text-xs flex items-center gap-2 text-indigo-800 font-medium">
              <GitBranch className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>
                {isNordeste && 'Região selecionada: Nordeste -> Exibindo perguntas 2.2, 2.3, 2.4 e 2.5'}
                {isSudeste && 'Região selecionada: Sudeste -> Seguindo para pergunta 2.6'}
                {isOutraRegiao && `Região selecionada: ${formData.regiaoOrigem} -> Seguindo para encerramento do questionário (2.8)`}
              </span>
            </div>
          )}

          {/* CONDICIONAL NORDESTE (2.2 a 2.5) */}
          {isNordeste && (
            <div className="space-y-6 pt-4 border-t border-indigo-100 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
              <span className="text-xs font-mono font-bold text-indigo-800 uppercase tracking-wider block">
                Módulo Específico: Origem Nordeste
              </span>

              {/* 2.2 Estado de nascimento */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-800">
                  2.2 Em qual estado você nasceu?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {['Alagoas', 'Paraíba', 'Rio Grande do Norte', 'Sergipe', 'Outro'].map((est) => (
                    <label
                      key={est}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                        formData.estadoNordeste === est
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="estadoNordeste"
                        value={est}
                        checked={formData.estadoNordeste === est}
                        onChange={() => setFormData({ ...formData, estadoNordeste: est as EstadoNordeste })}
                        className="accent-indigo-600"
                      />
                      <span>{est}</span>
                    </label>
                  ))}
                </div>

                {formData.estadoNordeste === 'Outro' && (
                  <input
                    type="text"
                    placeholder="Informe o estado do Nordeste..."
                    value={formData.estadoNordesteOutro}
                    onChange={(e) => setFormData({ ...formData, estadoNordesteOutro: e.target.value })}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 mt-2"
                  />
                )}
              </div>

              {/* 2.3 Reside atualmente em Campinas? */}
              <div className="space-y-2 pt-2 border-t border-indigo-100">
                <label className="block text-sm font-semibold text-slate-800">
                  2.3 Você reside atualmente em Campinas?
                </label>
                <div className="flex gap-4">
                  {[
                    { id: 'sim', label: 'Sim' },
                    { id: 'nao', label: 'Não' },
                  ].map((item) => (
                    <label
                      key={item.id}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                        formData.resideCampinas === item.id
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="resideCampinas"
                        value={item.id}
                        checked={formData.resideCampinas === item.id}
                        onChange={() => setFormData({ ...formData, resideCampinas: item.id as 'sim' | 'nao' })}
                        className="accent-indigo-600"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                {formData.resideCampinas && (
                  <div className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mt-2">
                    Classificação do perfil: {classificacao === 'nordestino_migrante' ? 'Nordestino Migrante em Campinas' : 'Nordestino Não Migrante'}
                  </div>
                )}
              </div>

              {/* 2.4 e 2.5 Exibidos apenas se resideCampinas === 'sim' */}
              {resideEmCampinas && (
                <div className="space-y-6 pt-4 border-t border-indigo-200">
                  {/* 2.4 Tempo de residência em Campinas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-slate-800">
                        2.4 Há quanto tempo você reside em Campinas?
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseExactTempoMode(!useExactTempoMode)}
                        className="text-xs text-indigo-600 hover:underline font-mono font-semibold"
                      >
                        {useExactTempoMode ? 'Usar faixas' : 'Informar anos exatos'}
                      </button>
                    </div>

                    {!useExactTempoMode ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: '<1', label: 'Menos de 1 ano' },
                          { id: '1-5', label: '1–5 anos' },
                          { id: '6-10', label: '6–10 anos' },
                          { id: '11-20', label: '11–20 anos' },
                          { id: '>20', label: 'Mais de 20 anos' },
                        ].map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                              formData.tempoCampinas === item.id
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="tempoCampinas"
                              value={item.id}
                              checked={formData.tempoCampinas === item.id}
                              onChange={() => setFormData({ ...formData, tempoCampinas: item.id as TempoCampinas })}
                              className="accent-indigo-600"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Tempo em anos (ex: 8)..."
                        value={formData.tempoCampinasAnos}
                        onChange={(e) => setFormData({ ...formData, tempoCampinasAnos: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    )}
                  </div>

                  {/* 2.5 Idade com que chegou a Campinas */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-semibold text-slate-800">
                        2.5 Com quantos anos você chegou a Campinas?
                      </label>
                      <button
                        type="button"
                        onClick={() => setUseExactIdadeChegadaMode(!useExactIdadeChegadaMode)}
                        className="text-xs text-indigo-600 hover:underline font-mono font-semibold"
                      >
                        {useExactIdadeChegadaMode ? 'Usar faixas' : 'Informar idade exata em anos'}
                      </button>
                    </div>

                    {!useExactIdadeChegadaMode ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: '<12', label: 'Antes dos 12 anos' },
                          { id: '12-17', label: '12–17 anos' },
                          { id: '18-29', label: '18–29 anos' },
                          { id: '30-49', label: '30–49 anos' },
                          { id: '50+', label: '50 anos ou mais' },
                        ].map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs font-semibold transition-all ${
                              formData.idadeChegadaCampinas === item.id
                                ? 'bg-indigo-100 border-indigo-500 text-indigo-900'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="idadeChegadaCampinas"
                              value={item.id}
                              checked={formData.idadeChegadaCampinas === item.id}
                              onChange={() =>
                                setFormData({ ...formData, idadeChegadaCampinas: item.id as IdadeChegadaCampinas })
                              }
                              className="accent-indigo-600"
                            />
                            <span>{item.label}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        placeholder="Idade de chegada em anos (ex: 21)..."
                        value={formData.idadeChegadaCampinasAnos}
                        onChange={(e) => setFormData({ ...formData, idadeChegadaCampinasAnos: e.target.value })}
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2.6 Outros locais resididos */}
          {showSection26 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="block text-sm font-semibold text-slate-800">
                2.6 Além da região onde você nasceu ou cresceu e de Campinas, você já residiu em outros locais?
              </label>
              <div className="flex gap-4">
                {[
                  { id: 'sim', label: 'Sim' },
                  { id: 'nao', label: 'Não' },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer text-xs font-bold transition-all ${
                      formData.residiuOutrosLocais === item.id
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-indigo-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="residiuOutrosLocais"
                      value={item.id}
                      checked={formData.residiuOutrosLocais === item.id}
                      onChange={() => setFormData({ ...formData, residiuOutrosLocais: item.id as 'sim' | 'nao' })}
                      className="accent-indigo-600"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>

              {/* 2.7 Se sim para 2.6 */}
              {showSection27 && (
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    2.7 Em quais outros locais você residiu?
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Informe, se possível, a cidade, o estado e o tempo aproximado de residência em cada local.
                    </span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Salvador - BA (3 anos), Recife - PE (1 ano)..."
                    value={formData.outrosLocaisDetalhes}
                    onChange={(e) => setFormData({ ...formData, outrosLocaisDetalhes: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
            </div>
          )}

          {/* 2.8 Gostaria de falar algo sobre o experimento? */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <label className="block text-sm font-semibold text-slate-800">
              2.8 Gostaria de falar algo sobre o experimento?
              <span className="block text-xs font-normal text-slate-500 mt-0.5">
                (Comentários livres, observações sobre as vozes ou sobre a plataforma)
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Sua mensagem ou feedback voluntário..."
              value={formData.comentariosExperimento}
              onChange={(e) => setFormData({ ...formData, comentariosExperimento: e.target.value })}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Validation error msg */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-3 font-medium">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="btn-submit-sociodemographic"
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Finalizar Experimento</span>
          </button>
        </div>
      </form>
    </div>
  );
};
