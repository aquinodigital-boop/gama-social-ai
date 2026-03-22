import React, { useState } from 'react';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';

const FORMAT_ICONS = {
  reels: '🎬',
  carrossel: '📸',
  stories: '📱',
  post_estatico: '📌',
  banner_site: '🖥️',
  whatsapp: '💬',
};

export function HistoryPanel({ history, onRemove, onClear }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterFormat, setFilterFormat] = useState('');

  const filteredHistory = filterFormat
    ? history.filter(h => h.format === filterFormat)
    : history;

  // Get unique formats in history
  const formats = [...new Set(history.map(h => h.format).filter(Boolean))];

  if (history.length === 0) {
    return (
      <div className="empty-state fade-in" style={{ minHeight: '300px' }}>
        <div className="empty-state-icon">📋</div>
        <h3>Nenhum conteúdo no histórico</h3>
        <p>Conteúdos gerados aparecerão aqui automaticamente.</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-4)',
      }}>
        <div>
          <h3 style={{ margin: 0 }}>Histórico</h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', margin: 0 }}>
            {history.length} conteúdos gerados
          </p>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {/* Filter */}
          <select
            value={filterFormat}
            onChange={e => setFilterFormat(e.target.value)}
            style={{ width: 'auto', fontSize: 'var(--text-xs)' }}
          >
            <option value="">Todos os formatos</option>
            {formats.map(f => (
              <option key={f} value={f}>{FORMAT_ICONS[f] || ''} {f}</option>
            ))}
          </select>
          <button
            className="btn btn-secondary"
            onClick={onClear}
            style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}
          >
            Limpar Tudo
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {filteredHistory.map(item => (
          <div key={item.id} className="card">
            <div
              className="card-header"
              style={{ cursor: 'pointer' }}
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <span>{FORMAT_ICONS[item.format] || '📄'}</span>
                  <strong style={{ fontSize: 'var(--text-sm)' }}>{item.title || 'Sem título'}</strong>
                  {item.quality && (
                    <span className={`quality-badge quality-${item.quality.grade}`}>
                      {item.quality.grade}
                    </span>
                  )}
                </div>
                <div style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-muted)',
                  marginTop: 'var(--space-1)',
                }}>
                  {item.strategy_focus}
                  {item.savedAt && ` | ${new Date(item.savedAt).toLocaleString('pt-BR')}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                <button
                  className="btn btn-ghost"
                  onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
                  title="Remover"
                  style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}
                >
                  ✕
                </button>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  {expandedId === item.id ? '▲' : '▼'}
                </span>
              </div>
            </div>

            {expandedId === item.id && (
              <div className="card-body fade-in">
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
