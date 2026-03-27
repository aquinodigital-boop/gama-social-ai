import React, { useState, useMemo, useCallback } from 'react';
import { SuggestionsEngine } from '../logic/SuggestionsEngine.js';
import { getCurrentSeason, getUpcomingHolidays } from '../utils/seasonalData.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  Globe, Calendar, Sun, ShoppingBag, Lightbulb,
  ChevronDown, ChevronUp, RefreshCw, Copy, Sparkles, ArrowRight,
} from 'lucide-react';

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  low: 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400',
};
const PRIORITY_LABELS = { high: 'Alta', medium: 'Média', low: 'Baixa' };

const FORMAT_LABELS = {
  reels: 'Reels', carrossel: 'Carrossel', stories: 'Stories',
  post_estatico: 'Post Estático', banner_site: 'Banner', whatsapp: 'WhatsApp',
};
const PERSONA_LABELS = {
  pintor_profissional: 'Pintor', lojista: 'Lojista', engenheiro_arquiteto: 'Eng./Arq.',
};

function SuggestionSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <Icon size={18} className="text-coral shrink-0" />
        <span className="text-sm font-bold text-text-primary flex-1 text-left">{title}</span>
        {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function SuggestionCard({ title, description, priority, actionLabel, onAction, children }) {
  return (
    <div className="p-3 bg-muted/20 border border-border/50 rounded-md">
      <div className="flex items-start gap-2 mb-1.5">
        <span className="text-sm font-semibold text-text-primary flex-1">{title}</span>
        {priority && (
          <Badge className={cn('text-[10px] shrink-0', PRIORITY_STYLES[priority])}>
            {PRIORITY_LABELS[priority]}
          </Badge>
        )}
      </div>
      <p className="text-xs text-text-secondary mb-2">{description}</p>
      {children}
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction} className="text-xs h-7 mt-1">
          <ArrowRight size={12} className="mr-1" /> {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function SuggestionsPanel({ onNavigateToGenerate }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const suggestions = useMemo(() => {
    void refreshKey; // Dependency for refresh
    return SuggestionsEngine.generateAll();
  }, [refreshKey]);

  const season = useMemo(() => getCurrentSeason(), []);

  const handleRefresh = useCallback(() => {
    setRefreshKey(k => k + 1);
    toast.info('Sugestões atualizadas');
  }, []);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copiado!'));
  }, []);

  const handleCreateContent = useCallback((config) => {
    if (onNavigateToGenerate) onNavigateToGenerate(config);
  }, [onNavigateToGenerate]);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-text-primary">Painel de Sugestões</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">{season.name} {new Date().getFullYear()}</Badge>
            <span className="text-xs text-text-muted">Atualizado agora</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="text-xs">
          <RefreshCw size={14} className="mr-1" /> Atualizar
        </Button>
      </div>

      <div className="space-y-4">
        {/* 1. Site Suggestions */}
        <SuggestionSection title="Melhorias para o Site" icon={Globe}>
          {suggestions.siteSuggestions.map(s => (
            <SuggestionCard
              key={s.id}
              title={s.title}
              description={s.description}
              priority={s.priority}
              actionLabel={s.generateConfig ? s.actionLabel : null}
              onAction={s.generateConfig ? () => handleCreateContent(s.generateConfig) : null}
            />
          ))}
        </SuggestionSection>

        {/* 2. Content Calendar */}
        <SuggestionSection title="Calendário de Conteúdo (7 dias)" icon={Calendar}>
          <div className="space-y-2">
            {suggestions.calendarIdeas.map((day, i) => (
              <div key={i} className="flex items-center gap-3 p-2 bg-muted/20 border border-border/50 rounded-md">
                <div className="w-16 shrink-0">
                  <div className="text-xs font-bold text-navy dark:text-coral">{day.day}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-text-primary truncate">{day.theme}</div>
                  <div className="flex gap-1 mt-0.5 flex-wrap">
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{FORMAT_LABELS[day.format]}</Badge>
                    <Badge variant="outline" className="text-[10px] h-4 px-1">{PERSONA_LABELS[day.persona]}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 shrink-0"
                  onClick={() => handleCreateContent({
                    format: day.format,
                    angle: day.angle,
                    persona: day.persona,
                    mode: day.type === 'institutional' ? 'institutional' : 'category_mix',
                    category: day.category,
                  })}
                >
                  <Sparkles size={12} />
                </Button>
              </div>
            ))}
          </div>
        </SuggestionSection>

        {/* 3. Seasonal Campaigns */}
        <SuggestionSection title="Campanhas Sazonais" icon={Sun}>
          {suggestions.seasonalCampaigns.map(c => (
            <SuggestionCard
              key={c.id}
              title={c.title}
              description={c.description}
              priority={c.priority}
            >
              {c.ideas && c.ideas.length > 0 && (
                <div className="mt-2 space-y-1">
                  {c.ideas.map((idea, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary flex-1">• {idea}</span>
                      <button onClick={() => handleCopy(idea)} className="text-text-muted hover:text-text-primary shrink-0">
                        <Copy size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SuggestionCard>
          ))}
        </SuggestionSection>

        {/* 4. Product Highlights */}
        <SuggestionSection title="Produtos em Destaque" icon={ShoppingBag} defaultOpen={false}>
          {suggestions.productHighlights.map(h => (
            <SuggestionCard
              key={h.id}
              title={h.title}
              description={h.description}
              actionLabel={h.brand ? 'Criar conteúdo' : h.product ? 'Criar conteúdo' : null}
              onAction={h.brand
                ? () => handleCreateContent({ mode: 'brand', brand: h.brand })
                : h.product
                  ? () => handleCreateContent({ mode: 'product', product: h.product })
                  : h.category
                    ? () => handleCreateContent({ mode: 'category_mix', category: h.category })
                    : null
              }
            />
          ))}
        </SuggestionSection>

        {/* 5. Social Media Ideas */}
        <SuggestionSection title="Ideias Rápidas (Redes Sociais)" icon={Lightbulb}>
          {suggestions.socialMediaIdeas.map(idea => (
            <div key={idea.id} className="p-3 bg-muted/20 border border-border/50 rounded-md">
              <p className="text-sm text-text-primary mb-2">"{idea.text}"</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px]">{FORMAT_LABELS[idea.format]}</Badge>
                <Badge variant="outline" className="text-[10px]">{PERSONA_LABELS[idea.persona]}</Badge>
                <div className="flex-1" />
                <button onClick={() => handleCopy(idea.text)} className="text-text-muted hover:text-text-primary">
                  <Copy size={14} />
                </button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleCreateContent({
                    format: idea.format,
                    angle: idea.angle,
                    persona: idea.persona,
                  })}
                >
                  <Sparkles size={12} className="mr-1" /> Gerar
                </Button>
              </div>
            </div>
          ))}
        </SuggestionSection>
      </div>
    </div>
  );
}
