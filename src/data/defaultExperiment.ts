import { AudioPairTrial, MapAudioTrial } from '../types';

export const DEFAULT_TCLE_TEXT = {
  titulo: 'Termo de Consentimento Livre e Esclarecido (TCLE)',
  projeto: 'Estudo Experimental de Percepção Auditiva do Português Brasileiro',
  pesquisadores: 'Laboratório de Estudos Linguísticos e Fonéticos',
  instituicao: 'Universidade Estadual de Campinas (UNICAMP)',
  introducao: `Você está sendo convidado(a) a participar como voluntário(a) do experimento de percepção auditiva intitulado "Teste de percepção auditiva". O objetivo desta pesquisa é investigar como ouvintes de diferentes regiões e trajetórias de migração percebem nuances fonéticas no Português Brasileiro.`,
  procedimentos: `Sua participação consiste nas seguintes partes:
1. **Seção 1 — Leitura e Aceite do TCLE**: Confirmação da sua concordância voluntária em participar.
2. **Seção 2 — Comparar e Avaliar Amostras de Áudio**: Você ouvirá pares de gravações e avaliará o quão diferentes elas soam em uma escala contínua (0 a 100).
3. **Seção 3 — Teste de Geolocalização Dialetal**: Indicação de origem no mapa interativo.
4. **Seção 4 — Questionário Sociodemográfico**: Perguntas breves sobre perfil sociodemográfico e histórico linguístico.`,
  tempoEstimado: 'Aproximadamente 10 a 15 minutos.',
  riscosBeneficios: `Não há riscos físicos ou desconforto previstos além do esforço normal de atenção para ouvir áudios em um computador ou smartphone. Como benefício, você contribuirá diretamente para a compreensão científica da percepção auditiva no Brasil.`,
  confidencialidade: `Todos os dados coletados serão mantidos estritamente confidenciais e anônimos. Nenhum dado de identificação pessoal direta (como CPF ou nome completo) será armazenado. Os resultados serão analisados de forma agregada para fins acadêmicos e de publicação científica.`,
  voluntariedade: `A sua participação é totalmente voluntária. Você pode desistir de participar a qualquer momento sem qualquer tipo de prejuízo.`,
  contato: `Para dúvidas sobre a pesquisa, entre em contato com a equipe responsável pelo e-mail: contato.experimento.linguistica@unicamp.br`
};

export const DEFAULT_AUDIO_PAIRS: AudioPairTrial[] = [
  {
    id: 'pair-1',
    pairIndex: 1,
    title1: 'Gravação 1',
    title2: 'Gravação 2',
    audio1Url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Pt-br-Porta.ogg/Pt-br-Porta.ogg.mp3',
    audio2Url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Pt-br-Porta.ogg/Pt-br-Porta.ogg.mp3',
    speechText1: 'Porta',
    speechText2: 'Porta',
    pitchShift1: 1.0,
    pitchShift2: 1.05,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação de mesma palavra "Porta"',
    phoneticNotes: 'Amostra A vs Amostra B'
  },
  {
    id: 'pair-2',
    pairIndex: 2,
    title1: 'Gravação 3',
    title2: 'Gravação 4',
    audio1Url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Pt-br-Porta.ogg/Pt-br-Porta.ogg.mp3',
    audio2Url: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Pt-br-Porta.ogg/Pt-br-Porta.ogg.mp3',
    speechText1: 'Porta',
    speechText2: 'Porta',
    pitchShift1: 1.0,
    pitchShift2: 0.95,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação de mesma palavra "Porta"',
    phoneticNotes: 'Amostra C vs Amostra D'
  }
];

export const DEFAULT_MAP_TRIALS: MapAudioTrial[] = [
  {
    id: 'map-trial-1',
    trialIndex: 1,
    title: 'Amostra de Fala 1',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/2/23/Pt-br-Menino.ogg/Pt-br-Menino.ogg.mp3',
    speechText: 'Menino',
    accentLabel: 'Nordeste',
    originRegion: 'Nordeste',
    originState: 'PE'
  },
  {
    id: 'map-trial-2',
    trialIndex: 2,
    title: 'Amostra de Fala 2',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/3/3d/Pt-br-Porta.ogg/Pt-br-Porta.ogg.mp3',
    speechText: 'Porta',
    accentLabel: 'Sudeste',
    originRegion: 'Sudeste',
    originState: 'SP'
  },
  {
    id: 'map-trial-3',
    trialIndex: 3,
    title: 'Amostra de Fala 3',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/d/d1/Pt-br-Carro.ogg/Pt-br-Carro.ogg.mp3',
    speechText: 'Carro',
    accentLabel: 'Sudeste',
    originRegion: 'Sudeste',
    originState: 'RJ'
  },
  {
    id: 'map-trial-4',
    trialIndex: 4,
    title: 'Amostra de Fala 4',
    audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1a/Pt-br-Brasil.ogg/Pt-br-Brasil.ogg.mp3',
    speechText: 'Brasil',
    accentLabel: 'Sul',
    originRegion: 'Sul',
    originState: 'RS'
  }
];
