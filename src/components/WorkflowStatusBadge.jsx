import React from 'react';
import { WORKFLOW_STATUS } from '../hooks/useContentHistory.js';
import { cn } from '@/lib/utils';

/**
 * Badge editorial — dot colorido + texto mono uppercase.
 * Visual de "etiqueta de arquivo" em vez de pill colorida genérica.
 */
const DOT_COLOR = {
  gray:    'var(--color-status-rascunho)',
  blue:    'var(--color-status-revisado)',
  green:   'var(--color-status-aprovado)',
  purple:  'var(--color-status-agendado)',
  emerald: 'var(--color-status-publicado)',
  red:     'var(--color-status-recusado)',
};

export function WorkflowStatusBadge({ status, compact = false }) {
  const def = WORKFLOW_STATUS[status] || WORKFLOW_STATUS.rascunho;
  const dotColor = DOT_COLOR[def.color] || DOT_COLOR.gray;

  return (
    <span
      className={cn('inline-flex items-center gap-1.5')}
      style={{
        fontFamily: 'var(--font-mono)',
        fontSize: compact ? 9 : 10,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'var(--color-text-primary)',
        padding: compact ? '2px 6px 2px 5px' : '3px 8px 3px 6px',
        border: '1px solid var(--color-rule)',
        borderRadius: 1,
        background: 'var(--color-paper)',
      }}
    >
      <span
        className="status-dot"
        style={{
          background: dotColor,
          width: compact ? 5 : 6,
          height: compact ? 5 : 6,
          boxShadow: `0 0 0 2px color-mix(in srgb, ${dotColor} 18%, transparent)`,
        }}
      />
      {def.label}
    </span>
  );
}
