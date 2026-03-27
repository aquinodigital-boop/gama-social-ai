/**
 * GamaDataService.js — Gama Distribuidora
 * Serviço de dados com catálogo real (1.200+ produtos do site gamatintas.com.br)
 */

import rawProducts from '../data/gama_products.json';
import categoryMeta from '../data/gama_categories.json';

// Pre-computed indexes (built once at module load)
let _products = null;
let _brandIndex = null;
let _categoryIndex = null;
let _brandStats = null;

function ensureIndexes() {
  if (_products) return;

  _products = rawProducts;

  // Build brand index
  _brandIndex = {};
  _categoryIndex = {};
  _brandStats = {};

  for (const p of _products) {
    // Brand index
    if (p.brand) {
      if (!_brandIndex[p.brand]) _brandIndex[p.brand] = [];
      _brandIndex[p.brand].push(p);
      _brandStats[p.brand] = (_brandStats[p.brand] || 0) + 1;
    }
    // Category index
    if (!_categoryIndex[p.category]) _categoryIndex[p.category] = [];
    _categoryIndex[p.category].push(p);
  }
}

export const GamaDataService = {
  // === Backward-compatible interface (replaces LaborDataService) ===

  getUniqueCategories() {
    ensureIndexes();
    return categoryMeta.marketingCategories;
  },

  getProducts(options = {}) {
    ensureIndexes();
    let result = _products;

    if (options.category) {
      result = result.filter(p => p.category === options.category);
    }
    if (options.brand) {
      result = result.filter(p => p.brand === options.brand);
    }
    if (options.search) {
      const q = options.search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q));
    }
    return result;
  },

  identifyCategory(productName) {
    ensureIndexes();
    const n = productName.toLowerCase();
    if (n.includes('coralar')) return 'Coralar';
    if (n.includes('rende muito')) return 'Rende Muito';
    if (n.includes('pinta piso')) return 'Pinta Piso';
    if (n.includes('sol') && n.includes('chuva')) return 'Sol & Chuva';
    if (n.includes('decora')) return 'Decora';
    if (n.includes('coralit') || n.includes('superlavável')) return 'Coralit / Superlavável';
    if (n.includes('sparlack') || n.includes('verniz')) return 'Sparlack Vernizes';
    if (n.includes('textura')) return 'Textura Rústica';
    if (n.includes('wande') || n.includes('epoxy')) return 'Wandepoxy';
    if (n.includes('corante') || n.includes('brilho') || n.includes('resina')) return 'Corantes e Bases';
    if (n.includes('fundo')) return 'Fundo Preparador';
    if (n.includes('massa') || n.includes('selador')) return 'Massa Corrida e Selador';
    if (n.includes('esmalte')) return 'Esmaltes';
    if (n.includes('grafite') || n.includes('imperm')) return 'Impermeabilizantes';
    // Try to find by exact match in catalog
    const found = _products.find(p => p.name.toLowerCase().includes(n) || n.includes(p.name.toLowerCase()));
    if (found) return found.category;
    return 'Tintas Acrílicas';
  },

  // === New methods ===

  getBrands() {
    ensureIndexes();
    return categoryMeta.brands;
  },

  getBrandStats() {
    ensureIndexes();
    return Object.entries(_brandStats)
      .map(([name, count]) => ({ name, productCount: count }))
      .sort((a, b) => b.productCount - a.productCount);
  },

  getProductsByBrand(brand) {
    ensureIndexes();
    return _brandIndex[brand] || [];
  },

  getProductsByCategory(category) {
    ensureIndexes();
    return _categoryIndex[category] || [];
  },

  getProductById(id) {
    ensureIndexes();
    return _products.find(p => p.id === id) || null;
  },

  searchProducts(query) {
    ensureIndexes();
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase();
    return _products.filter(p => p.name.toLowerCase().includes(q));
  },

  getProductCount() {
    ensureIndexes();
    return _products.length;
  },

  getCategoryStats() {
    ensureIndexes();
    return Object.entries(_categoryIndex)
      .map(([name, products]) => ({ name, productCount: products.length }))
      .sort((a, b) => b.productCount - a.productCount);
  },

  getStats() {
    ensureIndexes();
    return {
      totalProducts: _products.length,
      totalBrands: categoryMeta.brands.length,
      totalCategories: categoryMeta.marketingCategories.length,
      productsWithBrand: _products.filter(p => p.brand).length,
    };
  },
};
