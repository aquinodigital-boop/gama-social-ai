import React, { useState, useMemo, useCallback } from 'react';
import { SuggestionsEngine } from '../logic/SuggestionsEngine.js';
import { GamaDataService } from '../logic/GamaDataService.js';
import { getCurrentSeason, getUpcomingHolidays } from '../utils/seasonalData.js';
import { useAppContext } from '../context/AppContext.jsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  BarChart3, Package, Calendar, Megaphone, Lightbulb,
  ChevronDown, ChevronUp, RefreshCw, Copy, TrendingUp,
} from 'lucide-react';

const TABS = [
  { id: 'catalogo', label: 'Catálogo', Icon: Package },
  { id: 'calendario', label: 'Calendário', Icon: Calendar },
  { id: 'campanhas', label: 'Campanhas', Icon: Megaphone },
  { id: 'sugestoes', label: 'Sugestões', Icon: Lightbulb },
];

function Section({ title, icon: Icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-surface-card border border-border rounded-lg overflow-hidden">
      <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors" onClick={() => setOpen(!open)}>
        <Icon size={18} className="text-blue-500 shrink-0" />
        <span className="text-sm font-bold text-text-primary flex-1 text-left">{title}</span>
        {open ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

function CatalogoTab() {
  const stats = useMemo(() => GamaDataService.getStats(), []);
  const brandStats = useMemo(() => GamaDataService.getBrandStats(), []);
  const catStats = useMemo(() => GamaDataService.getCategoryStats(), []);

  return (
    <div className="space-y-4">
      {/* Stats overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-surface-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.totalProducts}</div>
          <div className="text-[10px] text-text-muted uppercase">Produtos</div>
        </div>
        <div className="bg-surface-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{brandStats.length}</div>
          <div className="text-[10px] text-text-muted uppercase">Marcas</div>
        </div>
        <div className="bg-surface-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{catStats.length}</div>
          <div className="text-[10px] text-text-muted uppercase">Categorias</div>
        </div>
        <div className="bg-surface-card border border-border rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-500">{stats.productsWithBrand}</div>
          <div className="text-[10px] text-text-muted uppercase">Com Marca</div>
        </div>
      </div>

      {/* Brands */}
      <Section title={`Marcas (${brandStats.length})`} icon={Package}>
        <div className="space-y-2">
          {brandStats.slice(0, 10).map(b => (
            <div key={b.name} className="flex items-center gap-3 p-2 bg-muted/20 rounded-md">
              <span className="text-sm font-semibold text-text-primary flex-1">{b.name}</span>
              <Badge variant="outline" className="text-[10px]">{b.productCount} produtos</Badge>
            </div>
          ))}
          {brandStats.length > 10 && <div className="text-xs text-text-muted text-center">+{brandStats.length - 10} marcas</div>}
        </div>
      </Section>

      {/* Categories */}
      <Section title={`Categorias (${catStats.length})`} icon={Package} defaultOpen={false}>
        <div className="space-y-2">
          {catStats.map(c => (
            <div key={c.name} className="flex items-center gap-3 p-2 bg-muted/20 rounded-md">
              <span className="text-sm text-text-primary flex-1">{c.name}</span>
              <Badge variant="outline" className="text-[10px]">{c.productCount}</Badge>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function CalendarioTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  const suggestions = useMemo(() => {
    void refreshKey;
    return SuggestionsEngine.generateCalendarIdeas();
  }, [refreshKey]);

  const FORMAT_LABELS = {
    reels: 'Reels', carrossel: 'Carrossel', stories: 'Stories',
    post_estatico: 'Post', banner_site: 'Banner', whatsapp: 'WhatsApp',
  };
  const PERSONA_LABELS = {
    pintor_profissional: 'Pintor', lojista: 'Lojista', engenheiro_arquiteto: 'Eng.',
    lojista_carteira: 'Carteira', lojista_prospeccao: 'Prospecção', balconista: 'Balconista',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Calendário de Conteúdo (7 dias)</h3>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} className="text-xs">
          <RefreshCw size={12} className="mr-1" /> Atualizar
        </Button>
      </div>
      <div className="space-y-2">
        {suggestions.map((day, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-surface-card border border-border rounded-lg">
            <div className="w-16 shrink-0">
              <div className="text-xs font-bold text-blue-500">{day.day}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-text-primary truncate">{day.theme}</div>
              <div className="flex gap-1 mt-0.5 flex-wrap">
                <Badge variant="outline" className="text-[10px] h-4 px-1">{FORMAT_LABELS[day.format] || day.format}</Badge>
                <Badge variant="outline" className="text-[10px] h-4 px-1">{PERSONA_LABELS[day.persona] || day.persona}</Badge>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CampanhasTab() {
  const { activeCampaigns } = useAppContext();
  const season = useMemo(() => getCurrentSeason(), []);
  const holidays = useMemo(() => getUpcomingHolidays(90), []);
  const suggestions = useMemo(() => SuggestionsEngine.generateSeasonalCampaigns(), []);

  return (
    <div className="space-y-4">
      {/* Active campaigns */}
      <Section title="Campanhas Ativas" icon={Megaphone}>
        <div className="space-y-2">
          {activeCampaigns.includes('reconquista') && (
            <div className="p-3 bg-coral/10 border border-coral/20 rounded-md">
              <div className="text-sm font-bold text-coral">Projeto Reconquista Santos</div>
              <div className="text-xs text-text-secondary mt-1">Retomada de market share na Baixada Santista vs Suvinil</div>
            </div>
          )}
          {activeCampaigns.includes('programa_cl') && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-md">
              <div className="text-sm font-bold text-blue-500">Programa CL</div>
              <div className="text-xs text-text-secondary mt-1">Fidelização e transformação de fachada</div>
            </div>
          )}
        </div>
      </Section>

      {/* Season */}
      <Section title={`Temporada: ${season.name}`} icon={Calendar}>
        <div className="p-3 bg-muted/20 rounded-md">
          <div className="text-sm text-text-primary mb-2">{season.reason}</div>
          <div className="flex gap-1 flex-wrap mb-2">
            {season.highlights.map(h => <Badge key={h} variant="outline" className="text-[10px]">{h}</Badge>)}
          </div>
          {season.campaigns?.map((c, i) => (
            <div key={i} className="text-xs text-text-secondary flex items-start gap-1 mt-1">
              <span className="text-blue-500">-</span> {c}
            </div>
          ))}
        </div>
      </Section>

      {/* Upcoming holidays */}
      <Section title={`Próximas Datas (${holidays.length})`} icon={Calendar} defaultOpen={false}>
        <div className="space-y-2">
          {holidays.map(h => (
            <div key={`${h.month}-${h.day}`} className="flex items-center gap-3 p-2 bg-muted/20 rounded-md">
              <Badge variant={h.daysUntil <= 14 ? 'default' : 'outline'} className={cn('text-[10px] shrink-0', h.daysUntil <= 14 && 'bg-coral')}>
                {h.daysUntil}d
              </Badge>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-text-primary">{h.name}</div>
                <div className="text-xs text-text-muted truncate">{h.marketing}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function SugestoesTab() {
  const [refreshKey, setRefreshKey] = useState(0);
  const suggestions = useMemo(() => {
    void refreshKey;
    return SuggestionsEngine.generateAll();
  }, [refreshKey]);

  const handleCopy = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copiado!'));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-text-primary">Sugestões de Conteúdo</h3>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)} className="text-xs">
          <RefreshCw size={12} className="mr-1" /> Atualizar
        </Button>
      </div>

      {/* Site suggestions */}
      <Section title="Melhorias para o Site" icon={TrendingUp}>
        {suggestions.siteSuggestions.map(s => (
          <div key={s.id} className="p-3 bg-muted/20 border border-border/50 rounded-md">
            <div className="text-sm font-semibold text-text-primary">{s.title}</div>
            <p className="text-xs text-text-secondary mt-1">{s.description}</p>
          </div>
        ))}
      </Section>

      {/* Product highlights */}
      <Section title="Produtos em Destaque" icon={Package} defaultOpen={false}>
        {suggestions.productHighlights.map(h => (
          <div key={h.id} className="p-3 bg-muted/20 border border-border/50 rounded-md">
            <div className="text-sm font-semibold text-text-primary">{h.title}</div>
            <p className="text-xs text-text-secondary mt-1">{h.description}</p>
          </div>
        ))}
      </Section>

      {/* Social media ideas */}
      <Section title="Ideias Rápidas" icon={Lightbulb}>
        {suggestions.socialMediaIdeas.map(idea => (
          <div key={idea.id} className="p-3 bg-muted/20 border border-border/50 rounded-md">
            <p className="text-sm text-text-primary mb-2">"{idea.text}"</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px]">{idea.format}</Badge>
              <Badge variant="outline" className="text-[10px]">{idea.persona}</Badge>
              <div className="flex-1" />
              <button onClick={() => handleCopy(idea.text)} className="text-text-muted hover:text-text-primary">
                <Copy size={14} />
              </button>
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

export function IntelligencePanel() {
  const [activeTab, setActiveTab] = useState('catalogo');
  const season = useMemo(() => getCurrentSeason(), []);

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 size={24} className="text-blue-500" />
          <div>
            <h2 className="text-lg font-bold text-text-primary">Inteligência</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px]">{season.name} {new Date().getFullYear()}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(id)}
            className={cn('text-xs', activeTab === id && 'bg-blue-600 hover:bg-blue-700')}
          >
            <Icon size={14} className="mr-1" /> {label}
          </Button>
        ))}
      </div>

      {activeTab === 'catalogo' && <CatalogoTab />}
      {activeTab === 'calendario' && <CalendarioTab />}
      {activeTab === 'campanhas' && <CampanhasTab />}
      {activeTab === 'sugestoes' && <SugestoesTab />}
    </div>
  );
}
