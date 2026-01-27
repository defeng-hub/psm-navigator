import { AppSettings, DEFAULT_PLATFORMS, DEFAULT_VARIABLES } from '../types';

const STORAGE_KEY = 'psm_navigator_settings';

const defaultSettings: AppSettings = {
  platforms: DEFAULT_PLATFORMS,
  variables: DEFAULT_VARIABLES,
  history: [],
  predefinedPsms: [],
  language: 'en',
};

export const storage = {
  get: async (): Promise<AppSettings> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      const stored = result[STORAGE_KEY];
      if (!stored) return defaultSettings;
      
      // Merge with default to handle schema updates (e.g. adding variables)
      return {
        ...defaultSettings,
        ...stored,
        platforms: stored.platforms || defaultSettings.platforms,
        variables: stored.variables || defaultSettings.variables,
        history: stored.history || [],
        predefinedPsms: stored.predefinedPsms || [],
        language: stored.language || 'en',
      };
    } else {
      // Fallback for local development
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    }
  },

  set: async (settings: AppSettings): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.set({ [STORAGE_KEY]: settings });
    } else {
      // Fallback for local development
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
  },

  addHistory: async (psm: string): Promise<void> => {
    const settings = await storage.get();
    const newHistory = [psm, ...settings.history.filter(h => h !== psm)].slice(0, 10); // Keep last 10
    await storage.set({ ...settings, history: newHistory });
  },
  
  clearHistory: async (): Promise<void> => {
    const settings = await storage.get();
    await storage.set({ ...settings, history: [] });
  },

  clearAllData: async (): Promise<void> => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      await chrome.storage.local.clear();
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
};
