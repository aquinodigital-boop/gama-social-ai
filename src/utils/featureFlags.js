/**
 * featureFlags.js
 * Sistema simples de feature flags para habilitar/desabilitar funcionalidades.
 */

const STORAGE_KEY = 'labor_feature_flags';

const DEFAULT_FLAGS = {
  llm_provider: false,       // Habilitar provider LLM
  weekly_plan: true,         // Plano semanal
  quality_checker: true,     // Checklist de qualidade
  prompt_pack: true,         // Pack de prompts exportável
  history: true,             // Histórico de conteúdos
  stories_trends: true,      // Stories baseados em trends
  whatsapp_messages: true,   // Mensagens WhatsApp
  banner_site: true,         // Banners de site
  debug_mode: false,         // Logs de debug
};

class FeatureFlags {
  constructor() {
    this.flags = { ...DEFAULT_FLAGS };
    this._load();
  }

  _load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.flags = { ...DEFAULT_FLAGS, ...parsed };
      }
    } catch {
      // Ignorar erros de localStorage
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.flags));
    } catch {
      // Ignorar
    }
  }

  isEnabled(flag) {
    return this.flags[flag] ?? false;
  }

  enable(flag) {
    this.flags[flag] = true;
    this._save();
  }

  disable(flag) {
    this.flags[flag] = false;
    this._save();
  }

  toggle(flag) {
    this.flags[flag] = !this.flags[flag];
    this._save();
    return this.flags[flag];
  }

  getAll() {
    return { ...this.flags };
  }

  reset() {
    this.flags = { ...DEFAULT_FLAGS };
    this._save();
  }
}

export const featureFlags = new FeatureFlags();
