import { ParticipantSession } from '../types';

/**
 * Generates a wide-format CSV where EACH ROW represents ONE PARTICIPANT (session).
 * Automatically excludes mapDetectedRegion and mapDetectedState as requested.
 */
export function generateWideCSV(sessions: ParticipantSession[]): string {
  if (!sessions || sessions.length === 0) {
    return '';
  }

  // Determine max number of audio pair responses and map responses across sessions
  let maxAudioPairs = 0;
  let maxMapClicks = 0;

  sessions.forEach((s) => {
    if (s.audioPairResponses && s.audioPairResponses.length > maxAudioPairs) {
      maxAudioPairs = s.audioPairResponses.length;
    }
    if (s.mapClickResponses && s.mapClickResponses.length > maxMapClicks) {
      maxMapClicks = s.mapClickResponses.length;
    }
  });

  // Build Header Row
  const headers: string[] = [
    // Identifiers & Timestamps
    'sessionId',
    'startTime',
    'endTime',
    'tcleAccepted',

    // Questionário Social
    'genero',
    'generoOutro',
    'faixaEtaria',
    'escolaridade',

    // Residência e Migração
    'regiaoOrigem',
    
    // Módulo Nordeste
    'nordeste_estadoNascimento',
    'nordeste_estadoNascimentoOutro',
    'nordeste_resideCampinas',
    'nordeste_tempoCampinas',
    'nordeste_tempoCampinasAnos',
    'nordeste_idadeChegadaCampinas',
    'nordeste_idadeChegadaCampinasAnos',

    // Módulo Sudeste
    'sudeste_eDeRMC',
    'sudeste_residiuOutrosLocais',
    'sudeste_residiuOutrosLocaisInfancia',
    'sudeste_outrosLocaisDetalhes',

    // Histórico de Residência
    'residiuOutrosLocais',
    'outrosLocaisDetalhes',

    // Classificação e Comentários
    'classificacaoMigratoria',
    'comentariosExperimento'
  ];

  // Dynamic headers for Audio Pair Comparison responses (Flattened)
  for (let i = 0; i < maxAudioPairs; i++) {
    const pNum = i + 1;
    headers.push(`audioPar${pNum}_id`);
    headers.push(`audioPar${pNum}_index`);
    headers.push(`audioPar${pNum}_diferencaScore`);
    headers.push(`audioPar${pNum}_ouviuAudio1Count`);
    headers.push(`audioPar${pNum}_ouviuAudio2Count`);
    headers.push(`audioPar${pNum}_tempoMs`);
  }

  // Dynamic headers for Map Dialect Geolocation responses (Flattened)
  for (let i = 0; i < maxMapClicks; i++) {
    const mNum = i + 1;
    headers.push(`mapaAmostra${mNum}_id`);
    headers.push(`mapaAmostra${mNum}_index`);
    headers.push(`mapaAmostra${mNum}_clickX_pct`);
    headers.push(`mapaAmostra${mNum}_clickY_pct`);
    headers.push(`mapaAmostra${mNum}_listenedCount`);
    headers.push(`mapaAmostra${mNum}_tempoMs`);
  }

  const rows: string[][] = [];

  sessions.forEach((s) => {
    const socio = s.sociodemographic || {};

    const row: string[] = [
      s.sessionId || '',
      s.startTime || '',
      s.endTime || '',
      s.tcleAccepted ? 'SIM' : 'NÃO',

      socio.genero || '',
      socio.generoOutro || '',
      socio.faixaEtaria || '',
      socio.escolaridade || '',

      socio.regiaoOrigem || '',

      socio.estadoNordeste || '',
      socio.estadoNordesteOutro || '',
      socio.resideCampinas || '',
      socio.tempoCampinas || '',
      socio.tempoCampinasAnos || '',
      socio.idadeChegadaCampinas || '',
      socio.idadeChegadaCampinasAnos || '',

      socio.eDeCampinasSudeste || '',
      socio.residiuOutrosLocaisSudeste || '',
      socio.residiuOutrosLocaisInfanciaSudeste || '',
      socio.outrosLocaisDetalhesSudeste || '',

      socio.residiuOutrosLocais || '',
      socio.outrosLocaisDetalhes || '',

      socio.classificacaoMigratoria || '',
      socio.comentariosExperimento || ''
    ];

    // Audio Pair Responses
    for (let i = 0; i < maxAudioPairs; i++) {
      const resp = s.audioPairResponses ? s.audioPairResponses[i] : null;
      if (resp) {
        row.push(resp.trialId || '');
        row.push(resp.pairIndex !== undefined ? resp.pairIndex.toString() : '');
        row.push(resp.differenceScore !== undefined ? resp.differenceScore.toString() : '');
        row.push(resp.listenedAudio1Count !== undefined ? resp.listenedAudio1Count.toString() : '');
        row.push(resp.listenedAudio2Count !== undefined ? resp.listenedAudio2Count.toString() : '');
        row.push(resp.timeTakenMs !== undefined ? resp.timeTakenMs.toString() : '');
      } else {
        row.push('', '', '', '', '', '');
      }
    }

    // Map Click Responses
    for (let i = 0; i < maxMapClicks; i++) {
      const resp = s.mapClickResponses ? s.mapClickResponses[i] : null;
      if (resp) {
        row.push(resp.trialId || '');
        row.push(resp.trialIndex !== undefined ? resp.trialIndex.toString() : '');
        row.push(resp.clickX !== undefined ? resp.clickX.toFixed(2) : '');
        row.push(resp.clickY !== undefined ? resp.clickY.toFixed(2) : '');
        row.push(resp.listenedCount !== undefined ? resp.listenedCount.toString() : '');
        row.push(resp.timeTakenMs !== undefined ? resp.timeTakenMs.toString() : '');
      } else {
        row.push('', '', '', '', '', '');
      }
    }

    rows.push(row);
  });

  const csvContent =
    'data:text/csv;charset=utf-8,\uFEFF' +
    [
      headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(','),
      ...rows.map((r) => r.map((val) => `"${val.replace(/"/g, '""')}"`).join(','))
    ].join('\n');

  return csvContent;
}

export function downloadCSVFile(csvContent: string, filename: string): void {
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
