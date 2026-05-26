/**
 * Provider Registry — Gama Distribuidora
 *
 * 3 providers disponíveis:
 *   - claude: backend /api/generate (Anthropic, prompt cached) — RECOMENDADO em prod
 *   - gemini: direto do client (API key client-side, vaza no bundle — só dev/legado)
 *   - local: templates offline (fallback)
 */

import { LocalProvider } from './LocalProvider.js';
import { GeminiProvider, GEMINI_MODELS, DEFAULT_GEMINI_MODEL } from './GeminiProvider.js';
import { ClaudeProvider, CLAUDE_MODELS, DEFAULT_CLAUDE_MODEL } from './ClaudeProvider.js';

let geminiKey = localStorage.getItem('gama_gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY || '';
let claudeBackendAvailable = null; // lazy-checked

export const getGeminiApiKey = () => geminiKey;
export { GEMINI_MODELS, DEFAULT_GEMINI_MODEL, CLAUDE_MODELS, DEFAULT_CLAUDE_MODEL };

class ProviderRegistry {
  constructor() {
    this.providers = {
      local: new LocalProvider(),
      gemini: new GeminiProvider(geminiKey),
      claude: new ClaudeProvider(),
    };
    // Default: se houver API key Gemini configurada usa Gemini; senão tenta Claude backend; senão local.
    // Em primeiro load, Claude vira default depois que o healthcheck confirma disponibilidade.
    this.activeProvider = geminiKey ? 'gemini' : 'local';
    this._initClaudeHealthcheck();
  }

  async _initClaudeHealthcheck() {
    const health = await ClaudeProvider.healthcheck();
    claudeBackendAvailable = health.available;
    // Se Claude tá vivo e o usuário não setou nenhum provider explicitamente,
    // promove Claude (mais seguro que Gemini client-side).
    const userSelected = localStorage.getItem('gama_active_provider');
    if (!userSelected && health.available) {
      this.activeProvider = 'claude';
    } else if (userSelected && this.providers[userSelected]) {
      this.activeProvider = userSelected;
    }
  }

  get current() {
    return this.providers[this.activeProvider];
  }

  setActive(name) {
    if (!this.providers[name]) return;
    this.activeProvider = name;
    localStorage.setItem('gama_active_provider', name);
  }

  updateGeminiKey(key) {
    geminiKey = key;
    this.providers.gemini = new GeminiProvider(key);
    if (key) this.activeProvider = 'gemini';
  }

  setGeminiModel(modelId) {
    if (this.providers.gemini) this.providers.gemini.setModel(modelId);
  }

  getGeminiModel() {
    return this.providers.gemini?.model || DEFAULT_GEMINI_MODEL;
  }

  setClaudeModel(modelId) {
    if (this.providers.claude) this.providers.claude.setModel(modelId);
  }

  getClaudeModel() {
    return this.providers.claude?.model || DEFAULT_CLAUDE_MODEL;
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

  hasClaudeBackend() {
    return claudeBackendAvailable === true;
  }

  listProviders() {
    return [
      {
        id: 'claude',
        name: 'Claude (backend)',
        description: 'Anthropic via servidor seguro — API key não exposta',
        available: claudeBackendAvailable !== false, // true ou null (ainda checando)
        recommended: true,
      },
      {
        id: 'gemini',
        name: 'Gemini AI',
        description: 'Google direto do browser — API key exposta no bundle (dev/legado)',
        available: !!geminiKey,
      },
      {
        id: 'local',
        name: 'Templates',
        description: 'Templates inteligentes (offline, sem IA)',
        available: true,
      },
    ];
  }
}

export const providerRegistry = new ProviderRegistry();
