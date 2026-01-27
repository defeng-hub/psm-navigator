import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, Edit2, RotateCcw, Database, Download, Upload, Settings, Languages } from 'lucide-react';
import { Button, Input, Card } from '../../components/ui';
import { storage } from '../../storage';
import { AppSettings, PlatformConfig, VariableConfig } from '../../types';
import { useTranslation } from '../../i18n';

function App() {
  const { t, language, changeLanguage } = useTranslation();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'platforms' | 'variables' | 'data'>('platforms');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PlatformConfig>>({});
  const [varFormData, setVarFormData] = useState<Partial<VariableConfig>>({});
  const [importText, setImportText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSettings();
  }, [language]); // Reload when language changes to ensure state consistency if needed

  const loadSettings = async () => {
    const data = await storage.get();
    setSettings(data);
    setImportText(data.predefinedPsms?.join('\n') || '');
  };

  const handleImport = async () => {
    if (!settings) return;
    const psms = importText
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    // Remove duplicates
    const uniquePsms = Array.from(new Set(psms));
    
    const newSettings = { ...settings, predefinedPsms: uniquePsms };
    await storage.set(newSettings);
    setSettings(newSettings);
    alert(t('common.successImport', { count: uniquePsms.length }));
  };

  const handleExportConfig = () => {
    if (!settings) return;
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `psm-navigator-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const newSettings = JSON.parse(content) as AppSettings;
        
        // Basic validation
        if (!Array.isArray(newSettings.platforms) || !Array.isArray(newSettings.variables)) {
          throw new Error('Invalid configuration format');
        }

        if (confirm(t('common.confirmOverwrite'))) {
          await storage.set(newSettings);
          await loadSettings();
          alert(t('common.successImport', { count: 1 })); // Reuse or generic success
        }
      } catch (error) {
        alert(t('common.importFailed'));
        console.error(error);
      }
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleToggle = async (id: string) => {
    if (!settings) return;
    const newPlatforms = settings.platforms.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    const newSettings = { ...settings, platforms: newPlatforms };
    setSettings(newSettings);
    await storage.set(newSettings);
  };

  const handleDelete = async (id: string) => {
    if (!settings || !confirm(t('common.confirmDelete'))) return;
    const newPlatforms = settings.platforms.filter(p => p.id !== id);
    const newSettings = { ...settings, platforms: newPlatforms };
    setSettings(newSettings);
    await storage.set(newSettings);
  };

  const handleDeleteVar = async (id: string) => {
    if (!settings || !confirm(t('common.confirmDelete'))) return;
    const newVars = settings.variables.filter(v => v.id !== id);
    const newSettings = { ...settings, variables: newVars };
    setSettings(newSettings);
    await storage.set(newSettings);
  };

  const startEdit = (platform?: PlatformConfig) => {
    if (platform) {
      setEditingId(platform.id);
      setFormData(platform);
    } else {
      setEditingId('new');
      setFormData({ 
        name: '', 
        urlTemplate: '', 
        category: 'Custom', 
        enabled: true 
      });
    }
  };

  const startEditVar = (variable?: VariableConfig) => {
    if (variable) {
      setEditingId(variable.id);
      setVarFormData(variable);
    } else {
      setEditingId('new_var');
      setVarFormData({ 
        name: '', 
        values: [],
        defaultValue: ''
      });
    }
  };

  const saveEdit = async () => {
    if (!settings || !formData.name || !formData.urlTemplate) return;

    let newPlatforms;
    if (editingId === 'new') {
      const newPlatform: PlatformConfig = {
        id: Date.now().toString(),
        name: formData.name,
        urlTemplate: formData.urlTemplate,
        category: formData.category || 'Custom',
        enabled: true,
        icon: formData.icon
      };
      newPlatforms = [...settings.platforms, newPlatform];
    } else {
      newPlatforms = settings.platforms.map(p => 
        p.id === editingId ? { ...p, ...formData } as PlatformConfig : p
      );
    }

    const newSettings = { ...settings, platforms: newPlatforms };
    setSettings(newSettings);
    await storage.set(newSettings);
    setEditingId(null);
    setFormData({});
  };

  const saveEditVar = async () => {
    if (!settings || !varFormData.name || !varFormData.values) return;

    let newVars;
    if (editingId === 'new_var') {
      const newVar: VariableConfig = {
        id: Date.now().toString(),
        name: varFormData.name,
        values: varFormData.values,
        defaultValue: varFormData.defaultValue || varFormData.values[0]?.value
      };
      newVars = [...settings.variables, newVar];
    } else {
      newVars = settings.variables.map(v => 
        v.id === editingId ? { ...v, ...varFormData } as VariableConfig : v
      );
    }

    const newSettings = { ...settings, variables: newVars };
    setSettings(newSettings);
    await storage.set(newSettings);
    setEditingId(null);
    setVarFormData({});
  };

  const clearHistory = async () => {
    if (confirm(t('common.confirmClearHistory'))) {
      await storage.clearHistory();
      loadSettings();
    }
  };

  const clearAllData = async () => {
    const confirmation = prompt(t('common.confirmClearAll'));
    if (confirmation === 'delete all') {
      await storage.clearAllData();
      // Reload settings which will populate defaults
      loadSettings(); 
      alert(t('common.allDataCleared'));
    } else if (confirmation !== null) {
      alert(t('common.confirmationFailed'));
    }
  };

  if (!settings) return <div className="p-8 max-w-2xl mx-auto">{t('common.loading')}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('options.title')}</h1>
            <p className="text-gray-500">{t('options.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => changeLanguage(language === 'en' ? 'cn' : 'en')} className="flex items-center gap-2">
              <Languages size={16} /> {language === 'en' ? '中文' : 'English'}
            </Button>
            <Button variant="secondary" onClick={clearHistory} className="flex items-center gap-2">
              <RotateCcw size={16} /> {t('options.clearSearchHistory')}
            </Button>
            <Button variant="danger" onClick={clearAllData} className="flex items-center gap-2">
              <Trash2 size={16} /> {t('options.clearAllData')}
            </Button>
          </div>
        </header>

        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'platforms' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('platforms')}
          >
            {t('options.tabs.platforms')}
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'variables' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('variables')}
          >
            {t('options.tabs.variables')}
          </button>
          <button 
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${activeTab === 'data' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('data')}
          >
            {t('options.tabs.data')}
          </button>
        </div>

        {activeTab === 'platforms' && (
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('options.platforms.title')}</h2>
                <Button onClick={() => startEdit()} className="flex items-center gap-2">
                  <Plus size={16} /> {t('options.platforms.add')}
                </Button>
              </div>

              {editingId === 'new' && (
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-3">{t('options.platforms.new')}</h3>
                  <div className="grid gap-3">
                    <Input 
                      placeholder={t('options.platforms.namePlaceholder')} 
                      value={formData.name || ''} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    <div className="space-y-1">
                      <Input 
                        placeholder={t('options.platforms.urlPlaceholder')} 
                        value={formData.urlTemplate || ''} 
                        onChange={e => setFormData({...formData, urlTemplate: e.target.value})}
                      />
                      <p className="text-xs text-gray-500">{t('options.platforms.availableVars')} {`{psm}`}, {settings.variables.map(v => `{${v.name}}`).join(', ')}</p>
                    </div>
                    <Input 
                      placeholder={t('options.platforms.categoryPlaceholder')} 
                      value={formData.category || ''} 
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    />
                    <div className="flex gap-2 justify-end mt-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>{t('common.cancel')}</Button>
                      <Button onClick={saveEdit}>{t('options.platforms.save')}</Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {settings.platforms.map((platform) => (
                  <div key={platform.id} className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    {editingId === platform.id ? (
                      <div className="flex-1 grid gap-2 mr-4">
                        <div className="flex gap-2">
                          <Input 
                            className="flex-1"
                            value={formData.name || ''} 
                            onChange={e => setFormData({...formData, name: e.target.value})}
                          />
                          <Input 
                            className="w-1/3"
                            value={formData.category || ''} 
                            onChange={e => setFormData({...formData, category: e.target.value})}
                          />
                        </div>
                        <Input 
                          value={formData.urlTemplate || ''} 
                          onChange={e => setFormData({...formData, urlTemplate: e.target.value})}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>{t('common.cancel')}</Button>
                          <Button size="sm" onClick={saveEdit}>{t('common.save')}</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium">{platform.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{platform.category}</span>
                            {!platform.enabled && <span className="text-xs text-red-500 font-medium">{t('options.platforms.disabled')}</span>}
                          </div>
                          <p className="text-sm text-gray-500 font-mono mt-1 truncate max-w-lg">{platform.urlTemplate}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleToggle(platform.id)}
                            title={platform.enabled ? "Disable" : "Enable"}
                            className={platform.enabled ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-gray-400"}
                          >
                            <div className={`w-3 h-3 rounded-full ${platform.enabled ? 'bg-current' : 'border-2 border-current'}`} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => startEdit(platform)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(platform.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'variables' && (
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{t('options.variables.title')}</h2>
                <Button onClick={() => startEditVar()} className="flex items-center gap-2">
                  <Plus size={16} /> {t('options.variables.add')}
                </Button>
              </div>

              {editingId === 'new_var' && (
                <div className="mb-6 p-4 border border-blue-200 bg-blue-50 rounded-lg">
                  <h3 className="font-medium mb-3">{t('options.variables.new')}</h3>
                  <div className="grid gap-3">
                    <Input 
                      placeholder={t('options.variables.namePlaceholder')} 
                      value={varFormData.name || ''} 
                      onChange={e => setVarFormData({...varFormData, name: e.target.value})}
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Values (Name - Value)</label>
                      {(varFormData.values || []).map((val, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder="Name"
                            value={val.name}
                            onChange={e => {
                              const newVals = [...(varFormData.values || [])];
                              newVals[idx] = { ...newVals[idx], name: e.target.value };
                              setVarFormData({ ...varFormData, values: newVals });
                            }}
                            className="flex-1"
                          />
                          <Input
                            placeholder="Value"
                            value={val.value}
                            onChange={e => {
                              const newVals = [...(varFormData.values || [])];
                              newVals[idx] = { ...newVals[idx], value: e.target.value };
                              setVarFormData({ ...varFormData, values: newVals });
                            }}
                            className="flex-1"
                          />
                          <Button variant="ghost" size="icon" onClick={() => {
                            const newVals = (varFormData.values || []).filter((_, i) => i !== idx);
                            setVarFormData({ ...varFormData, values: newVals });
                          }}>
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="secondary" onClick={() => {
                        setVarFormData({ ...varFormData, values: [...(varFormData.values || []), { name: '', value: '' }] });
                      }}>
                        <Plus size={14} className="mr-1" /> Add Value
                      </Button>
                    </div>

                     <Input 
                      placeholder={t('options.variables.defaultPlaceholder')} 
                      value={varFormData.defaultValue || ''} 
                      onChange={e => setVarFormData({...varFormData, defaultValue: e.target.value})}
                    />
                    <div className="flex gap-2 justify-end mt-2">
                      <Button variant="ghost" onClick={() => setEditingId(null)}>{t('common.cancel')}</Button>
                      <Button onClick={saveEditVar}>{t('options.variables.save')}</Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {settings.variables.map((variable) => (
                  <div key={variable.id} className="flex items-center justify-between p-3 border rounded-lg bg-white hover:bg-gray-50 transition-colors">
                    {editingId === variable.id ? (
                      <div className="flex-1 grid gap-2 mr-4">
                        <Input 
                          value={varFormData.name || ''} 
                          onChange={e => setVarFormData({...varFormData, name: e.target.value})}
                        />
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">{t('options.variables.valuesPlaceholder')}</label>
                          {(varFormData.values || []).map((val, idx) => (
                            <div key={idx} className="flex gap-2">
                              <Input
                                placeholder="Name"
                                value={val.name}
                                onChange={e => {
                                  const newVals = [...(varFormData.values || [])];
                                  newVals[idx] = { ...newVals[idx], name: e.target.value };
                                  setVarFormData({ ...varFormData, values: newVals });
                                }}
                                className="flex-1"
                              />
                              <Input
                                placeholder="Value"
                                value={val.value}
                                onChange={e => {
                                  const newVals = [...(varFormData.values || [])];
                                  newVals[idx] = { ...newVals[idx], value: e.target.value };
                                  setVarFormData({ ...varFormData, values: newVals });
                                }}
                                className="flex-1"
                              />
                              <Button variant="ghost" size="icon" onClick={() => {
                                const newVals = (varFormData.values || []).filter((_, i) => i !== idx);
                                setVarFormData({ ...varFormData, values: newVals });
                              }}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          ))}
                          <Button size="sm" variant="secondary" onClick={() => {
                            setVarFormData({ ...varFormData, values: [...(varFormData.values || []), { name: '', value: '' }] });
                          }}>
                            <Plus size={14} className="mr-1" /> Add Value
                          </Button>
                        </div>

                         <Input 
                          placeholder={t('options.variables.defaultPlaceholder')}
                          value={varFormData.defaultValue || ''} 
                          onChange={e => setVarFormData({...varFormData, defaultValue: e.target.value})}
                        />
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>{t('common.cancel')}</Button>
                          <Button size="sm" onClick={saveEditVar}>{t('common.save')}</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-medium font-mono text-blue-600">{`{${variable.name}}`}</h3>
                            {variable.defaultValue && <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t('options.variables.default')} {variable.defaultValue}</span>}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {variable.values.map((v, i) => (
                              <span key={i} className="text-xs px-2 py-1 bg-gray-100 rounded border border-gray-200" title={v.value}>{v.name}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => startEditVar(variable)}>
                            <Edit2 size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDeleteVar(variable.id)}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Database size={20} /> {t('options.data.title')}
                </h2>
                <div className="text-sm text-gray-500">
                  {t('options.data.total')} <span className="font-bold text-gray-900">{settings.predefinedPsms?.length || 0}</span>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  {t('options.data.description')}
                </p>
                <textarea
                  className="w-full h-64 p-3 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder={t('options.data.placeholder')}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button onClick={handleImport}>
                  {t('options.data.update')}
                </Button>
              </div>

              <div className="mt-8 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Settings size={20} /> {t('options.data.backupTitle')}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {t('options.data.backupDesc')}
                </p>
                
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={handleExportConfig} className="flex items-center gap-2">
                    <Download size={16} /> {t('options.data.export')}
                  </Button>
                  
                  <div className="relative">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".json"
                      onChange={handleImportConfig}
                      className="hidden"
                    />
                    <Button 
                      variant="secondary" 
                      onClick={() => fileInputRef.current?.click()} 
                      className="flex items-center gap-2"
                    >
                      <Upload size={16} /> {t('options.data.import')}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
