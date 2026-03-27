/**
 * TradeTemplates.js — Templates para Trade Marketing
 * Gera material de PDV, campanhas de incentivo e ações de sell-out.
 */

import { BrandBrain } from './BrandBrain.js';
import { GamaDataService } from './GamaDataService.js';
import { CategoryExpert } from './marketing/CategoryExpert.js';

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ── Material de PDV ──

export function generatePDVMaterial({ product, category, persona, region }) {
  const cat = category || product?.category || 'Tintas Internas';
  const productName = product?.name || cat;
  const regionLabel = BrandBrain.getRegionLabel(region);
  const catCtx = CategoryExpert.get(cat);

  return {
    type: 'pdv_material',
    title: `Material PDV: ${productName}`,
    category: cat,
    pieces: [
      {
        name: 'Cartaz de Gôndola',
        dimensions: 'A4 (210x297mm)',
        headline: `${productName} — ${catCtx.hook}`,
        body: `Disponível na Gama Distribuidora.\n${catCtx.b2b_angle}\nEntrega ágil em ${regionLabel}.`,
        cta: BrandBrain.getCTA(),
        visual_prompt: `Cartaz A4 profissional para gôndola de loja de tintas. Produto "${productName}" em destaque. Cores: azul marinho (#1E3A5F) e coral (#E85D3B). Logo Gama Distribuidora no rodapé. Estilo clean, B2B. ${catCtx.visual_cue}`,
      },
      {
        name: 'Stopper de Prateleira',
        dimensions: '15x5cm',
        headline: catCtx.hook,
        body: `${productName}\nGama Distribuidora`,
        cta: 'Consulte seu vendedor',
        visual_prompt: `Stopper de prateleira 15x5cm para "${productName}". Fundo coral (#E85D3B), texto branco bold. Logo Gama pequeno. Estilo atrativo, chama atenção na gôndola.`,
      },
      {
        name: 'Banner Ponto Extra',
        dimensions: '60x90cm',
        headline: `Destaque: ${productName}`,
        body: `${catCtx.keywords.join(' | ')}\n\n${catCtx.b2b_angle}`,
        cta: `Peça já! ${BrandBrain.getCTA()}`,
        visual_prompt: `Banner vertical 60x90cm para ponto extra em loja de materiais. "${productName}" com foto do produto. Fundo gradiente azul marinho para coral. Logo Gama e Coral. Profissional e chamativo.`,
      },
      {
        name: 'Tabloide Promocional',
        dimensions: 'A3 frente e verso',
        headline: `Ofertas Gama — ${cat}`,
        body: `Confira as melhores opções de ${cat} para sua loja.\n\nMarcas: Coral, Tigre, Henkel e mais.\nEntrega ágil em ${regionLabel}.\n\n${BrandBrain.marketData.productCount} no catálogo.`,
        cta: 'Peça sua tabela de preços!',
        visual_prompt: `Tabloide A3 promocional para distribuidor de tintas. Grid com 6-8 produtos de "${cat}". Preços e nomes visíveis. Fundo branco, acentos azul marinho e coral. Logo Gama Distribuidora no topo. Estilo varejo B2B.`,
      },
    ],
  };
}

// ── Campanha de Incentivo ──

export function generateIncentiveCampaign({ brand, category, duration, prize }) {
  const brandName = brand || 'Coral';
  const cat = category || 'Tintas';
  const dur = duration || '30 dias';
  const prizeText = prize || 'Premiação em dinheiro + kit de ferramentas';

  return {
    type: 'incentive_campaign',
    title: `Campanha Incentivo: ${brandName}`,
    mechanics: {
      rules: [
        `Válida por ${dur} para balconistas de lojas parceiras Gama`,
        `A cada venda de produto ${brandName} registrada, o balconista acumula pontos`,
        `Pontuação dobrada para produtos da linha premium`,
        `Ranking atualizado semanalmente via WhatsApp`,
      ],
      prize: prizeText,
      target: `Aumentar sell-out de ${brandName} em 20% no período`,
      participants: 'Balconistas de lojas Gama na região',
    },
    communication: {
      whatsapp_convite: `Atenção, balconista! 🎯\n\nChegou a *Campanha ${brandName}* da Gama!\n\n📋 Como funciona:\n• Venda produtos ${brandName} e acumule pontos\n• Ranking semanal no nosso grupo\n• Premiação: ${prizeText}\n\n⏰ Duração: ${dur}\n\nBora vender e ganhar? 💪\n\nSeu consultor Gama tem todos os detalhes!`,
      cartaz_a3: {
        headline: `Campanha ${brandName} — Venda e Ganhe!`,
        body: `Balconista, é sua hora de brilhar!\n\nVenda produtos ${brandName} e concorra a ${prizeText}.\n\nPeríodo: ${dur}\nRegulamento com seu consultor Gama.`,
        visual_prompt: `Cartaz A3 de campanha de incentivo "${brandName}". Estilo motivacional, cores vibrantes (coral e azul). Troféu ou prêmio em destaque. Texto "Venda e Ganhe!" bold. Logo Gama e ${brandName}. Fotos de produtos. Voltado para balconistas.`,
      },
      regulamento: [
        `1. A campanha é válida por ${dur}, contados a partir da data de início comunicada.`,
        `2. Participam balconistas de lojas cadastradas como parceiras Gama Distribuidora.`,
        `3. Cada unidade vendida de produto ${brandName} gera pontuação conforme tabela.`,
        `4. Produtos da linha premium contam em dobro.`,
        `5. O ranking será divulgado semanalmente via grupo de WhatsApp.`,
        `6. A premiação será entregue ao(s) vencedor(es) em até 15 dias após o encerramento.`,
        `7. Prêmio: ${prizeText}.`,
        `8. Casos omissos serão decididos pela equipe comercial Gama.`,
      ],
    },
  };
}

// ── Ação de Sell-out ──

export function generateSelloutAction({ product, category, region, angle }) {
  const cat = category || product?.category || 'Tintas Internas';
  const productName = product?.name || cat;
  const regionLabel = BrandBrain.getRegionLabel(region);
  const catCtx = CategoryExpert.get(cat);
  const angleData = BrandBrain.getAngle(angle || 'produto_margem');

  return {
    type: 'sellout_action',
    title: `Ação Sell-out: ${productName}`,
    action: {
      description: `Ação de sell-out para impulsionar ${productName} nas lojas parceiras da ${regionLabel}.`,
      audience: `Lojistas e balconistas da região ${regionLabel}`,
      duration: '15 dias',
      angle: angleData.label,
    },
    materials: [
      {
        type: 'whatsapp_blast',
        content: `Ação especial! 🔥\n\n*${productName}* com condição diferenciada para revenda.\n\n${catCtx.b2b_angle}\n\n📦 Estoque disponível para pronta-entrega\n🚛 Entrega ágil em ${regionLabel}\n\nFale com seu consultor Gama!`,
      },
      {
        type: 'argumentario_vendedor',
        content: `Briefing para consultor:\n\n• Produto foco: ${productName}\n• Categoria: ${cat}\n• Argumento principal: ${catCtx.b2b_angle}\n• Diferencial: ${catCtx.hook}\n• Região: ${regionLabel}\n• Objeção mais comum: preço → responder com rendimento/custo por m²\n\nAbordagem sugerida:\n1. Perguntar sobre giro da categoria ${cat}\n2. Apresentar ${productName} com dados de rendimento\n3. Oferecer condição especial para pedido no ato\n4. Sugerir posicionamento na gôndola`,
      },
      {
        type: 'material_pdv',
        content: `Kit PDV para a ação:\n\n• 1 Cartaz A3 de gôndola com destaque ${productName}\n• 2 Stoppers de prateleira\n• 1 Tabloide com mix da categoria ${cat}\n• Material digital para WhatsApp da loja`,
      },
    ],
    briefing: {
      objetivo: `Aumentar sell-out de ${productName} em 20% no período`,
      meta_pedidos: '15 pedidos em 15 dias',
      kpi: 'Volume vendido + novos pontos de venda ativados',
    },
  };
}
