/**
 * BrandService.js — Gama Distribuidora
 * Gerencia marcas distribuídas pela Gama.
 */

const GAMA_BRANDS = [
  {
    name: "CORAL",
    productCount: 120,
    categories: ["Tintas Internas", "Tintas Externas", "Vernizes", "Texturas", "Massa Corrida", "Impermeabilizantes"],
    sampleProducts: ["Coralar 18L", "Decora Premium", "Proteção Sol & Chuva", "Rende Muito", "Pinta Piso"],
    segment: "Tintas e Revestimentos",
    strength: "Carro-chefe — líder de mercado Coral/AkzoNobel",
    tier: "premium",
    isMain: true,
  },
  {
    name: "SPARLACK",
    productCount: 40,
    categories: ["Vernizes", "Tingidor de Madeira", "Primers"],
    sampleProducts: ["Verniz Sparlack Acetinado", "Verniz Marítimo", "Tingidor Ipê"],
    segment: "Vernizes e Madeira",
    strength: "Referência em verniz — linha Coral",
    tier: "premium",
    isMain: false,
  },
  {
    name: "TINTING",
    productCount: 30,
    categories: ["Tintometria", "Bases", "Corantes"],
    sampleProducts: ["Base Branca Tinting", "Corante Universal", "Base Médio"],
    segment: "Sistema de Tintometria",
    strength: "Sistema de coloração profissional",
    tier: "premium",
    isMain: false,
  },
  {
    name: "MACTRA",
    productCount: 25,
    categories: ["Texturas", "Revestimentos Decorativos"],
    sampleProducts: ["Textura Rústica", "Grafiato", "Cimentício"],
    segment: "Revestimentos Decorativos",
    strength: "Linha de texturas e efeitos",
    tier: "mainstream",
    isMain: false,
  },
  {
    name: "TIGRE",
    productCount: 60,
    categories: ["Tubos PVC", "Conexões", "Registros", "Hidráulica"],
    sampleProducts: ["Tubo PVC 100mm", "Joelho 90°", "Registro de Gaveta"],
    segment: "Hidráulica",
    strength: "Líder nacional em tubos e conexões",
    tier: "premium",
    isMain: false,
  },
  {
    name: "HENKEL",
    productCount: 45,
    categories: ["Adesivos", "Colas", "Silicone", "Fixação"],
    sampleProducts: ["Sikaflex", "Cola de Contato", "Silicone Neutro", "Araldite"],
    segment: "Adesivos e Fixação",
    strength: "Líder global em adesivos industriais",
    tier: "premium",
    isMain: false,
  },
  {
    name: "TRAMONTINA",
    productCount: 35,
    categories: ["Ferramentas Manuais", "Pintura", "Construção"],
    sampleProducts: ["Rolo de Pintura", "Trincha", "Espátula", "Colher de Pedreiro"],
    segment: "Ferramentas",
    strength: "Marca brasileira icônica de ferramentas",
    tier: "premium",
    isMain: false,
  },
  {
    name: "NORTON",
    productCount: 30,
    categories: ["Lixas", "Abrasivos", "Discos de Corte"],
    sampleProducts: ["Lixa Madeira", "Lixa Massa", "Disco Flap", "Lixa D'água"],
    segment: "Abrasivos",
    strength: "Referência mundial em lixas e abrasivos",
    tier: "premium",
    isMain: false,
  },
  {
    name: "VIAPOL",
    productCount: 20,
    categories: ["Impermeabilizantes", "Argamassas", "Rejuntes"],
    sampleProducts: ["Impermeabilizante Viapol", "Rejunte Flex", "Argamassa AC III"],
    segment: "Impermeabilização",
    strength: "Especialista em impermeabilização",
    tier: "mainstream",
    isMain: false,
  },
];

export const BrandService = {
  getBrands: () => GAMA_BRANDS,
  getBrandNames: () => GAMA_BRANDS.map(b => b.name),
  getProductsByBrand: (brandName) => {
    const brand = GAMA_BRANDS.find(b => b.name === brandName.toUpperCase());
    return brand ? brand.sampleProducts.map(name => ({ name, category: brand.categories[0] })) : [];
  },
  getBrandContext: (brandName) => {
    const brand = GAMA_BRANDS.find(b => b.name === brandName.toUpperCase());
    return brand ? { segment: brand.segment, strength: brand.strength, tier: brand.tier } : {
      segment: "Materiais de Construção",
      strength: "Marca parceira da Gama Distribuidora",
      tier: "mainstream"
    };
  }
};
