import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'gama_content_history';
const MAX_HISTORY = 50;

export function useContentHistory() {
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
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
    setHistory(prev => {
      const updated = [{ ...content, savedAt: Date.now() }, ...prev].slice(0, MAX_HISTORY);
      return updated;
    });
  }, []);

  const removeFromHistory = useCallback((id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const setFeedback = useCallback((id, value) => {
    setHistory(prev => prev.map(item =>
      item.id === id ? { ...item, feedback: value } : item
    ));
  }, []);

  return {
    history,
    addToHistory,
    removeFromHistory,
    clearHistory,
    setFeedback,
    historyCount: history.length,
  };
}
