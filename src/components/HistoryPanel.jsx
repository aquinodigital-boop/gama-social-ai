import React, { useState } from 'react';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { WorkflowStatusBadge } from './WorkflowStatusBadge.jsx';
import { WORKFLOW_STATUS, WORKFLOW_ORDER } from '../hooks/useContentHistory.js';
import { cn } from '@/lib/utils';
import { ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

const FORMAT = {
  reels:         { icon: '🎬', code: 'REL', color: 'var(--color-format-reels)' },
  carrossel:     { icon: '📸', code: 'CAR', color: 'var(--color-format-carrossel)' },
  stories:       { icon: '📱', code: 'STO', color: 'var(--color-format-stories)' },
  post_estatico: { icon: '📌', code: 'POS', color: 'var(--color-format-post)' },
  banner_site:   { icon: '🖥️', code: 'BNR', color: 'var(--color-format-banner)' },
  whatsapp:      { icon: '💬', code: 'WHA', color: 'var(--color-format-whatsapp)' },
  quick_image:   { icon: '🖼️', code: 'QIM', color: '#6E5BFF' },
  quick_video:   { icon: '🎞️', code: 'QVD', color: '#1B9AAA' },
};

const GRADE_COLOR = {
  A: '#10B981',
  B: '#3B82F6',
  C: '#F59E0B',
  D: '#F97316',
  F: '#EF4444',
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
      <div className="fade-in py-20 text-center">
        <div className="numero mb-2">HISTÓRICO · VAZIO</div>
        <h2 className="display-lg mb-2" style={{ fontSize: 28 }}>Nenhuma peça arquivada ainda</h2>
        <p className="lead mx-auto">Toda peça gerada aparece aqui, com pipeline de aprovação rastreável.</p>
      </div>
    );
  }

  return (
    <div className="fade-in space-y-6">
      {/* ──────── Hero editorial ──────── */}
      <section className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="numero">No. 06</span>
          <div className="regua flex-1" />
          <span className="eyebrow">{history.length} arquivado · {filtered.length} visível</span>
        </div>

        <h1 className="display-lg" style={{ fontSize: 36 }}>Arquivo Editorial</h1>
        <p className="lead">
          Pipeline de aprovação rastreável — cada peça caminha de rascunho a publicado, com log completo de transições.
        </p>
      </section>

      {/* ──────── Pipeline visual estilo Gantt magazine ──────── */}
      {statusCounts && (
        <div className="paper-card overflow-hidden">
          <span className="paint-band" style={{ background: 'var(--color-gama-amarelo)' }} />
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="eyebrow">Pipeline · clique pra filtrar</span>
              {filterStatus && (
                <button onClick={() => setFilterStatus('')} className="mono text-[10px] flex items-center gap-1 hover:opacity-70">
                  <X size={11} /> LIMPAR FILTRO
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-1">
              {WORKFLOW_ORDER.map((s, i) => {
                const def = WORKFLOW_STATUS[s];
                const c = statusCounts[s] || 0;
                const active = filterStatus === s;
                return (
                  <React.Fragment key={s}>
                    <button
                      onClick={() => setFilterStatus(active ? '' : s)}
                      className="flex items-center gap-2 px-3 py-2 transition-all"
                      style={{
                        background: active ? 'var(--color-ink)' : 'var(--color-paper-2)',
                        color: active ? 'var(--color-paper)' : 'var(--color-text-primary)',
                        border: `1px solid ${active ? 'var(--color-ink)' : 'var(--color-rule)'}`,
                        borderRadius: 2,
                        flex: '1 1 0',
                        minWidth: 120,
                      }}
                    >
                      <span style={{ fontSize: 14 }}>{def.icon}</span>
                      <div className="text-left min-w-0">
                        <div
                          className="mono text-[9px] font-bold opacity-70 truncate"
                          style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}
                        >
                          {String(i + 1).padStart(2, '0')} · {def.label}
                        </div>
                        <div className="display-md" style={{ fontSize: 18, lineHeight: 1 }}>{c}</div>
                      </div>
                    </button>
                    {i < WORKFLOW_ORDER.length - 1 && (
                      <div className="hidden sm:flex items-center" style={{ color: 'var(--color-rule)', fontSize: 18 }}>›</div>
                    )}
                  </React.Fragment>
                );
              })}
              {statusCounts.recusado > 0 && (
                <button
                  onClick={() => setFilterStatus(filterStatus === 'recusado' ? '' : 'recusado')}
                  className="flex items-center gap-2 px-3 py-2 transition-all"
                  style={{
                    background: filterStatus === 'recusado' ? 'var(--color-status-recusado)' : 'transparent',
                    color: filterStatus === 'recusado' ? '#fff' : 'var(--color-status-recusado)',
                    border: `1px solid var(--color-status-recusado)`,
                    borderRadius: 2,
                  }}
                >
                  <span>❌</span>
                  <span className="mono text-[9px] font-bold">RECUSADO · {statusCounts.recusado}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ──────── Filtros + ações ──────── */}
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div className="flex gap-2 flex-wrap">
          <FilterChip
            label="Formato"
            value={filterFormat}
            options={formats.map((f) => ({ value: f, label: `${FORMAT[f]?.icon || ''} ${f}` }))}
            onChange={setFilterFormat}
          />
        </div>
        <button
          onClick={onClear}
          className="mono text-[10px] flex items-center gap-1.5 px-3 py-1.5 transition-colors hover:bg-[var(--color-status-recusado)] hover:text-white"
          style={{
            border: '1px solid var(--color-status-recusado)',
            color: 'var(--color-status-recusado)',
            borderRadius: 2,
            letterSpacing: '0.08em',
          }}
        >
          <Trash2 size={11} /> LIMPAR HISTÓRICO
        </button>
      </div>

      {/* ──────── Lista de peças ──────── */}
      <div className="flex flex-col gap-3 stagger">
        {filtered.map((item, i) => {
          const f = FORMAT[item.format] || { icon: '📄', code: 'UNK', color: 'var(--color-text-muted)' };
          const expanded = expandedId === item.id;
          return (
            <article
              key={item.id}
              className="stagger-item paper-card overflow-hidden"
            >
              {/* Faixa colorida lateral com código do formato */}
              <div className="flex">
                <div
                  className="flex flex-col items-center justify-center py-3 px-2 shrink-0"
                  style={{ background: f.color, color: '#fff', minWidth: 56 }}
                >
                  <span style={{ fontSize: 20 }}>{f.icon}</span>
                  <span className="mono text-[8px] font-bold mt-1" style={{ letterSpacing: '0.08em' }}>
                    {f.code}
                  </span>
                  <span className="mono text-[8px] mt-0.5" style={{ opacity: 0.7 }}>
                    {String(i + 1).padStart(3, '0')}
                  </span>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => setExpandedId(expanded ? null : item.id)}
                    className="w-full text-left p-4 hover:bg-[var(--color-paper-2)] transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <WorkflowStatusBadge status={item.status || 'rascunho'} compact />
                          {item.quality && (
                            <span
                              className="mono text-[10px] font-bold px-1.5 py-0.5"
                              style={{
                                color: '#fff',
                                background: GRADE_COLOR[item.quality.grade] || 'var(--color-text-muted)',
                                borderRadius: 1,
                              }}
                            >
                              {item.quality.grade}
                              {item.quality.blocked && ' · BLOQUEADO'}
                            </span>
                          )}
                          {item.feedback && (
                            <span style={{ fontSize: 12 }}>{item.feedback === 'up' ? '👍' : '👎'}</span>
                          )}
                          {item.provider && (
                            <span className="mono text-[9px] opacity-50">{item.provider}</span>
                          )}
                        </div>
                        <div
                          className="display-md truncate"
                          style={{ fontSize: 18 }}
                        >
                          {item.title || 'Sem título'}
                        </div>
                        {item.strategy_focus && (
                          <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                            {item.strategy_focus}
                          </div>
                        )}
                        {item.savedAt && (
                          <div className="mono text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {new Date(item.savedAt).toLocaleString('pt-BR')}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                          className="p-1.5 transition-colors hover:bg-[var(--color-status-recusado)] hover:text-white"
                          style={{ border: '1px solid var(--color-rule)', borderRadius: 2 }}
                          aria-label="Remover"
                        >
                          <Trash2 size={13} />
                        </button>
                        {expanded
                          ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} />
                          : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
                      </div>
                    </div>
                  </button>

                  {/* Detail */}
                  {expanded && (
                    <div className="border-t p-4 space-y-4" style={{ borderColor: 'var(--color-rule)' }}>
                      <WorkflowActions item={item} onSetStatus={onSetStatus} />

                      {item.quality?.blocked && item.quality.hardViolations?.length > 0 && (
                        <div
                          className="p-3"
                          style={{
                            background: 'rgba(239,68,68,0.08)',
                            border: '1px solid var(--color-status-recusado)',
                            borderLeftWidth: 4,
                            borderRadius: 2,
                          }}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="tape" style={{ background: 'var(--color-status-recusado)', color: '#fff', border: '1px solid #B91C1C' }}>
                              ★ BLOQUEADO · HARD
                            </span>
                          </div>
                          <ul className="space-y-1 text-sm" style={{ color: 'var(--color-status-recusado)' }}>
                            {item.quality.hardViolations.map((v, idx) => (
                              <li key={idx} className="flex gap-2">
                                <span className="mono text-[10px] opacity-60 shrink-0 mt-0.5">▸</span>
                                <span>
                                  <strong>{v.label}:</strong>{' '}
                                  <code
                                    style={{
                                      background: 'rgba(239,68,68,0.15)',
                                      padding: '1px 4px',
                                      borderRadius: 1,
                                      fontFamily: 'var(--font-mono)',
                                      fontSize: 11,
                                    }}
                                  >
                                    {v.snippet}
                                  </code>
                                </span>
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 mono text-[10px]" style={{ color: 'var(--color-status-recusado)', opacity: 0.7 }}>
                            ▸ REGENERE EVITANDO ESSES TERMOS, OU MARQUE COMO RECUSADO
                          </div>
                        </div>
                      )}

                      <ContentDisplay content={item} />
                      {item.quality && <QualityPanel quality={item.quality} />}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Workflow actions — barra inline de transições permitidas
   ────────────────────────────────────────────────────────── */
function WorkflowActions({ item, onSetStatus }) {
  if (!onSetStatus) return null;
  const current = item.status || 'rascunho';
  const allowedNext = WORKFLOW_STATUS[current]?.next || [];

  return (
    <div className="flex flex-wrap items-center gap-2 p-3" style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-rule)', borderRadius: 2 }}>
      <span className="eyebrow">status:</span>
      <WorkflowStatusBadge status={current} />

      {allowedNext.length > 0 && (
        <>
          <span style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>→</span>
          {allowedNext.map((next) => {
            const def = WORKFLOW_STATUS[next];
            return (
              <button
                key={next}
                onClick={() => onSetStatus(item.id, next)}
                className="flex items-center gap-1.5 px-2.5 py-1 transition-all hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                style={{
                  border: '1px solid var(--color-ink)',
                  borderRadius: 1,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                <span style={{ fontSize: 12 }}>{def.icon}</span>{def.label}
              </button>
            );
          })}
        </>
      )}

      {item.statusHistory && item.statusHistory.length > 1 && (
        <details className="ml-auto mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
          <summary className="cursor-pointer hover:text-text-primary">log ({item.statusHistory.length})</summary>
          <ul className="mt-2 space-y-1 list-none">
            {item.statusHistory.map((h, idx) => (
              <li key={idx} className="flex gap-2">
                <span>{WORKFLOW_STATUS[h.status]?.icon}</span>
                <span>
                  <strong>{WORKFLOW_STATUS[h.status]?.label || h.status}</strong> ·{' '}
                  <span className="mono">{new Date(h.at).toLocaleString('pt-BR')}</span> ·{' '}
                  por {h.by}
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Filter chip — select editorial
   ────────────────────────────────────────────────────────── */
function FilterChip({ label, value, options, onChange }) {
  return (
    <label className="flex items-center gap-1.5 mono text-[10px]" style={{ letterSpacing: '0.06em' }}>
      <span style={{ color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 bg-transparent"
        style={{
          border: '1px solid var(--color-rule)',
          borderRadius: 2,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.04em',
        }}
      >
        <option value="">todos</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  );
}
