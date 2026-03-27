import React, { useState } from 'react';
import { useAppContext, REGIONS, CAMPAIGNS } from '../context/AppContext.jsx';
import { GEMINI_MODELS } from '../providers/GeminiProvider.js';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Key, Check, Zap, Brain, Sun, Moon, MapPin, Megaphone, Users, Shield, SlidersHorizontal } from 'lucide-react';

export function SettingsPanel() {
  const {
    apiKey, setApiKey, model, setModel, theme, toggleTheme,
    region, setRegion,
    activeCampaigns, setActiveCampaigns,
    teamData, setTeamData,
    competitors, setCompetitors,
    productConfig, setProductConfig,
  } = useAppContext();

  const [tempKey, setTempKey] = useState(apiKey);
  const [saved, setSaved] = useState(false);
  const [tempCompetitor, setTempCompetitor] = useState('');

  const handleSaveKey = () => {
    setApiKey(tempKey);
    setSaved(true);
    toast.success('API Key salva!');
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleCampaign = (id) => {
    const updated = activeCampaigns.includes(id)
      ? activeCampaigns.filter(c => c !== id)
      : [...activeCampaigns, id];
    setActiveCampaigns(updated);
    toast.success('Campanhas atualizadas');
  };

  const addCompetitor = () => {
    if (!tempCompetitor.trim()) return;
    if (competitors.includes(tempCompetitor.trim())) { toast.error('Já existe'); return; }
    setCompetitors([...competitors, tempCompetitor.trim()]);
    setTempCompetitor('');
    toast.success('Concorrente adicionado');
  };

  const removeCompetitor = (c) => {
    setCompetitors(competitors.filter(x => x !== c));
    toast.success('Concorrente removido');
  };

  return (
    <div className="space-y-6 max-w-xl fade-in">
      <div>
        <h2 className="text-lg font-bold text-text-primary mb-1">Configurações</h2>
        <p className="text-xs text-text-muted">Gerencie sua conexão, região e preferências</p>
      </div>

      {/* Region */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">Região Ativa</h3>
        </div>
        <div className="space-y-2">
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => { setRegion(r.id); toast.success(`Região: ${r.label}`); }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
                region === r.id ? 'border-coral bg-coral/10' : 'border-border hover:border-coral/30'
              )}
            >
              <div>
                <span className="text-xs font-medium text-text-primary">{r.label}</span>
                <p className="text-[10px] text-text-muted">{r.cities.join(', ')}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Campaigns */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">Campanhas Ativas</h3>
        </div>
        <div className="space-y-2">
          {CAMPAIGNS.map(c => (
            <button
              key={c.id}
              onClick={() => toggleCampaign(c.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-left transition-all',
                activeCampaigns.includes(c.id) ? 'border-coral bg-coral/10' : 'border-border hover:border-coral/30'
              )}
            >
              <div className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', activeCampaigns.includes(c.id) ? 'bg-coral border-coral' : 'border-border')}>
                {activeCampaigns.includes(c.id) && <Check size={12} className="text-white" />}
              </div>
              <div>
                <span className="text-xs font-medium text-text-primary">{c.label}</span>
                <p className="text-[10px] text-text-muted">{c.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Team Data */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">Dados da Equipe</h3>
        </div>
        <div className="space-y-2">
          <div>
            <Label htmlFor="consultor" className="text-xs text-text-muted">Nome do Consultor</Label>
            <Input
              id="consultor"
              value={teamData.consultorName}
              onChange={e => setTeamData({ ...teamData, consultorName: e.target.value })}
              placeholder="Ex: João Silva"
              className="h-9 text-xs"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="text-xs text-text-muted">WhatsApp</Label>
            <Input
              id="phone"
              value={teamData.phone}
              onChange={e => setTeamData({ ...teamData, phone: e.target.value })}
              placeholder="(13) 99999-9999"
              className="h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Competitors */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">Concorrentes</h3>
        </div>
        <div className="flex gap-2 flex-wrap">
          {competitors.map(c => (
            <span key={c} className="inline-flex items-center gap-1 px-2 py-1 bg-muted/50 border border-border rounded-full text-xs text-text-primary">
              {c}
              <button onClick={() => removeCompetitor(c)} className="text-text-muted hover:text-error ml-0.5">&times;</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={tempCompetitor} onChange={e => setTempCompetitor(e.target.value)} placeholder="Adicionar concorrente" className="h-9 text-xs flex-1" onKeyDown={e => e.key === 'Enter' && addCompetitor()} />
          <Button onClick={addCompetitor} size="sm" className="bg-coral hover:bg-coral-dark text-white h-9 text-xs">Adicionar</Button>
        </div>
      </div>

      {/* Catalog Filters */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">Filtros de Catálogo</h3>
        </div>
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-text-muted">Margem</Label>
            <select
              value={productConfig.marginFilter}
              onChange={e => setProductConfig({ ...productConfig, marginFilter: e.target.value })}
              className="w-full h-9 px-3 text-xs border border-border rounded-md bg-surface-card text-text-primary"
            >
              <option value="todas">Todas</option>
              <option value="alta">Alta Margem</option>
              <option value="media">Média Margem</option>
              <option value="baixa">Baixa Margem</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Label className="text-xs text-text-muted flex-1">Mostrar apenas sazonais</Label>
            <button
              onClick={() => setProductConfig({ ...productConfig, seasonalOnly: !productConfig.seasonalOnly })}
              className={cn(
                'w-10 h-5 rounded-full transition-colors relative',
                productConfig.seasonalOnly ? 'bg-coral' : 'bg-muted'
              )}
            >
              <div className={cn(
                'absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform',
                productConfig.seasonalOnly ? 'translate-x-5' : 'translate-x-0.5'
              )} />
            </button>
          </div>
          <div>
            <Label className="text-xs text-text-muted">Estratégico</Label>
            <select
              value={productConfig.strategicFilter}
              onChange={e => setProductConfig({ ...productConfig, strategicFilter: e.target.value })}
              className="w-full h-9 px-3 text-xs border border-border rounded-md bg-surface-card text-text-primary"
            >
              <option value="todos">Todos</option>
              <option value="reconquista">Reconquista Santos</option>
              <option value="programa_cl">Programa CL</option>
            </select>
          </div>
        </div>
      </div>

      <Separator />

      {/* API Key */}
      <div className="bg-surface-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Key size={16} className="text-coral" />
          <h3 className="text-sm font-medium text-text-primary">API Key do Gemini</h3>
        </div>
        <div className="space-y-2">
          <Label htmlFor="apikey" className="text-xs text-text-muted">Chave de API</Label>
          <div className="flex gap-2">
            <Input id="apikey" type="password" placeholder="AIzaSy..." value={tempKey} onChange={e => setTempKey(e.target.value)} className="flex-1 h-9 text-xs" />
            <Button onClick={handleSaveKey} size="sm" className="bg-coral hover:bg-coral-dark text-white text-xs h-9">
              {saved ? <><Check size={14} className="mr-1" /> Salvo</> : 'Salvar'}
            </Button>
          </div>
          <p className="text-[10px] text-text-muted">Obtenha em ai.google.dev. Salva localmente.</p>
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
                model === m.id ? 'border-coral bg-coral/10' : 'border-border hover:border-coral/30'
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
            className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all', theme === 'light' ? 'border-coral bg-coral/10' : 'border-border hover:border-coral/30')}
          >
            <Sun size={16} className="text-amber-500" />
            <span className="text-xs font-medium text-text-primary">Light</span>
          </button>
          <button
            onClick={() => { if (theme !== 'dark') toggleTheme(); }}
            className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-all', theme === 'dark' ? 'border-coral bg-coral/10' : 'border-border hover:border-coral/30')}
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
        <p className="text-xs text-text-secondary"><strong>Gama Trade Hub</strong> v2.0.0</p>
        <p className="text-xs text-text-muted mt-1">Plataforma de Inteligência Comercial B2B</p>
        <p className="text-xs text-text-muted">Gama Distribuidora — Distribuidor Oficial Coral/AkzoNobel</p>
      </div>
    </div>
  );
}
