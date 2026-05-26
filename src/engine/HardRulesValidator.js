/**
 * HardRulesValidator.js — Gama Distribuidora
 *
 * Faz cumprir as regras invioláveis (HARD) da Gama em TODA saída de IA.
 * Se a saída viola uma regra HARD → bloqueia publicação (grade F).
 *
 * Fonte oficial das regras:
 *   00_SITE-ECOSSISTEMA-2026/00_GOVERNANCA/REGRAS-PUBLICACAO.md
 *
 * Filosofia: "nunca confiar no system prompt sozinho". Mesmo com instrução
 * explícita ao LLM, ele eventualmente quebra. Esta camada é o cinto de segurança.
 */

/** Regras HARD — quebrar invalida a saída. */
const HARD_RULES = [
  {
    id: 'area_atuacao',
    label: 'Área de atuação (só Grande SP)',
    description: 'Nunca citar Baixada Santista, Santos ou litoral em copy externa Gama.',
    pattern: /\b(santos|baixada santista|baixada|litoral|s[ãa]o vicente|guaruj[áa]|cubat[ãa]o|praia grande)\b/i,
  },
  {
    id: 'reconquista_santos',
    label: 'Campanha morta — Reconquista Santos',
    description: 'Projeto Reconquista Santos foi removido — nunca citar.',
    pattern: /\breconquista\s+santos\b|\bprojeto reconquista\b/i,
  },
  {
    id: 'viapol',
    label: 'Viapol — marca proibida em peça Gama',
    description: 'Viapol vendia-se só pela Labor (encerrada). Nunca em peça Gama.',
    pattern: /\bviapol\b/i,
  },
  {
    id: 'labor',
    label: 'Labor Atacadista — empresa encerrada',
    description: 'Labor foi encerrada. Nunca mencionar como ativa.',
    pattern: /\blabor atacadista\b/i,
  },
  {
    id: 'distribuidor_oficial_parceiro',
    label: 'Distribuidor Oficial só pra Coral',
    description: 'Tigre, Tramontina, Norton, Henkel, Cascola, 3M etc são parceiras — nunca "oficiais".',
    pattern: /distribuidor(a)?\s+oficial\s+(?:da\s+|de\s+|do\s+)?(tigre|tramontina|norton|henkel|cascola|3m|fortlev|sil|hydra|colorgin|sparlack|romar|sulvicor|thompson|itaqua|natrielli|wanda|maxi|mactra|imperall|marluvas|soudal)/i,
  },
  {
    id: 'claim_inventado_ranking',
    label: 'Claim inventado de ranking/superioridade',
    description: 'Sem fonte verificável, não dá pra dizer "líder", "maior", "número 1".',
    pattern: /\b(somos|a gama é|gama é) (o|a) (l[íi]der|maior|n[úu]mero 1|n[ºo°] 1|melhor)\b/i,
  },
  {
    id: 'claim_inventado_numero',
    label: 'Claim numérico inventado',
    description: 'Volumes ("+500 lojistas", "1000 entregas/mês") só com dado real fornecido.',
    pattern: /\+?\s*\d{2,}\s*(lojistas|clientes|entregas|pedidos)\s+(atendidos|por mês|ao mês|mensais)/i,
  },
  {
    id: 'b2c_voce_casa',
    label: 'Linguagem B2C proibida',
    description: 'Gama é B2B. Proibido falar com consumidor final.',
    pattern: /\b(pinte sua casa|sua casa nova|transforme sua sala|seu lar|sua cozinha pronta)\b/i,
  },
  {
    id: 'linha_completa',
    label: 'Vocabulário proibido "linha completa"',
    description: 'Banido: "linha completa", "mix completo", "todo o portfólio".',
    pattern: /\b(linha completa|mix completo|todo o portf[óo]lio|todas as op[çc][õo]es)\b/i,
  },
];

/** Regras SOFT — avisar mas não bloquear. */
const SOFT_RULES = [
  {
    id: 'banner_dim_errada',
    label: 'Dimensão de banner errada',
    description: 'Site Gama usa 1920x400 desktop + 600x400 mobile. 1200x400 e outros são errados.',
    pattern: /1200\s*x\s*400|1080\s*x\s*1080(?=.*banner)/i,
  },
  {
    id: 'cta_pill_amarelo',
    label: 'CTA pill amarelo (proibido em banner)',
    description: 'Banner Gama não leva CTA pill amarelo — só título + subtítulo.',
    pattern: /cta\s+(amarelo|pill amarelo|amarelo gama)/i,
  },
  {
    id: 'tom_clickbait',
    label: 'Tom clickbait / urgência forçada',
    description: 'Evitar "última chance", "imperdível", "oferta relâmpago".',
    pattern: /\b([úu]ltima chance|imperd[íi]vel|oferta rel[âa]mpago|n[ãa]o perca esta)\b/i,
  },
];

export const HardRulesValidator = {
  /**
   * Valida texto completo concatenado (já em lowercase).
   * @param {string} text - texto completo do conteúdo gerado
   * @returns {{valid: boolean, violations: Array, warnings: Array}}
   */
  validate(text) {
    if (!text || typeof text !== 'string') {
      return { valid: true, violations: [], warnings: [] };
    }

    const violations = [];
    const warnings = [];

    for (const rule of HARD_RULES) {
      const match = text.match(rule.pattern);
      if (match) {
        violations.push({
          id: rule.id,
          label: rule.label,
          description: rule.description,
          snippet: match[0],
          severity: 'hard',
        });
      }
    }

    for (const rule of SOFT_RULES) {
      const match = text.match(rule.pattern);
      if (match) {
        warnings.push({
          id: rule.id,
          label: rule.label,
          description: rule.description,
          snippet: match[0],
          severity: 'soft',
        });
      }
    }

    return {
      valid: violations.length === 0,
      violations,
      warnings,
    };
  },

  /** Exposto pra UI mostrar regras vigentes (settings panel, debug). */
  listRules() {
    return {
      hard: HARD_RULES.map(({ id, label, description }) => ({ id, label, description })),
      soft: SOFT_RULES.map(({ id, label, description }) => ({ id, label, description })),
    };
  },
};
