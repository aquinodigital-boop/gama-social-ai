/**
 * api/_prompts.js — Prompts compartilhados pelo backend (Claude).
 *
 * IMPORTANTE: estes prompts são quase idênticos aos do src/providers/GeminiProvider.js
 * — mantemos versão server-side aqui pra evitar dependência cross-bundle (Node ≠ Vite).
 *
 * Toda mudança de regra HARD deve refletir em AMBOS os arquivos.
 * Single source of truth canônica: src/engine/HardRulesValidator.js.
 */

const FORMAT_LABELS = {
  reels: "Reels / TikTok (vídeo vertical 15-30s)",
  carrossel: "Carrossel Instagram (5 slides quadrados)",
  stories: "Stories Instagram (3-5 telas verticais)",
  post_estatico: "Post estático para feed (imagem única)",
  banner_site: "Banner para site Gama (1920x400 desktop + 600x400 mobile, sem CTA pill amarelo)",
  whatsapp: "Mensagens WhatsApp B2B (abertura, proposta, follow-up, reativação)",
};

const PERSONA_LABELS = {
  lojista_carteira: "Lojista parceiro Gama (carteira ativa) — relação de confiança, foco em ampliar mix",
  lojista_prospeccao: "Lojista da Grande SP que ainda compra do concorrente — foco em conquista",
  balconista: "Balconista da loja parceira — quer ganhar incentivo e ser bom vendedor",
  pintor_profissional: "Pintor profissional autônomo na Grande SP",
  engenheiro_arquiteto: "Engenheiro ou Arquiteto especificador",
  lojista: "Dono de loja de tintas / material de construção na Grande SP",
};

const ANGLE_LABELS = {
  coral_expertise: "Expertise Coral — distribuidor OFICIAL Coral, conhecimento técnico das linhas",
  profit: "Margem & Resultado — rentabilidade, giro de estoque, competitividade",
  parceria_confianca: "Parceria & Confiança — 20 anos de história, consultor dedicado, relação humana",
  partnership: "Parceria & Programa CL — sistema de níveis, transformação de fachada",
  technical: "Suporte Técnico — consultoria de aplicação, menos retrabalho",
  bastidores_operacao: "Bastidores da Operação — logística Grande SP, estoque, time Gama em ação",
  case_lojista: "Case de Lojista — depoimento e resultado real de parceiro Gama",
  produto_margem: "Produto & Margem — giro rápido, produto que vende e dá lucro",
  expertise_coral: "Expertise Coral — distribuidor OFICIAL Coral, domínio técnico das linhas",
  programa_cl: "Programa CL — sistema de níveis e investimento na fachada do lojista",
};

export function buildSystemPrompt() {
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

2. DISTRIBUIDOR OFICIAL: o selo "Distribuidor Oficial" pertence APENAS à Coral. Tigre, Tramontina, Norton, Henkel, Cascola, 3M etc são "parceiros" ou "marcas que trabalhamos" — NUNCA "oficiais".

3. VIAPOL: nunca mencionar Viapol em peça da Gama.

4. SEM CLAIMS INVENTADOS: NUNCA invente números específicos, rankings ("líder", "maior"), volumes ("500 lojistas", "+10000 entregas"). Sem fonte verificável, não escreva.

5. B2B SEMPRE: nunca posicione a Gama como varejo / consumidor final. Linguagem: "lojista", "revenda", "obra", "balcão". Proibido: "você que vai pintar sua casa".

6. PROIBIDO: "linha completa", "mix completo", "todo o portfólio", "todas as opções". Prefira: "linhas que trabalhamos", "produtos que recomendamos".

7. BANNER SITE GAMA: formato 1920x400 desktop OU 600x400 mobile, SEM CTA pill amarelo no banner (apenas título + subtítulo).

8. TOM: técnico, confiável, parceiro, direto. Sem floreio, sem exclamação dupla, sem caps de impacto.

REGRAS SOFT (recomendadas):
- CTAs: WhatsApp, tabela de preços, consultor Gama, Programa CL, visita técnica.
- Mencione a região naturalmente (Grande SP, ABC, Zona Oeste).
- Use emojis com moderação (máx 3-4).
- Hashtags: #GamaDistribuidora #DistribuidorCoral + categoria/marca/região.
- Diferencial sempre presente: distribuidor OFICIAL Coral, 20 anos de história, suporte técnico.

IDENTIDADE VISUAL DA GAMA:
- Cores: Azul marinho (#1E3A5F), Laranja coral (#E85D3B), Amarelo Gama (#FFB800 — com parcimônia, NUNCA como CTA no banner)
- Estética: profissional B2B, industrial sofisticada, não é "loja de bairro"

IDIOMA OBRIGATÓRIO: Português brasileiro EXCLUSIVAMENTE. Nenhuma palavra em inglês exceto nomes consagrados (Coral, Norton, Henkel) e termos técnicos sem tradução.

Você deve retornar APENAS JSON válido, sem markdown, sem comentários.`;
}

export function buildUserPrompt(request) {
  const { mode, name, category, angle, persona, format, brandContext } = request;
  const formatLabel = FORMAT_LABELS[format] || format;
  const personaLabel = PERSONA_LABELS[persona] || persona;
  const angleLabel = ANGLE_LABELS[angle] || angle;

  let contextBlock = "";
  if (mode === "brand" && brandContext) {
    contextBlock = `MODO: Destaque de MARCA PARCEIRA\nMARCA: ${name}\nSEGMENTO: ${brandContext.segment}\nDIFERENCIAL: ${brandContext.strength}\nTIER: ${brandContext.tier}`;
  } else if (mode === "category") {
    contextBlock = `MODO: Destaque de CATEGORIA\nCATEGORIA: ${name}`;
  } else if (mode === "institutional") {
    contextBlock = `MODO: Institucional (marca Gama Distribuidora)\nFOCO: Fortalecer a Gama como parceira Coral confiável na Grande SP`;
  } else {
    contextBlock = `MODO: Produto específico\nPRODUTO: ${name}\nCATEGORIA: ${category}`;
  }

  const jsonStructure = jsonSchemaFor(format);

  return `Gere conteúdo de marketing B2B para a Gama Distribuidora.

${contextBlock}

FORMATO: ${formatLabel}
ÂNGULO ESTRATÉGICO: ${angleLabel}
PERSONA ALVO: ${personaLabel}

IMPORTANTE: Todo o conteúdo deve ser em português brasileiro. Isso inclui prompts de imagem/vídeo dentro de "assets".

Crie conteúdo ORIGINAL e PERSUASIVO para B2B. Não use frases genéricas.
O conteúdo deve fazer o lojista/pintor querer entrar em contato com a Gama.

Retorne EXATAMENTE este JSON (sem markdown, sem \`\`\`, apenas JSON puro):

${jsonStructure}`;
}

function jsonSchemaFor(format) {
  if (format === "whatsapp") {
    return `{"title":"string","type":"WhatsApp B2B","strategy_focus":"string","persona_target":"string","messages":{"abertura":"string","proposta":"string","followup":"string","reativacao":"string"},"caption":""}`;
  }
  if (format === "carrossel") {
    return `{"title":"string","type":"Carrossel Instagram","strategy_focus":"string","persona_target":"string","slides":[{"slide":1,"text":"string","visual":"string","note":"string"},{"slide":2,"text":"string","visual":"string","note":"string"},{"slide":3,"text":"string","visual":"string","note":"string"},{"slide":4,"text":"string","visual":"string","note":"string"},{"slide":5,"text":"string","visual":"string","note":"string"}],"assets":{"narration_text":"string","image_prompts":["string","string"],"video_prompts":[]},"caption":"string"}`;
  }
  if (format === "stories") {
    return `{"title":"string","type":"Stories Instagram","strategy_focus":"string","persona_target":"string","trend":"string","trendDescription":"string","storySequence":[{"type":"string","text":"string","visual":"string"},{"type":"string","text":"string","visual":"string"},{"type":"string","text":"string","visual":"string"}],"assets":{"narration_text":"string","image_prompts":["string"],"video_prompts":["string"]},"caption":"string"}`;
  }
  if (format === "post_estatico") {
    return `{"title":"string","type":"Post Estático (Feed)","strategy_focus":"string","persona_target":"string","layout":{"headline":"string","subheadline":"string","bodyText":"string","cta":"string","hashtags":"string"},"assets":{"narration_text":"string","image_prompts":["string","string"],"video_prompts":[]},"caption":"string"}`;
  }
  if (format === "banner_site") {
    return `{"title":"string","type":"Banner de Site Gama","strategy_focus":"string","persona_target":"string","bannerSpecs":{"dimensions_desktop":"1920x400px","dimensions_mobile":"600x400px","headline":"string (max 7 palavras)","subheadline":"string (max 12 palavras)","cta_observation":"NÃO desenhar CTA pill amarelo sobre o banner — regra HARD Gama"},"assets":{"narration_text":"","image_prompts":["string (prompt 1920x400)","string (prompt 600x400 mobile)"],"video_prompts":[]},"caption":""}`;
  }
  // default: reels
  return `{"title":"string","type":"Reels / TikTok","strategy_focus":"string","persona_target":"string","script":[{"time":"0-3s","visual":"string","text":"string","visual_prompt":"string"},{"time":"3-8s","visual":"string","text":"string","visual_prompt":"string"},{"time":"8-13s","visual":"string","text":"string","visual_prompt":"string"},{"time":"13-15s","visual":"string","text":"string","visual_prompt":"string"}],"assets":{"narration_text":"string","image_prompts":["string","string","string"],"video_prompts":["string","string"]},"caption":"string"}`;
}

export function buildQuickImagePrompt(request) {
  const { name, category, angle, persona } = request;
  const angleLabel = ANGLE_LABELS[angle] || angle;
  const personaLabel = PERSONA_LABELS[persona] || persona;

  return `Gere conteúdo RÁPIDO para uma IMAGEM de marketing B2B da Gama Distribuidora.

PRODUTO/CONTEXTO: ${name}
CATEGORIA: ${category}
ÂNGULO: ${angleLabel}
PERSONA: ${personaLabel}

Retorne EXATAMENTE este JSON:
{"type":"quick_image","title":"string (título curto)","product":"${name}","image_prompt":"string (prompt detalhado em PT-BR pra Midjourney/DALL-E/Imagen, com estilo visual, composição, cores Gama, contexto B2B Grande SP)","caption":"string (legenda pronta, max 150 chars, com CTA)","hashtags":"#GamaDistribuidora #DistribuidorCoral + 3-4 hashtags relevantes","format_hint":"stories ou feed"}`;
}

export function buildQuickVideoPrompt(request) {
  const { name, category, angle, persona } = request;
  const angleLabel = ANGLE_LABELS[angle] || angle;
  const personaLabel = PERSONA_LABELS[persona] || persona;

  return `Gere uma IDEIA RÁPIDA pra VÍDEO de marketing B2B da Gama Distribuidora.

PRODUTO/CONTEXTO: ${name}
CATEGORIA: ${category}
ÂNGULO: ${angleLabel}
PERSONA: ${personaLabel}

Retorne EXATAMENTE este JSON:
{"type":"quick_video","title":"string","product":"${name}","video_idea":"string (conceito em 1-2 frases)","visual_prompts":["string (cena 1 PT-BR)","string (cena 2 PT-BR)","string (cena 3 PT-BR)"],"duration_hint":"15s ou 30s ou 60s","format_hint":"reels ou stories","caption":"string (legenda curta com CTA)"}`;
}
