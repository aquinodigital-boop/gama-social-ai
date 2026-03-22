/**
 * Provider Registry — Gama Distribuidora
 */

import { LocalProvider } from './LocalProvider.js';
import { GeminiProvider, GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from './GeminiProvider.js';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
export const getGeminiApiKey = () => GEMINI_KEY;
export { GEMINI_MODELS, DEFAULT_GEMINI_MODEL };

class ProviderRegistry {
  constructor() {
    this.providers = {
      local: new LocalProvider(),
      gemini: new GeminiProvider(GEMINI_KEY),
    };
    this.activeProvider = GEMINI_KEY ? 'gemini' : 'local';
  }

  get current() {
    return this.providers[this.activeProvider];
  }

  setActive(name) {
    if (!this.providers[name]) return;
    this.activeProvider = name;
  }

  setGeminiModel(modelId) {
    if (this.providers.gemini) {
      this.providers.gemini.setModel(modelId);
    }
  }

  getGeminiModel() {
    return this.providers.gemini?.model || DEFAULT_GEMINI_MODEL;
  }

  getProviderName() {
    return this.current.name;
  }

  getActiveId() {
    return this.activeProvider;
  }

  listProviders() {
    return [
      { id: 'gemini', name: 'Gemini AI', description: 'IA generativa (conteúdo original)', available: !!GEMINI_KEY },
      { id: 'local', name: 'Templates', description: 'Templates inteligentes (offline)', available: true },
    ];
  }
}

export const providerRegistry = new ProviderRegistry();
