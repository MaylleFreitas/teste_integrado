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
    id: 'pair-caixa',
    pairIndex: 1,
    title1: 'Gravação 1',
    title2: 'Gravação 2',
    audio1Url: 'https://www.dropbox.com/scl/fi/i3os1xkcgfez21xcypceg/caixa_a.mp3?rlkey=sxb3j59ihsy7rouvry0n7aqtj&st=c9j8nm0e&raw=1',
    audio2Url: 'https://www.dropbox.com/scl/fi/wi5azgaqp60f0vyihu97d/caixa_ai.mp3?rlkey=m67sbeyes9wmgesjunws27lxu&st=etx5kwee&raw=1',
    speechText1: 'Caixa',
    speechText2: 'Caixa',
    pitchShift1: 1.0,
    pitchShift2: 1.0,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação da palavra "Caixa"',
    phoneticNotes: 'caixa_a vs caixa_ai'
  },
  {
    id: 'pair-peixe',
    pairIndex: 2,
    title1: 'Gravação 3',
    title2: 'Gravação 4',
    audio1Url: 'https://www.dropbox.com/scl/fi/j0hxeseckdg27u0nqgp08/peixe_e.mp3?rlkey=jpxnrvrdfsj8tpap03k8fkqkq&st=qvf483o6&raw=1',
    audio2Url: 'https://www.dropbox.com/scl/fi/qgtm1k1bbmreyjo0attyg/peixe_ei.mp3?rlkey=ol4g46qolyb5a21yb54udnk89&st=h94jag69&raw=1',
    speechText1: 'Peixe',
    speechText2: 'Peixe',
    pitchShift1: 1.0,
    pitchShift2: 1.0,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação da palavra "Peixe"',
    phoneticNotes: 'peixe_e vs peixe_ei'
  },
  {
    id: 'pair-pelicula',
    pairIndex: 3,
    title1: 'Gravação 5',
    title2: 'Gravação 6',
    audio1Url: 'https://www.dropbox.com/scl/fi/1eajet4wzmq7vozkbfptk/pelicula_3.mp3?rlkey=qmifwg6arv2zknezf20cfj5vw&st=ryuiku2z&raw=1',
    audio2Url: 'https://www.dropbox.com/scl/fi/ggn3zjyfqq8snfh6p00ma/pelicula_e.mp3?rlkey=zhv8p00uxcd35oe0hnaj8en4x&st=ijzo8h7u&raw=1',
    speechText1: 'Película',
    speechText2: 'Película',
    pitchShift1: 1.0,
    pitchShift2: 1.0,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação da palavra "Película"',
    phoneticNotes: 'pelicula_3 vs pelicula_e'
  },
  {
    id: 'pair-porta-1',
    pairIndex: 4,
    title1: 'Gravação 7',
    title2: 'Gravação 8',
    audio1Url: 'https://www.dropbox.com/scl/fi/tarwlsrqdqfw3ksk680xy/porta_h.mp3?rlkey=fx0onathtqv31fd9ad9xbcy83&st=g5js7496&raw=1',
    audio2Url: 'https://www.dropbox.com/scl/fi/g5werfnzkrajeo2kh8apx/porta_r.mp3?rlkey=x23a5kzj9oua1ivkrsm360mof&st=j4u6dgak&raw=1',
    speechText1: 'Porta',
    speechText2: 'Porta',
    pitchShift1: 1.0,
    pitchShift2: 1.0,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação da palavra "Porta"',
    phoneticNotes: 'porta_h vs porta_r'
  },
  {
    id: 'pair-porta-2',
    pairIndex: 5,
    title1: 'Gravação 9',
    title2: 'Gravação 10',
    audio1Url: 'https://www.dropbox.com/scl/fi/l0qn37qnhf5hotviq43q3/porta_i.mp3?rlkey=5xmguqpho6m6cdhnd8p5mjq8q&st=1j6kcslm&raw=1',
    audio2Url: 'https://www.dropbox.com/scl/fi/be9f453aer38sa41n0rvc/porta_t.mp3?rlkey=8cgfavg12lijs9438mtxirboz&st=r9ux0v2w&raw=1',
    speechText1: 'Porta',
    speechText2: 'Porta',
    pitchShift1: 1.0,
    pitchShift2: 1.0,
    rate1: 1.0,
    rate2: 1.0,
    description: 'Combinação da palavra "Porta"',
    phoneticNotes: 'porta_i vs porta_t'
  }
];

export const DEFAULT_MAP_TRIALS: MapAudioTrial[] = [
  {
    id: 'map-trial-1',
    trialIndex: 1,
    title: 'Amostra de Fala 1',
    audioUrl: 'https://www.dropbox.com/scl/fi/tarwlsrqdqfw3ksk680xy/porta_h.mp3?rlkey=fx0onathtqv31fd9ad9xbcy83&st=g5js7496&raw=1',
    speechText: 'Porta',
    accentLabel: 'Sudeste',
    originRegion: 'Sudeste',
    originState: 'SP'
  },
  {
    id: 'map-trial-2',
    trialIndex: 2,
    title: 'Amostra de Fala 2',
    audioUrl: 'https://www.dropbox.com/scl/fi/i3os1xkcgfez21xcypceg/caixa_a.mp3?rlkey=sxb3j59ihsy7rouvry0n7aqtj&st=c9j8nm0e&raw=1',
    speechText: 'Caixa',
    accentLabel: 'Nordeste',
    originRegion: 'Nordeste',
    originState: 'PE'
  },
  {
    id: 'map-trial-3',
    trialIndex: 3,
    title: 'Amostra de Fala 3',
    audioUrl: 'https://www.dropbox.com/scl/fi/j0hxeseckdg27u0nqgp08/peixe_e.mp3?rlkey=jpxnrvrdfsj8tpap03k8fkqkq&st=qvf483o6&raw=1',
    speechText: 'Peixe',
    accentLabel: 'Sudeste',
    originRegion: 'Sudeste',
    originState: 'RJ'
  },
  {
    id: 'map-trial-4',
    trialIndex: 4,
    title: 'Amostra de Fala 4',
    audioUrl: 'https://www.dropbox.com/scl/fi/ggn3zjyfqq8snfh6p00ma/pelicula_e.mp3?rlkey=zhv8p00uxcd35oe0hnaj8en4x&st=ijzo8h7u&raw=1',
    speechText: 'Película',
    accentLabel: 'Sul',
    originRegion: 'Sul',
    originState: 'RS'
  }
];
