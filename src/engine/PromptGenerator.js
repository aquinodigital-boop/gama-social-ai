/**
 * PromptGenerator.js — Gama Distribuidora
 * Prompts em PT-BR com referência ao mascote oficial.
 * Mascote: lata de tinta azul metálica 3D, boné laranja Gama,
 * braços metálicos articulados, botas azuis, expressão confiante.
 * Logo Gama + Coral no corpo.
 */

const MASCOTE_DESC = `mascote oficial da Gama Distribuidora: lata de tinta cilíndrica azul metálico brilhante, rosto 3D com expressão confiante, boné laranja com logo Gama, braços metálicos articulados com juntas laranja, botas de couro azul marinho com cadarço, logo "Gama Distribuidora | Coral" no corpo. Estilo render 3D Pixar, iluminação de estúdio profissional.`;

const FORMAT_SPECS = {
  reels:         { aspect: '9:16', resolution: '1080x1920', notes: 'vertical, mobile, texto em destaque' },
  carrossel:     { aspect: '1:1',  resolution: '1080x1080', notes: 'quadrado, layout limpo, texto legível' },
  stories:       { aspect: '9:16', resolution: '1080x1920', notes: 'vertical, tela cheia, elementos interativos' },
  post_estatico: { aspect: '1:1',  resolution: '1080x1080', notes: 'quadrado, alto contraste, cores da marca' },
  banner_site:   { aspect: '3:1',  resolution: '1200x400',  notes: 'horizontal, otimizado desktop, botão CTA' },
  whatsapp:      { aspect: '1:1',  resolution: '600x600',   notes: 'compacto, mobile, carregamento rápido' },
};

export const PromptGenerator = {

  generate({ name, category, format = 'reels', catContext }) {
    const spec = FORMAT_SPECS[format] || FORMAT_SPECS.reels;
    const keywords = catContext?.keywords || ['qualidade', 'distribuidor oficial'];
    const visual = catContext?.visual_cue || 'produto em ambiente profissional';

    return {
      studio: `Fotografia profissional de produto: ${name}. Iluminação de estúdio, sombras suaves, fundo branco clean. Produto centralizado, formato ${spec.aspect}. Categoria: ${category}. Ultra detalhado, qualidade comercial.`,
      lifestyle: `Foto realista: ${name} em loja de tintas no Brasil. Lojista confiante no balcão. Prateleiras com latas Coral ao fundo. Iluminação natural, formato ${spec.aspect}.`,
      institutional: `Fotografia corporativa Gama Distribuidora: armazém organizado com produtos ${category}. Paleta azul marinho e laranja da Gama. Grande SP e Baixada Santista. Formato ${spec.aspect}.`,
      mascote: `${MASCOTE_DESC} Pose: segurando uma lata de ${name} com polegar para cima. Fundo gradiente azul marinho. Formato ${spec.aspect}.`,
      format_spec: spec,
    };
  },

  generateFull({ name, category, catContext }) {
    const visual = catContext?.visual_cue || `${name} em ambiente profissional`;
    const keywords = catContext?.keywords || ['qualidade', 'distribuidor oficial Coral'];
    const packs = {};

    Object.entries(FORMAT_SPECS).forEach(([fmt, spec]) => {
      packs[fmt] = {
        format: fmt,
        spec,
        prompts: {
          studio: {
            label: '📷 Foto de Estúdio',
            prompt_pt: `Fotografia hiper-realista de produto: ${name}. Iluminação de estúdio profissional, sombras suaves, fundo branco clean. Produto centralizado. Formato ${spec.aspect}, ${spec.resolution}. Categoria: ${category}. Ultra detalhado, qualidade 8K.`,
          },
          lifestyle: {
            label: '🏪 Lifestyle B2B (Loja)',
            prompt_pt: `Foto realista: ${name} em loja de tintas brasileira. Lojista (40 anos, confiante) manuseando o produto no balcão. Prateleiras com latas Coral ao fundo. Iluminação natural quente. Formato ${spec.aspect}. Cena autêntica.`,
          },
          institutional: {
            label: '🏢 Institucional Gama',
            prompt_pt: `Fotografia corporativa Gama Distribuidora — distribuidora oficial Coral/AkzoNobel. Armazém moderno com produtos ${category} organizados. Cores azul marinho e laranja. Baixada Santista / Grande SP. Iluminação profissional. Formato ${spec.aspect}.`,
          },
          mascote: {
            label: '🤖 Com Mascote Gama',
            prompt_pt: `${MASCOTE_DESC} Cenário: ${visual}. O mascote está apresentando o produto ${name} com entusiasmo. Cores predominantes: azul marinho e laranja. Fundo clean com elementos da marca Gama. Formato ${spec.aspect}.`,
          },
          coral_product: {
            label: '🎨 Lata Coral em Destaque',
            prompt_pt: `Foto publicitária premium: lata ${name}. Lata cilíndrica metálica azul com logo Coral colorido. Iluminação dramática lateral, reflexo suave na superfície. Fundo gradiente azul escuro. Formato ${spec.aspect}. Qualidade comercial premium.`,
          },
          video: {
            label: '🎬 Vídeo / B-Roll',
            prompt_pt: `Filmagem B-roll cinematográfica: ${visual}. Câmera lenta. Formato ${spec.aspect}. Gradação de cor em azul marinho e laranja. Profundidade de campo rasa. Loja de tintas brasileira.`,
          },
        },
      };
    });

    return { name, category, keywords, packs, generatedAt: Date.now() };
  },
};
