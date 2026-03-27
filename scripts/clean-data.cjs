/**
 * Script para limpar e processar dados do Apify scraping
 * Gera: src/data/gama_products.json e src/data/gama_categories.json
 */
const fs = require('fs');
const pathMod = require('path');

const SCRAPING_PATH = 'G:/Meu Drive/GAMA DISTRIBUIDORA/JANELA_DE_CONTEXTO/SCRAPING_SITE/gama_scraping/scraping_apify_2026-03-26_16-34-55';
const OUT_DIR = pathMod.join(__dirname, '..', 'src', 'data');

// Read source files
const rawProducts = JSON.parse(fs.readFileSync(pathMod.join(SCRAPING_PATH, 'produtos.json'), 'utf-8'));
const rawBrands = JSON.parse(fs.readFileSync(pathMod.join(SCRAPING_PATH, 'marcas.json'), 'utf-8'));

// Brand inference from product name
const BRAND_KEYWORDS = {
  CORAL: ['CORAL ', 'CORALAR', 'CORALIT', 'RENDE MUITO', 'PINTA PISO', 'SOL & CHUVA', 'SOL E CHUVA', 'DECORA ', 'DECORA ACRILICO', 'SUPERLAVAVEL', 'RENOVA ', 'GRAFITE CORAL', 'EMBELEZA CERAMICA'],
  SPARLACK: ['SPARLACK'],
  COLORGIN: ['COLORGIN'],
  TIGRE: ['TIGRE'],
  HENKEL: ['HENKEL', 'LOCTITE', 'PATTEX', 'DUREPOXI'],
  NORTON: ['NORTON'],
  ADELBRAS: ['ADELBRAS'],
  WANDA: ['WANDA', 'WANDEPOXY'],
  MACTRA: ['MACTRA'],
  BASTON: ['BASTON'],
  BIOCOR: ['BIOCOR'],
  MAXI: ['MAXI RUBBER', 'MAXI '],
  NATRIELLI: ['NATRIELLI'],
  ITAQUA: ['ITAQUA'],
  FORTLEV: ['FORTLEV'],
  SOUDAL: ['SOUDAL'],
  SIL: ['-SIL ', ' SIL ', 'SIL SILICONE'],
  HYDRA: ['HYDRA'],
  ROMAR: ['ROMAR'],
};

function inferBrand(nome) {
  const upper = nome.toUpperCase();
  for (const [brand, keywords] of Object.entries(BRAND_KEYWORDS)) {
    for (const kw of keywords) {
      if (upper.includes(kw)) return brand;
    }
  }
  return '';
}

function identifyMarketingCategory(nome, brand) {
  const n = nome.toUpperCase();
  // Coral product lines
  if (n.includes('CORALAR')) return 'Coralar';
  if (n.includes('RENDE MUITO')) return 'Rende Muito';
  if (n.includes('PINTA PISO')) return 'Pinta Piso';
  if ((n.includes('SOL') && n.includes('CHUVA')) || n.includes('SOL&CHUVA')) return 'Sol & Chuva';
  if (n.includes('DECORA') && !n.includes('DECORATIV')) return 'Decora';
  if (n.includes('CORALIT') || n.includes('SUPERLAVAVEL') || n.includes('SUPERLAV')) return 'Coralit / Superlavável';
  if (n.includes('SPARLACK') || (n.includes('VERNIZ') && brand === 'SPARLACK')) return 'Sparlack Vernizes';
  if (n.includes('TEXTURA')) return 'Textura Rústica';
  if (n.includes('WANDE') || n.includes('WANDEPOXY')) return 'Wandepoxy';
  if (n.includes('CORANTE') || n.includes('BRILHO P/') || n.includes('BRILHO P ')) return 'Corantes e Bases';
  if (n.includes('FUNDO PREP') || n.includes('FUNDO GALV') || n.includes('ZARCAO')) return 'Fundo Preparador';
  if (n.includes('MASSA CORRIDA') || n.includes('SELADOR')) return 'Massa Corrida e Selador';
  if (n.includes('ESMALTE') && !n.includes('WANDEPOXY')) return 'Esmaltes';
  if (n.includes('IMPERMEAB') || n.includes('GRAFITE')) return 'Impermeabilizantes';
  // By brand → category
  if (brand === 'TIGRE') return 'Hidráulica';
  if (brand === 'NORTON') return 'Abrasivos';
  if (brand === 'ADELBRAS') return 'Adesivos e Fitas';
  if (brand === 'COLORGIN') return 'Sprays e Automotivo';
  if (brand === 'MAXI') return 'Automotivo';
  if (brand === 'BASTON') return 'Sprays e Automotivo';
  if (brand === 'BIOCOR') return 'Limpeza e Diluentes';
  if (brand === 'NATRIELLI') return 'Iluminação';
  if (brand === 'ITAQUA') return 'Limpeza e Diluentes';
  if (brand === 'FORTLEV') return 'Hidráulica';
  if (brand === 'SOUDAL') return 'Adesivos e Colas';
  if (brand === 'HYDRA') return 'Hidráulica';
  if (brand === 'ROMAR') return 'Ferramentas';
  if (brand === 'SIL') return 'Adesivos e Fitas';
  if (brand === 'HENKEL') return 'Adesivos e Colas';
  // Catalisadores Wanda → Wandepoxy ecosystem
  if (n.includes('CATALISADOR') && brand === 'WANDA') return 'Wandepoxy';
  // Generic keyword matching
  if (n.includes('TINTA') || n.includes('ACRILIC') || n.includes('LATEX')) return 'Tintas Acrílicas';
  if (n.includes('LIXA') || n.includes('DISCO') || n.includes('REBOLO')) return 'Abrasivos';
  if (n.includes('FITA ADESIV') || n.includes('FITA CREPE') || n.includes('FITA ISOL') || n.includes('FITA DEMARCACAO') || n.includes('FITA SILVER') || n.includes('FITA ANTI')) return 'Adesivos e Fitas';
  if (n.includes('COLA') || n.includes('ADESIVO') || n.includes('SILICONE') || n.includes('VEDACAO') || n.includes('VEDA ') || n.includes('PU EXPAND')) return 'Adesivos e Colas';
  if (n.includes('SPRAY') || n.includes('PRIMER AUTO') || n.includes('AUTOMOTIV')) return 'Sprays e Automotivo';
  if (n.includes('LUVA') || n.includes('OCULOS') || n.includes('MASCARA') || n.includes('PROTETOR') || n.includes('BOTA') || n.includes('CAPACETE') || n.includes('AVENTAL') || n.includes('CINTO SEG') || n.includes('RESPIRADOR') || n.includes('ABAFADOR')) return 'EPI e Segurança';
  if (n.includes('LAMPADA') || n.includes('LED') || n.includes('SOQUETE') || n.includes('REATOR') || n.includes('LUMINARIA') || n.includes('SPOT')) return 'Iluminação';
  if (n.includes('PINCEL') || n.includes('ROLO') || n.includes('BANDEJA') || n.includes('TRINCHA') || n.includes('DESEMPENAD') || n.includes('ESPATUL') || n.includes('BROXA') || n.includes('SUPORTE ROLO') || n.includes('CABO ROLO') || n.includes('EXTENSOR')) return 'Ferramentas de Pintura';
  if (n.includes('THINNER') || n.includes('SOLVENTE') || n.includes('AGUARRAS') || n.includes('DILUENTE') || n.includes('REMOVEDOR')) return 'Solventes e Diluentes';
  if (n.includes('VERNIZ') || n.includes('STAIN') || n.includes('TINGIDOR')) return 'Sparlack Vernizes';
  if (n.includes('RESINA') || n.includes('EMBELEZA')) return 'Corantes e Bases';
  if (n.includes('MASSA') || n.includes('REJUNTE') || n.includes('ARGAMASSA')) return 'Massa Corrida e Selador';
  // Plumbing/hydraulic keywords
  if (n.includes('TUBO') || n.includes('CONEXAO') || n.includes('JOELHO') || n.includes('TEE') || n.includes('REGISTRO') || n.includes('TORNEIRA') || n.includes('SIFAO') || n.includes('VALVULA') || n.includes('ADAPTADOR') || n.includes('FLANGE') || n.includes('CHUVEIRO') || n.includes('CAIXA D') || n.includes('CANO')) return 'Hidráulica';
  // Electrical
  if (n.includes('FIO') || n.includes('CABO FLEX') || n.includes('TOMADA') || n.includes('INTERRUPTOR') || n.includes('DISJUNTOR') || n.includes('QUADRO DIST') || n.includes('ELETRODUTO') || n.includes('CURVA ELETRO')) return 'Elétrica';
  // Tools
  if (n.includes('CHAVE') || n.includes('ALICATE') || n.includes('SERROTE') || n.includes('MARTELO') || n.includes('TRENA') || n.includes('NIVEL') || n.includes('PARAFUSO') || n.includes('BUCHA') || n.includes('PREGO')) return 'Ferramentas';
  // Cleaning
  if (n.includes('LIMPA') || n.includes('DETERGENTE') || n.includes('DESENGORDUR') || n.includes('PANO') || n.includes('ESPONJA') || n.includes('VASSOURA') || n.includes('RODO')) return 'Limpeza';
  // Piso Vinílico / Manta
  if (n.includes('PISO') || n.includes('MANTA')) return 'Pinta Piso';
  // Fita genérica (não classificada antes)
  if (n.includes('FITA')) return 'Adesivos e Fitas';
  // Fundo genérico
  if (n.includes('FUNDO') || n.includes('PRIMER')) return 'Fundo Preparador';
  return 'Outros';
}

// Clean products
const cleanProducts = rawProducts
  .filter(p => p.nome && p.nome.trim().length > 3)
  .map(p => {
    const brand = p.marca || inferBrand(p.nome);
    return {
      id: p.codigo_gama,
      name: p.nome.trim(),
      brand,
      packaging: (p.embalagem || '').trim(),
      url: p.url || '',
      category: identifyMarketingCategory(p.nome, brand),
    };
  });

// Stats
const brandCount = {};
cleanProducts.forEach(p => {
  const b = p.brand || '(sem marca)';
  brandCount[b] = (brandCount[b] || 0) + 1;
});

const catCount = {};
cleanProducts.forEach(p => {
  catCount[p.category] = (catCount[p.category] || 0) + 1;
});

console.log('=== CLEAN PRODUCTS STATS ===');
console.log('Total clean products:', cleanProducts.length);
console.log('With brand:', cleanProducts.filter(p => p.brand).length);
console.log('Without brand:', cleanProducts.filter(p => !p.brand).length);
console.log();

console.log('=== BRANDS ===');
Object.entries(brandCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([b, c]) => console.log(`  ${b}: ${c}`));
console.log();

console.log('=== CATEGORIES ===');
Object.entries(catCount)
  .sort((a, b) => b[1] - a[1])
  .forEach(([c, n]) => console.log(`  ${c}: ${n}`));
console.log();

// Write clean products
fs.writeFileSync(
  pathMod.join(OUT_DIR, 'gama_products.json'),
  JSON.stringify(cleanProducts)
);
console.log(`Wrote gama_products.json (${cleanProducts.length} products, ${Math.round(JSON.stringify(cleanProducts).length / 1024)}KB)`);

// Write categories metadata
const uniqueCategories = [...new Set(cleanProducts.map(p => p.category))].sort();
const categoryMeta = {
  marketingCategories: uniqueCategories,
  brands: rawBrands,
  stats: {
    totalProducts: cleanProducts.length,
    totalBrands: rawBrands.length,
    totalCategories: uniqueCategories.length,
  },
};
fs.writeFileSync(
  pathMod.join(OUT_DIR, 'gama_categories.json'),
  JSON.stringify(categoryMeta, null, 2)
);
console.log(`Wrote gama_categories.json (${uniqueCategories.length} categories)`);

// Sample output
console.log('\n=== SAMPLE PRODUCTS ===');
console.log(JSON.stringify(cleanProducts.slice(0, 5), null, 2));
