export interface BrazilStateInfo {
  id: string; // e.g. "SP"
  name: string; // e.g. "São Paulo"
  region: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  path: string; // SVG path d attribute
  labelX: number; // approximate center X (0-1000 viewport)
  labelY: number; // approximate center Y (0-1000 viewport)
}

export interface RegionInfo {
  name: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
  color: string;
  states: string[];
}

export const BRAZIL_REGIONS: Record<string, RegionInfo> = {
  Norte: {
    name: 'Norte',
    color: '#0284c7', // Sky blue
    states: ['AC', 'AM', 'AP', 'PA', 'RO', 'RR', 'TO']
  },
  Nordeste: {
    name: 'Nordeste',
    color: '#ea580c', // Orange
    states: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE']
  },
  'Centro-Oeste': {
    name: 'Centro-Oeste',
    color: '#16a34a', // Emerald green
    states: ['DF', 'GO', 'MS', 'MT']
  },
  Sudeste: {
    name: 'Sudeste',
    color: '#9333ea', // Purple
    states: ['ES', 'MG', 'RJ', 'SP']
  },
  Sul: {
    name: 'Sul',
    color: '#e11d48', // Rose / Red
    states: ['PR', 'RS', 'SC']
  }
};

// Simplified, clean & geometrically accurate SVG map paths for Brazilian states inside a 0 0 1000 1000 viewBox.
export const BRAZIL_STATES: BrazilStateInfo[] = [
  // --- NORTE ---
  {
    id: 'RR',
    name: 'Roraima',
    region: 'Norte',
    labelX: 290,
    labelY: 100,
    path: 'M 240,40 L 330,40 L 350,130 L 290,170 L 230,120 Z'
  },
  {
    id: 'AP',
    name: 'Amapá',
    region: 'Norte',
    labelX: 520,
    labelY: 110,
    path: 'M 480,80 L 560,70 L 580,160 L 500,160 Z'
  },
  {
    id: 'AM',
    name: 'Amazonas',
    region: 'Norte',
    labelX: 200,
    labelY: 220,
    path: 'M 60,180 L 240,150 L 320,180 L 360,260 L 300,340 L 150,350 L 50,260 Z'
  },
  {
    id: 'PA',
    name: 'Pará',
    region: 'Norte',
    labelX: 440,
    labelY: 230,
    path: 'M 320,180 L 480,160 L 500,160 L 580,200 L 540,340 L 400,340 L 360,260 Z'
  },
  {
    id: 'AC',
    name: 'Acre',
    region: 'Norte',
    labelX: 80,
    labelY: 340,
    path: 'M 20,310 L 130,300 L 150,350 L 50,380 Z'
  },
  {
    id: 'RO',
    name: 'Rondônia',
    region: 'Norte',
    labelX: 220,
    labelY: 380,
    path: 'M 150,350 L 300,340 L 270,430 L 180,410 Z'
  },
  {
    id: 'TO',
    name: 'Tocantins',
    region: 'Norte',
    labelX: 520,
    labelY: 360,
    path: 'M 500,280 L 560,290 L 550,450 L 480,430 Z'
  },

  // --- NORDESTE ---
  {
    id: 'MA',
    name: 'Maranhão',
    region: 'Nordeste',
    labelX: 620,
    labelY: 250,
    path: 'M 580,200 L 670,220 L 640,320 L 560,290 Z'
  },
  {
    id: 'PI',
    name: 'Piauí',
    region: 'Nordeste',
    labelX: 670,
    labelY: 320,
    path: 'M 670,220 L 710,230 L 700,380 L 640,320 Z'
  },
  {
    id: 'CE',
    name: 'Ceará',
    region: 'Nordeste',
    labelX: 750,
    labelY: 230,
    path: 'M 710,200 L 800,200 L 780,270 L 710,230 Z'
  },
  {
    id: 'RN',
    name: 'Rio Grande do Norte',
    region: 'Nordeste',
    labelX: 840,
    labelY: 230,
    path: 'M 800,200 L 880,220 L 850,250 L 780,240 Z'
  },
  {
    id: 'PB',
    name: 'Paraíba',
    region: 'Nordeste',
    labelX: 840,
    labelY: 270,
    path: 'M 780,250 L 880,250 L 870,290 L 770,280 Z'
  },
  {
    id: 'PE',
    name: 'Pernambuco',
    region: 'Nordeste',
    labelX: 810,
    labelY: 310,
    path: 'M 720,280 L 880,290 L 860,330 L 710,310 Z'
  },
  {
    id: 'AL',
    name: 'Alagoas',
    region: 'Nordeste',
    labelX: 840,
    labelY: 350,
    path: 'M 810,330 L 870,330 L 850,370 L 800,360 Z'
  },
  {
    id: 'SE',
    name: 'Sergipe',
    region: 'Nordeste',
    labelX: 810,
    labelY: 380,
    path: 'M 790,360 L 840,370 L 820,400 L 780,390 Z'
  },
  {
    id: 'BA',
    name: 'Bahia',
    region: 'Nordeste',
    labelX: 700,
    labelY: 420,
    path: 'M 640,320 L 770,310 L 810,400 L 760,510 L 620,480 Z'
  },

  // --- CENTRO-OESTE ---
  {
    id: 'MT',
    name: 'Mato Grosso',
    region: 'Centro-Oeste',
    labelX: 360,
    labelY: 450,
    path: 'M 300,340 L 480,340 L 460,530 L 300,500 Z'
  },
  {
    id: 'GO',
    name: 'Goiás',
    region: 'Centro-Oeste',
    labelX: 520,
    labelY: 510,
    path: 'M 480,430 L 580,450 L 560,580 L 460,530 Z'
  },
  {
    id: 'DF',
    name: 'Distrito Federal',
    region: 'Centro-Oeste',
    labelX: 545,
    labelY: 515,
    path: 'M 535,505 L 555,505 L 555,525 L 535,525 Z'
  },
  {
    id: 'MS',
    name: 'Mato Grosso do Sul',
    region: 'Centro-Oeste',
    labelX: 380,
    labelY: 600,
    path: 'M 320,510 L 460,530 L 440,680 L 320,630 Z'
  },

  // --- SUDESTE ---
  {
    id: 'MG',
    name: 'Minas Gerais',
    region: 'Sudeste',
    labelX: 620,
    labelY: 570,
    path: 'M 560,480 L 720,500 L 680,640 L 520,600 Z'
  },
  {
    id: 'ES',
    name: 'Espírito Santo',
    region: 'Sudeste',
    labelX: 720,
    labelY: 610,
    path: 'M 690,580 L 740,590 L 730,650 L 680,640 Z'
  },
  {
    id: 'RJ',
    name: 'Rio de Janeiro',
    region: 'Sudeste',
    labelX: 670,
    labelY: 665,
    path: 'M 630,640 L 710,640 L 680,690 L 610,670 Z'
  },
  {
    id: 'SP',
    name: 'São Paulo',
    region: 'Sudeste',
    labelX: 530,
    labelY: 660,
    path: 'M 440,600 L 600,600 L 580,720 L 420,680 Z'
  },

  // --- SUL ---
  {
    id: 'PR',
    name: 'Paraná',
    region: 'Sul',
    labelX: 470,
    labelY: 730,
    path: 'M 410,680 L 530,710 L 510,780 L 390,750 Z'
  },
  {
    id: 'SC',
    name: 'Santa Catarina',
    region: 'Sul',
    labelX: 480,
    labelY: 800,
    path: 'M 410,760 L 520,770 L 500,840 L 410,810 Z'
  },
  {
    id: 'RS',
    name: 'Rio Grande do Sul',
    region: 'Sul',
    labelX: 440,
    labelY: 880,
    path: 'M 380,810 L 510,830 L 480,950 L 340,910 Z'
  }
];

/**
 * Determine state/region based on clicked SVG coordinate (0-1000)
 */
export function estimateStateFromCoordinates(xPercent: number, yPercent: number): {
  state?: BrazilStateInfo;
  region?: 'Norte' | 'Nordeste' | 'Centro-Oeste' | 'Sudeste' | 'Sul';
} {
  const x = (xPercent / 100) * 1000;
  const y = (yPercent / 100) * 1000;

  // Simple Euclidean distance to state centroid centers
  let closestState: BrazilStateInfo | null = null;
  let minDistance = Infinity;

  for (const state of BRAZIL_STATES) {
    const dx = x - state.labelX;
    const dy = y - state.labelY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < minDistance) {
      minDistance = dist;
      closestState = state;
    }
  }

  if (closestState) {
    return {
      state: closestState,
      region: closestState.region
    };
  }

  // Region fallback based on coordinates
  if (y < 420 && x < 550) return { region: 'Norte' };
  if (x >= 550 && y < 500) return { region: 'Nordeste' };
  if (x < 550 && y >= 420 && y < 650) return { region: 'Centro-Oeste' };
  if (x >= 500 && y >= 500 && y < 730) return { region: 'Sudeste' };
  if (y >= 730) return { region: 'Sul' };

  return { region: 'Sudeste' };
}
