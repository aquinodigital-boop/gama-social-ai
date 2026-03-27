/**
 * BrandBrain.js — Gama Distribuidora
 * Identidade de marca, personas B2B, ângulos estratégicos e dados competitivos.
 */
export const BrandBrain = {
  identity: {
    name: "Gama Distribuidora",
    slogan: "20 anos distribuindo qualidade",
    archetype: "The Ruler / The Expert",
    tone: ["Técnico", "Confiável", "Parceiro", "Direto"],
    emojis: ["🎨", "🏗️", "🤝", "🏢", "✅", "🚛"],
    mainBrand: "Coral / AkzoNobel",
    partnerBrands: ["Coral", "Tigre", "Henkel", "Tramontina", "Norton"],
    coralLines: ["Coralar", "Decora", "Proteção Sol & Chuva", "Rende Muito", "Pinta Piso", "Tinting", "Sparlack", "Mactra"],
  },

  regionalContext: {
    regions: {
      baixada_santista: {
        label: "Baixada Santista",
        cities: ["Santos", "São Vicente", "Guarujá", "Cubatão", "Praia Grande"],
        hooks: [
          "Entrega ágil na Baixada Santista",
          "Abastecemos toda a região de Santos",
          "Parceiro oficial Coral na sua região",
        ],
      },
      grande_sp: {
        label: "Grande São Paulo",
        cities: ["São Paulo", "Guarulhos", "Osasco"],
        hooks: [
          "Atendimento B2B em toda Grande SP",
          "Estoque disponível para a Capital e região",
        ],
      },
      abc: {
        label: "ABC Paulista",
        cities: ["São Bernardo", "Santo André", "São Caetano", "Diadema"],
        hooks: [
          "Do ABC ao litoral, a Gama chega",
          "Estoque reposto para você não perder venda",
        ],
      },
    },
    focusCampaign: "Projeto Reconquista Santos",
    competitor: "Suvinil",
  },

  // 3 novas personas B2B
  personas: {
    lojista_carteira: {
      id: 'lojista_carteira',
      label: 'Lojista (Carteira Ativa)',
      description: 'Lojista que já compra da Gama. Foco em fidelização, aumento de ticket e mix.',
      pain: 'Perder vendas por falta de estoque ou mix incompleto',
      desire: 'Lucrar mais com giro rápido e suporte do distribuidor',
      tone: 'Parceiro, direto, consultivo',
      whatsappStyle: 'Informal mas profissional. Já conhece o consultor, trata pelo nome.',
      icon: '🏪',
    },
    lojista_prospeccao: {
      id: 'lojista_prospeccao',
      label: 'Lojista (Prospecção)',
      description: 'Lojista que compra do concorrente (Suvinil/Lukscolor). Foco em conquista.',
      pain: 'Fornecedor que não entrega no prazo ou não dá suporte',
      desire: 'Um parceiro confiável que resolve e agrega valor',
      tone: 'Confiante, com dados. Mostrar diferencial sem atacar o concorrente.',
      whatsappStyle: 'Formal na primeira abordagem, propositivo. Sem intimidade forçada.',
      icon: '🎯',
    },
    balconista: {
      id: 'balconista',
      label: 'Balconista',
      description: 'Funcionário da loja parceira. Foco em incentivo, capacitação e engajamento.',
      pain: 'Não saber indicar o produto certo e perder a venda',
      desire: 'Ganhar incentivo e ser reconhecido como bom vendedor',
      tone: 'Motivacional, simples, prático. Linguagem do dia-a-dia.',
      whatsappStyle: 'Direto, visual (emojis), foco em prêmios e metas.',
      icon: '👷',
    },
  },

  // 6 novos ângulos estratégicos
  strategicAngles: [
    { id: "parceria_confianca", label: "Parceria & Confiança", icon: "🤝", focus: "20 anos de parceria, atendimento humano, consultor dedicado, confiança." },
    { id: "bastidores_operacao", label: "Bastidores da Operação", icon: "🚛", focus: "Logística, estoque, entrega ágil, time Gama em ação." },
    { id: "case_lojista", label: "Case de Lojista", icon: "📊", focus: "Resultado real de lojistas parceiros, depoimento, antes e depois." },
    { id: "produto_margem", label: "Produto & Margem", icon: "💰", focus: "Rentabilidade, giro de estoque, produto que vende e dá margem." },
    { id: "reconquista_santos", label: "Reconquista Santos", icon: "🏆", focus: "Retomada de market share na Baixada Santista vs Suvinil." },
    { id: "programa_cl", label: "Programa CL", icon: "⭐", focus: "Programa de níveis, transformação de fachada, benefícios exclusivos." },
  ],

  // Dados competitivos
  competitors: {
    suvinil: {
      name: 'Suvinil',
      weaknesses: ['Atendimento distante', 'Logística lenta no litoral', 'Menos flexibilidade para lojas pequenas'],
      gamaAdvantage: ['Entrega ágil', 'Consultor dedicado', 'Flexibilidade de pedido', 'Mix Coral + parceiras'],
    },
    lukscolor: {
      name: 'Lukscolor',
      weaknesses: ['Marca menos conhecida', 'Menor portfólio', 'Sem programa de fidelização robusto'],
      gamaAdvantage: ['Coral é líder de mercado', 'Programa CL', 'Tintometria', '20+ anos de experiência'],
    },
  },

  // Dados de mercado
  marketData: {
    coralMarketShare: '~30% do mercado nacional de tintas decorativas',
    gamaExperience: '20+ anos como distribuidor oficial',
    deliveryTime: 'Entrega em até 24h na região de atuação',
    productCount: '1200+ produtos no catálogo',
    partnerBrandsCount: '19 marcas parceiras',
  },

  getRegionLabel(regionId) {
    return this.regionalContext.regions[regionId]?.label || 'Baixada Santista';
  },

  getRegionHook(regionId) {
    const hooks = this.regionalContext.regions[regionId]?.hooks || this.regionalContext.regions.baixada_santista.hooks;
    return hooks[Math.floor(Math.random() * hooks.length)];
  },

  getPersona(personaId) {
    return this.personas[personaId] || this.personas.lojista_carteira;
  },

  getAngle(angleId) {
    return this.strategicAngles.find(a => a.id === angleId) || this.strategicAngles[0];
  },

  getContextualHook(category) {
    const hooks = [
      `Qual o melhor produto Coral para ${category}?`,
      `${category} com qualidade Coral — seu cliente vai notar.`,
      `Não deixe faltar ${category} na sua loja.`,
      `${category}: produto que vende e satisfaz o cliente final.`,
    ];
    return hooks[Math.floor(Math.random() * hooks.length)];
  },

  getCTA() {
    const ctas = [
      "Fale com nosso consultor no Zap!",
      "Peça sua tabela de preços.",
      "Consulte disponibilidade de estoque.",
      "Conheça o Programa CL.",
      "Agende uma visita do nosso representante.",
    ];
    return ctas[Math.floor(Math.random() * ctas.length)];
  },
};
