import React, { useState, useCallback } from 'react';
import { providerRegistry, GEMINI_MODELS } from '../providers/index.js';
import { GamaDataService } from '../logic/GamaDataService.js';
import { BrandBrain } from '../logic/BrandBrain.js';
import { BrandExpert } from '../logic/marketing/BrandExpert.js';
import { useContentHistory } from '../hooks/useContentHistory.js';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, Loader2, Camera, Video, Image } from 'lucide-react';

const FORMATS = [
  { id: 'reels', label: 'Reels', icon: '🎬' },
  { id: 'carrossel', label: 'Carrossel', icon: '📸' },
  { id: 'stories', label: 'Stories', icon: '📱' },
  { id: 'post_estatico', label: 'Post Estático', icon: '📌' },
];

const ANGLES = BrandBrain.strategicAngles.map(a => ({
  id: a.id, label: a.label, icon: a.icon,
}));

const PERSONAS = Object.values(BrandBrain.personas).map(p => ({
  id: p.id, label: p.label, icon: p.icon,
}));

export function SocialContent({ item }) {
  const { history, addToHistory } = useContentHistory();

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

  const [mode, setMode] = useState('product');
  const [selectedFormat, setSelectedFormat] = useState('reels');
  const [selectedAngle, setSelectedAngle] = useState('parceria_confianca');
  const [selectedPersona, setSelectedPersona] = useState('lojista_carteira');
  const [selectedThemeId, setSelectedThemeId] = useState('coral_parceiro');
  const [selectedCategory, setSelectedCategory] = useState(GamaDataService.getUniqueCategories()[0]);

  const [generatedContent, setGeneratedContent] = useState(null);
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
      category = item.category || GamaDataService.identifyCategory(name);
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
    } catch (err) { toast.error(`Erro: ${err.message}`); }
    finally { setIsGenerating(false); }
  }, [buildRequest, addToHistory]);

  const handleQuickImage = useCallback(async () => {
    const request = buildRequest();
    if (!request) { toast.error('Selecione um produto ou categoria primeiro'); return; }
    setIsGenerating(true); setGeneratedContent(null);
    try {
      const start = performance.now();
      const content = await providerRegistry.current.generateQuickImage(request);
      setGeneratedContent(content); addToHistory(content);
      toast.success(`Quick Image gerado em ${Math.round(performance.now() - start)}ms`);
    } catch (err) { toast.error(`Erro: ${err.message}`); }
    finally { setIsGenerating(false); }
  }, [buildRequest, addToHistory]);

  const handleQuickVideo = useCallback(async () => {
    const request = buildRequest();
    if (!request) { toast.error('Selecione um produto ou categoria primeiro'); return; }
    setIsGenerating(true); setGeneratedContent(null);
    try {
      const start = performance.now();
      const content = await providerRegistry.current.generateQuickVideo(request);
      setGeneratedContent(content); addToHistory(content);
      toast.success(`Quick Video gerado em ${Math.round(performance.now() - start)}ms`);
    } catch (err) { toast.error(`Erro: ${err.message}`); }
    finally { setIsGenerating(false); }
  }, [buildRequest, addToHistory]);

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Image size={24} className="text-purple-500" />
          <h2 className="text-lg font-bold text-text-primary">Conteúdo Social</h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

      {/* Mode selector */}
      <div className="bg-surface-card border border-border rounded-lg p-4 mb-4">
        <div className="flex gap-2 mb-4 flex-wrap">
          {[
            { id: 'product', label: 'Produto', disabled: !item || item.type === 'brand' },
            { id: 'category_mix', label: 'Categoria', disabled: false },
            { id: 'brand', label: 'Marca', disabled: !item || item.type !== 'brand' },
            { id: 'institutional', label: 'Institucional', disabled: false },
          ].map(m => (
            <Button key={m.id} variant={mode === m.id ? 'default' : 'outline'} size="sm" onClick={() => setMode(m.id)} disabled={m.disabled} className={cn(mode === m.id && 'bg-purple-600 hover:bg-purple-700')}>
              {m.label}
            </Button>
          ))}
        </div>

        {mode === 'product' && item && item.type !== 'brand' && (
          <div className="p-3 bg-muted/50 rounded-md text-sm">
            <strong className="text-purple-500 dark:text-purple-400">{item.name || item}</strong>
            <span className="text-text-muted ml-2">{item.category || ''}</span>
          </div>
        )}
        {mode === 'product' && !item && <div className="text-text-muted text-sm">Selecione um produto na sidebar</div>}

        {mode === 'brand' && item?.type === 'brand' && (
          <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-md text-sm">
            <div className="flex items-center gap-2 mb-1">
              <strong className="text-purple-500">{item.name}</strong>
              <Badge variant="secondary">{item.productCount} produtos</Badge>
            </div>
            <div className="text-text-secondary text-xs">{item.segment} - {item.strength}</div>
          </div>
        )}

        {mode === 'category_mix' && (
          <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            {GamaDataService.getUniqueCategories().map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {mode === 'institutional' && (
          <div className="flex gap-2 flex-wrap">
            {BrandExpert.themes.map(t => (
              <Button key={t.id} variant={selectedThemeId === t.id ? 'default' : 'outline'} size="sm" onClick={() => setSelectedThemeId(t.id)} className={cn('text-left', selectedThemeId === t.id && 'bg-purple-600')}>
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
          { label: 'Ângulo', items: ANGLES, selected: selectedAngle, onSelect: setSelectedAngle },
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
                      ? 'bg-purple-600 text-white'
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

      {/* Quick Content */}
      <div className="flex gap-3 mb-3">
        <Button variant="outline" onClick={handleQuickImage} disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} className="flex-1 h-10">
          <Camera size={16} className="mr-2" /> Quick Image
        </Button>
        <Button variant="outline" onClick={handleQuickVideo} disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} className="flex-1 h-10">
          <Video size={16} className="mr-2" /> Quick Video
        </Button>
      </div>

      <Button onClick={handleGenerate} disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} className="w-full h-12 text-base bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white mb-6 shadow-md">
        {isGenerating ? <><Loader2 size={18} className="animate-spin mr-2" />Gerando...</> : <><Sparkles size={18} className="mr-2" />Gerar Conteúdo Social</>}
      </Button>

      {generatedContent && !isGenerating && (
        <div className="fade-in">
          <ContentDisplay content={generatedContent} selectedItem={item} />
          {generatedContent.quality && <QualityPanel quality={generatedContent.quality} />}
        </div>
      )}
    </div>
  );
}
