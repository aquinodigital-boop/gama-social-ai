import React, { useState, useCallback } from 'react';
import { generateVisitScript, generateArgumentCard, generateObjectionResponse } from '../logic/KitPromotorTemplates.js';
import { ObjectionBank } from '../logic/ObjectionBank.js';
import { BrandBrain } from '../logic/BrandBrain.js';
import { GamaDataService } from '../logic/GamaDataService.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UserCheck, FileText, Shield, Copy, ChevronDown, ChevronUp, Search, Clock } from 'lucide-react';

const TABS = [
  { id: 'argumentario', label: 'Argumentário', Icon: FileText },
  { id: 'roteiro', label: 'Roteiro de Visita', Icon: Clock },
  { id: 'objecoes', label: 'Objeções', Icon: Shield },
];

function CopyBlock({ label, text }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copiado!'));
  };
  return (
    <div className="relative group">
      {label && <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1">{label}</div>}
      <div className="p-3 bg-muted/30 border border-border rounded-md text-sm text-text-primary whitespace-pre-wrap">{text}</div>
      <button onClick={handleCopy} className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-text-muted hover:text-text-primary">
        <Copy size={14} />
      </button>
    </div>
  );
}

function ArgumentarioTab({ item }) {
  const brands = GamaDataService.getBrandStats().map(b => b.name);
  const [brand, setBrand] = useState(item?.brand || 'Coral');
  const [competitor, setCompetitor] = useState('Suvinil');
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(() => {
    const r = generateArgumentCard({ product: item, brand, competitor });
    setResult(r);
    toast.success('Argumentário gerado!');
  }, [item, brand, competitor]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Gerar Argumentário</h3>
        {item && <div className="text-xs text-text-muted">Produto: <strong className="text-text-primary">{item.name || item}</strong></div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-text-muted block mb-1">Marca</label>
            <select value={brand} onChange={e => setBrand(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-text-muted block mb-1">Concorrente</label>
            <select value={competitor} onChange={e => setCompetitor(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
              <option value="Suvinil">Suvinil</option>
              <option value="Lukscolor">Lukscolor</option>
            </select>
          </div>
        </div>
        <Button onClick={handleGenerate} className="w-full bg-coral hover:bg-coral-dark text-white">
          <FileText size={16} className="mr-2" /> Gerar Argumentário
        </Button>
      </div>

      {result && (
        <div className="space-y-4 fade-in">
          <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>

          {/* 5 Arguments */}
          <div className="space-y-3">
            {result.arguments.map((arg, i) => (
              <div key={i} className="bg-surface-card border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-coral text-white text-[10px]">{arg.numero}</Badge>
                  <h4 className="text-sm font-bold text-text-primary">{arg.titulo}</h4>
                </div>
                <p className="text-sm text-text-secondary mb-2">{arg.argumento}</p>
                <div className="text-xs text-text-muted bg-muted/30 p-2 rounded-md">
                  <strong>Dado:</strong> {arg.dado}
                </div>
              </div>
            ))}
          </div>

          {/* Comparative */}
          <div className="bg-surface-card border border-border rounded-lg p-4">
            <h4 className="text-sm font-bold text-text-primary mb-3">Comparativo</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-bold text-coral mb-2">{result.comparativo.gama.marca}</div>
                <ul className="space-y-1">
                  {result.comparativo.gama.pontos.map((p, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1">
                      <span className="text-green-500 shrink-0">+</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs font-bold text-text-muted mb-2">{result.comparativo.concorrente.marca}</div>
                <ul className="space-y-1">
                  {result.comparativo.concorrente.pontos.map((p, i) => (
                    <li key={i} className="text-xs text-text-secondary flex items-start gap-1">
                      <span className="text-red-500 shrink-0">-</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Impact Data */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(result.impactData).map(([k, v]) => (
              <div key={k} className="bg-surface-card border border-border rounded-lg p-3 text-center">
                <div className="text-lg font-bold text-coral">{v}</div>
                <div className="text-[10px] text-text-muted uppercase">{k.replace(/([A-Z])/g, ' $1')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RoteiroTab({ item }) {
  const [persona, setPersona] = useState('lojista_carteira');
  const [result, setResult] = useState(null);

  const handleGenerate = useCallback(() => {
    const r = generateVisitScript({ product: item, persona });
    setResult(r);
    toast.success('Roteiro gerado!');
  }, [item, persona]);

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Roteiro de Visita</h3>
        {item && <div className="text-xs text-text-muted">Produto: <strong className="text-text-primary">{item.name || item}</strong></div>}
        <div>
          <label className="text-xs text-text-muted block mb-1">Persona</label>
          <select value={persona} onChange={e => setPersona(e.target.value)} className="w-full h-9 px-3 text-sm border border-border rounded-md bg-surface-card text-text-primary">
            {Object.values(BrandBrain.personas).map(p => <option key={p.id} value={p.id}>{p.icon} {p.label}</option>)}
          </select>
        </div>
        <Button onClick={handleGenerate} className="w-full bg-coral hover:bg-coral-dark text-white">
          <Clock size={16} className="mr-2" /> Gerar Roteiro
        </Button>
      </div>

      {result && (
        <div className="space-y-4 fade-in">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-text-primary">{result.title}</h3>
            <Badge variant="outline">{result.totalDuration}</Badge>
          </div>

          {result.steps.map((step, i) => (
            <div key={i} className="bg-surface-card border border-border rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-muted/20 border-b border-border">
                <Badge className="bg-coral text-white text-xs">{step.duracao}</Badge>
                <h4 className="text-sm font-bold text-text-primary">{step.fase}</h4>
              </div>
              <div className="p-4 space-y-3">
                <CopyBlock text={step.script} />
                <div>
                  <div className="text-xs font-semibold text-text-muted mb-1.5">Dicas</div>
                  <ul className="space-y-1">
                    {step.dicas.map((d, j) => (
                      <li key={j} className="text-xs text-text-secondary flex items-start gap-1.5">
                        <span className="text-coral shrink-0">-</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ObjecoesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeType, setActiveType] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const tipos = ObjectionBank.getTipos();
  const objections = activeType
    ? ObjectionBank.getByTipo(activeType)
    : searchQuery
      ? ObjectionBank.search(searchQuery)
      : ObjectionBank.getAll();

  return (
    <div className="space-y-4">
      <div className="bg-surface-card border border-border rounded-lg p-4 space-y-3">
        <h3 className="text-sm font-bold text-text-primary">Banco de Objeções ({ObjectionBank.getCount()})</h3>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <Input
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setActiveType(null); }}
            placeholder="Buscar objeção..."
            className="pl-9 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          <Button
            variant={activeType === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setActiveType(null); setSearchQuery(''); }}
            className={cn('text-xs', activeType === null && 'bg-coral hover:bg-coral-dark')}
          >
            Todas
          </Button>
          {tipos.map(t => (
            <Button
              key={t.id}
              variant={activeType === t.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => { setActiveType(t.id); setSearchQuery(''); }}
              className={cn('text-xs', activeType === t.id && 'bg-coral hover:bg-coral-dark')}
            >
              {t.icon} {t.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {objections.map(o => (
          <div key={o.id} className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/20 transition-colors"
              onClick={() => setExpandedId(expandedId === o.id ? null : o.id)}
            >
              <Badge variant="outline" className="text-[10px] shrink-0">{o.tipoLabel}</Badge>
              <span className="text-sm font-medium text-text-primary flex-1">{o.objecao}</span>
              {expandedId === o.id ? <ChevronUp size={16} className="text-text-muted" /> : <ChevronDown size={16} className="text-text-muted" />}
            </button>
            {expandedId === o.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                <CopyBlock label="Resposta" text={o.resposta} />
                <div className="text-xs text-text-muted bg-muted/20 p-2 rounded-md">
                  <strong>Dado de apoio:</strong> {o.dados_apoio}
                </div>
                <CopyBlock label="Pergunta de Follow-up" text={o.pergunta_followup} />
              </div>
            )}
          </div>
        ))}
        {objections.length === 0 && (
          <div className="text-sm text-text-muted text-center py-6">Nenhuma objeção encontrada.</div>
        )}
      </div>
    </div>
  );
}

export function KitPromotor({ item }) {
  const [activeTab, setActiveTab] = useState('argumentario');

  return (
    <div className="fade-in">
      <div className="flex items-center gap-2 mb-4">
        <UserCheck size={24} className="text-coral" />
        <h2 className="text-lg font-bold text-text-primary">Kit Promotor</h2>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
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

      {activeTab === 'argumentario' && <ArgumentarioTab item={item} />}
      {activeTab === 'roteiro' && <RoteiroTab item={item} />}
      {activeTab === 'objecoes' && <ObjecoesTab />}
    </div>
  );
}
