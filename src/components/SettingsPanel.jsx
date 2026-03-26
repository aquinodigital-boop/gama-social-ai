import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { GEMINI_MODELS } from '../providers/GeminiProvider.js';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Key, Check, Zap, Brain, Sun, Moon } from 'lucide-react';

export function SettingsPanel() {
  const { apiKey, setApiKey, model, setModel, theme, toggleTheme } = useAppContext();
  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiKey(tempKey);
    setSaved(true);
    toast.success('API Key salva com sucesso!');
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-xl fade-in">
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Configurações</h2>
        <p className="text-xs text-text-muted">Gerencie sua conexão com o Gemini e preferências</p>
      </div>

      {/* API Key */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">API Key do Gemini</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apikey" className="text-xs text-text-muted">Chave de API</Label>
          <div className="flex gap-2">
            <Input
              id="apikey"
              type="password"
              placeholder="AIzaSy..."
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              className="flex-1 h-9 text-xs"
            />
            <Button onClick={handleSave} size="sm" className="bg-coral hover:bg-coral-dark text-white text-xs h-9">
              {saved ? <><Check size={14} className="mr-1" /> Salvo</> : 'Salvar'}
            </Button>
          </div>
          <p className="text-[10px] text-text-muted">
            Obtenha sua chave em ai.google.dev. A chave é salva localmente no navegador.
          </p>
        </div>
      </div>

      {/* Model */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-text-primary">Modelo Gemini</h3>
        <div className="space-y-2">
          {GEMINI_MODELS.map(m => (
            <button
              key={m.id}
              onClick={() => setModel(m.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
                model === m.id
                  ? 'border-coral bg-coral/10'
                  : 'border-border bg-surface-bg hover:border-navy-light dark:hover:border-coral/30'
              )}
            >
              {m.id.includes('flash') ? <Zap size={16} className="text-coral" /> : <Brain size={16} className="text-coral" />}
              <div>
                <span className="text-xs font-medium text-text-primary">{m.label}</span>
                <p className="text-[10px] text-text-muted">{m.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-text-primary">Aparência</h3>
        <div className="flex gap-2">
          <button
            onClick={() => { if (theme !== 'light') toggleTheme(); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all',
              theme === 'light' ? 'border-coral bg-coral/10' : 'border-border hover:border-navy-light'
            )}
          >
            <Sun size={16} className="text-amber-500" />
            <span className="text-xs font-medium text-text-primary">Light</span>
          </button>
          <button
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all',
              theme === 'dark' ? 'border-coral bg-coral/10' : 'border-border hover:border-navy-light'
            )}
          >
            <Moon size={16} className="text-blue-400" />
            <span className="text-xs font-medium text-text-primary">Dark</span>
          </button>
        </div>
      </div>

      <Separator />

      {/* About */}
      <div className="bg-surface-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-text-primary mb-2">Sobre</h3>
        <p className="text-xs text-text-secondary"><strong>Gama Social AI</strong> v2.0.0</p>
        <p className="text-xs text-text-muted mt-1">Laboratório de Conteúdo B2B — Gama Distribuidora</p>
        <p className="text-xs text-text-muted">Distribuidor Oficial Coral / AkzoNobel</p>
      </div>
    </div>
  );
}
