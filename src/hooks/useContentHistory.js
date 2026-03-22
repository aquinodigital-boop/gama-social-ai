import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'labor_content_history';
const MAX_HISTORY = 50;

/**
 * Hook para gerenciar histórico de conteúdos gerados.
 * Persiste em localStorage.
 */
export function useContentHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist ao mudar
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.warn('[History] Erro ao salvar:', e);
    }
  }, [history]);

  const addToHistory = useCallback((content) => {
    setHistory(prev => {
      const updated = [
        {
          ...content,
          savedAt: Date.now(),
        },
        ...prev,
      ].slice(0, MAX_HISTORY);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    historyCount: history.length,
  };
}
