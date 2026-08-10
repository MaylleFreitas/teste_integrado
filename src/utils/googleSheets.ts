import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import { ParticipantSession } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      if (cachedAccessToken && onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn && onAuthFailure) {
        onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogle = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Não foi possível obter o token do Google Sheets.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } finally {
    isSigningIn = false;
  }
};

export const getCachedAccessToken = (): string | null => cachedAccessToken;

export function extractSpreadsheetId(urlOrId: string): string {
  const clean = urlOrId.trim();
  const match = clean.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  return clean;
}

export async function createGoogleSpreadsheet(token: string, title = 'Experimento Fonetico - Respostas'): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Respostas_Participantes',
          },
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao criar planilha no Google Sheets');
  }

  const data = await response.json();
  const spreadsheetId = data.spreadsheetId;
  const spreadsheetUrl = data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // Write headers to newly created sheet
  await appendSpreadsheetRows(token, spreadsheetId, [
    [
      'ID da Sessão',
      'Data/Hora Início',
      'Data/Hora Fim',
      'TCLE Aceito',
      'Gênero',
      'Idade (Anos)',
      'Escolaridade',
      'Região Origem',
      'Reside em Campinas',
      'Tempo em Campinas',
      'Classificação Migratória',
      'Respostas Percepção (Resumo)',
      'Respostas Mapa (Resumo)',
      'Comentários',
      'JSON Completo da Sessão'
    ],
  ]);

  return { spreadsheetId, spreadsheetUrl };
}

export async function appendSpreadsheetRows(token: string, spreadsheetId: string, rows: (string | number | boolean)[][]): Promise<void> {
  const cleanId = extractSpreadsheetId(spreadsheetId);
  const range = 'A1';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanId}/values/${range}:append?valueInputOption=USER_ENTERED`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: rows,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Erro ao salvar linha no Google Sheets.');
  }
}

export function formatSessionRow(session: ParticipantSession): (string | number | boolean)[] {
  const socio = session.sociodemographic || {};
  
  const perceptionSummary = session.audioPairResponses
    ?.map((r) => `${r.trialId}: ${r.differenceScore}% (Ouviu:${r.listenedAudio1Count}/${r.listenedAudio2Count}, T:${r.timeTakenMs}ms)`)
    .join('; ') || '';

  const mapSummary = session.mapClickResponses
    ?.map((r) => `${r.trialId}->${r.detectedState || r.detectedRegion || 'Clique'} (${r.clickX.toFixed(1)}%, ${r.clickY.toFixed(1)}%)`)
    .join('; ') || '';

  return [
    session.sessionId,
    session.startTime ? new Date(session.startTime).toLocaleString('pt-BR') : '',
    session.endTime ? new Date(session.endTime).toLocaleString('pt-BR') : '',
    session.tcleAccepted ? 'SIM' : 'NÃO',
    socio.genero || '',
    socio.idadeAnosExata || socio.faixaEtaria || '',
    socio.escolaridade || '',
    socio.regiaoOrigem || '',
    socio.resideCampinas || '',
    socio.tempoCampinasAnos || socio.tempoCampinas || '',
    socio.classificacaoMigratoria || '',
    perceptionSummary,
    mapSummary,
    socio.comentariosExperimento || '',
    JSON.stringify(session),
  ];
}
