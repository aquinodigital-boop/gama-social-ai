import React from 'react';
import { WORKFLOW_STATUS } from '../hooks/useContentHistory.js';
import { cn } from '@/lib/utils';

const COLOR_STYLES = {
  gray:    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  blue:    'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  green:   'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  purple:  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  red:     'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export function WorkflowStatusBadge({ status, compact = false }) {
  const def = WORKFLOW_STATUS[status] || WORKFLOW_STATUS.rascunho;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        COLOR_STYLES[def.color] || COLOR_STYLES.gray,
        compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-xs'
      )}
    >
      <span>{def.icon}</span>
      <span>{def.label}</span>
    </span>
  );
}
