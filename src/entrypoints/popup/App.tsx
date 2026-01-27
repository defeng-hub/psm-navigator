import { useEffect, useState } from 'react';
import { Settings, Search, ExternalLink, Clock } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { storage } from '../../storage';
import { navigatorService } from '../../services/navigator';
import { AppSettings, PlatformConfig, VariableConfig } from '../../types';
import { useTranslation } from '../../i18n';

function App() {
  const { t } = useTranslation();
  const [psm, setPsm] = useState('');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedVars, setSelectedVars] = useState<Record<string, string>>({});
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (!settings?.predefinedPsms || !psm) {
      setSuggestions([]);
      return;
    }
    
    // Simple fuzzy search: check if PSM includes the input string (case insensitive)
    // Limit to top 5 matches
    const input = psm.toLowerCase();
    const matches = settings.predefinedPsms
      .filter(p => p.toLowerCase().includes(input) && p.toLowerCase() !== input)
      .slice(0, 5);
      
    setSuggestions(matches);
  }, [psm, settings]);

  const loadSettings = async () => {
    const data = await storage.get();
    setSettings(data);
    
    // Initialize defaults
    const defaults: Record<string, string> = {};
    data.variables.forEach(v => {
      defaults[v.name] = v.defaultValue || v.values[0];
    });
    setSelectedVars(defaults);
  };

  const handleJump = async (platform: PlatformConfig) => {
    if (!psm.trim()) return;
    
    // Use current selected variables
    const url = navigatorService.generateUrl(platform.urlTemplate, psm.trim(), selectedVars);
    await storage.addHistory(psm.trim());
    navigatorService.openUrl(url);
    
    // Refresh history
    loadSettings();
  };

  const handleHistoryClick = (historyPsm: string) => {
    setPsm(historyPsm);
    setSuggestions([]); // Clear suggestions when selecting from history
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPsm(suggestion);
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleVarChange = (name: string, value: string) => {
    setSelectedVars(prev => ({ ...prev, [name]: value }));
  };

  const openOptions = () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('/src/entrypoints/options/index.html', '_blank');
    }
  };

  if (!settings) return <div className="p-4">{t('common.loading')}</div>;

  const enabledPlatforms = settings.platforms.filter(p => p.enabled);

  return (
    <div className="w-[400px] min-h-[300px] bg-gray-50 p-4 font-sans text-gray-900">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <span className="bg-blue-600 text-white p-1 rounded">PSM</span> Navigator
        </h1>
        <Button variant="ghost" size="icon" onClick={openOptions} className="p-2" title={t('popup.settings')}>
          <Settings size={20} />
        </Button>
      </div>

      <div className="mb-6 relative">
        <Search className="absolute left-3 top-2 text-gray-400" size={16} />
        <Input 
          autoFocus
          placeholder={t('popup.placeholder')}
          className="pl-9 h-8 text-sm"
          value={psm}
          onChange={(e) => setPsm(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && enabledPlatforms.length > 0) {
              handleJump(enabledPlatforms[0]);
            }
          }}
        />
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
            {suggestions.map((s) => (
              <div
                key={s}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700"
                onClick={() => handleSuggestionClick(s)}
              >
                {s}
              </div>
            ))}
          </div>
        )}
      </div>

      {settings.history.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Clock size={12} /> {t('popup.recent')}
          </h2>
          <div className="flex flex-wrap gap-2">
            {settings.history.map((h) => (
              <button
                key={h}
                onClick={() => handleHistoryClick(h)}
                className="bg-white border border-gray-200 px-2 py-1 rounded text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
              >
                {h}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {enabledPlatforms.map((platform) => {
          const usedVars = navigatorService.extractVariables(platform.urlTemplate);
          const platformVars = usedVars
            .map(name => settings.variables.find(v => v.name === name))
            .filter((v): v is VariableConfig => !!v);

          return (
            <Card 
              key={platform.id}
              className="p-3 hover:border-blue-500 hover:shadow-md transition-all group"
            >
              <div 
                className="flex items-center justify-between cursor-pointer mb-2"
                onClick={() => handleJump(platform)}
              >
                <div className="flex items-center gap-2">
                   <span className="font-medium text-gray-900">{platform.name}</span>
                   <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{platform.category}</span>
                </div>
                <ExternalLink size={14} className="text-gray-400 group-hover:text-blue-500" />
              </div>

              {platformVars.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100">
                  {platformVars.map(v => (
                    <div key={v.id} className="flex items-center gap-2 text-xs">
                      <span className="text-gray-500 font-medium">{v.name}:</span>
                      <div className="flex bg-gray-100 rounded p-0.5">
                        {v.values.map(val => (
                          <button
                            key={val}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleVarChange(v.name, val);
                            }}
                            className={`px-2 py-0.5 rounded transition-colors ${
                              selectedVars[v.name] === val 
                                ? 'bg-white text-blue-600 shadow-sm font-medium' 
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {enabledPlatforms.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          {t('popup.noPlatforms')} <br/>
          <button onClick={openOptions} className="text-blue-600 underline hover:text-blue-800">{t('popup.configure')}</button>
        </div>
      )}
    </div>
  );
}

export default App;
