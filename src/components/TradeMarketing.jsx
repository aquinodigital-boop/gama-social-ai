import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { generatePDVMaterial, generateIncentiveCampaign, generateSelloutAction } from '../logic/TradeTemplates.js';
import { GamaDataService } from '../logic/GamaDataService.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Store, Gift, TrendingUp, Copy, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const TABS = [
  { id: 'pdv', label: 'Material PDV', Icon: Store },
  { id: 'incentivo', label: 'Incentivo', Icon: Gift },
  { id: 'sellout', label: 'Sell-out', Icon: TrendingUp },
];

function CopyBlock({ label, text }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado!`));
  };
  return (
    <div className="relative group">
      <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className="p-3 bg-muted/30 border border-border rounded-md text-sm text-text-primary whitespace-pre-wrap">{text}</div>
      <button onClick={handleCopy} className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary">
        <Copy size={14} />
      </button>
    </div>
  );
}

function PDVTab({ item }) {
  const { region } = useAppContext();
  const [result, setResult] = useState(null);
  const categories = GamaDataService.getUniqueCategories();
  const [category, setCategory] = useState(item?.category || categories[0]);

  const handleGenerate = useCallback(() => {
    const r = generatePDVMaterial({ product: item, category, region });
    setResult(r);
    toast.success('Material PDV gerado!');
  }, [item, category, region]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-bold text-text-primary mb-3">Configurar Material PDV</h3>
        {item && <div className="text-xs text-text-muted mb-2">Produto: <strong className="text-text-primary">{item.name || item}</strong></div>}
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary mb-3">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button onClick={handleGenerate} className="w-full bg-coral hover:bg-coral-dark text-white">
          <Store size={16} className="mr-2" /> Gerar Material PDV
        </Button>
      </div>

      {result && (
        <div className="space-y-3 fade-in">
          <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>
          {result.pieces.map((piece, i) => (
            <div key={i} className="bg-surface-card border border-border rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-bold text-text-primary">{piece.name}</h4>
                <Badge variant="outline" className="text-[10px]">{piece.dimensions}</Badge>
              </div>
              <div className="space-y-2">
                <CopyBlock label="Headline" text={piece.headline} />
                <CopyBlock label="Corpo" text={piece.body} />
                <CopyBlock label="CTA" text={piece.cta} />
                <CopyBlock label="Prompt Visual" text={piece.visual_prompt} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IncentivoTab() {
  const [brand, setBrand] = useState('Coral');
  const [duration, setDuration] = useState('30 dias');
  const [prize, setPrize] = useState('R$ 500 + kit ferramentas');
  const [result, setResult] = useState(null);

  const brands = GamaDataService.getBrandStats().map(b => b.name);

  const handleGenerate = useCallback(() => {
    const r = generateIncentiveCampaign({ brand, duration, prize });
    setResult(r);
    toast.success('Campanha de incentivo gerada!');
  }, [brand, duration, prize]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Configurar Campanha</h3>
        <div>
          <label className="text-xs text-text-muted block mb-1">Marca foco</label>
          <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            {brands.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Duração</label>
          <select value={duration} onChange={e => setDuration(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            <option value="15 dias">15 dias</option>
            <option value="30 dias">30 dias</option>
            <option value="45 dias">45 dias</option>
            <option value="60 dias">60 dias</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Premiação</label>
          <Input value={prize} onChange={e => setPrize(e.target.value)} className="h-9 text-sm" />
        </div>
        <Button onClick={handleGenerate} className="w-full bg-coral hover:bg-coral-dark text-white">
          <Gift size={16} className="mr-2" /> Gerar Campanha
        </Button>
      </div>

      {result && (
        <div className="space-y-4 fade-in">
          <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>

          <div className="bg-surface-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-bold text-text-primary mb-2">Mecânica</h4>
            <ul className="space-y-1 text-sm text-text-secondary">
              {result.mechanics.rules.map((r, i) => <li key={i}>- {r}</li>)}
            </ul>
            <div className="mt-2 text-sm"><strong className="text-coral">Meta:</strong> {result.mechanics.target}</div>
            <div className="text-sm"><strong className="text-coral">Prêmio:</strong> {result.mechanics.prize}</div>
          </div>

          <CopyBlock label="WhatsApp — Convite" text={result.communication.whatsapp_convite} />
          <CopyBlock label="Cartaz A3 — Texto" text={`${result.communication.cartaz_a3.headline}\n\n${result.communication.cartaz_a3.body}`} />
          <CopyBlock label="Prompt Visual — Cartaz" text={result.communication.cartaz_a3.visual_prompt} />

          <div className="bg-surface-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-bold text-text-primary mb-2">Regulamento</h4>
            <ol className="space-y-1 text-xs text-text-secondary list-decimal list-inside">
              {result.communication.regulamento.map((r, i) => <li key={i}>{r}</li>)}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}

function SelloutTab({ item }) {
  const { region } = useAppContext();
  const categories = GamaDataService.getUniqueCategories();
  const [category, setCategory] = useState(item?.category || categories[0]);
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(() => {
    const r = generateSelloutAction({ product: item, category, region });
    setResult(r);
    toast.success('Ação sell-out gerada!');
  }, [item, category, region]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-bold text-text-primary mb-3">Configurar Ação Sell-out</h3>
        {item && <div className="text-xs text-text-muted mb-2">Produto: <strong className="text-text-primary">{item.name || item}</strong></div>}
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary mb-3">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Button onClick={handleGenerate} className="w-full bg-coral hover:bg-coral-dark text-white">
          <TrendingUp size={16} className="mr-2" /> Gerar Ação Sell-out
        </Button>
      </div>

      {result && (
        <div className="space-y-4 fade-in">
          <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>

          <div className="bg-surface-card border border-border rounded-lg p-4">
            <div className="text-sm text-text-secondary mb-2">{result.action.description}</div>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline">{result.action.audience}</Badge>
              <Badge variant="outline">{result.action.duration}</Badge>
              <Badge variant="outline">{result.action.angle}</Badge>
            </div>
          </div>

          {result.materials.map((m, i) => (
            <CopyBlock key={i} label={m.type.replace('_', ' ').toUpperCase()} text={m.content} />
          ))}

          <div className="bg-surface-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-bold text-text-primary mb-2">KPIs</h4>
            <div className="text-sm text-text-secondary space-y-1">
              <div><strong>Objetivo:</strong> {result.briefing.objetivo}</div>
              <div><strong>Meta:</strong> {result.briefing.meta_pedidos}</div>
              <div><strong>KPI:</strong> {result.briefing.kpi}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function TradeMarketing({ item }) {
  const [activeTab, setActiveTab] = useState('pdv');

  return (
    <div className="fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Store size={24} className="text-coral" />
        <h2 className="text-lg font-bold text-text-primary">Trade Marketing</h2>
      </div>

      <div className="flex gap-1.5 mb-4">
        {TABS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(id)}
            className={cn('text-xs', activeTab === id && 'bg-coral hover:bg-coral-dark')}
          >
            <Icon size={14} className="mr-1" /> {label}
          </Button>
        ))}
      </div>

      {activeTab === 'pdv' && <PDVTab item={item} />}
      {activeTab === 'incentivo' && <IncentivoTab />}
      {activeTab === 'sellout' && <SelloutTab item={item} />}
    </div>
  );
}
