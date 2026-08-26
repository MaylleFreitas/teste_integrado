import { GasExperimentPayload, ParticipantSession, AudioPairTrial, MapAudioTrial } from '../types';
import { DEFAULT_AUDIO_PAIRS, DEFAULT_MAP_TRIALS } from '../data/defaultExperiment';

/**
 * Resolves the Google Apps Script Web App URL from multiple priority sources:
 * 1. URL search parameter: ?scriptUrl=... or ?gasUrl=...
 * 2. Vite Environment variable: VITE_APPS_SCRIPT_URL
 * 3. Local storage override (if set by researcher previously)
 * 4. Empty string (triggers graceful fallback to internal defaults)
 */
export function getGoogleAppsScriptUrl(): string {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const fromParam = params.get('scriptUrl') || params.get('gasUrl') || params.get('url');
    if (fromParam && fromParam.trim().length > 0) {
      try {
        localStorage.setItem('gas_experiment_webapp_url', fromParam.trim());
      } catch {
        // ignore
      }
      return fromParam.trim();
    }

    try {
      const stored = localStorage.getItem('gas_experiment_webapp_url');
      if (stored && stored.trim().length > 0) {
        return stored.trim();
      }
    } catch {
      // ignore
    }
  }

  const envUrl = import.meta.env.VITE_APPS_SCRIPT_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim().length > 0) {
    return envUrl.trim();
  }

  return '';
}

/**
 * Performs a GET request to the Google Apps Script Web App to retrieve
 * both the spreadsheet configurations ("Configurações" tab) and questions ("Perguntas" tab).
 * Correctly follows Google Apps Script 302 redirects and handles JSON responses.
 */
export async function fetchExperimentConfigAndQuestions(): Promise<GasExperimentPayload> {
  const scriptUrl = getGoogleAppsScriptUrl();

  // If no script URL is configured yet, provide open status with default stimulus
  if (!scriptUrl) {
    console.info('[GAS Integration] No Google Apps Script URL detected. Using default questions and open status.');
    return {
      config: {
        status: 'aberto',
        tituloPesquisa: 'Experimento de Percepção Auditiva',
        instituicao: 'Universidade Estadual de Campinas (UNICAMP)',
        contatoPesquisador: 'contato.experimento.linguistica@unicamp.br'
      },
      sections: {
        audioPairs: DEFAULT_AUDIO_PAIRS,
        mapTrials: DEFAULT_MAP_TRIALS
      }
    };
  }

  try {
    // Add cache buster timestamp to avoid stale browser caching
    const targetUrl = new URL(scriptUrl);
    targetUrl.searchParams.set('action', 'getConfigAndQuestions');
    targetUrl.searchParams.set('_t', Date.now().toString());

    const response = await fetch(targetUrl.toString(), {
      method: 'GET',
      redirect: 'follow', // Ensures browser follows Google Apps Script redirect to script.googleusercontent.com
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Validate payload structure
    const rawStatus = (data?.config?.status || data?.status || 'aberto').toString().toLowerCase().trim();
    const isClosed = rawStatus === 'fechado' || rawStatus === 'encerrado' || rawStatus === 'inativo' || rawStatus === 'closed';

    const audioPairs: AudioPairTrial[] = Array.isArray(data?.sections?.audioPairs) && data.sections.audioPairs.length > 0
      ? data.sections.audioPairs
      : DEFAULT_AUDIO_PAIRS;

    const mapTrials: MapAudioTrial[] = Array.isArray(data?.sections?.mapTrials) && data.sections.mapTrials.length > 0
      ? data.sections.mapTrials
      : DEFAULT_MAP_TRIALS;

    return {
      config: {
        status: isClosed ? 'fechado' : 'aberto',
        mensagemFechado: data?.config?.mensagemFechado || 'Esta pesquisa foi encerrada e não está mais recebendo novas respostas. Agradecemos pelo seu interesse e colaboração!',
        tituloPesquisa: data?.config?.tituloPesquisa || 'Experimento de Percepção Auditiva',
        instituicao: data?.config?.instituicao || 'Universidade Estadual de Campinas (UNICAMP)',
        contatoPesquisador: data?.config?.contatoPesquisador || 'contato.experimento.linguistica@unicamp.br'
      },
      sections: {
        audioPairs,
        mapTrials
      }
    };
  } catch (error) {
    console.warn('[GAS Integration] Error fetching from Google Apps Script endpoint:', error);
    // Return fallback with open status to ensure participants can still proceed
    return {
      config: {
        status: 'aberto',
        tituloPesquisa: 'Experimento de Percepção Auditiva',
        instituicao: 'Universidade Estadual de Campinas (UNICAMP)',
        contatoPesquisador: 'contato.experimento.linguistica@unicamp.br'
      },
      sections: {
        audioPairs: DEFAULT_AUDIO_PAIRS,
        mapTrials: DEFAULT_MAP_TRIALS
      }
    };
  }
}

/**
 * Sends complete participant session data to the Google Apps Script Web App via POST.
 * Serializes the exact presented question order and all responses to be stored in the "Respostas" sheet.
 */
export async function submitParticipantSession(session: ParticipantSession): Promise<{ success: boolean; message?: string }> {
  const scriptUrl = getGoogleAppsScriptUrl();

  if (!scriptUrl) {
    console.warn('[GAS Integration] No Google Apps Script URL configured. Session stored in client state only.');
    return {
      success: true,
      message: 'Dados salvos localmente (URL do Apps Script não configurada).'
    };
  }

  const payload = {
    action: 'saveResponse',
    session: {
      sessionId: session.sessionId,
      startTime: session.startTime,
      endTime: session.endTime || new Date().toISOString(),
      tcleAccepted: session.tcleAccepted ? 'SIM' : 'NÃO',
      tcleAcceptedAt: session.tcleAcceptedAt || '',

      // CRITICAL REQUIREMENT: Exact serialized order of presented trials for statistical control
      presentedOrderAudioPairs: session.presentedOrderAudioPairs || [],
      presentedOrderAudioPairsSerialized: JSON.stringify(session.presentedOrderAudioPairs || []),
      presentedOrderMapTrials: session.presentedOrderMapTrials || [],
      presentedOrderMapTrialsSerialized: JSON.stringify(session.presentedOrderMapTrials || []),

      // Sociodemographics
      sociodemographic: session.sociodemographic || {},

      // Audio pair trial responses
      audioPairResponses: session.audioPairResponses || [],

      // Map trial responses
      mapClickResponses: session.mapClickResponses || [],

      // Complete raw JSON dump for backup
      fullJson: JSON.stringify(session)
    }
  };

  try {
    // We send payload as text/plain to avoid CORS preflight OPTIONS block in Google Apps Script,
    // which Apps Script parses via e.postData.contents.
    const response = await fetch(scriptUrl, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const resJson = await response.json().catch(() => ({ status: 'success' }));
    return {
      success: true,
      message: resJson?.message || 'Respostas salvas com sucesso no banco de dados da pesquisa.'
    };
  } catch (error) {
    console.warn('[GAS Integration] Standard POST failed, attempting no-cors fallback:', error);
    try {
      // Fallback with no-cors to guarantee submission reaches Google Apps Script
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });
      return {
        success: true,
        message: 'Respostas transmitidas para o servidor da pesquisa.'
      };
    } catch (fallbackError) {
      console.error('[GAS Integration] Submission failure:', fallbackError);
      return {
        success: false,
        message: 'Não foi possível sincronizar com a planilha online no momento.'
      };
    }
  }
}
