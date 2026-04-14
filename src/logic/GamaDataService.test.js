/**
 * GamaDataService tests — valida os índices do catálogo real (1.200+ produtos).
 * Garante que os métodos de leitura estão consistentes e que mudanças no JSON
 * não quebram silenciosamente os consumers.
 */
import { describe, it, expect } from 'vitest';
import { GamaDataService } from './GamaDataService.js';

describe('GamaDataService.getStats()', () => {
  it('retorna contagens coerentes do catálogo real', () => {
    const stats = GamaDataService.getStats();
    expect(stats.totalProducts).toBeGreaterThan(1000);
    expect(stats.totalBrands).toBeGreaterThan(0);
    expect(stats.totalCategories).toBeGreaterThan(0);
    expect(stats.productsWithBrand).toBeGreaterThan(0);
    expect(stats.productsWithBrand).toBeLessThanOrEqual(stats.totalProducts);
  });
});

describe('GamaDataService.getBrandStats()', () => {
  it('retorna lista ordenada por productCount desc', () => {
    const brands = GamaDataService.getBrandStats();
    expect(brands.length).toBeGreaterThan(0);
    for (let i = 1; i < brands.length; i++) {
      expect(brands[i - 1].productCount).toBeGreaterThanOrEqual(brands[i].productCount);
    }
  });

  it('cada item tem name e productCount', () => {
    const [first] = GamaDataService.getBrandStats();
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('productCount');
    expect(typeof first.name).toBe('string');
    expect(typeof first.productCount).toBe('number');
  });
});

describe('GamaDataService.getCategoryStats()', () => {
  it('retorna categorias com contagem agregada', () => {
    const cats = GamaDataService.getCategoryStats();
    expect(cats.length).toBeGreaterThan(5);
    const total = cats.reduce((sum, c) => sum + c.productCount, 0);
    expect(total).toBe(GamaDataService.getStats().totalProducts);
  });
});

describe('GamaDataService.getProducts()', () => {
  it('filtra por categoria', () => {
    const cats = GamaDataService.getCategoryStats();
    const sampleCat = cats[0].name;
    const filtered = GamaDataService.getProducts({ category: sampleCat });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(p => p.category === sampleCat)).toBe(true);
  });

  it('filtra por marca', () => {
    const brands = GamaDataService.getBrandStats();
    const sampleBrand = brands[0].name;
    const filtered = GamaDataService.getProducts({ brand: sampleBrand });
    expect(filtered.length).toBeGreaterThan(0);
    expect(filtered.every(p => p.brand === sampleBrand)).toBe(true);
  });

  it('busca por nome é case-insensitive', () => {
    const resultUpper = GamaDataService.getProducts({ search: 'CORAL' });
    const resultLower = GamaDataService.getProducts({ search: 'coral' });
    expect(resultUpper.length).toBe(resultLower.length);
  });
});

describe('GamaDataService.searchProducts()', () => {
  it('retorna vazio para query com menos de 2 caracteres', () => {
    expect(GamaDataService.searchProducts('a')).toEqual([]);
    expect(GamaDataService.searchProducts('')).toEqual([]);
  });

  it('encontra produtos por substring', () => {
    const result = GamaDataService.searchProducts('coral');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('GamaDataService.identifyCategory()', () => {
  it('identifica Coralar', () => {
    expect(GamaDataService.identifyCategory('Coralar Econômica 18L')).toBe('Coralar');
  });

  it('identifica Rende Muito', () => {
    expect(GamaDataService.identifyCategory('Coral Rende Muito 18L')).toBe('Rende Muito');
  });

  it('identifica Sol & Chuva', () => {
    expect(GamaDataService.identifyCategory('Proteção Sol e Chuva 18L')).toBe('Sol & Chuva');
  });

  it('identifica Sparlack / verniz', () => {
    expect(GamaDataService.identifyCategory('Sparlack Extra Brilho')).toBe('Sparlack Vernizes');
    expect(GamaDataService.identifyCategory('Verniz Marítimo')).toBe('Sparlack Vernizes');
  });

  it('identifica esmalte', () => {
    expect(GamaDataService.identifyCategory('Esmalte Sintético Branco')).toBe('Esmaltes');
  });

  it('usa fallback "Tintas Acrílicas" para desconhecidos sem match', () => {
    // Nome bem improvável de existir no catálogo
    const result = GamaDataService.identifyCategory('zzzproduto-xyz-inexistente-999');
    expect(result).toBe('Tintas Acrílicas');
  });
});

describe('GamaDataService.getProductsByBrand()', () => {
  it('retorna apenas produtos da marca solicitada', () => {
    const brands = GamaDataService.getBrandStats();
    const sample = brands[0].name;
    const products = GamaDataService.getProductsByBrand(sample);
    expect(products.length).toBe(brands[0].productCount);
    expect(products.every(p => p.brand === sample)).toBe(true);
  });

  it('retorna array vazio para marca inexistente', () => {
    expect(GamaDataService.getProductsByBrand('MarcaInexistenteXYZ')).toEqual([]);
  });
});

describe('GamaDataService.getUniqueCategories()', () => {
  it('retorna lista de categorias de marketing', () => {
    const cats = GamaDataService.getUniqueCategories();
    expect(Array.isArray(cats)).toBe(true);
    expect(cats.length).toBeGreaterThan(0);
  });
});
