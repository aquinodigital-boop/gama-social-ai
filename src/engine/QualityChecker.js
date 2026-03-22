/**
 * QualityChecker.js — Gama Distribuidora
 * Checklist automático de qualidade do conteúdo.
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
  'oferta relâmpago', 'grátis', 'sorteio', 'viral', 'labor atacadista',
];

export const QualityChecker = {
  check(content) {
    const allText = _extractAllText(content).toLowerCase();
    const checks = [];

    const ctaFound = CTA_KEYWORDS.filter(k => allText.includes(k));
    checks.push({
      id: 'cta_claro', label: 'CTA claro (WhatsApp / tabela / consultor)',
      passed: ctaFound.length >= 2,
      detail: ctaFound.length >= 2 ? `CTAs: ${ctaFound.slice(0,4).join(', ')}` : 'Adicione CTAs (WhatsApp, tabela, consultor)',
      weight: 3,
    });

    const b2bFound = B2B_KEYWORDS.filter(k => allText.includes(k));
    checks.push({
      id: 'promessa_b2b', label: 'Promessa alinhada ao B2B',
      passed: b2bFound.length >= 2,
      detail: b2bFound.length >= 2 ? `Termos B2B: ${b2bFound.slice(0,4).join(', ')}` : 'Reforce: lojista, estoque, margem, pintor',
      weight: 3,
    });

    const credFound = CREDIBILITY_KEYWORDS.filter(k => allText.includes(k));
    checks.push({
      id: 'credibilidade', label: 'Credibilidade (Gama / Coral / região)',
      passed: credFound.length >= 2,
      detail: credFound.length >= 2 ? `Credibilidade: ${credFound.slice(0,4).join(', ')}` : 'Reforce: "distribuidor oficial Coral", "20 anos", "Baixada Santista"',
      weight: 2,
    });

    const tonePositive = BRAND_TONE_POSITIVE.filter(k => allText.includes(k));
    const toneNegative = BRAND_TONE_NEGATIVE.filter(k => allText.includes(k));
    const toneOk = tonePositive.length >= 2 && toneNegative.length === 0;
    checks.push({
      id: 'tom_marca', label: 'Tom de voz (técnico, parceiro, direto)',
      passed: toneOk,
      detail: toneOk ? `Tom correto: ${tonePositive.slice(0,3).join(', ')}` : toneNegative.length > 0 ? `Evitar: ${toneNegative.join(', ')}` : 'Adicionar: resolve, ágil, parceiro',
      weight: 2,
    });

    checks.push({
      id: 'substancia', label: 'Conteúdo substancial',
      passed: allText.length > 100,
      detail: allText.length > 100 ? 'Conteúdo adequado' : 'Conteúdo muito curto',
      weight: 1,
    });

    const hasRegion = allText.includes('santos') || allText.includes('baixada') || allText.includes('grande sp') || allText.includes('são paulo');
    checks.push({
      id: 'regiao', label: 'Menção à região (Santos / Baixada Santista / SP)',
      passed: hasRegion,
      detail: hasRegion ? 'Referência regional presente' : 'Adicionar menção à Baixada Santista ou Grande SP',
      weight: 1,
    });

    const maxScore = checks.reduce((s, c) => s + c.weight, 0);
    const score = checks.filter(c => c.passed).reduce((s, c) => s + c.weight, 0);
    const percentage = Math.round((score / maxScore) * 100);
    const grade = percentage >= 90 ? 'A' : percentage >= 75 ? 'B' : percentage >= 50 ? 'C' : 'D';

    return { score, maxScore, percentage, grade, passed: percentage >= 75, checks };
  },
};

function _extractAllText(content) {
  const parts = [];
  if (content.title) parts.push(content.title);
  if (content.caption) parts.push(content.caption);
  if (content.strategy_focus) parts.push(content.strategy_focus);
  if (content.script) content.script.forEach(s => s.text && parts.push(s.text));
  if (content.slides) content.slides.forEach(s => s.text && parts.push(s.text));
  if (content.storySequence) content.storySequence.forEach(s => s.text && parts.push(s.text));
  if (content.layout) Object.values(content.layout).forEach(v => typeof v === 'string' && parts.push(v));
  if (content.messages) Object.values(content.messages).forEach(v => typeof v === 'string' && parts.push(v));
  if (content.assets?.narration_text) parts.push(content.assets.narration_text);
  if (content.bannerSpecs) Object.values(content.bannerSpecs).forEach(v => typeof v === 'string' && parts.push(v));
  return parts.join(' ');
}
