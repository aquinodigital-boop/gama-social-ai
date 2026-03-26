import React, { useState } from 'react';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

const FORMAT_ICONS = {
  reels: '🎬', carrossel: '📸', stories: '📱',
  post_estatico: '📌', banner_site: '🖥️', whatsapp: '💬',
};

const GRADE_STYLES = {
  A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  D: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function HistoryPanel({ history, onRemove, onClear }) {
  const [expandedId, setExpandedId] = useState(null);
  const [filterFormat, setFilterFormat] = useState('');

  const filteredHistory = filterFormat ? history.filter(h => h.format === filterFormat) : history;
  const formats = [...new Set(history.map(h => h.format).filter(Boolean))];

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
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Histórico</h3>
          <p className="text-sm text-text-muted">{history.length} conteúdos gerados</p>
        </div>
        <div className="flex gap-2">
          <select value={filterFormat} onChange={e => setFilterFormat(e.target.value)} className="h-8 px-2 text-xs border border-border rounded-md bg-surface-card text-text-primary">
            <option value="">Todos os formatos</option>
            {formats.map(f => <option key={f} value={f}>{FORMAT_ICONS[f] || ''} {f}</option>)}
          </select>
          <Button variant="outline" size="sm" onClick={onClear} className="text-xs text-error hover:text-error">
            <Trash2 size={13} className="mr-1" /> Limpar Tudo
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {filteredHistory.map(item => (
          <div key={item.id} className="bg-surface-card border border-border rounded-lg overflow-hidden">
            <div
              className="flex items-start justify-between gap-3 px-4 py-3 cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>{FORMAT_ICONS[item.format] || '📄'}</span>
                  <strong className="text-sm text-text-primary">{item.title || 'Sem título'}</strong>
                  {item.quality && (
                    <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', GRADE_STYLES[item.quality.grade])}>
                      {item.quality.grade}
                    </span>
                  )}
                  {item.feedback && (
                    <span className="text-xs">{item.feedback === 'up' ? '👍' : '👎'}</span>
                  )}
                </div>
                <div className="text-xs text-text-muted mt-1">
                  {item.strategy_focus}
                  {item.savedAt && ` | ${new Date(item.savedAt).toLocaleString('pt-BR')}`}
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
              <div className="p-4 border-t border-border fade-in">
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
