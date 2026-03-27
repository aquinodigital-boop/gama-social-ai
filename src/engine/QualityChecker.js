/**
 * QualityChecker.js — Gama Distribuidora
 * 4 conjuntos de critérios: social, trade, whatsapp, promotor.
 */

const CTA_KEYWORDS = [
  'whatsapp', 'zap', 'tabela', 'estoque', 'peça', 'pedir', 'consultor',
  'fale', 'chame', 'link', 'bio', 'cote', 'garanta', 'abasteça',
  'responda', 'contato', 'pedido', 'visita',
];

const B2B_KEYWORDS = [
  'lojista', 'loja', 'balcão', 'estoque', 'reposição', 'atacado',
  'margem', 'lucro', 'giro', 'fornecedor', 'parceiro', 'b2b',
  'comprador', 'pedido', 'tabela', 'distribuição', 'pintor', 'obra',
];

const CREDIBILITY_KEYWORDS = [
  'gama', 'coral', 'akzonobel', 'distribuidor oficial', 'entrega ágil',
  'atendimento', 'qualidade', 'confiança', 'parceria', '20 anos',
  'profissional', 'opções', 'trabalhamos', 'baixada santista', 'santos',
];

const BRAND_TONE_POSITIVE = [
  'resolve', 'rápido', 'ágil', 'direto', 'parceiro', 'confiança',
  'qualidade', 'garanta', 'não perca', 'opções', 'técnico',
];

const BRAND_TONE_NEGATIVE = [
  'barato', 'promoção imperdível', 'últimas unidades', 'compre já',
  'oferta relâmpago', 'grátis', 'sorteio', 'viral',
];

const SOCIAL_CHECKS = [
  { id: 'cta_claro', label: 'CTA claro', weight: 3, check: (t) => CTA_KEYWORDS.filter(k => t.includes(k)).length >= 2 },
  { id: 'promessa_b2b', label: 'B2B puro', weight: 3, check: (t) => B2B_KEYWORDS.filter(k => t.includes(k)).length >= 2 },
  { id: 'credibilidade', label: 'Credibilidade', weight: 2, check: (t) => CREDIBILITY_KEYWORDS.filter(k => t.includes(k)).length >= 2 },
  { id: 'tom_marca', label: 'Tom profissional', weight: 2, check: (t) => BRAND_TONE_POSITIVE.filter(k => t.includes(k)).length >= 2 && BRAND_TONE_NEGATIVE.filter(k => t.includes(k)).length === 0 },
  { id: 'substancia', label: 'Conteúdo substancial', weight: 1, check: (t) => t.length > 100 },
  { id: 'regiao', label: 'Referência regional', weight: 1, check: (t) => t.includes('santos') || t.includes('baixada') || t.includes('grande sp') || t.includes('são paulo') || t.includes('abc') },
];

const TRADE_CHECKS = [
  { id: 'publico', label: 'Público correto', weight: 3, check: (t) => t.includes('lojist') || t.includes('balconi') || t.includes('loja') },
  { id: 'acao_concreta', label: 'Ação concreta', weight: 3, check: (t) => t.includes('gôndola') || t.includes('pdv') || t.includes('prateleira') || t.includes('campanha') || t.includes('ação') },
  { id: 'mensuravel', label: 'Mensurável', weight: 2, check: (t) => t.includes('meta') || t.includes('kpi') || t.includes('objetivo') || /\d+%/.test(t) },
  { id: 'viavel', label: 'Viável', weight: 2, check: (t) => t.includes('a4') || t.includes('a3') || t.includes('cm') || t.includes('px') || t.includes('whatsapp') },
  { id: 'diferencial', label: 'Diferencial Gama', weight: 1, check: (t) => t.includes('gama') || t.includes('coral') || t.includes('entrega') },
  { id: 'regiao', label: 'Regionalizado', weight: 1, check: (t) => t.includes('santos') || t.includes('baixada') || t.includes('sp') || t.includes('abc') || t.includes('região') },
];

const WHATSAPP_CHECKS = [
  { id: 'tom_parceiro', label: 'Tom parceiro', weight: 3, check: (t) => t.includes('parceiro') || t.includes('olá') || t.includes('tudo bem') || t.includes('tudo certo') },
  { id: 'cta_unico', label: 'CTA claro', weight: 3, check: (t) => CTA_KEYWORDS.filter(k => t.includes(k)).length >= 1 },
  { id: 'personalizado', label: 'Personalizado', weight: 2, check: (t) => t.includes('sua loja') || t.includes('você') || t.includes('seu') },
  { id: 'valor', label: 'Gera valor', weight: 2, check: (t) => t.includes('estoque') || t.includes('entrega') || t.includes('tabela') || t.includes('condição') },
  { id: 'timing', label: 'Timing indicado', weight: 1, check: (t) => t.includes('dia') || t.includes('manhã') || t.includes('semana') },
  { id: 'nao_spam', label: 'Não repetitivo', weight: 1, check: (t) => !t.includes('última chance') && !t.includes('urgente') },
];

const PROMOTOR_CHECKS = [
  { id: 'linguagem', label: 'Linguagem simples', weight: 3, check: (t) => t.length > 50 },
  { id: 'dado', label: 'Argumento com dado', weight: 3, check: (t) => /\d/.test(t) || t.includes('rendimento') || t.includes('cobertura') || t.includes('m²') },
  { id: 'objecao', label: 'Objeção respondida', weight: 2, check: (t) => t.includes('objeção') || t.includes('resposta') || t.includes('entendo') },
  { id: 'executavel', label: 'Executável', weight: 2, check: (t) => t.includes('min') || t.includes('passo') || t.includes('fase') || t.includes('etapa') },
  { id: 'comparativo', label: 'Comparativo', weight: 1, check: (t) => t.includes('suvinil') || t.includes('concorrent') || t.includes('vantagem') },
  { id: 'perfil_loja', label: 'Perfil da loja', weight: 1, check: (t) => t.includes('loja') || t.includes('lojista') || t.includes('gôndola') },
];

const CHECK_SETS = { social: SOCIAL_CHECKS, trade: TRADE_CHECKS, whatsapp: WHATSAPP_CHECKS, promotor: PROMOTOR_CHECKS };

export const QualityChecker = {
  check(content, module = 'social') {
    const allText = _extractAllText(content).toLowerCase();
    const checkSet = CHECK_SETS[module] || CHECK_SETS.social;

    const checks = checkSet.map(c => ({
      id: c.id, label: c.label, weight: c.weight, passed: c.check(allText),
    }));

    const maxScore = checks.reduce((s, c) => s + c.weight, 0);
    const score = checks.filter(c => c.passed).reduce((s, c) => s + c.weight, 0);
    const percentage = Math.round((score / maxScore) * 100);
    const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 50 ? 'C' : 'D';

    return { score, maxScore, percentage, grade, passed: percentage >= 75, checks, module };
  },
};

function _extractAllText(content) {
  const parts = [];
  if (typeof content === 'string') return content;
  if (content.title) parts.push(content.title);
  if (content.caption) parts.push(content.caption);
  if (content.strategy_focus) parts.push(content.strategy_focus);
  if (content.script) content.script.forEach(s => s.text && parts.push(s.text));
  if (content.slides) content.slides.forEach(s => s.text && parts.push(s.text));
  if (content.storySequence) content.storySequence.forEach(s => s.text && parts.push(s.text));
  if (content.layout) Object.values(content.layout).forEach(v => typeof v === 'string' && parts.push(v));
  if (content.messages && typeof content.messages === 'object' && !Array.isArray(content.messages)) {
    Object.values(content.messages).forEach(v => typeof v === 'string' && parts.push(v));
  }
  if (content.assets?.narration_text) parts.push(content.assets.narration_text);
  if (content.bannerSpecs) Object.values(content.bannerSpecs).forEach(v => typeof v === 'string' && parts.push(v));
  if (content.pieces) content.pieces.forEach(p => { if (p.headline) parts.push(p.headline); if (p.body) parts.push(p.body); });
  if (content.flow) content.flow.forEach(f => f.message && parts.push(f.message));
  if (content.steps) content.steps.forEach(s => s.script && parts.push(s.script));
  if (content.arguments) content.arguments.forEach(a => { if (a.argumento) parts.push(a.argumento); if (a.dado) parts.push(a.dado); });
  if (content.mechanics?.rules) content.mechanics.rules.forEach(r => parts.push(r));
  if (content.materials) content.materials.forEach(m => m.content && parts.push(m.content));
  if (content.communication?.whatsapp_convite) parts.push(content.communication.whatsapp_convite);
  if (content.action?.description) parts.push(content.action.description);
  if (content.briefing?.objetivo) parts.push(content.briefing.objetivo);
  return parts.join(' ');
}
