/**
 * Provider Registry — Gama Distribuidora
 */

import { LocalProvider } from './LocalProvider.js';
import { GeminiProvider, GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from './GeminiProvider.js';

let geminiKey = localStorage.getItem('gama_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
export const getGeminiApiKey = () => geminiKey;
export { GEMINI_MODELS, DEFAULT_GEMINI_MODEL };

class ProviderRegistry {
  constructor() {
    this.providers = {
      local: new LocalProvider(),
      gemini: new GeminiProvider(geminiKey),
    };
    this.activeProvider = geminiKey ? 'gemini' : 'local';
  }

  get current() {
    return this.providers[this.activeProvider];
  }

  setActive(name) {
    if (!this.providers[name]) return;
    this.activeProvider = name;
  }

  updateGeminiKey(key) {
    geminiKey = key;
    this.providers.gemini = new GeminiProvider(key);
    if (key) {
      this.activeProvider = 'gemini';
    }
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

  hasGeminiKey() {
    return !!geminiKey;
  }

  listProviders() {
    return [
      { id: 'gemini', name: 'Gemini AI', description: 'IA generativa (conteúdo original)', available: !!geminiKey },
      { id: 'local', name: 'Templates', description: 'Templates inteligentes (offline)', available: true },
    ];
  }
}

export const providerRegistry = new ProviderRegistry();
