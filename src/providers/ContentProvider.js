/**
 * ContentProvider.js
 * Interface abstrata para geração de conteúdo.
 * Padrão Strategy: permite trocar o "motor" sem mudar a UI.
 * 
 * Providers disponíveis:
 *   - LocalProvider (templates inteligentes, sem IA externa)
 *   - LLMProvider (futuro: OpenAI, Claude, etc.)
 */

/**
 * @typedef {Object} ContentRequest
 * @property {'product'|'category'|'institutional'} mode
 * @property {string} name - Nome do produto/categoria/tema
 * @property {string} category - Categoria
 * @property {string} angle - Ângulo estratégico (logistics, profit, partnership, problem_solution)
 * @property {string} persona - Persona alvo (dono_loja, balconista, comprador)
 * @property {string} format - Formato (reels, carrossel, stories, post_estatico, banner_site, whatsapp)
 * @property {string} objective - Objetivo (gerar_demanda, ativar_whatsapp, institucional)
 */

/**
 * @typedef {Object} ContentResult
 * @property {string} id - UUID do conteúdo
 * @property {string} type - Tipo (Reels, Carrossel, etc.)
 * @property {string} title
 * @property {string} strategy_focus
 * @property {Array} script - Roteiro cena a cena (se aplicável)
 * @property {Object} assets - Prompts de imagem/vídeo
 * @property {string} caption - Legenda para redes
 * @property {string} whatsapp - Mensagem WhatsApp (se aplicável)
 * @property {Object} quality - Resultado do checklist de qualidade
 * @property {number} generatedAt - Timestamp
 * @property {string} provider - Nome do provider usado
 */

export class ContentProviderInterface {
  constructor(name) {
    this.name = name;
  }

  /**
   * Gera conteúdo para um único formato
   * @param {ContentRequest} request
   * @returns {Promise<ContentResult>}
   */
  async generate(_request) {
    throw new Error(`Provider "${this.name}" deve implementar generate()`);
  }

  /**
   * Gera plano semanal (7 dias)
   * @param {Object} params - { objective, category, angle, persona }
   * @returns {Promise<Array<{ day: number, dayName: string, contents: ContentResult[] }>>}
   */
  async generateWeeklyPlan(_params) {
    throw new Error(`Provider "${this.name}" deve implementar generateWeeklyPlan()`);
  }

  /**
   * Gera prompts de imagem/vídeo
   * @param {Object} params - { name, category, style, format }
   * @returns {Promise<Object>}
   */
  async generatePromptPack(_params) {
    throw new Error(`Provider "${this.name}" deve implementar generatePromptPack()`);
  }
}
