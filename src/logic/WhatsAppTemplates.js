/**
 * WhatsAppTemplates.js — Templates para fluxos de WhatsApp B2B
 * Réguas de comunicação: Carteira Ativa, Prospecção, Reativação, Avulsas.
 */

import { BrandBrain } from './BrandBrain.js';
import { CategoryExpert } from './marketing/CategoryExpert.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Carteira Ativa ──

export function generateCarteiraAtiva({ product, persona, region, teamData }) {
  const productName = product?.name || product || 'nossos produtos';
  const cat = product?.category || 'Tintas';
  const regionLabel = BrandBrain.getRegionLabel(region);
  const consultorName = teamData?.consultorName || 'seu consultor Gama';
  const personaData = BrandBrain.getPersona(persona);

  return {
    type: 'whatsapp_carteira',
    title: `Carteira Ativa: ${productName}`,
    persona: personaData.label,
    flow: [
      {
        step: 1,
        label: 'Abertura',
        message: `Olá! Aqui é ${consultorName}, da Gama Distribuidora 👋\n\nTudo bem por aí? Como está o movimento na loja?\n\nPassando pra avisar que temos *${productName}* disponível pra pronta-entrega!`,
        timing: 'Dia 1 — Manhã (seg-qua)',
        note: 'Tom amigável, perguntar sobre o negócio.',
      },
      {
        step: 2,
        label: 'Proposta de Valor',
        message: `Separei uma condição especial pra você em *${productName}* 📦\n\n✅ Estoque disponível\n✅ Entrega ágil em ${regionLabel}\n✅ Preço competitivo pra revenda\n\n${CategoryExpert.get(cat).b2b_angle}\n\nQuer que eu envie a tabela atualizada?`,
        timing: 'Dia 1 — Se respondeu a abertura',
        note: 'Apresentar benefícios de forma clara e direta.',
      },
      {
        step: 3,
        label: 'Follow-up',
        message: `Oi! Tudo certo? 😊\n\nSó passando pra saber se conseguiu dar uma olhada na proposta de *${productName}*.\n\nSe tiver qualquer dúvida sobre especificação, rendimento ou aplicação, pode mandar aqui que respondo rapidinho!\n\nPrecisa de reposição de algum outro item?`,
        timing: 'Dia 3 — Se não respondeu',
        note: 'Gentil mas não insistente. Oferecer suporte técnico.',
      },
      {
        step: 4,
        label: 'Fechamento',
        message: `Última mensagem sobre *${productName}* por enquanto! 🤝\n\nSe precisar, é só chamar aqui. Estou sempre disponível pra te ajudar com:\n\n📋 Tabela de preços atualizada\n📦 Disponibilidade de estoque\n🚛 Agendamento de entrega\n🔧 Suporte técnico\n\nBoas vendas! 💪`,
        timing: 'Dia 5 — Se não respondeu o follow-up',
        note: 'Encerrar com elegância, deixar porta aberta.',
      },
    ],
  };
}

// ── Prospecção ──

export function generateProspeccao({ brand, competitor, persona, region }) {
  const brandName = brand || 'Coral';
  const comp = competitor || 'outro fornecedor';
  const regionLabel = BrandBrain.getRegionLabel(region);
  const personaData = BrandBrain.getPersona(persona);

  return {
    type: 'whatsapp_prospeccao',
    title: `Prospecção: ${brandName} vs ${comp}`,
    persona: personaData.label,
    flow: [
      {
        step: 1,
        label: 'Primeira Abordagem',
        message: `Bom dia! Me chamo [NOME], sou consultor da Gama Distribuidora 🤝\n\nSomos distribuidores oficiais *Coral/AkzoNobel* há mais de 20 anos na região de ${regionLabel}.\n\nVi que sua loja trabalha com materiais de construção e gostaria de apresentar nossas condições.\n\nTem 2 minutinhos pra conversar?`,
        timing: 'Dia 1 — Manhã',
        note: 'Formal, breve, identificar-se claramente.',
      },
      {
        step: 2,
        label: 'Proposta',
        message: `Obrigado pela atenção! Aqui está o que a Gama oferece 📋\n\n🎨 *${brandName}* — marca líder em tintas decorativas\n📦 1200+ produtos no catálogo (tintas, ferramentas, hidráulica)\n🚛 Entrega em até 24h em ${regionLabel}\n👤 Consultor dedicado pra sua loja\n⭐ Programa CL com benefícios exclusivos\n\nPosso enviar nossa tabela de preços pra você comparar?`,
        timing: 'Dia 1 — Se demonstrou interesse',
        note: 'Mostrar amplitude do mix, não só tintas.',
      },
      {
        step: 3,
        label: 'Tratamento de Objeção',
        message: `Entendo sua posição! 👍\n\nMuitos dos nossos melhores parceiros começaram exatamente assim — testando com 2-3 itens de alto giro.\n\nNão precisa trocar de fornecedor. Ter a Gama como segunda opção garante:\n\n✅ Backup quando o principal falhar\n✅ Mais poder de negociação\n✅ Acesso à linha Coral completa\n\nQue tal começar com um pedido teste sem compromisso de volume?`,
        timing: 'Quando houver objeção',
        note: 'Não atacar concorrente. Posicionar como complemento.',
      },
      {
        step: 4,
        label: 'Fechamento',
        message: `Combinado então! ✅\n\nVou preparar uma proposta personalizada com os itens que conversamos.\n\nPróximos passos:\n1. Envio da tabela de preços\n2. Agendamento da primeira entrega\n3. Cadastro no Programa CL\n\nQualquer dúvida, pode chamar aqui. Bem-vindo à Gama! 🎨`,
        timing: 'Após aceitar teste',
        note: 'Ser direto nos próximos passos, mostrar organização.',
      },
    ],
  };
}

// ── Reativação ──

export function generateReativacao({ persona, region }) {
  const regionLabel = BrandBrain.getRegionLabel(region);
  const personaData = BrandBrain.getPersona(persona);

  return {
    type: 'whatsapp_reativacao',
    title: 'Reativação de Cliente Inativo',
    persona: personaData.label,
    flow: [
      {
        step: 1,
        label: 'Reencontro',
        message: `Olá! Tudo bem? 👋\n\nAqui é da Gama Distribuidora. Faz um tempo que não nos falamos e sentimos sua falta!\n\nComo anda o movimento na loja? Estamos com novidades que podem te interessar.`,
        timing: 'Dia 1 — Manhã',
        note: 'Tom leve, sem cobrar. Demonstrar interesse genuíno.',
      },
      {
        step: 2,
        label: 'Novidade',
        message: `Muita coisa mudou na Gama! 🚀\n\n📦 Ampliamos o catálogo para ${BrandBrain.marketData.productCount}\n🚛 Entrega agora em até 24h em ${regionLabel}\n👤 Consultor dedicado para sua região\n⭐ Programa CL com benefícios exclusivos\n\nAlém de Coral, trabalhamos com Tigre, Henkel, Tramontina e mais 15 marcas!\n\nQuer saber mais?`,
        timing: 'Dia 1 — Se respondeu',
        note: 'Mostrar o que mudou. Dados concretos.',
      },
      {
        step: 3,
        label: 'Oferta Exclusiva',
        message: `Pensando em você, separei uma condição especial de retorno 🎁\n\n✅ Primeiro pedido com condição diferenciada\n✅ Frete especial para ${regionLabel}\n✅ Consultoria de gôndola gratuita\n\nÉ nossa forma de dizer: "Queremos você de volta!" 🤝\n\nPosso agendar uma visita essa semana?`,
        timing: 'Dia 2-3 — Após interesse',
        note: 'Oferta concreta. Não exagerar nas promessas.',
      },
      {
        step: 4,
        label: 'Urgência (gentil)',
        message: `Oi! Só passando pra avisar que a condição especial de retorno é por tempo limitado ⏰\n\nSe tiver interesse, me responde aqui que agendo tudo rapidinho.\n\nSe não for o momento, sem problemas! Fico à disposição pro futuro. 😊\n\nBoas vendas!`,
        timing: 'Dia 5 — Se não respondeu',
        note: 'Criar urgência leve. Não ser insistente.',
      },
    ],
  };
}

// ── Mensagens Avulsas ──

const AVULSA_TEMPLATES = {
  lancamento: ({ product, persona }) => ({
    label: 'Lançamento',
    message: `Novidade na Gama! 🆕\n\n*${product || 'Novo produto'}* acaba de chegar ao nosso catálogo!\n\nSeja um dos primeiros a oferecer na sua loja.\n\n📦 Estoque disponível para pronta-entrega\n📋 Peça a ficha técnica\n\nInteressado? Responda aqui! 👇`,
  }),
  promo_relampago: ({ product, persona }) => ({
    label: 'Promo Relâmpago',
    message: `⚡ PROMO RELÂMPAGO ⚡\n\n*${product || 'Produtos selecionados'}* com condição especial!\n\n⏰ Válido apenas hoje\n📦 Enquanto durar o estoque\n\nAproveite e renove o estoque da sua loja!\n\nPeça sua tabela agora 👇`,
  }),
  tabela: ({ product, persona }) => ({
    label: 'Envio de Tabela',
    message: `Conforme combinado, segue a tabela atualizada 📋\n\n*${product || 'Tabela Geral'}*\n\n✅ Preços atualizados\n✅ Condições especiais para volume\n✅ Prazo de entrega: até 24h\n\nDúvidas? Estou por aqui! 🤝`,
  }),
  visita: ({ product, persona, teamData }) => ({
    label: 'Agendamento de Visita',
    message: `Olá! 📅\n\nGostaria de agendar uma visita do nosso consultor ${teamData?.consultorName || ''} à sua loja.\n\nNa visita podemos:\n• Apresentar novidades do catálogo\n• Avaliar layout da gôndola\n• Discutir condições especiais\n• Tirar dúvidas técnicas\n\nQual o melhor dia e horário pra você?`,
  }),
  pos_venda: ({ product, persona }) => ({
    label: 'Pós-Venda',
    message: `Oi! Tudo certo com a última entrega? 📦✅\n\nPassando pra saber se *${product || 'os produtos'}* chegaram certinho e se precisa de algo mais.\n\nNa Gama, o atendimento não termina na entrega. Estamos aqui pra qualquer suporte! 🤝\n\nPrecisa de reposição?`,
  }),
  aniversario_loja: ({ product, persona }) => ({
    label: 'Aniversário da Loja',
    message: `Parabéns pelo aniversário da loja! 🎂🎉\n\nA Gama Distribuidora quer celebrar com você!\n\nSeparamos uma condição especial de aniversário:\n✅ Desconto exclusivo no próximo pedido\n✅ Kit de PDV personalizado\n\nVamos crescer juntos por mais anos! 💪\n\nEntre em contato pra saber mais.`,
  }),
};

export function generateAvulsa({ tipo, product, persona, teamData }) {
  const template = AVULSA_TEMPLATES[tipo];
  if (!template) return null;

  const result = template({ product: product?.name || product, persona, teamData });
  return {
    type: 'whatsapp_avulsa',
    subtype: tipo,
    title: `WhatsApp Avulsa: ${result.label}`,
    ...result,
  };
}

export function getAvulsaTypes() {
  return [
    { id: 'lancamento', label: 'Lançamento', icon: '🆕' },
    { id: 'promo_relampago', label: 'Promo Relâmpago', icon: '⚡' },
    { id: 'tabela', label: 'Envio de Tabela', icon: '📋' },
    { id: 'visita', label: 'Agendar Visita', icon: '📅' },
    { id: 'pos_venda', label: 'Pós-Venda', icon: '📦' },
    { id: 'aniversario_loja', label: 'Aniversário da Loja', icon: '🎂' },
  ];
}
