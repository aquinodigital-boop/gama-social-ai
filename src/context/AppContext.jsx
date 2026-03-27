import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { providerRegistry } from '../providers/index.js';

const AppContext = createContext(null);

const STORAGE_KEYS = {
  apiKey: 'gama_gemini_api_key',
  model: 'gama_gemini_model',
  theme: 'gama_theme',
  activeModule: 'gama_active_module',
  region: 'gama_region',
  activeCampaigns: 'gama_active_campaigns',
  teamData: 'gama_team_data',
  competitors: 'gama_competitors',
  productConfig: 'gama_product_config',
};

const DEFAULT_TEAM_DATA = { consultorName: '', phone: '', region: 'baixada_santista' };
const DEFAULT_COMPETITORS = ['Suvinil', 'Lukscolor'];
const DEFAULT_CAMPAIGNS = ['reconquista'];
const DEFAULT_PRODUCT_CONFIG = {
  marginFilter: 'todas',      // 'todas' | 'alta' | 'media' | 'baixa'
  seasonalOnly: false,
  strategicFilter: 'todos',   // 'todos' | 'reconquista' | 'programa_cl'
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

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

  // v2 state
  const [activeModule, setActiveModuleState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.activeModule) || 'trade'
  );
  const [region, setRegionState] = useState(
    () => localStorage.getItem(STORAGE_KEYS.region) || 'baixada_santista'
  );
  const [activeCampaigns, setActiveCampaignsState] = useState(
    () => loadJSON(STORAGE_KEYS.activeCampaigns, DEFAULT_CAMPAIGNS)
  );
  const [teamData, setTeamDataState] = useState(
    () => loadJSON(STORAGE_KEYS.teamData, DEFAULT_TEAM_DATA)
  );
  const [competitors, setCompetitorsState] = useState(
    () => loadJSON(STORAGE_KEYS.competitors, DEFAULT_COMPETITORS)
  );
  const [productConfig, setProductConfigState] = useState(
    () => loadJSON(STORAGE_KEYS.productConfig, DEFAULT_PRODUCT_CONFIG)
  );

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

  const setActiveModule = useCallback((m) => {
    setActiveModuleState(m);
    localStorage.setItem(STORAGE_KEYS.activeModule, m);
  }, []);

  const setRegion = useCallback((r) => {
    setRegionState(r);
    localStorage.setItem(STORAGE_KEYS.region, r);
  }, []);

  const setActiveCampaigns = useCallback((c) => {
    setActiveCampaignsState(c);
    localStorage.setItem(STORAGE_KEYS.activeCampaigns, JSON.stringify(c));
  }, []);

  const setTeamData = useCallback((d) => {
    setTeamDataState(d);
    localStorage.setItem(STORAGE_KEYS.teamData, JSON.stringify(d));
  }, []);

  const setCompetitors = useCallback((c) => {
    setCompetitorsState(c);
    localStorage.setItem(STORAGE_KEYS.competitors, JSON.stringify(c));
  }, []);

  const setProductConfig = useCallback((c) => {
    setProductConfigState(c);
    localStorage.setItem(STORAGE_KEYS.productConfig, JSON.stringify(c));
  }, []);

  return (
    <AppContext.Provider value={{
      apiKey, setApiKey,
      model, setModel,
      theme, setTheme, toggleTheme,
      sidebarOpen, setSidebarOpen,
      activeModule, setActiveModule,
      region, setRegion,
      activeCampaigns, setActiveCampaigns,
      teamData, setTeamData,
      competitors, setCompetitors,
      productConfig, setProductConfig,
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

export const REGIONS = [
  { id: 'baixada_santista', label: 'Baixada Santista', cities: ['Santos', 'São Vicente', 'Guarujá', 'Cubatão', 'Praia Grande'] },
  { id: 'grande_sp', label: 'Grande São Paulo', cities: ['São Paulo', 'Guarulhos', 'Osasco'] },
  { id: 'abc', label: 'ABC Paulista', cities: ['São Bernardo', 'Santo André', 'São Caetano', 'Diadema'] },
];

export const CAMPAIGNS = [
  { id: 'reconquista', label: 'Projeto Reconquista Santos', description: 'Retomada de market share vs Suvinil na Baixada Santista' },
  { id: 'programa_cl', label: 'Programa CL', description: 'Programa de fidelização e transformação de fachada' },
];
