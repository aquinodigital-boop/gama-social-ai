/**
 * CategoryExpert.js — Gama Distribuidora
 * Contexto de marketing por categoria de produto Coral/parceiras.
 */

const CATEGORY_CONTEXTS = {
  "Tintas Internas": {
    hook: "A tinta que o cliente vê todo dia — tem que cobrir bem e durar.",
    keywords: ["cobertura", "lavável", "acabamento", "ambiente interno"],
    visual_cue: "Ambiente interno recém pintado, iluminação natural, cores claras e aconchegantes.",
    b2b_angle: "Item de maior giro na loja — é o que não pode faltar.",
  },
  "Tintas Externas": {
    hook: "Fachada é o cartão de visitas do imóvel — e da loja que vendeu a tinta.",
    keywords: ["resistência", "clima", "UV", "impermeável", "durabilidade"],
    visual_cue: "Fachada de casa recém pintada, sol do litoral, cores vibrantes.",
    b2b_angle: "Produto de ticket maior — margem relevante para o lojista.",
  },
  "Tintas de Piso": {
    hook: "Piso sem a tinta certa racha, descasca e volta pro balcão como reclamação.",
    keywords: ["resistência mecânica", "garagem", "área de serviço", "aderência"],
    visual_cue: "Garagem com piso pintado de cinza, carro limpo em cima.",
    b2b_angle: "Venda cruzada com tinta de parede na mesma reforma.",
  },
  "Vernizes e Tingidores": {
    hook: "Madeira bonita e protegida é verniz aplicado certo.",
    keywords: ["proteção", "realce", "madeira", "deck", "móveis"],
    visual_cue: "Deck de madeira tratado, luz quente, tom amadeirado rico.",
    b2b_angle: "Produto de margem alta e venda consultiva.",
  },
  "Texturas e Revestimentos": {
    hook: "Textura é o produto que o cliente não sabia que queria — até ver na parede.",
    keywords: ["decorativo", "efeito", "textura", "grafiato", "revestimento"],
    visual_cue: "Parede com textura rústica, sala moderna, efeito elegante.",
    b2b_angle: "Ticket alto, diferencial de loja que oferece mais que tinta básica.",
  },
  "Massa Corrida e Selador": {
    hook: "Sem preparação de superfície, a tinta mais cara do mundo descasca.",
    keywords: ["preparo", "nivelamento", "aderência", "base", "superfície"],
    visual_cue: "Aplicação de massa corrida em parede lisa, espátula em ação.",
    b2b_angle: "Venda obrigatória junto com tinta — não tem como separar.",
  },
  "Impermeabilizantes": {
    hook: "No litoral, umidade não perdoa. Impermeabilizante não é opcional.",
    keywords: ["umidade", "infiltração", "laje", "terraço", "litoral"],
    visual_cue: "Aplicação de impermeabilizante em laje, região costeira ao fundo.",
    b2b_angle: "Altíssima relevância na Baixada Santista — diferencial regional.",
  },
  "Tintometria / Tinting": {
    hook: "A cor certa na hora certa — sem perder o cliente pra concorrência.",
    keywords: ["personalização", "cor especial", "tintômetro", "matching"],
    visual_cue: "Máquina de tintometria em ação, lojista e cliente escolhendo cor.",
    b2b_angle: "Retenção de cliente — quem tem tintometria não perde venda de cor especial.",
  },
  "Ferramentas de Pintura": {
    hook: "Pintor que usa rolo ruim culpa a tinta. Venda a ferramenta certa junto.",
    keywords: ["rolo", "trincha", "bandeja", "aplicação", "acabamento"],
    visual_cue: "Kit de pintura organizado — rolo, trincha, bandeja e fita crepe.",
    b2b_angle: "Venda cruzada natural com tinta — aumenta ticket médio.",
  },
  "Hidráulica": {
    hook: "Obra parada por falta de conexão é prejuízo certo.",
    keywords: ["tubo", "conexão", "registro", "hidráulica", "reparo"],
    visual_cue: "Prateleira organizada com tubos e conexões Tigre.",
    b2b_angle: "Complemento natural ao mix de materiais de construção.",
  },
  "Adesivos e Fixação": {
    hook: "Tem cola no projeto do seu cliente? A gente tem a solução certa.",
    keywords: ["adesivo", "fixação", "silicone", "cola", "vedação"],
    visual_cue: "Aplicação de silicone em janela, acabamento profissional.",
    b2b_angle: "Produto de conveniência — cliente agradece ter no balcão.",
  },
  "Abrasivos e Lixas": {
    hook: "Antes de pintar, lixar. É básico — mas falta no balcão da maioria.",
    keywords: ["lixa", "abrasivo", "preparo", "disco", "lixamento"],
    visual_cue: "Lixa sendo usada em madeira, pó fino, preparação de superfície.",
    b2b_angle: "Item de recompra frequente — o lojista que tem não perde venda.",
  },
  "Argamassas e Rejuntes": {
    hook: "Rejunte errado é reclamação certa. Viapol Flex não arranha.",
    keywords: ["rejunte", "argamassa", "assentamento", "flexível", "porcelana"],
    visual_cue: "Rejuntamento de porcelanato, linhas perfeitas, acabamento impecável.",
    b2b_angle: "Venda natural no combo azulejo + rejunte + argamassa.",
  },
};

const DEFAULT_CONTEXT = {
  hook: "Produto Coral/Gama — qualidade que seu cliente reconhece.",
  keywords: ["qualidade", "Coral", "distribuidor oficial", "Gama"],
  visual_cue: "Produto em destaque com identidade visual Coral.",
  b2b_angle: "Diferencial de ter distribuidor oficial na região.",
};

export const CategoryExpert = {
  get: (category) => CATEGORY_CONTEXTS[category] || DEFAULT_CONTEXT,
  getAll: () => CATEGORY_CONTEXTS,
};
