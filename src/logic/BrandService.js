/**
 * BrandService.js — Gama Distribuidora
 * Gerencia marcas distribuídas pela Gama com dados reais do catálogo.
 */

import { GamaDataService } from './GamaDataService.js';

// Contexto curado das marcas conhecidas
const BRAND_CONTEXT = {
  CORAL: { segment: 'Tintas e Revestimentos', strength: 'Carro-chefe — líder de mercado Coral/AkzoNobel', tier: 'premium', isMain: true },
  SPARLACK: { segment: 'Vernizes e Madeira', strength: 'Referência em verniz — linha Coral', tier: 'premium' },
  TIGRE: { segment: 'Hidráulica', strength: 'Líder nacional em tubos e conexões', tier: 'premium' },
  HENKEL: { segment: 'Adesivos e Fixação', strength: 'Líder global em adesivos industriais', tier: 'premium' },
  NORTON: { segment: 'Abrasivos', strength: 'Referência mundial em lixas e abrasivos', tier: 'premium' },
  MACTRA: { segment: 'Revestimentos Decorativos', strength: 'Linha de texturas e efeitos', tier: 'mainstream' },
  WANDA: { segment: 'Epóxi Industrial', strength: 'Sistema Wandepoxy de alta performance', tier: 'premium' },
  COLORGIN: { segment: 'Sprays e Acabamentos', strength: 'Líder em tintas spray no Brasil', tier: 'mainstream' },
  ADELBRAS: { segment: 'Fitas Adesivas', strength: 'Referência nacional em fitas', tier: 'mainstream' },
  MAXI: { segment: 'Automotivo', strength: 'Produtos automotivos Maxi Rubber', tier: 'mainstream' },
  BASTON: { segment: 'Sprays e Aerossóis', strength: 'Tintas spray e acabamentos', tier: 'mainstream' },
  BIOCOR: { segment: 'Solventes e Diluentes', strength: 'Linha de solventes e diluentes', tier: 'mainstream' },
  NATRIELLI: { segment: 'Iluminação', strength: 'Soluções em iluminação', tier: 'mainstream' },
  ITAQUA: { segment: 'Solventes e Diluentes', strength: 'Solventes e aguarrás', tier: 'value' },
  FORTLEV: { segment: 'Hidráulica', strength: 'Caixas d\'água e reservatórios', tier: 'mainstream' },
  SOUDAL: { segment: 'Adesivos e Vedação', strength: 'Selantes e espumas PU importados', tier: 'premium' },
  SIL: { segment: 'Fitas e Adesivos', strength: 'Fitas adesivas e isolantes', tier: 'value' },
  HYDRA: { segment: 'Hidráulica', strength: 'Chuveiros e duchas', tier: 'mainstream' },
  ROMAR: { segment: 'Ferramentas de Pintura', strength: 'Rolos, pincéis e acessórios', tier: 'mainstream' },
};

const DEFAULT_CONTEXT = {
  segment: 'Materiais de Construção',
  strength: 'Marca parceira da Gama Distribuidora',
  tier: 'mainstream',
};

// Build brand list from real data + curated context
function buildBrandList() {
  const stats = GamaDataService.getBrandStats();
  return stats.map(({ name, productCount }) => {
    const ctx = BRAND_CONTEXT[name] || DEFAULT_CONTEXT;
    const products = GamaDataService.getProductsByBrand(name);
    const categories = [...new Set(products.map(p => p.category))];
    return {
      name,
      productCount,
      categories,
      segment: ctx.segment,
      strength: ctx.strength,
      tier: ctx.tier,
      isMain: ctx.isMain || false,
    };
  });
}

let _brands = null;

export const BrandService = {
  getBrands() {
    if (!_brands) _brands = buildBrandList();
    return _brands;
  },

  getBrandNames() {
    return this.getBrands().map(b => b.name);
  },

  getProductsByBrand(brandName) {
    return GamaDataService.getProductsByBrand(brandName.toUpperCase());
  },

  getBrandContext(brandName) {
    const key = brandName.toUpperCase();
    const ctx = BRAND_CONTEXT[key] || DEFAULT_CONTEXT;
    return { segment: ctx.segment, strength: ctx.strength, tier: ctx.tier };
  },
};
