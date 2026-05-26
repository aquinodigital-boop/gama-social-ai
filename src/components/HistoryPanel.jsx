import React, { useState } from 'react';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { WorkflowStatusBadge } from './WorkflowStatusBadge.jsx';
import { WORKFLOW_STATUS, WORKFLOW_ORDER } from '../hooks/useContentHistory.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const FORMAT_ICONS = {
  reels: '🎬', carrossel: '📸', stories: '📱',
  post_estatico: '📌', banner_site: '🖥️', whatsapp: '💬',
  quick_image: '🖼️', quick_video: '🎞️',
};

const GRADE_STYLES = {
  A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  D: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  F: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-200',
};

export function HistoryPanel({ history, onRemove, onClear, onSetStatus, statusCounts }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterFormat, setFilterFormat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  let filtered = history;
  if (filterFormat) filtered = filtered.filter((h) => h.format === filterFormat);
  if (filterStatus) filtered = filtered.filter((h) => (h.status || 'rascunho') === filterStatus);

  const formats = [...new Set(history.map((h) => h.format).filter(Boolean))];

  if (history.length === 0) {
    return (
      <div className="fade-in text-center py-20">
        <div className="text-4xl mb-3">📋</div>
        <h3 className="text-lg font-semibold text-text-primary">Nenhum conteúdo no histórico</h3>
        <p className="text-sm text-text-muted mt-1">Conteúdos gerados aparecerão aqui automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Cabeçalho + filtros */}
      <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Histórico</h3>
          <p className="text-sm text-text-muted">{history.length} conteúdos · {filtered.length} mostrados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={filterFormat} onChange={(e) => setFilterFormat(e.target.value)} className="h-8 px-2 text-xs border border-border rounded-md bg-surface-card text-text-primary">
            <option value="">Todos os formatos</option>
            {formats.map((f) => <option key={f} value={f}>{FORMAT_ICONS[f] || ''} {f}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="h-8 px-2 text-xs border border-border rounded-md bg-surface-card text-text-primary">
            <option value="">Todos os status</option>
            {WORKFLOW_ORDER.map((s) => (
              <option key={s} value={s}>{WORKFLOW_STATUS[s].icon} {WORKFLOW_STATUS[s].label}</option>
            ))}
            <option value="recusado">{WORKFLOW_STATUS.recusado.icon} {WORKFLOW_STATUS.recusado.label}</option>
          </select>
          <Button variant="outline" size="sm" onClick={onClear} className="text-xs text-error hover:text-error">
            <Trash2 size={13} className="mr-1" /> Limpar Tudo
          </Button>
        </div>
      </div>

      {/* Faixa de contagem por status (pipeline visual) */}
      {statusCounts && (
        <div className="flex gap-2 mb-4 flex-wrap text-xs">
          {WORKFLOW_ORDER.map((s) => {
            const c = statusCounts[s] || 0;
            const def = WORKFLOW_STATUS[s];
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(filterStatus === s ? '' : s)}
                className={cn(
                  'px-2.5 py-1 rounded-full border transition-all flex items-center gap-1',
                  filterStatus === s
                    ? 'bg-coral text-white border-coral'
                    : 'bg-surface-card border-border text-text-muted hover:text-text-primary'
                )}
              >
                <span>{def.icon}</span>
                <span className="font-medium">{def.label}</span>
                <span className="font-mono ml-1 opacity-70">{c}</span>
              </button>
            );
          })}
          {statusCounts.recusado > 0 && (
            <button
              onClick={() => setFilterStatus(filterStatus === 'recusado' ? '' : 'recusado')}
              className={cn(
                'px-2.5 py-1 rounded-full border transition-all flex items-center gap-1',
                filterStatus === 'recusado'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-surface-card border-border text-text-muted hover:text-text-primary'
              )}
            >
              <span>❌</span><span>Recusado</span><span className="font-mono ml-1 opacity-70">{statusCounts.recusado}</span>
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((item) => (
          <div key={item.id} className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <div
              className="flex items-start justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{FORMAT_ICONS[item.format] || '📄'}</span>
                  <strong className="text-sm text-text-primary">{item.title || 'Sem título'}</strong>
                  <WorkflowStatusBadge status={item.status || 'rascunho'} compact />
                  {item.quality && (
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', GRADE_STYLES[item.quality.grade])}>
                      {item.quality.grade}
                      {item.quality.blocked && ' • BLOQUEADO'}
                    </span>
                  )}
                  {item.feedback && (
                    <span className="text-xs">{item.feedback === 'up' ? '👍' : '👎'}</span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {item.strategy_focus}
                  {item.savedAt && ` · ${new Date(item.savedAt).toLocaleString('pt-BR')}`}
                  {item.provider && ` · ${item.provider}`}
                </div>
              </div>
              <div className="flex gap-1.5 items-center shrink-0">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onRemove(item.id); }} className="h-7 w-7 p-0 text-text-muted hover:text-error">
                  <Trash2 size={14} />
                </Button>
                {expandedId === item.id ? <ChevronUp size={14} className="text-text-muted" /> : <ChevronDown size={14} className="text-text-muted" />}
              </div>
            </div>

            {expandedId === item.id && (
              <div className="p-4 border-t border-border fade-in space-y-4">
                {/* Pipeline de status com ações */}
                <WorkflowActions item={item} onSetStatus={onSetStatus} />

                {item.quality?.blocked && item.quality.hardViolations?.length > 0 && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md text-sm">
                    <div className="font-bold text-red-700 dark:text-red-300 mb-1">🚨 Bloqueado por regra HARD da Gama</div>
                    <ul className="list-disc list-inside text-red-700 dark:text-red-300 space-y-0.5">
                      {item.quality.hardViolations.map((v, i) => (
                        <li key={i}>
                          <strong>{v.label}:</strong> trecho violador <code className="bg-red-100 dark:bg-red-900/40 px-1 rounded">{v.snippet}</code>
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-red-600 dark:text-red-400 mt-2">
                      Refaça o conteúdo evitando esses termos ou marque como Recusado.
                    </div>
                  </div>
                )}

                <ContentDisplay content={item} />
                {item.quality && <QualityPanel quality={item.quality} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barra de ações de workflow — só mostra as transições permitidas pelo status atual. */
function WorkflowActions({ item, onSetStatus }) {
  const current = item.status || 'rascunho';
  const allowedNext = WORKFLOW_STATUS[current]?.next || [];

  if (!onSetStatus) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/30 rounded-md">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider mr-1">Status:</span>
      <WorkflowStatusBadge status={current} />
      {allowedNext.length > 0 && (
        <>
          <span className="text-xs text-text-muted">→</span>
          {allowedNext.map((next) => {
            const def = WORKFLOW_STATUS[next];
            return (
              <Button
                key={next}
                variant="outline"
                size="sm"
                onClick={() => onSetStatus(item.id, next)}
                className="h-7 text-xs"
              >
                <span className="mr-1">{def.icon}</span>{def.label}
              </Button>
            );
          })}
        </>
      )}
      {item.statusHistory && item.statusHistory.length > 1 && (
        <details className="text-xs text-text-muted ml-auto">
          <summary className="cursor-pointer">Histórico ({item.statusHistory.length})</summary>
          <ul className="mt-2 space-y-1">
            {item.statusHistory.map((h, i) => (
              <li key={i}>
                {WORKFLOW_STATUS[h.status]?.icon} <strong>{WORKFLOW_STATUS[h.status]?.label || h.status}</strong> ·{' '}
                {new Date(h.at).toLocaleString('pt-BR')} · por {h.by}
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
