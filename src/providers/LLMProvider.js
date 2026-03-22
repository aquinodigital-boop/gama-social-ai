/**
 * LLMProvider.js
 * Provider para IA externa (OpenAI, Claude, etc.)
 * 
 * IMPLEMENTAÇÃO FUTURA - Interface preparada.
 * Nunca espalha fetch pela UI; toda comunicação com IA passa por aqui.
 */

import { ContentProviderInterface } from './ContentProvider.js';

export class LLMProvider extends ContentProviderInterface {
  constructor(config = {}) {
    super('LLM');
    this.apiUrl = config.apiUrl || '';
    this.apiKey = config.apiKey || '';
    this.model = config.model || 'gpt-4';
    this.enabled = false; // Feature flag - desabilitado por padrão
  }

  async generate(request) {
    if (!this.enabled) {
      throw new Error('LLMProvider está desabilitado. Ative nas configurações.');
    }

    // Construir system prompt com contexto da marca
    const systemPrompt = this._buildSystemPrompt();
    const userPrompt = this._buildUserPrompt(request);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`);
      }

      const data = await response.json();
      return this._parseResponse(data, request);
    } catch (error) {
      console.error('[LLMProvider] Erro na chamada:', error);
      throw error;
    }
  }

  async generateWeeklyPlan(_params) {
    if (!this.enabled) {
      throw new Error('LLMProvider está desabilitado.');
    }
    // Futuro: chamada única para gerar plano semanal completo
    throw new Error('generateWeeklyPlan não implementado para LLM ainda.');
  }

  async generatePromptPack(_params) {
    if (!this.enabled) {
      throw new Error('LLMProvider está desabilitado.');
    }
    throw new Error('generatePromptPack não implementado para LLM ainda.');
  }

  _buildSystemPrompt() {
    return `Você é o assistente de marketing da Labor Atacadista, um atacadista B2B de materiais de construção no ABC Paulista.

REGRAS OBRIGATÓRIAS:
- Tom: objetivo, direto, parceiro, confiável
- Público: lojistas, donos de lojas de material de construção, balconistas
- Região: ABC Paulista (Santo André, São Bernardo, São Caetano, Diadema, Mauá, Ribeirão Pires)
- NUNCA inventar números específicos (ex: "entrega em 2h", "500 clientes")
- NUNCA usar: "linha completa", "mix completo", "todo o mix", "portfólio completo"
- Usar afirmações seguras: "entrega ágil no ABC", "opções que trabalhamos", "atendimento B2B"
- CTA sempre direcionando para WhatsApp, tabela de preços, ou consulta de estoque
- Foco em: margem do lojista, giro rápido, parceria, logística ágil
- NÃO usar linguagem de consumidor final; o cliente é B2B`;
  }

  _buildUserPrompt(request) {
    return `Gere conteúdo para:
- Produto/Categoria: ${request.name}
- Formato: ${request.format}
- Ângulo: ${request.angle}
- Persona: ${request.persona}
- Modo: ${request.mode}

Retorne em JSON com: title, type, strategy_focus, script (array de cenas), assets (narration_text, image_prompts, video_prompts), caption.`;
  }

  _parseResponse(data, request) {
    // Parsear resposta do LLM em formato ContentResult
    try {
      const content = JSON.parse(data.choices[0].message.content);
      return {
        ...content,
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        generatedAt: Date.now(),
        provider: this.name,
        format: request.format,
        angle: request.angle,
        persona: request.persona,
      };
    } catch {
      // Fallback: retornar como texto
      return {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        type: request.format,
        title: `Conteúdo: ${request.name}`,
        strategy_focus: request.angle,
        rawText: data.choices[0].message.content,
        generatedAt: Date.now(),
        provider: this.name,
      };
    }
  }
}
