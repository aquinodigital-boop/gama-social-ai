/**
 * BrandBrain.js — Gama Distribuidora
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
        regions: ["Grande São Paulo", "Baixada Santista"],
        cities: ["Santos", "São Vicente", "Guarujá", "Cubatão", "Praia Grande", "São Bernardo", "Santo André", "São Paulo"],
        focusRegion: "Baixada Santista",
        focusCampaign: "Projeto Reconquista Santos",
        competitor: "Suvinil",
        logisticsHook: [
            "Entrega ágil na Baixada Santista",
            "Abastecemos toda a região de Santos",
            "Do ABC ao litoral, a Gama chega",
            "Estoque reposto para você não perder venda",
            "Parceiro oficial Coral na sua região",
        ]
    },
    strategicAngles: [
        { id: "coral_expertise", label: "Expertise Coral", icon: "🎨", focus: "Conhecimento técnico das linhas Coral, diferencial de ser distribuidor oficial." },
        { id: "profit", label: "Margem & Resultado", icon: "💰", focus: "Rentabilidade, giro de estoque, competitividade na gôndola." },
        { id: "reconquista", label: "Projeto Reconquista Santos", icon: "🏆", focus: "Retomada de market share em Santos vs. Suvinil." },
        { id: "partnership", label: "Parceria & Programa CL", icon: "🤝", focus: "Programa de níveis CL, transformação de fachada, benefícios de parceria." },
        { id: "technical", label: "Suporte Técnico", icon: "🔧", focus: "Consultoria técnica, aplicação correta, menos retrabalho." }
    ],
    getContextualHook: (category) => {
        const hooks = [
            `Qual o melhor produto Coral para ${category}?`,
            `${category} com qualidade Coral — seu cliente vai notar.`,
            `Não deixe faltar ${category} na sua loja.`,
            `${category}: produto que vende e satisfaz o cliente final.`,
        ];
        return hooks[Math.floor(Math.random() * hooks.length)];
    },
    getCTA: () => {
        const ctas = ["Fale com nosso consultor no Zap!", "Peça sua tabela de preços.", "Consulte disponibilidade de estoque.", "Conheça o Programa CL.", "Agende uma visita do nosso representante."];
        return ctas[Math.floor(Math.random() * ctas.length)];
    }
};
