/**
 * ImagePromptEnhancer.js
 * Enriquece prompts de imagem para alinhar à identidade da marca Gama (Grupo Gama).
 *
 * Regras:
 * 1. Menção a Gama ou conteúdo do app → incluir logo oficial
 * 2. Produto específico → mostrar produto real, não genérico
 * 3. Embalagem/caixa → logo na embalagem
 * 4. Com Mascote → incluir mascote fiel ao design
 *
 * Nota: Imagen não aceita upload de imagens; usamos descrições textuais detalhadas.
 * Referências locais: public/mascote.png, assets/logo-gama.png (para futura integração).
 */

// Descrição do logo Gama para o Imagen gerar fielmente
const GAMA_LOGO_DESC = `Logo oficial da Gama Distribuidora visível e integrado: marca com tipografia corporativa em azul marinho (#1B2A4A) e laranja (#D4672C), design limpo e profissional, parte do Grupo Gama.`;

// Descrição do mascote (ajustar conforme o mascote real)
const MASCOTE_DESC = `Mascote oficial do Laboratório de Conteúdo: personagem cartoon amigável, estilo moderno e acessível, cores da marca Gama (azul marinho e laranja), expressão convidativa, proporções equilibradas, integrado naturalmente na cena.`;

// Palavras que indicam menção à Gama
const GAMA_KEYWORDS = /\b(gama|Gama|GAMA|marca gama|Gama Distribuidora|Laboratório)\b/i;

// Palavras que indicam embalagem
const PACKAGING_KEYWORDS = /\b(embalagem|caixa|pacote|packaging|envio|entrega|produto em caixa|caixa de produto)\b/i;

/**
 * Extrai o nome do produto/categoria do contexto ou do prompt
 */
function extractProductName(content, promptText = null) {
  if (content) {
    if (content.name) return content.name;
    if (content.product_name) return content.product_name;
    if (content.selectedProduct) return content.selectedProduct;
    if (content.title) {
      // "Reels: DISCO FLAP 7"" ou "Carrossel: Marca THOMPSON" ou "Produto: Tinta Acrílica"
      const m = content.title.match(/:\s*(.+?)(?:\s*$|\s*\||\s*\()/);
      return m ? m[1].trim() : content.title.replace(/^(Reels|Carrossel|Stories|Post|Banner|WhatsApp|Produto|Seleção|Institucional):\s*/i, '').trim();
    }
  }
  // Fallback: extrair do prompt quando há produto entre aspas ou nome em maiúsculas
  if (promptText) {
    const quoted = promptText.match(/"([^"]{3,50})"/);
    if (quoted) return quoted[1];
  }
  return null;
}

/**
 * Enriquece o prompt com instruções de identidade Gama
 */
export function enhanceImagePrompt(originalPrompt, options = {}) {
  const {
    productName = null,
    withMascot = false,
    content = null,
  } = options;

  const fullText = `${originalPrompt} ${productName || ''}`.toLowerCase();
  const parts = [];

  // Base: prompt original
  parts.push(originalPrompt?.trim() || '');

  // 1. Logo Gama obrigatório: todo conteúdo do app é da Gama (Grupo Gama)
  // Inclui quando: menção a Gama, ou quando temos produto/categoria (sempre no app)
  const needsLogo = GAMA_KEYWORDS.test(fullText) ||
    /institucional|marca|laboratório|Gama Distribuidora/i.test(fullText) ||
    productName ||
    content;
  if (needsLogo) {
    parts.push(`IMPORTANTE: ${GAMA_LOGO_DESC} Posicione o logo de forma visível (canto superior, embalagem, fundo discreto ou elemento central conforme a composição).`);
  }

  // 2. Produto específico → produto real, não genérico
  if (productName && productName.length > 2) {
    parts.push(`Mostre o produto "${productName}" REAL da Gama, com design fiel ao original: embalagem autêntica, cores e formato típicos. Evite imagens stock genéricas. O logo da Gama deve estar visível na caixa ou no produto.`);
  }

  // 3. Embalagem/caixa → logo na embalagem
  if (PACKAGING_KEYWORDS.test(fullText)) {
    parts.push(`Na embalagem, caixa de envio ou pacote: coloque o logo oficial da Gama de forma proeminente e realista (impresso na frente, lateral ou tampa), usando o design real da marca.`);
  }

  // 4. Com Mascote
  if (withMascot) {
    parts.push(`${MASCOTE_DESC} Integre o mascote na cena de forma natural (ex.: segurando produto, ao lado, posando). Mantenha o design exato e reconhecível.`);
  }

  // Sufixo de qualidade (sempre)
  parts.push(`Estilo: alta qualidade, cores vibrantes e fiéis à marca, composição natural e atraente para redes sociais. Evite imagens genéricas ou stock.`);

  return parts.filter(Boolean).join(' ');
}

/**
 * Exemplos de prompts modificados (para validação)
 * Use enhanceImagePrompt() para obter o prompt final.
 */
export const EXAMPLE_PROMPTS = {
  produto: {
    original: 'Foto profissional de DISCO FLAP 7" em ambiente de obra, iluminação de estúdio.',
    content: { title: 'Reels: DISCO FLAP 7"' },
    withMascot: false,
  },
  embalagem: {
    original: 'Caixa de envio da Gama com produto dentro, fundo neutro.',
    content: { title: 'Post: Tinta Acrílica' },
    withMascot: false,
  },
  mascote: {
    original: 'Cena institucional da Gama Distribuidora, ambiente de loja B2B.',
    content: { title: 'Institucional: Parceria' },
    withMascot: true,
  },
};

/** Gera exemplos de prompts enriquecidos para debug/validação */
export function getExampleEnhancedPrompts() {
  return Object.entries(EXAMPLE_PROMPTS).map(([key, ex]) => ({
    cenario: key,
    original: ex.original,
    enhanced: enhanceImagePrompt(ex.original, {
      productName: ex.content && extractProductName(ex.content),
      withMascot: ex.withMascot,
      content: ex.content,
    }),
  }));
}

export { GAMA_LOGO_DESC, MASCOTE_DESC, extractProductName };
