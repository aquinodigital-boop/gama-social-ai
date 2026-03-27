/**
 * SuggestionsEngine.js — Motor de sugestões para Gama Distribuidora
 * Gera sugestões de conteúdo, site e campanhas baseado nos dados reais do catálogo.
 */

import { GamaDataService } from './GamaDataService.js';
import { getCurrentSeason, getUpcomingHolidays } from '../utils/seasonalData.js';

const FORMATS = ['reels', 'carrossel', 'stories', 'post_estatico', 'banner_site', 'whatsapp'];
const ANGLES = ['coral_expertise', 'profit', 'reconquista', 'partnership', 'technical'];
const PERSONAS = ['pintor_profissional', 'lojista', 'engenheiro_arquiteto'];

const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickN(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function todaySeed() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function seededPick(arr, seed) {
  return arr[seed % arr.length];
}

export const SuggestionsEngine = {
  generateAll() {
    return {
      siteSuggestions: this.generateSiteSuggestions(),
      calendarIdeas: this.generateCalendarIdeas(),
      seasonalCampaigns: this.generateSeasonalCampaigns(),
      productHighlights: this.generateProductHighlights(),
      socialMediaIdeas: this.generateSocialMediaIdeas(),
    };
  },

  generateSiteSuggestions() {
    const stats = GamaDataService.getStats();
    const catStats = GamaDataService.getCategoryStats();
    const suggestions = [];

    // 1. SEO: Quase 100% dos produtos sem descrição
    suggestions.push({
      id: 'seo-descriptions',
      type: 'seo',
      priority: 'high',
      title: `${stats.totalProducts} produtos sem descrição no site`,
      description: 'Nenhum produto no gamatintas.com.br tem descrição. Isso prejudica SEO e conversão. Adicionar descrições ricas com palavras-chave de busca pode aumentar o tráfego orgânico significativamente.',
      action: 'generate',
      actionLabel: 'Gerar descrições com IA',
    });

    // 2. Categorias com poucos produtos = oportunidade
    const smallCats = catStats.filter(c => c.productCount < 10 && c.name !== 'Outros');
    if (smallCats.length > 0) {
      suggestions.push({
        id: 'category-gaps',
        type: 'catalog',
        priority: 'medium',
        title: `${smallCats.length} categorias com menos de 10 produtos`,
        description: `Categorias como ${smallCats.slice(0, 3).map(c => c.name).join(', ')} têm poucos produtos. Considere ampliar o mix ou criar conteúdo para destacar esses produtos.`,
        action: 'info',
        actionLabel: 'Ver categorias',
        data: smallCats,
      });
    }

    // 3. Banner sazonal
    const season = getCurrentSeason();
    suggestions.push({
      id: 'seasonal-banner',
      type: 'design',
      priority: 'medium',
      title: `Banner sazonal: ${season.name} ${new Date().getFullYear()}`,
      description: `Atualize os banners do site com foco em ${season.highlights.join(', ')}. ${season.reason}.`,
      action: 'create',
      actionLabel: 'Criar banner',
      generateConfig: { format: 'banner_site', angle: 'coral_expertise' },
    });

    // 4. Produtos sem marca identificada
    const withoutBrand = stats.totalProducts - stats.productsWithBrand;
    if (withoutBrand > 50) {
      suggestions.push({
        id: 'brand-gaps',
        type: 'catalog',
        priority: 'low',
        title: `${withoutBrand} produtos sem marca identificada`,
        description: 'Esses produtos aparecem no site sem marca visível. Categorizar por marca melhora a navegação e a busca.',
        action: 'info',
        actionLabel: 'Ver detalhes',
      });
    }

    return suggestions;
  },

  generateCalendarIdeas() {
    const seed = todaySeed();
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon...
    const startDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to Mon=0

    const brands = GamaDataService.getBrandStats().slice(0, 5);
    const categories = GamaDataService.getUniqueCategories().filter(c => c !== 'Outros');

    return WEEKDAYS.map((day, i) => {
      const dayIdx = (startDay + i) % 7;
      const format = FORMATS[dayIdx % FORMATS.length];
      const angle = ANGLES[dayIdx % ANGLES.length];
      const persona = PERSONAS[dayIdx % PERSONAS.length];
      const cat = seededPick(categories, seed + i);
      const brand = seededPick(brands, seed + i + 7);

      const themes = [
        { theme: `Produto destaque: ${brand.name}`, type: 'brand' },
        { theme: `Dicas técnicas: ${cat}`, type: 'category' },
        { theme: 'Bastidores Gama / Logística', type: 'institutional' },
        { theme: `Depoimento de cliente / Antes e depois`, type: 'institutional' },
        { theme: `Promoção relâmpago: ${cat}`, type: 'category' },
        { theme: `Tutorial rápido: como aplicar ${cat}`, type: 'category' },
        { theme: 'Novidade do catálogo', type: 'brand' },
      ];
      const t = themes[(seed + i) % themes.length];

      return {
        day: day,
        format,
        angle,
        persona,
        theme: t.theme,
        type: t.type,
        category: cat,
        brand: brand.name,
      };
    });
  },

  generateSeasonalCampaigns() {
    const season = getCurrentSeason();
    const holidays = getUpcomingHolidays(60);
    const campaigns = [];

    // Current season campaign
    campaigns.push({
      id: `season-${season.key}`,
      type: 'seasonal',
      priority: 'high',
      title: `${season.name} ${new Date().getFullYear()} — ${season.highlights[0]}`,
      description: season.reason,
      ideas: season.campaigns || [],
      products: season.highlights,
    });

    // Upcoming holidays
    for (const holiday of holidays.slice(0, 3)) {
      campaigns.push({
        id: `holiday-${holiday.month}-${holiday.day}`,
        type: 'holiday',
        priority: holiday.daysUntil <= 14 ? 'high' : 'medium',
        title: `${holiday.name} (${holiday.daysUntil} dias)`,
        description: holiday.marketing,
        daysUntil: holiday.daysUntil,
      });
    }

    return campaigns;
  },

  generateProductHighlights() {
    const brandStats = GamaDataService.getBrandStats();
    const catStats = GamaDataService.getCategoryStats();
    const seed = todaySeed();
    const highlights = [];

    // Top 3 brands
    const topBrands = brandStats.slice(0, 3);
    for (const brand of topBrands) {
      const products = GamaDataService.getProductsByBrand(brand.name);
      const sample = pickN(products, 3);
      highlights.push({
        id: `brand-${brand.name}`,
        type: 'brand',
        title: `${brand.name} — ${brand.productCount} produtos`,
        description: `Destaque da semana: ${sample.map(p => p.name).join(', ')}`,
        brand: brand.name,
        productCount: brand.productCount,
        sampleProducts: sample,
      });
    }

    // Product of the day (rotates daily)
    const allProducts = GamaDataService.getProducts();
    const productOfDay = allProducts[seed % allProducts.length];
    if (productOfDay) {
      highlights.push({
        id: 'product-of-day',
        type: 'product',
        title: 'Produto do Dia',
        description: productOfDay.name,
        product: productOfDay,
      });
    }

    // Top category
    const topCat = catStats.filter(c => c.name !== 'Outros')[0];
    if (topCat) {
      highlights.push({
        id: `cat-${topCat.name}`,
        type: 'category',
        title: `Categoria em destaque: ${topCat.name}`,
        description: `${topCat.productCount} produtos disponíveis. Explore opções de conteúdo para esta categoria.`,
        category: topCat.name,
      });
    }

    return highlights;
  },

  generateSocialMediaIdeas() {
    const season = getCurrentSeason();
    const brands = GamaDataService.getBrandStats();
    const categories = GamaDataService.getUniqueCategories().filter(c => c !== 'Outros');
    const seed = todaySeed();

    const templates = [
      { text: `Você sabia? ${seededPick(season.highlights, seed)} é essencial no ${season.name.toLowerCase()} do litoral paulista.`, format: 'stories', persona: 'lojista' },
      { text: `3 produtos ${seededPick(brands, seed).name} que não podem faltar no seu estoque`, format: 'carrossel', persona: 'lojista' },
      { text: `Tutorial rápido: como aplicar ${seededPick(categories, seed + 1)} corretamente`, format: 'reels', persona: 'pintor_profissional' },
      { text: `Antes e depois: transformação com ${seededPick(categories, seed + 2)}`, format: 'reels', persona: 'pintor_profissional' },
      { text: `Dica do consultor Gama: quando usar ${seededPick(categories, seed + 3)} vs ${seededPick(categories, seed + 4)}?`, format: 'carrossel', persona: 'engenheiro_arquiteto' },
      { text: `Por que a Gama é o distribuidor oficial Coral #1 da Baixada Santista?`, format: 'post_estatico', persona: 'lojista' },
      { text: `Top 5 ${seededPick(categories, seed + 5)} mais vendidos este mês`, format: 'stories', persona: 'lojista' },
      { text: `Como aumentar a margem da sua loja com ${seededPick(brands, seed + 1).name}`, format: 'carrossel', persona: 'lojista' },
    ];

    return pickN(templates, 5).map((t, i) => ({
      id: `idea-${i}`,
      ...t,
      angle: pick(ANGLES),
    }));
  },
};
