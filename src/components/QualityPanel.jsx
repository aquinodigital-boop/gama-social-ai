import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const GRADE_STYLES = {
  A: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  B: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  C: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  D: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export function QualityPanel({ quality }) {
  if (!quality) return null;

  return (
    <div className="bg-surface-card border border-border rounded-lg shadow-sm my-4 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-md text-sm font-bold', GRADE_STYLES[quality.grade])}>
            {quality.grade}
          </span>
          <div>
            <strong className="text-sm text-text-primary">Qualidade: {quality.percentage}%</strong>
            <div className="text-xs text-text-muted">{quality.score}/{quality.maxScore} pontos</div>
          </div>
        </div>
        {quality.passed ? (
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Aprovado</Badge>
        ) : (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Ajustar</Badge>
        )}
      </div>

      <div className="p-4 space-y-2">
        {quality.checks.map(check => (
          <div key={check.id} className="flex items-start gap-3 py-1.5">
            <span className="text-base mt-0.5">{check.passed ? '✅' : '❌'}</span>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">{check.label}</div>
              <div className={cn('text-xs mt-0.5', check.passed ? 'text-success' : 'text-error')}>
                {check.detail}
              </div>
            </div>
            <Badge variant="outline" className={cn('shrink-0 text-xs', check.passed ? 'border-success/30 text-success' : 'border-error/30 text-error')}>
              +{check.weight}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
