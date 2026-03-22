import React, { useState, useCallback } from 'react';
import { providerRegistry, GEMINI_MODELS } from '../providers/index.js';
import { LaborDataService } from '../logic/LaborDataService.js';
import { BrandExpert } from '../logic/marketing/BrandExpert.js';
import { useToast } from '../hooks/useToast.js';
import { useContentHistory } from '../hooks/useContentHistory.js';
import { featureFlags } from '../utils/featureFlags.js';
import { ContentDisplay } from './ContentDisplay.jsx';
import { WeeklyPlan } from './WeeklyPlan.jsx';
import { PromptPackView } from './PromptPackView.jsx';
import { HistoryPanel } from './HistoryPanel.jsx';
import { QualityPanel } from './QualityPanel.jsx';

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

export function ContentGenerator({ item }) {
  const { addToast } = useToast();
  const { history, addToHistory, removeFromHistory, clearHistory } = useContentHistory();

  const [activeProviderId, setActiveProviderId] = useState(providerRegistry.getActiveId());
  const [activeModel, setActiveModel] = useState(providerRegistry.getGeminiModel());
  const providers = providerRegistry.listProviders();

  const handleProviderChange = (id) => {
    providerRegistry.setActive(id);
    setActiveProviderId(id);
    addToast(`Motor: ${providerRegistry.getProviderName()}`, 'info', 2000);
  };

  const handleModelChange = (modelId) => {
    providerRegistry.setGeminiModel(modelId);
    setActiveModel(modelId);
    const m = GEMINI_MODELS.find(m => m.id === modelId);
    addToast(`Modelo: ${m?.label || modelId}`, 'info', 2000);
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
    if (!request) { addToast('Selecione um produto ou categoria primeiro', 'error'); return; }
    setIsGenerating(true); setGeneratedContent(null);
    try {
      const start = performance.now();
      const provider = providerRegistry.current;
      const content = await provider.generate(request);
      setGeneratedContent(content); addToHistory(content);
      addToast(`Conteúdo gerado em ${Math.round(performance.now() - start)}ms`, 'success');
    } catch (err) {
      addToast(`Erro ao gerar: ${err.message}`, 'error');
    } finally { setIsGenerating(false); }
  }, [buildRequest, addToast, addToHistory]);

  const handleGenerateWeekly = useCallback(async () => {
    const request = buildRequest();
    if (!request) { addToast('Selecione um produto ou categoria primeiro', 'error'); return; }
    setIsGenerating(true); setWeeklyPlan(null);
    try {
      const start = performance.now();
      const plan = await providerRegistry.current.generateWeeklyPlan({ ...request, objective: selectedObjective });
      setWeeklyPlan(plan);
      addToast(`Plano semanal gerado em ${Math.round(performance.now() - start)}ms`, 'success');
    } catch (err) { addToast(`Erro: ${err.message}`, 'error'); }
    finally { setIsGenerating(false); }
  }, [buildRequest, selectedObjective, addToast]);

  const handleGeneratePrompts = useCallback(async () => {
    const request = buildRequest();
    if (!request) { addToast('Selecione um produto primeiro', 'error'); return; }
    setIsGenerating(true); setPromptPack(null);
    try {
      const pack = await providerRegistry.current.generatePromptPack({ name: request.name, category: request.category, catContext: null });
      setPromptPack(pack); addToast('Pack de prompts gerado!', 'success');
    } catch (err) { addToast(`Erro: ${err.message}`, 'error'); }
    finally { setIsGenerating(false); }
  }, [buildRequest, addToast]);

  return (
    <div className="main-content">
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          {[
            { id: 'generate', label: 'Gerar Conteúdo', icon: '✨' },
            { id: 'weekly', label: 'Plano Semanal', icon: '📅' },
            { id: 'prompts', label: 'Prompt Pack', icon: '🎨' },
            { id: 'history', label: `Histórico (${history.length})`, icon: '📋' },
          ].map(v => (
            <button key={v.id} className={activeView === v.id ? 'btn btn-navy' : 'btn btn-secondary'} onClick={() => setActiveView(v.id)}>
              {v.icon} {v.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: '3px' }}>
          {providers.filter(p => p.available).map(p => (
            <button key={p.id} onClick={() => handleProviderChange(p.id)} style={{ padding: '4px 12px', fontSize: 'var(--text-xs)', fontWeight: 600, borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', transition: 'all var(--transition-fast)', background: activeProviderId === p.id ? (p.id === 'gemini' ? 'linear-gradient(135deg, #4285F4, #34A853)' : 'var(--color-primary)') : 'transparent', color: activeProviderId === p.id ? 'white' : 'var(--text-muted)' }} title={p.description}>
              {p.id === 'gemini' ? '🤖' : '📝'} {p.name}
            </button>
          ))}
        </div>

        {/* Model selector — only when Gemini is active */}
        {activeProviderId === 'gemini' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'var(--surface-card)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-full)', padding: '3px' }}>
            {GEMINI_MODELS.map(m => (
              <button key={m.id} onClick={() => handleModelChange(m.id)} title={m.description} style={{ padding: '4px 14px', fontSize: 'var(--text-xs)', fontWeight: 600, borderRadius: 'var(--radius-full)', border: 'none', cursor: 'pointer', transition: 'all var(--transition-fast)', background: activeModel === m.id ? 'var(--color-secondary)' : 'transparent', color: activeModel === m.id ? 'white' : 'var(--text-muted)' }}>
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* GENERATE VIEW */}
      {activeView === 'generate' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap' }}>
                {[
                  { id: 'product', label: 'Produto', disabled: !item || item.type === 'brand' },
                  { id: 'category_mix', label: 'Categoria', disabled: false },
                  { id: 'brand', label: 'Marca', disabled: !item || item.type !== 'brand' },
                  { id: 'institutional', label: 'Institucional', disabled: false },
                ].map(m => (
                  <button key={m.id} className={mode === m.id ? 'btn btn-navy' : 'btn btn-secondary'} onClick={() => setMode(m.id)} disabled={m.disabled}>{m.label}</button>
                ))}
              </div>

              {mode === 'product' && item && item.type !== 'brand' && (
                <div style={{ padding: 'var(--space-3)', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                  <strong style={{ color: 'var(--color-primary)' }}>{item.name || item}</strong>
                  <span style={{ color: 'var(--text-muted)', marginLeft: 'var(--space-2)' }}>{item.category || ''}</span>
                </div>
              )}
              {mode === 'product' && !item && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Selecione um produto na lista ao lado</div>}

              {mode === 'brand' && item?.type === 'brand' && (
                <div style={{ padding: 'var(--space-3)', background: 'rgba(232,93,59,0.06)', border: '1px solid rgba(232,93,59,0.2)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                    <strong style={{ color: 'var(--color-secondary)', fontSize: 'var(--text-base)' }}>{item.name}</strong>
                    <span className="badge badge-secondary">{item.productCount} produtos</span>
                    {item.isMain && <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: 'white', fontWeight: 700 }}>CARRO-CHEFE</span>}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)' }}>{item.segment} · {item.strength}</div>
                  {item.categories?.length > 0 && (
                    <div style={{ marginTop: 'var(--space-2)', display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                      {item.categories.slice(0, 5).map(c => <span key={c} className="badge badge-primary" style={{ fontSize: '10px' }}>{c}</span>)}
                      {item.categories.length > 5 && <span className="badge" style={{ fontSize: '10px', background: 'var(--gray-100)', color: 'var(--text-muted)' }}>+{item.categories.length - 5}</span>}
                    </div>
                  )}
                </div>
              )}
              {mode === 'brand' && (!item || item.type !== 'brand') && <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>Selecione uma marca na aba "Marcas" ao lado</div>}

              {mode === 'category_mix' && (
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  {LaborDataService.getUniqueCategories().map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              )}

              {mode === 'institutional' && (
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {BrandExpert.themes.map(t => (
                    <button key={t.id} className={selectedThemeId === t.id ? 'btn btn-navy' : 'btn btn-secondary'} onClick={() => setSelectedThemeId(t.id)} style={{ textAlign: 'left' }}>
                      <div><strong>{t.label}</strong><div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginTop: '2px' }}>{t.context.slice(0, 50)}...</div></div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Format + Angle + Persona */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            {[
              { label: 'Formato', items: FORMATS, selected: selectedFormat, onSelect: setSelectedFormat },
              { label: 'Ângulo Estratégico', items: ANGLES, selected: selectedAngle, onSelect: setSelectedAngle },
              { label: 'Persona', items: PERSONAS, selected: selectedPersona, onSelect: setSelectedPersona },
            ].map(({ label, items, selected, onSelect }) => (
              <div className="card" key={label}>
                <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                  <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>{label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                    {items.map(f => (
                      <button key={f.id} className={selected === f.id ? 'btn btn-navy' : 'btn btn-ghost'} onClick={() => onSelect(f.id)} style={{ justifyContent: 'flex-start', width: '100%', fontSize: 'var(--text-sm)' }}>
                        {f.icon} {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} className="btn btn-lg btn-primary" disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} style={{ width: '100%', marginBottom: 'var(--space-6)' }}>
            {isGenerating ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>Gerando...</> : <>✨ Gerar Conteúdo</>}
          </button>

          {generatedContent && !isGenerating && (
            <div className="fade-in">
              <ContentDisplay content={generatedContent} selectedItem={item} />
              {generatedContent.quality && <QualityPanel quality={generatedContent.quality} />}
            </div>
          )}
        </div>
      )}

      {/* WEEKLY VIEW */}
      {activeView === 'weekly' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div className="section-title" style={{ marginBottom: 'var(--space-4)' }}>Plano Semanal de Conteúdo</div>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
                {[
                  { label: 'Objetivo', value: selectedObjective, setter: setSelectedObjective, options: OBJECTIVES },
                  { label: 'Ângulo Principal', value: selectedAngle, setter: setSelectedAngle, options: ANGLES },
                  { label: 'Persona', value: selectedPersona, setter: setSelectedPersona, options: PERSONAS },
                ].map(({ label, value, setter, options }) => (
                  <div key={label}>
                    <label style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', display: 'block', marginBottom: 'var(--space-1)' }}>{label}</label>
                    <select value={value} onChange={e => setter(e.target.value)} style={{ width: 'auto' }}>
                      {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={handleGenerateWeekly} className="btn btn-lg btn-primary" disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} style={{ width: '100%' }}>
                {isGenerating ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span>Gerando plano...</> : <>📅 Gerar Plano Semanal (7 dias)</>}
              </button>
            </div>
          </div>
          {weeklyPlan && !isGenerating && <WeeklyPlan plan={weeklyPlan} onSaveToHistory={addToHistory} />}
        </div>
      )}

      {/* PROMPTS VIEW */}
      {activeView === 'prompts' && (
        <div className="fade-in">
          <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="card-body" style={{ padding: 'var(--space-4) var(--space-6)' }}>
              <div className="section-title">Pack de Prompts para IA</div>
              <p className="section-subtitle">Prompts prontos para Midjourney, DALL-E, Runway, Kling AI, etc.</p>
              <button onClick={handleGeneratePrompts} className="btn btn-lg btn-primary" disabled={isGenerating || ((mode === 'product' || mode === 'brand') && !item)} style={{ width: '100%' }}>
                {isGenerating ? 'Gerando...' : '🎨 Gerar Pack de Prompts'}
              </button>
            </div>
          </div>
          {promptPack && !isGenerating && <PromptPackView pack={promptPack} />}
        </div>
      )}

      {/* HISTORY VIEW */}
      {activeView === 'history' && <HistoryPanel history={history} onRemove={removeFromHistory} onClear={clearHistory} />}
    </div>
  );
}
