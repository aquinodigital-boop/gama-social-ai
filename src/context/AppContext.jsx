import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { providerRegistry } from '../providers/index.js';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  apiKey: 'gama_gemini_api_key',
  model: 'gama_gemini_model',
  theme: 'gama_theme',
};

export function AppProvider({ children }) {
  const [apiKey, setApiKeyState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.apiKey) || import.meta.env.VITE_GEMINI_API_KEY || ''
  );
  const [model, setModelState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.model) || providerRegistry.getGeminiModel()
  );
  const [theme, setThemeState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.theme) || 'dark'
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const setApiKey = useCallback((key) => {
    setApiKeyState(key);
    localStorage.setItem(STORAGE_KEYS.apiKey, key);
    providerRegistry.updateGeminiKey(key);
  }, []);

  const setModel = useCallback((m) => {
    setModelState(m);
    localStorage.setItem(STORAGE_KEYS.model, m);
    providerRegistry.setGeminiModel(m);
  }, []);

  const setTheme = useCallback((t) => {
    setThemeState(t);
    localStorage.setItem(STORAGE_KEYS.theme, t);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey,
      model, setModel,
      theme, setTheme, toggleTheme,
      sidebarOpen, setSidebarOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext deve ser usado dentro de AppProvider');
  return ctx;
}
