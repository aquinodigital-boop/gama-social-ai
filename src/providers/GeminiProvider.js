/**
 * GeminiProvider.js — Gama Distribuidora
 * Gera conteúdo via Google Gemini com system prompt da Gama.
 */

import { ContentProviderInterface } from './ContentProvider.js';
import { QualityChecker } from '../engine/QualityChecker.js';
import { PromptGenerator } from '../engine/PromptGenerator.js';
import { CategoryExpert } from '../logic/marketing/CategoryExpert.js';

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const GEMINI_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Flash', description: 'Rápido e gratuito' },
  { id: 'gemini-2.5-pro', label: 'Pro', description: 'Mais elaborado, mais lento' },
];
export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

const FORMAT_LABELS = {
  reels: 'Reels / TikTok (vídeo vertical 15-30s)',
  carrossel: 'Carrossel Instagram (5 slides quadrados)',
  stories: 'Stories Instagram (3-5 telas verticais)',
  post_estatico: 'Post estático para feed (imagem única)',
  banner_site: 'Banner para site Gama (1920x400 desktop + 600x400 mobile, sem CTA pill amarelo)',
  whatsapp: 'Mensagens WhatsApp B2B (abertura, proposta, follow-up, reativação)',
};

const PERSONA_LABELS = {
  pintor_profissional: 'Pintor profissional autônomo',
  lojista: 'Dono de loja de tintas / material de construção',
  engenheiro_arquiteto: 'Engenheiro ou Arquiteto especificador',
};

const ANGLE_LABELS = {
  coral_expertise: 'Expertise Coral — distribuidor OFICIAL Coral, conhecimento técnico das linhas',
  profit: 'Margem & Resultado — rentabilidade, giro de estoque, competitividade',
  parceria_confianca: 'Parceria & Confiança — 20 anos de história, consultor dedicado, relação humana',
  partnership: 'Parceria & Programa CL — sistema de níveis, transformação de fachada',
  technical: 'Suporte Técnico — consultoria de aplicação, menos retrabalho',
  bastidores_operacao: 'Bastidores da Operação — logística Grande SP, estoque, time Gama em ação',
  case_lojista: 'Case de Lojista — depoimento e resultado real de parceiro Gama',
  produto_margem: 'Produto & Margem — giro rápido, produto que vende e dá lucro',
  expertise_coral: 'Expertise Coral — distribuidor OFICIAL Coral, dominio técnico das linhas',
  programa_cl: 'Programa CL — sistema de níveis e investimento na fachada do lojista',
};

function buildSystemPrompt() {
  return `Você é o estrategista de conteúdo da Gama Distribuidora — distribuidora oficial Coral/AkzoNobel com 20+ anos de mercado, atuando exclusivamente na GRANDE SÃO PAULO (capital + região metropolitana + ABC).

PÚBLICOS-ALVO B2B: donos de lojas de tintas e materiais de construção, balconistas, pintores profissionais, engenheiros e arquitetos especificadores.

CONTEXTO ESTRATÉGICO ATUAL:
- Programa CL: sistema de níveis para lojistas — quanto mais o lojista investe no mix Coral (Tinting, Sparlack, Mactra), mais a Gama investe na loja dele (fachada, comunicação visual, material de PDV)
- Parceria 20+ anos: histórico de relacionamento humano, consultor dedicado, atendimento próximo
- Logística Grande SP: estoque reposto, entrega ágil para a região metropolitana
- Marcas distribuídas: Coral (carro-chefe + ÚNICA marca pela qual somos distribuidor OFICIAL), Tigre, Henkel, Tramontina, Norton (parceiras)
- Linhas Coral: Coralar, Decora, Proteção Sol & Chuva, Rende Muito, Pinta Piso, Tinting, Sparlack, Mactra

🚨 REGRAS HARD (INVIOLÁVEIS — quebrar invalida a saída):

1. ÁREA DE ATUAÇÃO: APENAS Grande São Paulo. NUNCA cite "Santos", "Baixada Santista", "litoral", "São Vicente", "Guarujá", "Cubatão", "Praia Grande". Se o usuário pedir conteúdo regional, use "Grande SP", "Capital", "ABC Paulista", "Zona Oeste", "Alphaville".

2. DISTRIBUIDOR OFICIAL: o selo "Distribuidor Oficial" / "distribuidor oficial" pertence APENAS à Coral. Tigre, Tramontina, Norton, Henkel, Cascola etc são "parceiros" ou "marcas que trabalhamos" — NUNCA "oficiais".

3. VIAPOL: nunca mencionar Viapol em peça da Gama (essa marca vendia-se apenas pela Labor, que foi encerrada).

4. SEM CLAIMS INVENTADOS: NUNCA invente números específicos (preços, percentuais, prazos exatos), rankings ("líder", "maior"), volumes ("500 lojistas", "+10000 entregas"). Sem fonte verificável, não escreva.

5. B2B SEMPRE: nunca posicione a Gama como varejo / consumidor final. Linguagem: "lojista", "revenda", "obra", "balcão". Proibido: "você que vai pintar sua casa", "transforme sua sala".

6. PROIBIDO: "linha completa", "mix completo", "todo o portfólio", "todas as opções". Prefira: "linhas que trabalhamos", "produtos que recomendamos", "soluções que temos disponíveis".

7. BANNER SITE GAMA: formato 1920x400 desktop OU 600x400 mobile, SEM CTA pill amarelo no banner (apenas título + subtítulo).

8. TOM: técnico, confiável, parceiro, direto. Sem floreio, sem exclamação dupla, sem caps de impacto.

REGRAS SOFT (recomendadas):
- CTAs: WhatsApp, tabela de preços, consultor Gama, Programa CL, visita técnica.
- Mencione a região naturalmente (Grande SP, ABC, Zona Oeste).
- Use emojis com moderação (máx 3-4).
- Hashtags: #GamaDistribuidora #DistribuidorCoral + categoria/marca/região.
- Diferencial sempre presente: distribuidor OFICIAL Coral, 20 anos de história, suporte técnico, logística Grande SP.

IDENTIDADE VISUAL DA GAMA:
- Cores: Azul marinho (#1E3A5F), Laranja coral (#E85D3B), Amarelo Gama (#FFB800 — usar com parcimônia, NUNCA como CTA no banner)
- Estética: profissional B2B, industrial sofisticada, não é "loja de bairro"

IDIOMA OBRIGATÓRIO:
Todo o conteúdo gerado — textos, roteiros, legendas, descrições visuais, narração, CTAs, prompts de imagem e vídeo — deve ser EXCLUSIVAMENTE em português brasileiro. Nenhuma palavra em inglês, exceto nomes de marcas já consagrados (ex: Coral, Norton, Henkel) e termos técnicos sem tradução.

Você deve retornar APENAS JSON válido, sem markdown, sem comentários.`;
}

function buildUserPrompt(request) {
  const { mode, name, category, angle, persona, format, brandContext } = request;
  const formatLabel = FORMAT_LABELS[format] || format;
  const personaLabel = PERSONA_LABELS[persona] || persona;
  const angleLabel = ANGLE_LABELS[angle] || angle;
  const catContext = CategoryExpert.get(category);

  let contextBlock = '';
  if (mode === 'brand' && brandContext) {
    contextBlock = `MODO: Destaque de MARCA PARCEIRA\nMARCA: ${name}\nSEGMENTO: ${brandContext.segment}\nDIFERENCIAL: ${brandContext.strength}\nTIER: ${brandContext.tier}`;
  } else if (mode === 'category') {
    contextBlock = `MODO: Destaque de CATEGORIA\nCATEGORIA: ${name}\nCONTEXTO B2B: ${catContext.b2b_angle}\nKEYWORDS: ${catContext.keywords.join(', ')}`;
  } else if (mode === 'institutional') {
    contextBlock = `MODO: Institucional (marca Gama Distribuidora)\nFOCO: Fortalecer a Gama como parceira Coral confiável da região`;
  } else {
    contextBlock = `MODO: Produto específico\nPRODUTO: ${name}\nCATEGORIA: ${category}\nCONTEXTO: ${catContext.hook}\nANGULO B2B: ${catContext.b2b_angle}`;
  }

  let jsonStructure = '';
  if (format === 'whatsapp') {
    jsonStructure = `{"title":"string","type":"WhatsApp B2B","strategy_focus":"string","persona_target":"string","messages":{"abertura":"string","proposta":"string","followup":"string","reativacao":"string"},"caption":""}`;
  } else if (format === 'carrossel') {
    jsonStructure = `{"title":"string","type":"Carrossel Instagram","strategy_focus":"string","persona_target":"string","slides":[{"slide":1,"text":"string","visual":"string","note":"string"},{"slide":2,"text":"string","visual":"string","note":"string"},{"slide":3,"text":"string","visual":"string","note":"string"},{"slide":4,"text":"string","visual":"string","note":"string"},{"slide":5,"text":"string","visual":"string","note":"string"}],"assets":{"narration_text":"string","image_prompts":["string","string"],"video_prompts":[]},"caption":"string"}`;
  } else if (format === 'stories') {
    jsonStructure = `{"title":"string","type":"Stories Instagram","strategy_focus":"string","persona_target":"string","trend":"string","trendDescription":"string","storySequence":[{"type":"string","text":"string","visual":"string"},{"type":"string","text":"string","visual":"string"},{"type":"string","text":"string","visual":"string"}],"assets":{"narration_text":"string","image_prompts":["string"],"video_prompts":["string"]},"caption":"string"}`;
  } else if (format === 'post_estatico') {
    jsonStructure = `{"title":"string","type":"Post Estático (Feed)","strategy_focus":"string","persona_target":"string","layout":{"headline":"string","subheadline":"string","bodyText":"string","cta":"string","hashtags":"string"},"assets":{"narration_text":"string","image_prompts":["string","string"],"video_prompts":[]},"caption":"string"}`;
  } else if (format === 'banner_site') {
    jsonStructure = `{"title":"string","type":"Banner de Site Gama","strategy_focus":"string","persona_target":"string","bannerSpecs":{"dimensions_desktop":"1920x400px","dimensions_mobile":"600x400px","headline":"string (max 7 palavras, sem exclamação)","subheadline":"string (max 12 palavras)","cta_observation":"NÃO desenhar CTA pill amarelo sobre o banner — regra HARD Gama"},"assets":{"narration_text":"","image_prompts":["string (prompt para imagem 1920x400 da Gama)","string (prompt para imagem 600x400 mobile)"],"video_prompts":[]},"caption":""}`;
  } else {
    jsonStructure = `{"title":"string","type":"Reels / TikTok","strategy_focus":"string","persona_target":"string","script":[{"time":"0-3s","visual":"string","text":"string","visual_prompt":"string"},{"time":"3-8s","visual":"string","text":"string","visual_prompt":"string"},{"time":"8-13s","visual":"string","text":"string","visual_prompt":"string"},{"time":"13-15s","visual":"string","text":"string","visual_prompt":"string"}],"assets":{"narration_text":"string","image_prompts":["string","string","string"],"video_prompts":["string","string"]},"caption":"string"}`;
  }

  return `Gere conteúdo de marketing B2B para a Gama Distribuidora (distribuidor oficial Coral/AkzoNobel).

${contextBlock}

FORMATO: ${formatLabel}
ÂNGULO ESTRATÉGICO: ${angleLabel}
PERSONA ALVO: ${personaLabel}

IMPORTANTE: Todo o conteúdo deve ser em português brasileiro. Isso inclui os prompts de imagem e vídeo dentro de "assets".

Crie conteúdo ORIGINAL e PERSUASIVO para B2B. Não use frases genéricas.
O conteúdo deve fazer o lojista/pintor querer entrar em contato com a Gama.

Retorne EXATAMENTE este JSON (sem markdown, sem \`\`\`, apenas JSON puro):

${jsonStructure}`;
}

export class GeminiProvider extends ContentProviderInterface {
  constructor(apiKey) {
    super('Gemini AI');
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
    this.model = DEFAULT_GEMINI_MODEL;
  }

  setModel(modelId) {
    const valid = GEMINI_MODELS.find(m => m.id === modelId);
    if (valid) this.model = modelId;
  }

  async generate(request) {
    if (!this.apiKey) throw new Error('API Key do Gemini não configurada. Vá em Configurações para inserir sua chave.');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt() }] },
        contents: [{ parts: [{ text: buildUserPrompt(request) }] }],
        generationConfig: { temperature: 0.85, maxOutputTokens: 4096, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API: ${errorData?.error?.message || `HTTP ${response.status}`}`);
    }

    const data = await response.json();
    // Gemini 2.5 models may return thinking parts — find the actual text part
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.filter(p => !p.thought).pop();
    const rawText = textPart?.text;
    if (!rawText) throw new Error('Gemini retornou resposta vazia.');

    let content;
    try {
      content = JSON.parse(rawText);
    } catch {
      // Clean common JSON issues from LLM output
      let cleaned = rawText
        .replace(/^```json\s*/i, '').replace(/```\s*$/i, '')  // markdown blocks
        .replace(/\/\/[^\n]*/g, '')                            // single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '')                      // multi-line comments
        .replace(/,\s*([}\]])/g, '$1')                         // trailing commas
        .trim();
      content = JSON.parse(cleaned);
    }

    const catContext = CategoryExpert.get(request.category);
    const promptPack = PromptGenerator.generate({ name: request.name, category: request.category, format: request.format, catContext });

    content.id = uid();
    content.format = request.format;
    content.angle = request.angle;
    content.persona = request.persona;
    content.generatedAt = Date.now();
    content.provider = this.name;
    content.assets = content.assets || { narration_text: '', image_prompts: [], video_prompts: [] };
    content.assets.promptPack = promptPack;
    content.quality = QualityChecker.check(content);

    return content;
  }

  async generateWeeklyPlan(params) {
    const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
    const formats = ['reels', 'carrossel', 'stories', 'post_estatico', 'banner_site', 'whatsapp', 'reels'];
    const angles = ['coral_expertise', 'profit', 'partnership', 'parceria_confianca', 'technical'];
    const plan = [];
    for (let day = 0; day < 7; day++) {
      const content = await this.generate({ ...params, format: formats[day % formats.length], angle: angles[day % angles.length] });
      plan.push({ day: day + 1, dayName: DIAS[day], format: formats[day % formats.length], angle: angles[day % angles.length], contents: [content] });
    }
    return plan;
  }

  async generatePromptPack(params) {
    return PromptGenerator.generateFull(params);
  }

  /** Helper: call Gemini API and parse JSON response */
  async _callGemini(userPrompt, { temperature = 0.85, maxOutputTokens = 4096 } = {}) {
    if (!this.apiKey) throw new Error('API Key do Gemini não configurada. Vá em Configurações para inserir sua chave.');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: buildSystemPrompt() }] },
        contents: [{ parts: [{ text: userPrompt }] }],
        generationConfig: { temperature, maxOutputTokens, responseMimeType: 'application/json' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API: ${errorData?.error?.message || `HTTP ${response.status}`}`);
    }

    const data = await response.json();
    const parts = data?.candidates?.[0]?.content?.parts || [];
    const textPart = parts.filter(p => !p.thought).pop();
    const rawText = textPart?.text;
    if (!rawText) throw new Error('Gemini retornou resposta vazia.');

    try {
      return JSON.parse(rawText);
    } catch {
      let cleaned = rawText
        .replace(/^```json\s*/i, '').replace(/```\s*$/i, '')
        .replace(/\/\/[^\n]*/g, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/,\s*([}\]])/g, '$1')
        .trim();
      return JSON.parse(cleaned);
    }
  }

  async generateQuickImage(request) {
    const { name, category, angle, persona } = request;
    const angleLabel = ANGLE_LABELS[angle] || angle;
    const personaLabel = PERSONA_LABELS[persona] || persona;

    const prompt = `Gere conteúdo RÁPIDO para uma IMAGEM de marketing B2B da Gama Distribuidora.

PRODUTO/CONTEXTO: ${name}
CATEGORIA: ${category}
ÂNGULO: ${angleLabel}
PERSONA: ${personaLabel}

Retorne EXATAMENTE este JSON:
{"type":"quick_image","title":"string (título curto)","product":"${name}","image_prompt":"string (prompt detalhado em PT-BR para gerar imagem no Midjourney/DALL-E, incluindo estilo visual, composição, cores da Gama azul marinho e laranja coral, contexto B2B)","caption":"string (legenda pronta para postar, max 150 caracteres, com CTA)","hashtags":"#GamaDistribuidora #DistribuidorCoral + 3-4 hashtags relevantes","format_hint":"stories ou feed"}`;

    const content = await this._callGemini(prompt, { temperature: 0.9, maxOutputTokens: 1024 });
    content.id = uid();
    content.type = 'quick_image';
    content.format = 'quick_image';
    content.angle = angle;
    content.persona = persona;
    content.generatedAt = Date.now();
    content.provider = this.name;
    return content;
  }

  async generateQuickVideo(request) {
    const { name, category, angle, persona } = request;
    const angleLabel = ANGLE_LABELS[angle] || angle;
    const personaLabel = PERSONA_LABELS[persona] || persona;

    const prompt = `Gere uma IDEIA RÁPIDA para VÍDEO de marketing B2B da Gama Distribuidora.

PRODUTO/CONTEXTO: ${name}
CATEGORIA: ${category}
ÂNGULO: ${angleLabel}
PERSONA: ${personaLabel}

Retorne EXATAMENTE este JSON:
{"type":"quick_video","title":"string (título curto)","product":"${name}","video_idea":"string (conceito do vídeo em 1-2 frases)","visual_prompts":["string (prompt visual cena 1 em PT-BR)","string (prompt visual cena 2 em PT-BR)","string (prompt visual cena 3 em PT-BR)"],"duration_hint":"15s ou 30s ou 60s","format_hint":"reels ou stories","caption":"string (legenda curta com CTA)"}`;

    const content = await this._callGemini(prompt, { temperature: 0.9, maxOutputTokens: 1024 });
    content.id = uid();
    content.type = 'quick_video';
    content.format = 'quick_video';
    content.angle = angle;
    content.persona = persona;
    content.generatedAt = Date.now();
    content.provider = this.name;
    return content;
  }
}
