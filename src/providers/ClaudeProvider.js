/**
 * ClaudeProvider.js — Gama Distribuidora
 *
 * Cliente que chama o backend `/api/generate` (Vercel serverless).
 * Resolve a vulnerabilidade de API key client-side: a chave Claude fica
 * em `ANTHROPIC_API_KEY` no servidor, não no bundle do browser.
 *
 * Mesma interface do GeminiProvider — drop-in replacement.
 */

import { ContentProviderInterface } from "./ContentProvider.js";
import { QualityChecker } from "../engine/QualityChecker.js";
import { PromptGenerator } from "../engine/PromptGenerator.js";
import { CategoryExpert } from "../logic/marketing/CategoryExpert.js";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/**
 * Modelos disponíveis. Default ajustado por tipo de tarefa no backend
 * (Sonnet pra criativo, Haiku pra quick). O usuário pode forçar via UI.
 */
export const CLAUDE_MODELS = [
  { id: "claude-sonnet-4-6", label: "Sonnet 4.6", description: "Criativo equilibrado (default)" },
  { id: "claude-haiku-4-5", label: "Haiku 4.5", description: "Rápido e barato (volume)" },
  { id: "claude-opus-4-7", label: "Opus 4.7", description: "Máxima qualidade (custo alto)" },
];
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

/** Endpoint do backend. Em dev `vercel dev` proxia /api/* localmente. */
const API_ENDPOINT = "/api/generate";

export class ClaudeProvider extends ContentProviderInterface {
  constructor() {
    super("Claude (backend)");
    this.model = DEFAULT_CLAUDE_MODEL;
  }

  setModel(modelId) {
    if (CLAUDE_MODELS.find((m) => m.id === modelId)) this.model = modelId;
  }

  async _post(payload) {
    const res = await fetch(API_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(
        `Backend /api/generate falhou (${res.status}): ${errBody?.error || res.statusText}`
      );
    }
    return res.json();
  }

  async generate(request) {
    const { content } = await this._post({
      type: "content",
      modelOverride: this.model,
      request,
    });

    // Enriquece com metadados client-side
    const catContext = CategoryExpert.get(request.category);
    const promptPack = PromptGenerator.generate({
      name: request.name,
      category: request.category,
      format: request.format,
      catContext,
    });

    content.id = uid();
    content.format = request.format;
    content.angle = request.angle;
    content.persona = request.persona;
    content.provider = content.provider || this.name;
    content.assets = content.assets || { narration_text: "", image_prompts: [], video_prompts: [] };
    content.assets.promptPack = promptPack;
    content.quality = QualityChecker.check(content);

    return content;
  }

  async generateWeeklyPlan(params) {
    const { plan } = await this._post({
      type: "weekly_plan",
      modelOverride: this.model,
      request: params,
    });

    // Roda QualityChecker em cada peça do plano (HARD validator pega tudo)
    plan.forEach((day) => {
      day.contents = day.contents.map((c) => {
        c.id = uid();
        c.quality = QualityChecker.check(c);
        return c;
      });
    });
    return plan;
  }

  async generatePromptPack(params) {
    return PromptGenerator.generateFull(params);
  }

  async generateQuickImage(request) {
    const { content } = await this._post({
      type: "quick_image",
      modelOverride: this.model,
      request,
    });
    content.id = uid();
    content.format = "quick_image";
    content.angle = request.angle;
    content.persona = request.persona;
    content.provider = content.provider || this.name;
    return content;
  }

  async generateQuickVideo(request) {
    const { content } = await this._post({
      type: "quick_video",
      modelOverride: this.model,
      request,
    });
    content.id = uid();
    content.format = "quick_video";
    content.angle = request.angle;
    content.persona = request.persona;
    content.provider = content.provider || this.name;
    return content;
  }

  /** Healthcheck simples — usado pela UI pra mostrar status do backend. */
  static async healthcheck() {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "__healthcheck__" }),
      });
      // 400 = endpoint responde mas rejeita type inválido → backend está vivo
      // 500 = key não configurada → backend vivo mas mal config
      // network error = backend não roda
      if (res.status === 400 || res.status === 500) {
        const body = await res.json().catch(() => ({}));
        return { available: true, status: res.status, message: body.error || "OK" };
      }
      return { available: false, status: res.status, message: "Inesperado" };
    } catch (err) {
      return { available: false, status: 0, message: err.message };
    }
  }
}
