import React, { useState, useCallback } from 'react';
import { providerRegistry, GEMINI_MODELS } from '../providers/index.js';
import { LaborDataService } from '../logic/LaborDataService.js';
import { BrandExpert } from '../logic/marketing/BrandExpert.js';
import { useContentHistory } from '../hooks/useContentHistory.js';
import { ContentDisplay } from './ContentDisplay.jsx';
import { WeeklyPlan } from './WeeklyPlan.jsx';
import { PromptPackView } from './PromptPackView.jsx';
import { HistoryPanel } from './HistoryPanel.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { SettingsPanel } from './SettingsPanel.jsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Calendar, Palette, Clock, Settings, Loader2 } from 'lucide-react';

const FORMATS = [
  { id: 'reels', label: 'Reels / TikTok', icon: '🎬' },
  { id: 'carrossel', label: 'Carrossel', icon: '📸' },
  { id: 'stories', label: 'Stories', icon: '📱' },
  { id: 'post_estatico', label: 'Post Estático', icon: '📌' },
  { id: 'banner_site', label: 'Banner Site', icon: '🖥️' },
  { id: 'whatsapp', label: 'WhatsApp B2B', icon: '💬' },
];

const ANGLES = [
  { id: 'coral_expertise', label: 'Expertise Coral', icon: '🎨' },
  { id: 'profit', label: 'Margem & Resultado', icon: '💰' },
  { id: 'reconquista', label: 'Reconquista Santos', icon: '🏆' },
  { id: 'partnership', label: 'Programa CL', icon: '⭐' },
  { id: 'technical', label: 'Suporte Técnico', icon: '🔧' },
];

const PERSONAS = [
  { id: 'pintor_profissional', label: 'Pintor Profissional', icon: '🖌️' },
  { id: 'lojista', label: 'Dono de Loja', icon: '🏪' },
  { id: 'engenheiro_arquiteto', label: 'Eng. / Arquiteto', icon: '📐' },
];

const OBJECTIVES = [
  { id: 'gerar_demanda', label: 'Gerar Demanda' },
  { id: 'ativar_whatsapp', label: 'Ativar WhatsApp' },
  { id: 'reconquista_santos', label: 'Reconquista Santos' },
  { id: 'programa_cl', label: 'Programa CL' },
];

const VIEWS = [
  { id: 'generate', label: 'Gerar Conteúdo', Icon: Sparkles },
  { id: 'weekly', label: 'Plano Semanal', Icon: Calendar },
  { id: 'prompts', label: 'Prompt Pack', Icon: Palette },
  { id: 'history', label: 'Histórico', Icon: Clock },
  { id: 'settings', label: 'Configurações', Icon: Settings },
];

export function ContentGenerator({ item }) {
  const { history, addToHistory, removeFromHistory, clearHistory, setFeedback } = useContentHistory();

  const [activeProviderId, setActiveProviderId] = useState(providerRegistry.getActiveId());
  const [activeModel, setActiveModel] = useState(providerRegistry.getGeminiModel());
  const providers = providerRegistry.listProviders();

  const handleProviderChange = (id) => {
    providerRegistry.setActive(id);
    setActiveProviderId(id);
    toast.info(`Motor: ${providerRegistry.getProviderName()}`);
  };

  const handleModelChange = (modelId) => {
    providerRegistry.setGeminiModel(modelId);
    setActiveModel(modelId);
    const m = GEMINI_MODELS.find(m => m.id === modelId);
    toast.info(`Modelo: ${m?.label || modelId}`);
  };

  const [activeView, setActiveView] = useState('generate');
  const [mode, setMode] = useState('product');
  const [selectedFormat, setSelectedFormat] = useState('reels');
  const [selectedAngle, setSelectedAngle] = useState('coral_expertise');
  const [selectedPersona, setSelectedPersona] = useState('lojista');
  const [selectedObjective, setSelectedObjective] = useState('gerar_demanda');
  const [selectedThemeId, setSelectedThemeId] = useState('coral_parceiro');
  const [selectedCategory, setSelectedCategory] = useState(LaborDataService.getUniqueCategories()[0]);

  const [generatedContent, setGeneratedContent] = useState(null);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [promptPack, setPromptPack] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (item) {
      if (item.type === 'institutional') setMode('institutional');
      else if (item.type === 'category') { setMode('category_mix'); setSelectedCategory(item.name); }
      else if (item.type === 'brand') setMode('brand');
      else setMode('product');
    }
  }, [item]);

  const buildRequest = useCallback(() => {
    let name, category, requestMode, brandContext;
    if (mode === 'institutional') {
      name = 'Gama Distribuidora'; category = 'Institucional'; requestMode = 'institutional';
    } else if (mode === 'category_mix') {
      name = selectedCategory; category = selectedCategory; requestMode = 'category';
    } else if (mode === 'brand') {
      if (!item || item.type !== 'brand') return null;
      name = item.name; category = item.categories?.[0] || 'Tintas e Revestimentos';
      requestMode = 'brand';
      brandContext = { segment: item.segment, strength: item.strength, tier: item.tier, productCount: item.productCount, categories: item.categories };
    } else {
      if (!item) return null;
      name = item.name || item;
      category = item.category || LaborDataService.identifyCategory(name);
      requestMode = 'product';
    }
    return { mode: requestMode, name, category, angle: selectedAngle, persona: selectedPersona, format: selectedFormat, brandContext };
  }, [mode, item, selectedCategory, selectedAngle, selectedPersona, selectedFormat]);

  const handleGenerate = useCallback(async () => {
    const request = buildRequest();
    if (!request) { toast.error('Selecione um produto ou categoria primeiro'); return; }
    setIsGenerating(true); setGeneratedContent(null);
    try {
      const start = performance.now();
      const content = await providerRegistry.current.generate(request);
      setGeneratedContent(content); addToHistory(content);
      toast.success(`Conteúdo gerado em ${Math.round(performance.now() - start)}ms`);
    } catch (err) {
      toast.error(`Erro ao gerar: ${err.message}`);
    } finally { setIsGenerating(false); }
  }, [buildRequest, addToHistory]);

  const handleGenerateWeekly = useCallback(async () => {
    const request = buildRequest();
    if (!request) { toast.error('Selecione um produto ou categoria primeiro'); return; }
    setIsGenerating(true); setWeeklyPlan(null);
    try {
      const start = performance.now();
      const plan = await providerRegistry.current.generateWeeklyPlan({ ...request, objective: selectedObjective });
      setWeeklyPlan(plan);
      toast.success(`Plano semanal gerado em ${Math.round(performance.now() - start)}ms`);
    } catch (err) { toast.error(`Erro: ${err.message}`); }
    finally { setIsGenerating(false); }
  }, [buildRequest, selectedObjective]);

  const handleGeneratePrompts = useCallback(async () => {
    const request = buildRequest();
    if (!request) { toast.error('Selecione um produto primeiro'); return; }
    setIsGenerating(true); setPromptPack(null);
    try {
      const pack = await providerRegistry.current.generatePromptPack({ name: request.name, category: request.category, catContext: null });
      setPromptPack(pack); toast.success('Pack de prompts gerado!');
    } catch (err) { toast.error(`Erro: ${err.message}`); }
    finally { setIsGenerating(false); }
  }, [buildRequest]);

  const handleFeedback = useCallback((contentId, value) => {
    if (setFeedback) setFeedback(contentId, value);
  }, [setFeedback]);

  return (
    <div className="overflow-y-auto p-4 lg:p-6 bg-surface-bg">
      {/* Top bar: View tabs + Provider/Model */}
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex gap-1.5 flex-wrap">
          {VIEWS.map(v => (
            <Button
              key={v.id}
              variant={activeView === v.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveView(v.id)}
              className={cn('text-xs h-8', activeView === v.id && 'bg-navy hover:bg-navy-light dark:bg-coral dark:hover:bg-coral-dark')}
            >
              <v.Icon size={14} className="mr-1" />
              {v.label}
              {v.id === 'history' && history.length > 0 && <Badge variant="secondary" className="ml-1.5 text-[10px] h-4 px-1">{history.length}</Badge>}
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Provider toggle */}
          <div className="flex bg-surface-card border border-border rounded-full p-0.5">
            {providers.filter(p => p.available).map(p => (
              <button
                key={p.id}
                onClick={() => handleProviderChange(p.id)}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full transition-all',
                  activeProviderId === p.id
                    ? p.id === 'gemini' ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' : 'bg-navy text-white'
                    : 'text-text-muted hover:text-text-primary'
                )}
              >
                {p.id === 'gemini' ? '🤖' : '📝'} {p.name}
              </button>
            ))}
          </div>

          {/* Model selector */}
          {activeProviderId === 'gemini' && (
            <div className="flex bg-surface-card border border-border rounded-full p-0.5">
              {GEMINI_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => handleModelChange(m.id)}
                  title={m.description}
                  className={cn(
                    'px-3 py-1 text-xs font-semibold rounded-full transition-all',
                    activeModel === m.id ? 'bg-coral text-white' : 'text-text-muted hover:text-text-primary'
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* SETTINGS */}
      {activeView === 'settings' && <SettingsPanel />}

      {/* GENERATE VIEW */}
      {activeView === 'generate' && (
        <div className="fade-in">
          {/* Mode selector */}
          <div className="bg-surface-card border border-border rounded-lg p-4 lg:p-6 mb-4">
            <div className="flex gap-2 mb-4 flex-wrap">
              {[
                { id: 'product', label: 'Produto', disabled: !item || item.type === 'brand' },
                { id: 'category_mix', label: 'Categoria', disabled: false },
                { id: 'brand', label: 'Marca', disabled: !item || item.type !== 'brand' },
                { id: 'institutional', label: 'Institucional', disabled: false },
              ].map(m => (
                <Button key={m.id} variant={mode === m.id ? 'default' : 'outline'} size="sm" onClick={() => setMode(m.id)} disabled={m.disabled} className={cn(mode === m.id && 'bg-navy hover:bg-navy-light dark:bg-coral dark:hover:bg-coral-dark')}>
                  {m.label}
                </Button>
              ))}
            </div>

            {mode === 'product' && item && item.type !== 'brand' && (
              <div className="p-3 bg-muted/50 rounded-md text-sm">
                <strong className="text-navy dark:text-coral">{item.name || item}</strong>
                <span className="text-text-muted ml-2">{item.category || ''}</span>
              </div>
            )}
            {mode === 'product' && !item && <div className="text-text-muted text-sm">Selecione um produto na lista ao lado</div>}

            {mode === 'brand' && item?.type === 'brand' && (
              <div className="p-3 bg-coral/5 border border-coral/20 rounded-md text-sm">
                <div className="flex items-center gap-2 mb-1">
                  <strong className="text-coral text-base">{item.name}</strong>
                  <Badge variant="secondary">{item.productCount} produtos</Badge>
                  {item.isMain && <Badge className="bg-navy text-white text-[10px]">CARRO-CHEFE</Badge>}
                </div>
                <div className="text-text-secondary text-xs">{item.segment} · {item.strength}</div>
                {item.categories?.length > 0 && (
                  <div className="mt-2 flex gap-1 flex-wrap">
                    {item.categories.slice(0, 5).map(c => <Badge key={c} variant="outline" className="text-[10px]">{c}</Badge>)}
                    {item.categories.length > 5 && <Badge variant="outline" className="text-[10px]">+{item.categories.length - 5}</Badge>}
                  </div>
                )}
              </div>
            )}
            {mode === 'brand' && (!item || item.type !== 'brand') && <div className="text-text-muted text-sm">Selecione uma marca na aba "Marcas" ao lado</div>}

            {mode === 'category_mix' && (
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
                {LaborDataService.getUniqueCategories().map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {mode === 'institutional' && (
              <div className="flex gap-2 flex-wrap">
                {BrandExpert.themes.map(t => (
                  <Button key={t.id} variant={selectedThemeId === t.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedThemeId(t.id)} className={cn('text-left', selectedThemeId === t.id && 'bg-navy dark:bg-coral')}>
                    <div>
                      <strong>{t.label}</strong>
                      <div className="text-xs opacity-70 mt-0.5">{t.context.slice(0, 50)}...</div>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Format + Angle + Persona */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {[
              { label: 'Formato', items: FORMATS, selected: selectedFormat, onSelect: setSelectedFormat },
              { label: 'Ângulo Estratégico', items: ANGLES, selected: selectedAngle, onSelect: setSelectedAngle },
              { label: 'Persona', items: PERSONAS, selected: selectedPersona, onSelect: setSelectedPersona },
            ].map(({ label, items, selected, onSelect }) => (
              <div className="bg-surface-card border border-border rounded-lg p-4" key={label}>
                <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">{label}</div>
                <div className="flex flex-col gap-1">
                  {items.map(f => (
                    <button
                      key={f.id}
                      className={cn(
                        'w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-all',
                        selected === f.id
                          ? 'bg-navy text-white dark:bg-coral'
                          : 'text-text-secondary hover:bg-muted/50'
                      )}
                      onClick={() => onSelect(f.id)}
                    >
                      <span>{f.icon}</span> {f.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} className="w-full h-12 text-base bg-gradient-to-r from-coral to-coral-dark hover:from-coral-light hover:to-coral text-white mb-6 shadow-md">
            {isGenerating ? <><Loader2 size={18} className="animate-spin mr-2" />Gerando...</> : <><Sparkles size={18} className="mr-2" />Gerar Conteúdo</>}
          </Button>

          {generatedContent && !isGenerating && (
            <div className="fade-in">
              <ContentDisplay content={generatedContent} selectedItem={item} onFeedback={handleFeedback} />
              {generatedContent.quality && <QualityPanel quality={generatedContent.quality} />}
            </div>
          )}
        </div>
      )}

      {/* WEEKLY VIEW */}
      {activeView === 'weekly' && (
        <div className="fade-in">
          <div className="bg-surface-card border border-border rounded-lg p-4 lg:p-6 mb-4">
            <h3 className="text-lg font-bold text-text-primary mb-4">Plano Semanal de Conteúdo</h3>
            <div className="flex gap-3 flex-wrap mb-4">
              {[
                { label: 'Objetivo', value: selectedObjective, setter: setSelectedObjective, options: OBJECTIVES },
                { label: 'Ângulo Principal', value: selectedAngle, setter: setSelectedAngle, options: ANGLES },
                { label: 'Persona', value: selectedPersona, setter: setSelectedPersona, options: PERSONAS },
              ].map(({ label, value, setter, options }) => (
                <div key={label}>
                  <label className="text-xs text-text-muted block mb-1">{label}</label>
                  <select value={value} onChange={e => setter(e.target.value)} className="h-8 px-2 text-sm border border-border rounded-md bg-surface-card text-text-primary">
                    {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <Button onClick={handleGenerateWeekly} disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} className="w-full h-11 bg-gradient-to-r from-coral to-coral-dark hover:from-coral-light hover:to-coral text-white">
              {isGenerating ? <><Loader2 size={18} className="animate-spin mr-2" />Gerando plano...</> : <><Calendar size={18} className="mr-2" />Gerar Plano Semanal (7 dias)</>}
            </Button>
          </div>
          {weeklyPlan && !isGenerating && <WeeklyPlan plan={weeklyPlan} onSaveToHistory={addToHistory} />}
        </div>
      )}

      {/* PROMPTS VIEW */}
      {activeView === 'prompts' && (
        <div className="fade-in">
          <div className="bg-surface-card border border-border rounded-lg p-4 lg:p-6 mb-4">
            <h3 className="text-lg font-bold text-text-primary">Pack de Prompts para IA</h3>
            <p className="text-sm text-text-muted mt-1 mb-4">Prompts prontos para Midjourney, DALL-E, Runway, Kling AI, etc.</p>
            <Button onClick={handleGeneratePrompts} disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} className="w-full h-11 bg-gradient-to-r from-coral to-coral-dark hover:from-coral-light hover:to-coral text-white">
              {isGenerating ? 'Gerando...' : <><Palette size={18} className="mr-2" />Gerar Pack de Prompts</>}
            </Button>
          </div>
          {promptPack && !isGenerating && <PromptPackView pack={promptPack} />}
        </div>
      )}

      {/* HISTORY VIEW */}
      {activeView === 'history' && <HistoryPanel history={history} onRemove={removeFromHistory} onClear={clearHistory} />}
    </div>
  );
}
