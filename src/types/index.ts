export interface PlatformConfig {
  id: string;
  name: string;
  urlTemplate: string; // e.g. "https://grafana.internal/d/{psm}"
  category?: string;
  icon?: string; // Optional icon name from lucide-react or url
  enabled: boolean;
}

export interface VariableConfig {
  id: string;
  name: string; // e.g. "VRegion" (without {})
  values: { name: string; value: string }[]; // e.g. [{ name: "US", value: "us" }]
  defaultValue?: string;
}

export interface AppSettings {
  platforms: PlatformConfig[];
  variables: VariableConfig[];
  history: string[]; // List of recently visited PSMs
  predefinedPsms: string[]; // List of imported PSMs for autocomplete
  language: 'en' | 'cn';
  lastState?: {
    psm: string;
    selectedVars: Record<string, string>;
  };
}

export const DEFAULT_VARIABLES: VariableConfig[] = [
  {
    id: 'v1',
    name: 'Region',
    values: [
      { name: 'US', value: 'US' },
      { name: 'CN', value: 'CN' },
      { name: 'SG', value: 'SG' }
    ],
    defaultValue: 'US'
  },
  {
    id: 'v2',
    name: 'Env',
    values: [
      { name: 'prod', value: 'prod' },
      { name: 'boe', value: 'boe' },
      { name: 'ppe', value: 'ppe' }
    ],
    defaultValue: 'prod'
  }
];

export const DEFAULT_PLATFORMS: PlatformConfig[] = [
  {
    id: '1',
    name: 'SCM (Code)',
    urlTemplate: 'https://code.internal/search?q={psm}',
    category: 'Code',
    enabled: true,
  },
  {
    id: '2',
    name: 'TCE (Deploy)',
    urlTemplate: 'https://tce.internal/services/{psm}?region={VRegion}&env={Env}',
    category: 'Deployment',
    enabled: true,
  },
  {
    id: '3',
    name: 'Grafana (Metrics)',
    urlTemplate: 'https://grafana.internal/d/service-overview?var-service={psm}&var-region={VRegion}',
    category: 'Observability',
    enabled: true,
  },
  {
    id: '4',
    name: 'Kibana (Logs)',
    urlTemplate: 'https://kibana.internal/app/discover#/?_a=(query:(language:kuery,query:{psm}))',
    category: 'Observability',
    enabled: true,
  }
];
