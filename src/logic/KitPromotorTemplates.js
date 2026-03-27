/**
 * KitPromotorTemplates.js — Templates para Kit do Promotor de Vendas
 * Argumentários, roteiros de visita e respostas a objeções contextualizadas.
 */

import { BrandBrain } from './BrandBrain.js';
import { CategoryExpert } from './marketing/CategoryExpert.js';
import { ObjectionBank } from './ObjectionBank.js';

// ── Roteiro de Visita ──

export function generateVisitScript({ product, brand, persona }) {
  const productName = product?.name || product || 'Produtos Coral';
  const brandName = brand || product?.brand || 'Coral';
  const cat = product?.category || 'Tintas';
  const catCtx = CategoryExpert.get(cat);
  const personaData = BrandBrain.getPersona(persona || 'lojista_carteira');

  return {
    type: 'visit_script',
    title: `Roteiro de Visita: ${productName}`,
    persona: personaData.label,
    totalDuration: '17 minutos',
    steps: [
      {
        fase: 'Abertura',
        duracao: '2 min',
        script: `"Bom dia! [Nome], tudo bem? Como está o movimento hoje?"\n\n• Observar a loja: gôndola organizada? Produtos Coral visíveis?\n• Perguntar sobre o negócio (genuíno interesse)\n• Mencionar novidade ou evento recente`,
        dicas: [
          'Chegar com sorriso e energia positiva',
          'Observar a loja antes de falar — mostra que você se importa',
          'Se for primeira visita, apresentar-se e entregar cartão',
        ],
      },
      {
        fase: 'Diagnóstico',
        duracao: '5 min',
        script: `Perguntas-chave:\n\n1. "Como está o giro de ${cat} este mês?"\n2. "Qual produto mais sai e qual está parado?"\n3. "Tem recebido demanda por ${productName}?"\n4. "Seu estoque está no nível que gostaria?"\n5. "Alguma dificuldade com o fornecedor atual?"`,
        dicas: [
          'ESCUTAR mais do que falar nessa fase',
          'Anotar as respostas — isso mostra profissionalismo',
          'Identificar a DOR principal (falta de estoque? margem? suporte?)',
          `Persona ${personaData.label}: lembrar que a dor é "${personaData.pain}"`,
        ],
      },
      {
        fase: 'Apresentação',
        duracao: '5 min',
        script: `"Baseado no que você me contou, tenho uma solução..."\n\n• Produto: *${productName}*\n• Diferencial: ${catCtx.hook}\n• ${catCtx.b2b_angle}\n• Dados: ${BrandBrain.marketData.coralMarketShare}\n• Entrega: ${BrandBrain.marketData.deliveryTime}`,
        dicas: [
          'Conectar a solução com a DOR identificada no diagnóstico',
          'Usar dados concretos (rendimento, cobertura, preço/m²)',
          'Mostrar produto físico ou catálogo se possível',
          `Para ${personaData.label}: foco em "${personaData.desire}"`,
        ],
      },
      {
        fase: 'Objeções',
        duracao: '3 min',
        script: `Objeções mais comuns para ${cat}:\n\n${ObjectionBank.getAll().slice(0, 3).map(o => `• ${o.objecao}\n  → ${o.resposta.substring(0, 100)}...`).join('\n\n')}`,
        dicas: [
          'NUNCA interromper a objeção — deixar o lojista terminar',
          'Validar antes de responder: "Entendo sua preocupação..."',
          'Ter dados prontos (rendimento, custo/m², garantia)',
          'Se não souber responder, anotar e retornar em 24h',
        ],
      },
      {
        fase: 'Fechamento',
        duracao: '2 min',
        script: `"Então, posso preparar um pedido de ${productName} pra você?"\n\nOpções de fechamento:\n• "Que tal começar com [X] unidades? É o giro médio pro seu porte de loja."\n• "Consigo uma condição especial se fecharmos agora."\n• "Posso agendar a entrega pra amanhã mesmo."`,
        dicas: [
          'Sempre propor próximo passo concreto',
          'Se não fechar, agendar próxima visita na hora',
          'Registrar tudo no CRM/caderno — data, produto, volume',
          'Agradecer o tempo do lojista independente do resultado',
        ],
      },
    ],
  };
}

// ── Argumentário / Card de Argumentação ──

export function generateArgumentCard({ product, brand, competitor }) {
  const productName = product?.name || product || 'Coral Rende Muito';
  const brandName = brand || product?.brand || 'Coral';
  const cat = product?.category || 'Tintas Internas';
  const catCtx = CategoryExpert.get(cat);
  const comp = competitor || 'Suvinil';
  const compData = BrandBrain.competitors[comp.toLowerCase()] || BrandBrain.competitors.suvinil;

  return {
    type: 'argument_card',
    title: `Argumentário: ${productName}`,
    product: productName,
    brand: brandName,
    category: cat,
    arguments: [
      {
        numero: 1,
        titulo: 'Rendimento superior',
        argumento: `${productName} cobre mais por lata. Menos tinta = menor custo pro cliente final = menos reclamação.`,
        dado: 'Coral Rende Muito: até 120m²/lata (2 demãos). Concorrentes similares: ~80-90m².',
      },
      {
        numero: 2,
        titulo: 'Marca líder',
        argumento: `Coral é a marca mais lembrada em tintas no Brasil. Produto que o consumidor pede pelo nome vende sozinho.`,
        dado: BrandBrain.marketData.coralMarketShare,
      },
      {
        numero: 3,
        titulo: 'Entrega Gama',
        argumento: `Com a Gama, reposição em até 24h. Chega faltando → liga → amanhã tá na loja.`,
        dado: BrandBrain.marketData.deliveryTime,
      },
      {
        numero: 4,
        titulo: 'Margem para o lojista',
        argumento: `${catCtx.b2b_angle}. Produto premium com margem real — não é briga de preço.`,
        dado: 'Lojas que trabalham com Coral reportam margem 10-15% superior na categoria tintas.',
      },
      {
        numero: 5,
        titulo: 'Suporte técnico',
        argumento: `Nosso time orienta sobre aplicação, diluição e sistema de pintura completo. Menos devoluções, mais confiança.`,
        dado: 'Suporte técnico gratuito | Demonstrações em loja | Treinamento para balconistas',
      },
    ],
    comparativo: {
      gama: {
        marca: 'Gama + Coral',
        pontos: compData.gamaAdvantage,
      },
      concorrente: {
        marca: compData.name,
        pontos: compData.weaknesses,
      },
    },
    objections: ObjectionBank.getAll().slice(0, 5).map(o => ({
      objecao: o.objecao,
      resposta: o.resposta,
      followup: o.pergunta_followup,
    })),
    impactData: {
      rendimento: 'Até 120m²/lata (2 demãos)',
      marketShare: BrandBrain.marketData.coralMarketShare,
      experience: BrandBrain.marketData.gamaExperience,
      catalog: BrandBrain.marketData.productCount,
    },
  };
}

// ── Resposta a Objeção Contextualizada ──

export function generateObjectionResponse({ objectionType, product }) {
  const objections = objectionType
    ? ObjectionBank.getByTipo(objectionType)
    : ObjectionBank.getAll();

  return {
    type: 'objection_response',
    title: `Objeções: ${objectionType ? ObjectionBank.getTipos().find(t => t.id === objectionType)?.label : 'Todas'}`,
    product: product?.name || null,
    objections: objections.map(o => ({
      ...o,
      resposta_contextualizada: product?.name
        ? o.resposta.replace(/Coral/g, product.brand || 'Coral')
        : o.resposta,
    })),
  };
}
