/**
 * ProductImageService.js
 * Busca imagens reais dos produtos no catálogo Gama (labor_atacadista_data.json).
 *
 * Fontes:
 * - image_url: CDN do site (laboratacadista.agilecdn.com.br)
 * - image_local: pasta local (ex: images/abrasivos/xxx.jpg) - coloque em public/ para servir
 *
 * Uso: quando o produto tem imagem, mostre-a como opção antes de gerar via IA.
 */

import laborData from '../data/labor_atacadista_data.json';

const products = laborData?.products || [];

/**
 * Normaliza nome para comparação fuzzy (remove acentos, lowercase, trim)
 */
function normalize(str) {
  if (!str || typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Calcula similaridade entre dois nomes (0-1)
 * Match exato = 1, substring = 0.8+, palavras em comum = proporcional
 */
function similarity(a, b) {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  const wordsA = na.split(/\s+/);
  const wordsB = nb.split(/\s+/);
  const common = wordsA.filter(w => w.length > 2 && nb.includes(w)).length;
  return common / Math.max(wordsA.length, wordsB.length);
}

/**
 * Busca produto no catálogo por nome (match fuzzy).
 * Retorna o primeiro produto com imagem que tenha similaridade >= 0.5.
 */
export function findProductByName(productName) {
  if (!productName || typeof productName !== 'string') return null;
  const name = productName.trim();
  if (name.length < 2) return null;

  let best = { product: null, score: 0 };

  for (const p of products) {
    const score = similarity(name, p.name);
    if (score >= 0.5 && (p.image_url || p.image_local) && score > best.score) {
      best = { product: p, score };
    }
  }

  return best.product;
}

/**
 * Retorna URL da imagem do produto (prioriza image_url, fallback image_local).
 *
 * Para image_local: assume que a pasta está em public/ do projeto.
 * Ex: image_local "images\\abrasivos\\xxx.jpg" → "/images/abrasivos/xxx.jpg"
 *
 * Se a pasta de produtos estiver em outro lugar, configure PRODUCT_IMAGES_BASE.
 */
const PRODUCT_IMAGES_BASE = '/'; // ou 'https://...' se imagens em CDN externo

export function getProductImageUrl(productNameOrProduct) {
  const product = typeof productNameOrProduct === 'object'
    ? productNameOrProduct
    : findProductByName(productNameOrProduct);

  if (!product) return null;

  if (product.image_url) return product.image_url;

  if (product.image_local) {
    const path = product.image_local.replace(/\\/g, '/');
    return `${PRODUCT_IMAGES_BASE}${path.startsWith('/') ? path.slice(1) : path}`;
  }

  return null;
}

/**
 * Busca imagem por contexto (content do ContentDisplay).
 */
export function getImageFromContent(content) {
  if (!content) return null;
  const name = content.name || content.product_name || content.selectedProduct
    || (content.title && content.title.replace(/^(Reels|Carrossel|Stories|Post|Banner|WhatsApp|Produto|Seleção|Institucional):\s*/i, '').trim());
  return name ? getProductImageUrl(name) : null;
}

export { products };
