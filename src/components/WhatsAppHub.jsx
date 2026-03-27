import React, { useState, useCallback } from 'react';
import { useAppContext } from '../context/AppContext.jsx';
import { generateCarteiraAtiva, generateProspeccao, generateReativacao, generateAvulsa, getAvulsaTypes } from '../logic/WhatsAppTemplates.js';
import { BrandBrain } from '../logic/BrandBrain.js';
import { GamaDataService } from '../logic/GamaDataService.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { MessageCircle, Users, Target, RotateCcw, Zap, Copy, ChevronRight } from 'lucide-react';

const TABS = [
  { id: 'carteira', label: 'Carteira Ativa', Icon: Users },
  { id: 'prospeccao', label: 'Prospecção', Icon: Target },
  { id: 'reativacao', label: 'Reativação', Icon: RotateCcw },
  { id: 'avulsas', label: 'Avulsas', Icon: Zap },
];

const PERSONAS = Object.values(BrandBrain.personas);

function WhatsAppBubble({ message, label, step }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(message).then(() => toast.success('Mensagem copiada!'));
  };
  return (
    <div className="flex flex-col items-end">
      {label && <div className="text-[10px] text-text-muted mb-1 mr-2">{step ? `Passo ${step}: ` : ''}{label}</div>}
      <div className="relative group max-w-[85%] bg-[#d9fdd3] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tr-none p-3 text-sm shadow-sm">
        <div className="whitespace-pre-wrap">{message}</div>
        <button
          onClick={handleCopy}
          className="absolute -left-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary"
        >
          <Copy size={14} />
        </button>
      </div>
    </div>
  );
}

function FlowDisplay({ result }) {
  if (!result?.flow) return null;
  const handleCopyAll = () => {
    const all = result.flow.map(f => `--- ${f.label} (${f.timing}) ---\n${f.message}`).join('\n\n');
    navigator.clipboard.writeText(all).then(() => toast.success('Fluxo completo copiado!'));
  };

  return (
    <div className="fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>
        <Button variant="outline" size="sm" onClick={handleCopyAll} className="text-xs">
          <Copy size={12} className="mr-1" /> Copiar Tudo
        </Button>
      </div>
      {result.persona && <Badge variant="outline" className="text-xs">{result.persona}</Badge>}

      <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-lg p-4 space-y-4">
        {result.flow.map((f, i) => (
          <div key={i}>
            <WhatsAppBubble message={f.message} label={f.label} step={f.step} />
            <div className="flex items-center gap-2 mt-1.5 ml-2">
              <Badge variant="secondary" className="text-[10px]">{f.timing}</Badge>
              {f.note && <span className="text-[10px] text-text-muted italic">{f.note}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CarteiraTab({ item }) {
  const { region, teamData } = useAppContext();
  const [persona, setPersona] = useState('lojista_carteira');
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(() => {
    const r = generateCarteiraAtiva({ product: item, persona, region, teamData });
    setResult(r);
    toast.success('Fluxo de carteira gerado!');
  }, [item, persona, region, teamData]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Régua: Carteira Ativa</h3>
        <p className="text-xs text-text-muted">Fluxo de 4 mensagens para clientes que já compram da Gama.</p>
        {item && <div className="text-xs text-text-muted">Produto: <strong className="text-text-primary">{item.name || item}</strong></div>}
        <div>
          <label className="text-xs text-text-muted block mb-1">Persona</label>
          <select value={persona} onChange={e => setPersona(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
          </select>
        </div>
        <Button onClick={handleGenerate} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <MessageCircle size={16} className="mr-2" /> Gerar Fluxo
        </Button>
      </div>
      <FlowDisplay result={result} />
    </div>
  );
}

function ProspeccaoTab({ item }) {
  const { region, competitors } = useAppContext();
  const [persona, setPersona] = useState('lojista_prospeccao');
  const [competitor, setCompetitor] = useState(competitors[0] || 'Suvinil');
  const brands = GamaDataService.getBrandStats().map(b => b.name);
  const [brand, setBrand] = useState('Coral');
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(() => {
    const r = generateProspeccao({ brand, competitor, persona, region });
    setResult(r);
    toast.success('Fluxo de prospecção gerado!');
  }, [brand, competitor, persona, region]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Régua: Prospecção</h3>
        <p className="text-xs text-text-muted">Fluxo para conquistar lojistas que compram do concorrente.</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted block mb-1">Marca foco</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Concorrente</label>
            <select value={competitor} onChange={e => setCompetitor(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
              {competitors.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Persona</label>
          <select value={persona} onChange={e => setPersona(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
          </select>
        </div>
        <Button onClick={handleGenerate} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <Target size={16} className="mr-2" /> Gerar Fluxo
        </Button>
      </div>
      <FlowDisplay result={result} />
    </div>
  );
}

function ReativacaoTab() {
  const { region } = useAppContext();
  const [persona, setPersona] = useState('lojista_carteira');
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(() => {
    const r = generateReativacao({ persona, region });
    setResult(r);
    toast.success('Fluxo de reativação gerado!');
  }, [persona, region]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Régua: Reativação</h3>
        <p className="text-xs text-text-muted">Fluxo para reativar clientes inativos.</p>
        <div>
          <label className="text-xs text-text-muted block mb-1">Persona</label>
          <select value={persona} onChange={e => setPersona(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            {PERSONAS.map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
          </select>
        </div>
        <Button onClick={handleGenerate} className="w-full bg-green-600 hover:bg-green-700 text-white">
          <RotateCcw size={16} className="mr-2" /> Gerar Fluxo
        </Button>
      </div>
      <FlowDisplay result={result} />
    </div>
  );
}

function AvulsasTab({ item }) {
  const { teamData } = useAppContext();
  const types = getAvulsaTypes();
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback((tipo) => {
    const r = generateAvulsa({ tipo, product: item, teamData });
    if (r) {
      setResult(r);
      toast.success('Mensagem gerada!');
    }
  }, [item, teamData]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4">
        <h3 className="text-sm font-bold text-text-primary mb-2">Mensagens Avulsas</h3>
        <p className="text-xs text-text-muted mb-3">Selecione o tipo de mensagem para gerar.</p>
        {item && <div className="text-xs text-text-muted mb-3">Produto: <strong className="text-text-primary">{item.name || item}</strong></div>}
        <div className="grid grid-cols-2 gap-2">
          {types.map(t => (
            <Button
              key={t.id}
              variant="outline"
              size="sm"
              onClick={() => handleGenerate(t.id)}
              className="text-xs justify-start h-9"
            >
              <span className="mr-1.5">{t.icon}</span> {t.label}
            </Button>
          ))}
        </div>
      </div>

      {result && (
        <div className="fade-in space-y-3">
          <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>
          <div className="bg-[#efeae2] dark:bg-[#0b141a] rounded-lg p-4">
            <WhatsAppBubble message={result.message} label={result.label} />
          </div>
        </div>
      )}
    </div>
  );
}

export function WhatsAppHub({ item }) {
  const [activeTab, setActiveTab] = useState('carteira');

  return (
    <div className="fade-in">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle size={24} className="text-green-500" />
        <h2 className="text-lg font-bold text-text-primary">WhatsApp Hub</h2>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(({ id, label, Icon }) => (
          <Button
            key={id}
            variant={activeTab === id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(id)}
            className={cn('text-xs', activeTab === id && 'bg-green-600 hover:bg-green-700')}
          >
            <Icon size={14} className="mr-1" /> {label}
          </Button>
        ))}
      </div>

      {activeTab === 'carteira' && <CarteiraTab item={item} />}
      {activeTab === 'prospeccao' && <ProspeccaoTab item={item} />}
      {activeTab === 'reativacao' && <ReativacaoTab />}
      {activeTab === 'avulsas' && <AvulsasTab item={item} />}
    </div>
  );
}
