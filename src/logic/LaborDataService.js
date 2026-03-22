/**
 * GamaDataService.js (mantido como LaborDataService para compatibilidade)
 * Catálogo real extraído de gamatintas.com.br
 */

const GAMA_CATEGORIES = [
  "Coralar",
  "Rende Muito",
  "Pinta Piso",
  "Sol & Chuva",
  "Decora",
  "Coralit / Superlavável",
  "Sparlack Vernizes",
  "Textura Rústica",
  "Wandepoxy",
  "Corantes e Bases",
  "Fundo Preparador",
  "Massa Corrida e Selador",
  "Tintas Acrílicas",
  "Esmaltes",
  "Impermeabilizantes",
  "Outros Complementos",
];

const SAMPLE_PRODUCTS = [
  // Coralar
  { name: "Coralar Acrílico Oceano 18L", category: "Coralar" },
  { name: "Coralar Duo 18L", category: "Coralar" },
  { name: "Coralar Esmalte 18L", category: "Coralar" },
  { name: "Coralar Acrílico Branco 3,6L", category: "Coralar" },
  // Rende Muito
  { name: "Rende Muito 18L", category: "Rende Muito" },
  { name: "Rende Muito LOC 18L", category: "Rende Muito" },
  { name: "Rende Muito Branco Neve 18L", category: "Rende Muito" },
  { name: "Rende Muito 3,6L", category: "Rende Muito" },
  // Pinta Piso
  { name: "Pinta Piso Cinza Médio 18L", category: "Pinta Piso" },
  { name: "Pinta Piso Branco 18L", category: "Pinta Piso" },
  { name: "Pinta Piso Chumbo 18L", category: "Pinta Piso" },
  { name: "Pinta Piso 3,6L", category: "Pinta Piso" },
  // Sol & Chuva
  { name: "Sol & Chuva Impermeável 18L", category: "Sol & Chuva" },
  { name: "Sol & Chuva LOC 18L", category: "Sol & Chuva" },
  { name: "Sol & Chuva Branco 3,6L", category: "Sol & Chuva" },
  // Decora
  { name: "Decora Premium Branco Gelo 18L", category: "Decora" },
  { name: "Decora LOC 18L", category: "Decora" },
  { name: "Decora Fosco 3,6L", category: "Decora" },
  // Coralit
  { name: "Coralit Ultra Resistência 18L", category: "Coralit / Superlavável" },
  { name: "Superlavável 18L", category: "Coralit / Superlavável" },
  { name: "Coralit Esmalte Brilhante 0,9L", category: "Coralit / Superlavável" },
  // Sparlack
  { name: "Sparlack Verniz Acetinado 0,9L", category: "Sparlack Vernizes" },
  { name: "Sparlack Verniz Marítimo 0,9L", category: "Sparlack Vernizes" },
  { name: "Sparlack PintOff Decapante 0,9L", category: "Sparlack Vernizes" },
  { name: "Sparlack Tingidor Ipê 0,9L", category: "Sparlack Vernizes" },
  // Textura
  { name: "Textura Rústica LOC 25kg", category: "Textura Rústica" },
  { name: "Textura Rústica Branca 25kg", category: "Textura Rústica" },
  // Wandepoxy
  { name: "Wandepoxy Esmalte 0,9L", category: "Wandepoxy" },
  { name: "Wandepoxy LOC 0,9L", category: "Wandepoxy" },
  { name: "Catalisador Amida Wanda 0,9L", category: "Wandepoxy" },
  // Corantes
  { name: "Corante Universal Coral", category: "Corantes e Bases" },
  { name: "Brilho para Tinta Coral 3,6L", category: "Corantes e Bases" },
  { name: "Resina Acrílica Coral", category: "Corantes e Bases" },
  { name: "Embeleza Cerâmica Coral", category: "Corantes e Bases" },
  // Fundo
  { name: "Fundo Preparador Base Água 18L", category: "Fundo Preparador" },
  { name: "Fundo Preparador 3,6L", category: "Fundo Preparador" },
  // Massa e Selador
  { name: "Massa Corrida PVA Coral 25kg", category: "Massa Corrida e Selador" },
  { name: "Selador Acrílico Coral 18L", category: "Massa Corrida e Selador" },
  // Tintas Acrílicas genéricas
  { name: "Acrílica Econômica Branco 18L", category: "Tintas Acrílicas" },
  { name: "Acrílica Premium 18L", category: "Tintas Acrílicas" },
  { name: "Acrílica Standard 18L", category: "Tintas Acrílicas" },
  { name: "Linha Master Acrílico Premium 18L", category: "Tintas Acrílicas" },
  // Esmaltes
  { name: "Esmalte Premium Brilhante 0,9L", category: "Esmaltes" },
  { name: "Esmalte Standard Branco 0,9L", category: "Esmaltes" },
  // Impermeabilizantes
  { name: "Coral Grafite Escuro 3,6L", category: "Impermeabilizantes" },
  { name: "Sol & Chuva Impermeável Incolor", category: "Impermeabilizantes" },
  // Tinta Epoxy
  { name: "Tinta Epoxy Coral 0,9L", category: "Outros Complementos" },
  { name: "Renova LOC 18L", category: "Outros Complementos" },
  { name: "Tinta Spray Colorgin", category: "Outros Complementos" },
];

export const LaborDataService = {
  getUniqueCategories: () => GAMA_CATEGORIES,
  getProducts: () => SAMPLE_PRODUCTS,
  identifyCategory: (productName) => {
    const n = productName.toLowerCase();
    if (n.includes("coralar")) return "Coralar";
    if (n.includes("rende muito")) return "Rende Muito";
    if (n.includes("pinta piso")) return "Pinta Piso";
    if (n.includes("sol") && n.includes("chuva")) return "Sol & Chuva";
    if (n.includes("decora")) return "Decora";
    if (n.includes("coralit") || n.includes("superlavável")) return "Coralit / Superlavável";
    if (n.includes("sparlack") || n.includes("verniz")) return "Sparlack Vernizes";
    if (n.includes("textura")) return "Textura Rústica";
    if (n.includes("wande") || n.includes("epoxy")) return "Wandepoxy";
    if (n.includes("corante") || n.includes("brilho") || n.includes("resina")) return "Corantes e Bases";
    if (n.includes("fundo")) return "Fundo Preparador";
    if (n.includes("massa") || n.includes("selador")) return "Massa Corrida e Selador";
    if (n.includes("esmalte")) return "Esmaltes";
    if (n.includes("grafite") || n.includes("imperm")) return "Impermeabilizantes";
    return "Tintas Acrílicas";
  }
};
