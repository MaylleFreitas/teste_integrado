export type ExperimentStage = 'tcle' | 'linguistic_pairs' | 'map_geolocation' | 'sociodemographic' | 'completed';

export interface AudioPairTrial {
  id: string;
  pairIndex: number;
  title1: string;
  title2: string;
  audio1Url?: string;
  audio2Url?: string;
  speechText1?: string;
  speechText2?: string;
  pitchShift1?: number;
  pitchShift2?: number;
  rate1?: number;
  rate2?: number;
  description?: string;
  phoneticNotes?: string;
}

export interface MapAudioTrial {
  id: string;
  trialIndex: number;
  title: string;
  audioUrl?: string;
  speechText?: string;
  accentLabel?: string;
  originRegion?: string;
  originState?: string;
}

export interface AudioPairResponse {
  trialId: string;
  pairIndex: number;
  differenceScore: number; // 0 to 100
  listenedAudio1Count: number;
  listenedAudio2Count: number;
  timeTakenMs: number;
}

export interface MapClickResponse {
  trialId: string;
  trialIndex: number;
  clickX: number; // Percentage relative to map box (0-100)
  clickY: number; // Percentage relative to map box (0-100)
  detectedState?: string;
  detectedRegion?: string;
  confidenceScore?: number; // 1-5 or 0-100
  listenedCount: number;
  timeTakenMs: number;
}

export type Genero = 'feminino' | 'masculino' | 'nao_binario' | 'outro' | 'prefiro_nao_responder';
export type FaixaEtaria = '18-35' | '36-59' | '60+' | string;
export type Escolaridade = 'fundamental' | 'medio' | 'superior_incompleto' | 'superior_completo' | 'pos_graduacao';
export type RegiaoOrigem = 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul' | 'Exterior';
export type EstadoNordeste = 'Alagoas' | 'Paraíba' | 'Rio Grande do Norte' | 'Sergipe' | 'Outro';
export type TempoCampinas = '<1' | '1-5' | '6-10' | '11-20' | '>20';
export type IdadeChegadaCampinas = '<12' | '12-17' | '18-29' | '30-49' | '50+';

export interface SociodemographicData {
  // 1. Social
  genero?: Genero;
  generoOutro?: string;
  faixaEtaria?: FaixaEtaria;
  idadeAnosExata?: string;
  escolaridade?: Escolaridade;

  // 2. Residência e migração
  regiaoOrigem?: RegiaoOrigem;
  
  // Condicional Nordeste (2.2)
  estadoNordeste?: EstadoNordeste;
  estadoNordesteOutro?: string;
  
  // Condicional Campinas (2.3)
  resideCampinas?: 'sim' | 'nao';
  
  // Condicional Nordestino em Campinas (2.4, 2.5)
  tempoCampinas?: TempoCampinas;
  tempoCampinasAnos?: string;
  idadeChegadaCampinas?: IdadeChegadaCampinas;
  idadeChegadaCampinasAnos?: string;

  // Classificação automática derivada
  classificacaoMigratoria?: 'nordestino_migrante' | 'nordestino_nao_migrante' | 'outra_regiao';

  // 2.6 e 2.7 Residência em outros locais
  residiuOutrosLocais?: 'sim' | 'nao';
  outrosLocaisDetalhes?: string;

  // 2.8 Comentários
  comentariosExperimento?: string;
}

export interface ParticipantSession {
  sessionId: string;
  startTime: string;
  endTime?: string;
  tcleAccepted: boolean;
  tcleAcceptedAt?: string;
  audioPairResponses: AudioPairResponse[];
  mapClickResponses: MapClickResponse[];
  sociodemographic: SociodemographicData;
}
