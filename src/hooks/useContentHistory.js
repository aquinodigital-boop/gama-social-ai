import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'gama_content_history';
const MAX_HISTORY = 100;

/**
 * Workflow de aprovação Gama — equipe trabalha em pipeline:
 *
 *   rascunho → revisado → aprovado → agendado → publicado
 *                 ↓           ↓           ↓
 *               recusado   recusado    recusado
 */
export const WORKFLOW_STATUS = {
  rascunho: { id: 'rascunho', label: 'Rascunho', icon: '📝', color: 'gray', next: ['revisado', 'recusado'] },
  revisado: { id: 'revisado', label: 'Revisado', icon: '👀', color: 'blue', next: ['aprovado', 'rascunho', 'recusado'] },
  aprovado: { id: 'aprovado', label: 'Aprovado', icon: '✅', color: 'green', next: ['agendado', 'publicado', 'revisado'] },
  agendado: { id: 'agendado', label: 'Agendado', icon: '📅', color: 'purple', next: ['publicado', 'aprovado'] },
  publicado: { id: 'publicado', label: 'Publicado', icon: '🚀', color: 'emerald', next: [] },
  recusado: { id: 'recusado', label: 'Recusado', icon: '❌', color: 'red', next: ['rascunho'] },
};

export const WORKFLOW_ORDER = ['rascunho', 'revisado', 'aprovado', 'agendado', 'publicado'];

export function useContentHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      // Migra itens antigos sem workflow
      return parsed.map((item) => ({
        status: item.status || 'rascunho',
        statusHistory: item.statusHistory || [
          { status: 'rascunho', at: item.savedAt || Date.now(), by: 'sistema' },
        ],
        ...item,
      }));
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('[History] Erro ao salvar:', e);
    }
  }, [history]);

  const addToHistory = useCallback((content) => {
    setHistory((prev) => {
      const now = Date.now();
      const item = {
        ...content,
        savedAt: now,
        status: 'rascunho',
        statusHistory: [{ status: 'rascunho', at: now, by: 'sistema' }],
      };
      return [item, ...prev].slice(0, MAX_HISTORY);
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const setFeedback = useCallback((id, value) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, feedback: value } : item))
    );
  }, []);

  /**
   * Avança/regride status de uma peça. Valida transições permitidas pelo workflow.
   * @param {string} id - id da peça
   * @param {string} newStatus - novo status
   * @param {object} extras - {by, note, publishedUrl, scheduledFor}
   */
  const setStatus = useCallback((id, newStatus, extras = {}) => {
    if (!WORKFLOW_STATUS[newStatus]) {
      console.warn(`[Workflow] status inválido: ${newStatus}`);
      return false;
    }
    setHistory((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const allowed = WORKFLOW_STATUS[item.status]?.next || [];
        if (!allowed.includes(newStatus)) {
          console.warn(`[Workflow] transição inválida: ${item.status} → ${newStatus}. Permitidas: ${allowed.join(', ')}`);
          return item;
        }
        const transition = {
          status: newStatus,
          at: Date.now(),
          by: extras.by || 'usuário',
          ...(extras.note && { note: extras.note }),
        };
        const update = {
          ...item,
          status: newStatus,
          statusHistory: [...(item.statusHistory || []), transition],
        };
        if (newStatus === 'agendado' && extras.scheduledFor) update.scheduledFor = extras.scheduledFor;
        if (newStatus === 'publicado') {
          update.publishedAt = Date.now();
          if (extras.publishedUrl) update.publishedUrl = extras.publishedUrl;
        }
        return update;
      })
    );
    return true;
  }, []);

  const getByStatus = useCallback(
    (status) => history.filter((item) => item.status === status),
    [history]
  );

  const getStatusCounts = useCallback(() => {
    const counts = {};
    WORKFLOW_ORDER.forEach((s) => (counts[s] = 0));
    counts.recusado = 0;
    history.forEach((item) => {
      const s = item.status || 'rascunho';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [history]);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    setFeedback,
    setStatus,
    getByStatus,
    getStatusCounts,
    historyCount: history.length,
  };
}
