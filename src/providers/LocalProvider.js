/**
 * LocalProvider.js
 * Provider local baseado em templates inteligentes.
 * Usa BrandBrain, CategoryExpert e BrandExpert sem IA externa.
 * 
 * Este é o provider padrão ("offline") que funciona sem API.
 */

import { ContentProviderInterface } from './ContentProvider.js';
import { BrandBrain } from '../logic/BrandBrain.js';
import { CategoryExpert } from '../logic/marketing/CategoryExpert.js';
import { BrandExpert } from '../logic/marketing/BrandExpert.js';
import { PromptGenerator } from '../engine/PromptGenerator.js';
import { QualityChecker } from '../engine/QualityChecker.js';

// Gerar ID único simples
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Escolha aleatória de array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Dias da semana
const DIAS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

// Formatos por objetivo
const FORMAT_MAP = {
  gerar_demanda: ['reels', 'carrossel', 'stories', 'post_estatico', 'whatsapp'],
  ativar_whatsapp: ['stories', 'whatsapp', 'post_estatico', 'reels'],
  institucional: ['reels', 'carrossel', 'stories', 'banner_site', 'post_estatico'],
  mix_completo: ['reels', 'stories', 'carrossel', 'post_estatico', 'banner_site', 'whatsapp'],
};

// Personas
const PERSONAS = {
  dono_loja: {
    label: 'Dono de Loja',
    pain: 'perder vendas por falta de estoque',
    desire: 'lucrar mais com giro rápido',
    tone: 'direto e objetivo',
  },
  balconista: {
    label: 'Balconista',
    pain: 'não ter o produto que o cliente pediu',
    desire: 'atender rápido e bem',
    tone: 'prático e amigável',
  },
  comprador: {
    label: 'Comprador / Gestor de Compras',
    pain: 'lidar com vários fornecedores',
    desire: 'centralizar pedidos com preço bom',
    tone: 'técnico e confiante',
  },
};

// Ângulos estratégicos
const ANGLES = {
  logistics: {
    label: 'Logística Ágil ABC',
    hooks: [
      (name) => `Precisa de ${name} com urgência no ABC?`,
      (name) => `Sem ${name} no estoque? A Gama resolve hoje.`,
      (name) => `Entrega ágil de ${name} em todo o ABC Paulista.`,
    ],
    focus: 'Velocidade de entrega, estoque local, não perder venda.',
  },
  profit: {
    label: 'Margem & Lucro',
    hooks: [
      (name) => `${name}: margem que faz sua loja crescer.`,
      (name) => `Giro rápido com ${name}. Lucro garantido.`,
      (name) => `O item que não para na prateleira: ${name}.`,
    ],
    focus: 'Giro rápido, rentabilidade, produto essencial.',
  },
  partnership: {
    label: 'Parceria & Confiança',
    hooks: [
      () => `Gama: mais que fornecedor, parceiro do seu negócio.`,
      () => `Conte com a Gama para abastecer sua loja com confiança.`,
      (name) => `${name} com atendimento que resolve. Isso é Gama.`,
    ],
    focus: 'Atendimento humano, resolução, confiança.',
  },
  problem_solution: {
    label: 'Solução de Problema',
    hooks: [
      (name) => `Seu cliente pediu ${name} e você não tinha?`,
      (name) => `Não perca venda por falta de ${name}.`,
      (name) => `Estoque de ${name} sempre em dia com a Gama.`,
    ],
    focus: 'Soluções que atendem bem essa necessidade, não deixar o cliente na mão.',
  },
};

export class LocalProvider extends ContentProviderInterface {
  constructor() {
    super('LocalTemplates');
  }

  async generate(request) {
    const startTime = performance.now();
    const {
      mode = 'product',
      name,
      category,
      angle = 'logistics',
      persona = 'dono_loja',
      format = 'reels',
      brandContext,
    } = request;

    const angleData = ANGLES[angle] || ANGLES.logistics;
    const personaData = PERSONAS[persona] || PERSONAS.dono_loja;
    const catContext = CategoryExpert.get(category);
    const region = BrandBrain.regionalContext.region;
    const isBrand = mode === 'brand';
    const hook = isBrand
      ? pick(this._brandHooks(name, brandContext))
      : pick(angleData.hooks)(name);

    const p = { name, category, hook, catContext, region, angleData, personaData, mode, isBrand, brandContext };
    let result;

    switch (format) {
      case 'reels':
        result = this._generateReels(p);
        break;
      case 'carrossel':
        result = this._generateCarrossel(p);
        break;
      case 'stories':
        result = this._generateStories(p);
        break;
      case 'post_estatico':
        result = this._generatePostEstatico(p);
        break;
      case 'banner_site':
        result = this._generateBannerSite(p);
        break;
      case 'whatsapp':
        result = this._generateWhatsApp(p);
        break;
      default:
        result = this._generateReels(p);
    }

    // Adicionar prompts de imagem/vídeo
    const promptPack = PromptGenerator.generate({
      name,
      category,
      format,
      catContext,
    });

    result.assets = {
      ...result.assets,
      promptPack,
    };

    // Rodar checklist de qualidade
    result.quality = QualityChecker.check(result);
    result.generatedAt = Date.now();
    result.generationTime = Math.round(performance.now() - startTime);
    result.provider = this.name;
    result.id = uid();
    result.format = format;
    result.angle = angle;
    result.persona = persona;

    return result;
  }

  async generateWeeklyPlan(params) {
    const {
      objective = 'gerar_demanda',
      category,
      name,
      angle = 'logistics',
      persona = 'dono_loja',
      mode = 'product',
    } = params;

    const formats = FORMAT_MAP[objective] || FORMAT_MAP.mix_completo;
    const angles = Object.keys(ANGLES);
    const plan = [];

    for (let day = 0; day < 7; day++) {
      // Variar formato e ângulo ao longo da semana
      const dayFormat = formats[day % formats.length];
      const dayAngle = day < 4 ? angle : angles[(day + angles.indexOf(angle)) % angles.length];

      const content = await this.generate({
        mode,
        name: name || category,
        category,
        angle: dayAngle,
        persona,
        format: dayFormat,
      });

      plan.push({
        day: day + 1,
        dayName: DIAS[day],
        format: dayFormat,
        angle: dayAngle,
        contents: [content],
      });
    }

    return plan;
  }

  async generatePromptPack(params) {
    return PromptGenerator.generateFull(params);
  }

  // ─────────────────────────────────────────────
  // FORMATOS ESPECÍFICOS
  // ─────────────────────────────────────────────

  // Brand-specific hooks
  _brandHooks(brandName, ctx) {
    const segment = ctx?.segment || 'materiais de construção';
    const strength = ctx?.strength || 'opções que trabalhamos';
    return [
      `Procurando ${brandName}? Na Gama tem opções que atendem sua necessidade.`,
      `${brandName}: ${strength}. Disponível na Gama Distribuidora.`,
      `Sua loja precisa de ${brandName}? Temos produtos que trabalhamos e costumamos indicar.`,
      `${brandName} no atacado, com entrega ágil. Só na Gama.`,
      `Referência em ${segment}: ${brandName} na Gama.`,
    ];
  }

  _generateReels({ name, category, hook, catContext, region, angleData, personaData, mode, isBrand, brandContext }) {
    const isGeneric = mode === 'category' || mode === 'institutional';
    const brandStrength = isBrand && brandContext ? brandContext.strength : '';
    const brandSegment = isBrand && brandContext ? brandContext.segment : '';

    return {
      type: 'Reels / TikTok',
      title: isBrand ? `Reels: Marca ${name}` : `Reels: ${name}`,
      strategy_focus: isBrand ? `Destaque de Marca: ${name}` : angleData.label,
      persona_target: personaData.label,
      script: [
        {
          time: '0-3s',
          visual: 'Gancho Visual',
          text: `"${hook}"`,
          visual_prompt: isBrand
            ? `(Estilo Comercial) Expositor com produtos ${name} organizados. Logo da marca em destaque. Iluminação de loja profissional.`
            : `(Estilo Realista) ${catContext.visual_cue} Iluminação dramática focada.`,
        },
        {
          time: '3-8s',
          visual: isBrand ? 'Autoridade da Marca' : 'Problema / Contexto',
          text: isBrand
            ? `${name}: ${brandStrength}. Na Gama você encontra opções que trabalhamos de ${brandSegment}.`
            : isGeneric
              ? `Sua seção de ${name} precisa estar completa pra não perder venda.`
              : `O ${name} é item de giro certo. ${personaData.label}: ${personaData.desire}.`,
          visual_prompt: isBrand
            ? `(Close-up) Produtos ${name} em prateleira organizada. Variedade de itens da marca.`
            : isGeneric
              ? `(Plano Aberto) Prateleiras cheias de ${category}. Variedade de tamanhos.`
              : `(Close-up) Profissional usando o ${name} em contexto real.`,
        },
        {
          time: '8-13s',
          visual: 'Solução Gama',
          text: isBrand
            ? `Gama Distribuidora: distribuidor ${name} no ${region}. Estoque disponível, entrega ágil, atendimento B2B.`
            : `Na Gama, ${name} com entrega ágil em todo o ${region}. Opções que atendem sua necessidade, atendimento B2B.`,
          visual_prompt: `(Motion Graphics) Caminhão Gama em movimento. Mapa do ABC com pinos de entrega.`,
        },
        {
          time: '13-15s',
          visual: 'CTA Final',
          text: `${BrandBrain.getCTA()} Link na bio!`,
          visual_prompt: `(Texto 3D) Logo Gama sobre fundo azul marinho. Botão WhatsApp pulsando.`,
        },
      ],
      assets: {
        narration_text: `"${hook}" Na Gama você encontra ${isBrand ? `opções ${name} que trabalhamos` : name} com atendimento B2B e entrega ágil no ${region}. ${BrandBrain.getCTA()}`,
        image_prompts: [
          isBrand
            ? `[Capa] Composição de produtos ${name} (${brandSegment}) em fundo profissional. Logo da marca visível.`
            : `[Capa] Foto profissional de ${name} em ambiente de uso real, iluminação de estúdio.`,
          `[Estoque] Corredor de armazém organizado com caixas de ${category}.`,
          `[Lojista] ${personaData.label} sorrindo no balcão da loja, segurando produto.`,
        ],
        video_prompts: [
          `[B-Roll] ${catContext.visual_cue} em câmera lenta.`,
          `[Logística] Empilhadeira carregando paletes, time lapse.`,
        ],
      },
      caption: isBrand
        ? `🏷️ **${name}** na Gama Distribuidora\n\n${hook}\n\n${brandStrength}. Opções que trabalhamos disponíveis no atacado.\n\nEntrega ágil no ${region} | Atendimento B2B\n\n📍 ${catContext.keywords.join(' • ')}\n\n👉 Peça sua tabela no WhatsApp\n\n#GamaDistribuidora #${name.replace(/[\s-]+/g, '')} #B2B #Lojista #ABC`
        : `🎬 **${name}**\n\n${hook}\n\n${isGeneric ? `Temos opções de ${name} que costumamos indicar.` : `Garanta ${name} para sua loja.`}\n\nEntrega ágil no ${region} | Atendimento B2B\n\n📍 ${catContext.keywords.join(' • ')}\n\n👉 Link na bio ou chame no WhatsApp\n\n#GamaDistribuidora #B2B #${category.replace(/\s+/g, '')} #Lojista #ABC`,
    };
  }

  _generateCarrossel({ name, category, hook, catContext, region, angleData, personaData, isBrand, brandContext }) {
    const brandStrength = isBrand && brandContext ? brandContext.strength : '';
    return {
      type: 'Carrossel Instagram',
      title: isBrand ? `Carrossel: Marca ${name}` : `Carrossel: ${name}`,
      strategy_focus: isBrand ? `Destaque de Marca: ${name}` : angleData.label,
      persona_target: personaData.label,
      slides: [
        {
          slide: 1,
          text: hook,
          visual: `Foto impactante de ${name}. Texto grande e legível.`,
          note: 'Slide de gancho - precisa parar o scroll',
        },
        {
          slide: 2,
          text: `O problema: ${personaData.pain}`,
          visual: `Ilustração ou foto de situação-problema. Prateleira vazia, cliente esperando.`,
          note: 'Gerar identificação com a dor',
        },
        {
          slide: 3,
          text: `A solução: Gama Distribuidora tem ${name} com entrega ágil no ${region}.`,
          visual: `Foto do produto + logo Gama. Ambiente organizado de estoque.`,
          note: 'Apresentar a solução',
        },
        {
          slide: 4,
          text: `${catContext.keywords.join(' | ')}`,
          visual: `Grid com variações do produto ou itens da categoria ${category}.`,
          note: 'Mostrar variedade / autoridade',
        },
        {
          slide: 5,
          text: `${BrandBrain.getCTA()}\n📱 Chame no WhatsApp e peça sua tabela.`,
          visual: `Logo Gama + QR code para WhatsApp. Fundo azul marinho.`,
          note: 'CTA claro e direto',
        },
      ],
      assets: {
        narration_text: `${hook} A Gama tem ${name} com entrega ágil no ${region}. ${BrandBrain.getCTA()}`,
        image_prompts: [
          `[Slide 1] Foto de ${name} em fundo clean, tipografia bold sobreposta.`,
          `[Slide 2] Balcão de loja vazio, cliente decepcionado (estilo editorial).`,
          `[Slide 3] Produto chegando em caixa Gama. Lojista satisfeito.`,
          `[Slide 4] Grid com 4-6 produtos de ${category}, fundo neutro.`,
          `[Slide 5] Logo Gama em fundo azul, botão WhatsApp.`,
        ],
        video_prompts: [],
      },
      caption: isBrand
        ? `📸 Deslize e conheça a seleção *${name}* na Gama →\n\n${hook}\n\n${brandStrength}. Atacado com entrega ágil no ${region}.\n\n👉 Peça sua tabela no WhatsApp\n\n#GamaDistribuidora #${name.replace(/[\s-]+/g, '')} #B2B #Lojista`
        : `📸 Deslize pra ver como a Gama resolve o estoque de ${name} →\n\n${hook}\n\nEntrega ágil no ${region} | Atendimento B2B | Opções que atendem sua necessidade\n\n👉 Peça sua tabela no WhatsApp\n\n#GamaDistribuidora #Carrossel #${category.replace(/\s+/g, '')} #Lojista`,
    };
  }

  _generateStories({ name, category, catContext, region, angleData, personaData }) {
    // Stories baseados em trends replicáveis no nicho B2B
    const trendFormats = [
      {
        trend: 'Isso ou Aquilo',
        description: 'Enquete interativa comparando dois cenários',
        storySequence: [
          { type: 'text_poll', text: `Estoque de ${name}: compra na hora da necessidade OU mantém preventivo?`, poll: ['Na hora', 'Preventivo'], visual: `Fundo com produto ${name} de um lado, prateleira vazia do outro.` },
          { type: 'reveal', text: `Lojista esperto compra preventivo. E com a Gama, chega rápido no ${region}!`, visual: `Produto chegando. Logo Gama.` },
        ],
      },
      {
        trend: 'POV (Point of View)',
        description: 'Simular situação do dia a dia do lojista',
        storySequence: [
          { type: 'video_pov', text: `POV: seu cliente pede ${name} e você tem no estoque 😎`, visual: `Câmera subjetiva: mão pegando produto na prateleira, entregando ao cliente.` },
          { type: 'cta', text: `Quer ter sempre? Chame a Gama no Zap!`, visual: `Botão WhatsApp animado. Logo Gama.` },
        ],
      },
      {
        trend: 'Checklist do Dia',
        description: 'Lista de tarefas com checkmark animado',
        storySequence: [
          { type: 'checklist', text: `Checklist do lojista:\n✅ Conferir estoque de ${category}\n✅ Pedir reposição na Gama\n✅ Preço competitivo\n✅ Entrega ágil no ${region}`, visual: `Fundo com textura de papelão/estoque. Itens aparecendo um a um.` },
          { type: 'cta', text: `Falta completar? A Gama resolve. Link no perfil!`, visual: `Logo Gama + link.` },
        ],
      },
      {
        trend: 'Antes x Depois',
        description: 'Prateleira vazia vs. abastecida',
        storySequence: [
          { type: 'before_after', text: `ANTES: Prateleira vazia de ${name}`, visual: `Foto de prateleira vazia, iluminação triste.` },
          { type: 'before_after', text: `DEPOIS: Abastecida pela Gama!`, visual: `Mesma prateleira cheia, iluminação vibrante. Logo Gama no canto.` },
          { type: 'cta', text: `Quer esse resultado? ${BrandBrain.getCTA()}`, visual: `Botão de ação.` },
        ],
      },
      {
        trend: 'Mito x Verdade',
        description: 'Desfazer objeções comuns do lojista',
        storySequence: [
          { type: 'myth', text: `MITO: "Atacadista só vende em grande quantidade"`, visual: `Texto com X vermelho. Fundo escuro.` },
          { type: 'truth', text: `VERDADE: A Gama atende pedidos adequados ao seu porte. Atendimento personalizado B2B!`, visual: `Texto com ✅ verde. Foto de loja pequena abastecida.` },
          { type: 'cta', text: `Peça sua tabela sem compromisso!`, visual: `WhatsApp link.` },
        ],
      },
    ];

    const selectedTrend = pick(trendFormats);

    return {
      type: 'Stories Instagram',
      title: `Stories: ${name} (Trend: ${selectedTrend.trend})`,
      strategy_focus: angleData.label,
      persona_target: personaData.label,
      trend: selectedTrend.trend,
      trendDescription: selectedTrend.description,
      storySequence: selectedTrend.storySequence,
      assets: {
        narration_text: selectedTrend.storySequence.map(s => s.text).join(' | '),
        image_prompts: selectedTrend.storySequence.map((s, i) =>
          `[Story ${i + 1}] ${s.visual} (Formato vertical 9:16)`
        ),
        video_prompts: [
          `[Story animado] Transição rápida entre slides com efeito de swipe. ${catContext.visual_cue}`,
        ],
      },
      caption: `Story ${selectedTrend.trend} para ${name}. Interação + venda B2B.`,
    };
  }

  _generatePostEstatico({ name, category, hook, catContext, region, angleData, personaData, isBrand }) {
    return {
      type: 'Post Estático (Feed)',
      title: isBrand ? `Post: Marca ${name}` : `Post: ${name}`,
      strategy_focus: isBrand ? `Destaque de Marca: ${name}` : angleData.label,
      persona_target: personaData.label,
      layout: {
        headline: hook,
        subheadline: `${angleData.focus}`,
        bodyText: `${name} disponível na Gama Distribuidora. Atendimento B2B, opções que trabalhamos e entrega ágil no ${region}.`,
        cta: BrandBrain.getCTA(),
        hashtags: `#GamaDistribuidora #${category.replace(/\s+/g, '')} #B2B #ABC #Lojista`,
      },
      assets: {
        narration_text: `${hook} ${name} na Gama. ${BrandBrain.getCTA()}`,
        image_prompts: [
          `[Post Feed 1:1] Foto de ${name} em fundo clean. Logo Gama no canto. Texto: "${hook}" em tipografia bold.`,
          `[Alternativo] Composição flat lay de produtos ${category} com paleta azul marinho e laranja.`,
        ],
        video_prompts: [],
      },
      caption: `📌 **${name}**\n\n${hook}\n\n${catContext.keywords.join(' | ')}\n\nEntrega ágil no ${region} | Atendimento B2B\n\n👉 ${BrandBrain.getCTA()}\n\n#GamaDistribuidora #${category.replace(/\s+/g, '')} #Lojista`,
    };
  }

  _generateBannerSite({ name, category, hook, region, angleData, personaData, isBrand }) {
    return {
      type: 'Banner de Site',
      title: isBrand ? `Banner: Marca ${name}` : `Banner: ${name}`,
      strategy_focus: isBrand ? `Destaque de Marca: ${name}` : angleData.label,
      persona_target: personaData.label,
      bannerSpecs: {
        dimensions: '1200x400px (desktop) / 600x600px (mobile)',
        headline: hook,
        subheadline: `Seleção de ${category} | Entrega ágil no ${region}`,
        cta_button: 'Pedir Tabela de Preços',
        cta_link: 'WhatsApp ou página de contato',
      },
      assets: {
        narration_text: `${hook} ${name} na Gama. Peça sua tabela.`,
        image_prompts: [
          `[Banner Desktop 1200x400] Foto de ${name} à esquerda, texto "${hook}" à direita. Fundo gradient azul marinho para branco. Logo Gama. Botão laranja "Pedir Tabela".`,
          `[Banner Mobile 600x600] ${name} centralizado. Texto curto. Botão CTA grande.`,
        ],
        video_prompts: [],
      },
      caption: '',
    };
  }

  _generateWhatsApp({ name, category, hook, region, angleData, personaData, isBrand, brandContext }) {
    const brandStrength = isBrand && brandContext ? brandContext.strength : '';
    const messages = isBrand ? {
      abertura: `Olá! 👋\n\nAqui é da *Gama Distribuidora*.\n\nTrabalha com *${name}*? Temos opções que trabalhamos no atacado!\n\n${brandStrength}.`,
      proposta: `🏷️ *Marca ${name}*\n\n✅ Opções que trabalhamos no atacado\n✅ Entrega ágil no ${region}\n✅ Atendimento B2B personalizado\n✅ Preço competitivo\n\nQuer receber a tabela ${name}?`,
      followup: `Oi! Tudo certo? 😊\n\nPassando para lembrar que temos *${name}* disponível para pronta-entrega.\n\nPrecisa de reposição? A gente resolve rápido!\n\n📱 Responda aqui que enviamos a tabela.`,
      reativacao: `Faz tempo que não nos falamos! 🤝\n\nA Gama continua sendo distribuidor *${name}* no ${region}.\n\nEntrega ágil, atendimento que resolve.\n\nBora conversar? 💬`,
    } : {
      abertura: `Olá! 👋\n\nAqui é da *Gama Distribuidora*.\n\n${hook}\n\nVocê já conferiu as opções que temos de *${category}*?`,
      proposta: `📦 *${name}*\n\n✅ Opções que trabalhamos\n✅ Entrega ágil no ${region}\n✅ Atendimento B2B personalizado\n✅ Preço de atacado\n\nQuer receber a tabela atualizada?`,
      followup: `Oi! Tudo certo? 😊\n\nPassando para lembrar que temos *${name}* disponível para pronta-entrega.\n\nPrecisa de reposição? A gente resolve rápido!\n\n📱 Responda aqui que enviamos a tabela.`,
      reativacao: `Faz tempo que não nos falamos! 🤝\n\nA Gama continua com opções de *${category}* que atendem sua loja.\n\nEntrega ágil no ${region}, atendimento que resolve.\n\nBora conversar? 💬`,
    };

    return {
      type: 'WhatsApp B2B',
      title: isBrand ? `WhatsApp: Marca ${name}` : `WhatsApp: ${name}`,
      strategy_focus: isBrand ? `Destaque de Marca: ${name}` : angleData.label,
      persona_target: personaData.label,
      messages,
      assets: {
        narration_text: messages.proposta,
        image_prompts: [
          `[Card WhatsApp] Miniatura de ${name} com preço/descrição. Visual limpo para mobile.`,
        ],
        video_prompts: [],
      },
      caption: '',
    };
  }

  async generateQuickImage(request) {
    const { name, category, angle, persona } = request;
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return {
      id: uid,
      type: 'quick_image',
      format: 'quick_image',
      title: `Quick Image: ${name}`,
      product: name,
      image_prompt: `Fotografia profissional de ${name} (categoria ${category}) em ambiente de loja de tintas. Fundo gradiente azul marinho (#1E3A5F) para laranja coral (#E85D3B). Logo Gama Distribuidora no canto. Estilo B2B profissional, iluminação de estúdio, alta qualidade.`,
      caption: `${name} disponível na Gama Distribuidora. Fale com nosso consultor!`,
      hashtags: '#GamaDistribuidora #DistribuidorCoral #Tintas #B2B',
      format_hint: 'stories',
      angle,
      persona,
      generatedAt: Date.now(),
      provider: this.name,
    };
  }

  async generateQuickVideo(request) {
    const { name, category, angle, persona } = request;
    const uid = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return {
      id: uid,
      type: 'quick_video',
      format: 'quick_video',
      title: `Quick Video: ${name}`,
      product: name,
      video_idea: `Vídeo rápido mostrando ${name} em uso profissional. Pintor aplicando o produto com resultado antes/depois. CTA para WhatsApp da Gama.`,
      visual_prompts: [
        `Cena 1: Close-up de ${name} sendo aberto/preparado. Ambiente de obra profissional. Cores azul marinho e laranja coral na identidade visual.`,
        `Cena 2: Aplicação do produto por pintor profissional. Movimento fluido, textura sendo revelada. Ângulo que mostra técnica.`,
        `Cena 3: Resultado final com logo Gama Distribuidora. Texto "Fale com nosso consultor" e QR code WhatsApp. Fundo azul marinho.`,
      ],
      duration_hint: '15s',
      format_hint: 'reels',
      caption: `${name} na Gama Distribuidora. 20+ anos como distribuidor oficial Coral!`,
      angle,
      persona,
      generatedAt: Date.now(),
      provider: this.name,
    };
  }
}
