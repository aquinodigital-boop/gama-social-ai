import React, { useState, useCallback } from 'react';
import { providerRegistry } from '../providers/index.js';
import { GamaDataService } from '../logic/GamaDataService.js';
import { BrandBrain } from '../logic/BrandBrain.js';
import { BrandExpert } from '../logic/marketing/BrandExpert.js';
import { useContentHistory } from '../hooks/useContentHistory.js';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Sparkles, Loader2, Camera, Video } from 'lucide-react';

/* ──────────────────────────────────────────────────────────
   Catálogo de escolhas — cada uma vira um "cartão Pantone"
   ────────────────────────────────────────────────────────── */
const FORMATS = [
  { id: 'reels',         label: 'Reels',         code: 'REL-01', color: 'var(--color-format-reels)',     hint: '15-30s · vertical' },
  { id: 'carrossel',     label: 'Carrossel',     code: 'CAR-02', color: 'var(--color-format-carrossel)', hint: '5 slides · 1:1' },
  { id: 'stories',       label: 'Stories',       code: 'STO-03', color: 'var(--color-format-stories)',   hint: '3-5 telas · vertical' },
  { id: 'post_estatico', label: 'Post estático', code: 'POS-04', color: 'var(--color-format-post)',      hint: 'imagem única · feed' },
];

const ANGLES = BrandBrain.strategicAngles.map((a) => ({
  id: a.id, label: a.label, icon: a.icon, focus: a.focus,
}));

const PERSONAS = Object.values(BrandBrain.personas).map((p) => ({
  id: p.id, label: p.label, icon: p.icon, pain: p.pain,
}));

const MODE_OPTIONS = [
  { id: 'product',       label: 'Produto',        hint: 'um SKU específico da sidebar' },
  { id: 'category_mix',  label: 'Categoria',      hint: 'um grupo de produtos' },
  { id: 'brand',         label: 'Marca parceira', hint: 'destaque de uma marca' },
  { id: 'institucional', label: 'Institucional',  hint: 'a Gama em primeiro plano' },
];

export function SocialContent({ item }) {
  const { addToHistory } = useContentHistory();

  const [activeProviderId, setActiveProviderId] = useState(providerRegistry.getActiveId());
  const providers = providerRegistry.listProviders();

  const [mode, setMode] = useState('product');
  const [selectedFormat, setSelectedFormat] = useState('reels');
  const [selectedAngle, setSelectedAngle] = useState('parceria_confianca');
  const [selectedPersona, setSelectedPersona] = useState('lojista_carteira');
  const [selectedThemeId, setSelectedThemeId] = useState('coral_parceiro');
  const [selectedCategory, setSelectedCategory] = useState(GamaDataService.getUniqueCategories()[0]);

  const [generatedContent, setGeneratedContent] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  React.useEffect(() => {
    if (!item) return;
    if (item.type === 'institutional') setMode('institucional');
    else if (item.type === 'category') { setMode('category_mix'); setSelectedCategory(item.name); }
    else if (item.type === 'brand') setMode('brand');
    else setMode('product');
  }, [item]);

  const handleProviderChange = (id) => {
    providerRegistry.setActive(id);
    setActiveProviderId(id);
    toast.success(`Motor: ${providerRegistry.getProviderName()}`);
  };

  const buildRequest = useCallback(() => {
    let name, category, requestMode, brandContext;
    if (mode === 'institucional') {
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

  async function runGenerate(method, label) {
    const request = buildRequest();
    if (!request) { toast.error('Selecione um produto, marca ou categoria primeiro'); return; }
    setIsGenerating(true); setGeneratedContent(null);
    try {
      const start = performance.now();
      const content = await providerRegistry.current[method](request);
      setGeneratedContent(content); addToHistory(content);
      toast.success(`${label} em ${Math.round(performance.now() - start)}ms`);
    } catch (err) {
      toast.error(`Falhou: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleGenerate    = () => runGenerate('generate', 'Conteúdo gerado');
  const handleQuickImage  = () => runGenerate('generateQuickImage', 'Quick Image');
  const handleQuickVideo  = () => runGenerate('generateQuickVideo', 'Quick Video');

  const needsItem = (mode === 'product' || mode === 'brand') && !item;
  const itemLabel = item?.name || item || 'Nenhum';

  return (
    <div className="fade-in space-y-10">
      {/* ──────── HERO editorial ──────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="numero">No. 04</span>
          <div className="regua flex-1" />
          <span className="eyebrow">Estúdio de Conteúdo · GMA-004</span>
        </div>

        <h1 className="display-xl" style={{ color: 'var(--color-ink)' }}>
          Gere uma peça B2B<br />
          <span style={{ position: 'relative', display: 'inline-block' }}>
            <span style={{ position: 'relative', zIndex: 1 }}>conforme ao DNA Gama.</span>
            <span className="stroke-y" />
          </span>
        </h1>

        <p className="lead">
          Escolha o <strong>modo</strong>, o <strong>formato</strong>, o <strong>ângulo</strong> e a <strong>persona</strong>.
          O validador HARD bloqueia automaticamente qualquer saída fora das regras da marca.
        </p>

        {/* Provider switcher — pílulas mono */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="eyebrow">motor:</span>
          {providers.filter((p) => p.available).map((p) => (
            <button
              key={p.id}
              onClick={() => handleProviderChange(p.id)}
              className="px-3 py-1 transition-all"
              style={{
                background: activeProviderId === p.id ? 'var(--color-ink)' : 'transparent',
                color: activeProviderId === p.id ? 'var(--color-paper)' : 'var(--color-text-primary)',
                border: '1px solid var(--color-ink)',
                borderRadius: 1,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
              title={p.description}
            >
              {p.id === 'claude' && '◆ '}{p.id === 'gemini' && '◇ '}{p.id === 'local' && '◌ '}
              {p.name}
              {p.recommended && <span style={{ marginLeft: 6, color: 'var(--color-gama-amarelo-2)' }}>★</span>}
            </button>
          ))}
        </div>
      </section>

      {/* ──────── 1. MODO ──────── */}
      <Section number="01" title="Modo" subtitle="Quem é o protagonista desta peça?">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
          {MODE_OPTIONS.map((m, i) => {
            const active = mode === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={cn('stagger-item paper-card p-4 text-left transition-all', active && 'shadow-[2px_2px_0_var(--color-ink)]')}
                style={active ? { borderColor: 'var(--color-ink)', borderWidth: 2 } : {}}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <span className="display-md" style={{ fontSize: 18 }}>{m.label}</span>
                  <span className="mono text-[9px] opacity-50">M/{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="text-xs text-text-muted mt-1">{m.hint}</div>
              </button>
            );
          })}
        </div>

        {/* Context card */}
        <div className="mt-4 paper-card overflow-hidden">
          <span className="paint-band" style={{ background: 'var(--color-gama-amarelo)' }} />
          <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <span className="eyebrow">Selecionado</span>
              <div className="display-md mt-1 truncate" style={{ maxWidth: '40ch' }}>{itemLabel}</div>
              <div className="flex gap-2 mt-2 flex-wrap">
                {item?.category && <span className="mtag">cat · {item.category}</span>}
                {item?.type === 'brand' && (
                  <span className="mtag" style={{ color: 'var(--color-chip-social)' }}>marca · {item.segment}</span>
                )}
              </div>
            </div>

            {needsItem && (
              <div className="mono text-[10px] px-3 py-1.5"
                style={{ background: 'var(--color-status-recusado)', color: '#fff', borderRadius: 1, letterSpacing: '0.08em' }}>
                ▸ ESCOLHA UM ITEM NA SIDEBAR
              </div>
            )}

            {mode === 'category_mix' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-sm bg-white"
                style={{ border: '1px solid var(--color-rule)', borderRadius: 2, fontFamily: 'var(--font-mono)' }}
              >
                {GamaDataService.getUniqueCategories().map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            )}

            {mode === 'institucional' && (
              <div className="flex flex-wrap gap-1.5 max-w-md justify-end">
                {BrandExpert.themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedThemeId(t.id)}
                    className="px-2.5 py-1.5 text-xs transition-all"
                    style={{
                      background: selectedThemeId === t.id ? 'var(--color-ink)' : 'transparent',
                      color: selectedThemeId === t.id ? 'var(--color-paper)' : 'var(--color-text-primary)',
                      border: '1px solid var(--color-rule)',
                      borderRadius: 1,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* ──────── 2. FORMATO ──────── */}
      <Section number="02" title="Formato" subtitle="Onde a peça vai morar.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
          {FORMATS.map((f) => (
            <SwatchPick
              key={f.id}
              active={selectedFormat === f.id}
              onClick={() => setSelectedFormat(f.id)}
              color={f.color}
              code={f.code}
              label={f.label}
              hint={f.hint}
            />
          ))}
        </div>
      </Section>

      {/* ──────── 3 + 4. ÂNGULO + PERSONA ──────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Section number="03" title="Ângulo" subtitle="O argumento estratégico.">
          <div className="flex flex-col gap-2 stagger">
            {ANGLES.map((a) => (
              <SelectableRow
                key={a.id}
                active={selectedAngle === a.id}
                onClick={() => setSelectedAngle(a.id)}
                icon={a.icon}
                title={a.label}
                desc={a.focus}
              />
            ))}
          </div>
        </Section>

        <Section number="04" title="Persona" subtitle="Pra quem a peça fala.">
          <div className="flex flex-col gap-2 stagger">
            {PERSONAS.map((p) => (
              <SelectableRow
                key={p.id}
                active={selectedPersona === p.id}
                onClick={() => setSelectedPersona(p.id)}
                icon={p.icon}
                title={p.label}
                desc={p.pain && `Dor: ${p.pain}`}
              />
            ))}
          </div>
        </Section>
      </div>

      {/* ──────── 5. EXECUTE ──────── */}
      <section className="paper-card overflow-hidden">
        <span className="paint-band" style={{ background: 'var(--color-ink)' }} />
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <span className="numero">No. 05</span>
            <div className="regua flex-1" />
            <span className="eyebrow">Execute</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <QuickButton onClick={handleQuickImage} disabled={isGenerating || needsItem} Icon={Camera} label="Quick Image" code="QIM-01" hint="1 prompt + caption pronta" />
            <QuickButton onClick={handleQuickVideo} disabled={isGenerating || needsItem} Icon={Video} label="Quick Video" code="QVD-01" hint="3 cenas + caption" />
          </div>

          {/* Botão lacrado amarelo */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || needsItem}
            className="btn-yellow w-full px-6 py-4 flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            style={{ borderRadius: 2, fontSize: 18 }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gerando…</span>
              </>
            ) : (
              <>
                <Sparkles size={20} />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>Gerar peça completa</span>
              </>
            )}
          </button>

          {needsItem && (
            <div className="mono text-[10px] text-center" style={{ color: 'var(--color-text-muted)' }}>
              ▸ ABRA A SIDEBAR E ESCOLHA UM PRODUTO/MARCA ANTES DE GERAR
            </div>
          )}
        </div>
      </section>

      {/* ──────── RESULTADO ──────── */}
      {generatedContent && !isGenerating && (
        <section className="fade-up paper-card overflow-hidden">
          <span className="paint-band" style={{ background: 'var(--color-gama-amarelo)' }} />
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="numero">RESULTADO</span>
              <div className="regua flex-1" />
              <span className="eyebrow">{generatedContent.provider || 'IA'}</span>
            </div>
            <ContentDisplay content={generatedContent} selectedItem={item} />
            {generatedContent.quality && <QualityPanel quality={generatedContent.quality} />}
          </div>
        </section>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Sub-componentes editorial
   ────────────────────────────────────────────────────────── */

function Section({ number, title, subtitle, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <span className="numero whitespace-nowrap">No. {number}</span>
        <div className="min-w-0">
          <h2 className="display-lg" style={{ fontSize: 22 }}>{title}</h2>
          {subtitle && (
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{subtitle}</p>
          )}
        </div>
        <div className="regua flex-1 ml-2" />
      </div>
      {children}
    </section>
  );
}

function SwatchPick({ active, onClick, color, code, label, hint }) {
  return (
    <button
      onClick={onClick}
      className={cn('stagger-item paper-card overflow-hidden text-left transition-all', active && 'shadow-[2px_2px_0_var(--color-ink)]')}
      style={active ? { borderColor: 'var(--color-ink)', borderWidth: 2 } : {}}
    >
      <div className="h-20 flex items-end justify-between p-2.5" style={{ background: color }}>
        <span className="mono text-[9px] font-bold" style={{ color: '#fff', opacity: 0.85, letterSpacing: '0.06em' }}>
          {code}
        </span>
        <span className="mono text-[9px] font-bold" style={{ color: '#fff', opacity: 0.85, letterSpacing: '0.06em' }}>
          {active ? '✓ ATIVO' : ''}
        </span>
      </div>
      <div className="p-3">
        <div className="display-md" style={{ fontSize: 16 }}>{label}</div>
        <div className="text-[11px] text-text-muted mt-0.5">{hint}</div>
      </div>
    </button>
  );
}

function SelectableRow({ active, onClick, icon, title, desc }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'stagger-item flex items-start gap-3 p-3 text-left transition-all',
        active ? 'shadow-[2px_2px_0_var(--color-ink)]' : 'hover:bg-[var(--color-paper-2)]'
      )}
      style={{
        background: active ? 'var(--color-paper-2)' : 'transparent',
        border: `1px solid ${active ? 'var(--color-ink)' : 'var(--color-rule)'}`,
        borderRadius: 2,
      }}
    >
      <span
        className="flex items-center justify-center shrink-0"
        style={{
          width: 32, height: 32,
          background: active ? 'var(--color-gama-amarelo)' : 'var(--color-paper-2)',
          border: `1px solid ${active ? 'var(--color-ink)' : 'var(--color-rule)'}`,
          borderRadius: 1, fontSize: 16,
        }}
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{title}</div>
        {desc && <div className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{desc}</div>}
      </div>
    </button>
  );
}

function QuickButton({ onClick, disabled, Icon, label, code, hint }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="paper-card p-4 text-left transition-all hover:translate-y-[-2px] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <div className="flex items-baseline justify-between">
        <span className="display-md flex items-center gap-2" style={{ fontSize: 16 }}>
          <Icon size={18} /> {label}
        </span>
        <span className="mono text-[9px] opacity-50">{code}</span>
      </div>
      <div className="text-xs text-text-muted mt-1">{hint}</div>
    </button>
  );
}
