/**
 * ContentTemplates.js
 * Generators for social media formats using Contextual Intelligence.
 * 
 * Updates:
 * - Uses CategoryExpert for specific cues.
 * - Uses BrandExpert for institutional posts.
 * - All Prompts in Portuguese.
 */

import { BrandBrain } from './BrandBrain.js';
import { CategoryExpert } from './marketing/CategoryExpert.js';
import { BrandExpert } from './marketing/BrandExpert.js';

export const ContentTemplates = {

    /**
     * GENERATE PRODUCT / CATEGORY POST
     * Uses CategoryExpert to inject intelligence.
     */
    generateProductScript: (adapterInput) => {
        // Intelligence Lookup
        const categoryContext = CategoryExpert.get(adapterInput.category);
        const region = BrandBrain.regionalContext.region;
        const isGeneric = adapterInput.is_generic; // If true, we are selling the Whole Category

        const productName = adapterInput.name;

        // Hooks & Angles (If no strategy passed, pick random)
        const expertHook = categoryContext.hook;

        return {
            type: isGeneric ? "Destaque de Categoria" : "Destaque de Produto",
            title: isGeneric ? `Seleção: ${productName}` : `Produto: ${productName}`,
            strategy_focus: `Autoridade em ${adapterInput.category}`,

            // SCRIPT
            script: [
                {
                    time: "0-3s",
                    visual: "Gancho Visual",
                    text: `"${expertHook}"`,
                    visual_prompt: `(Estilo Realista) ${categoryContext.visual_cue} Iluminação dramática focada no produto.`
                },
                {
                    time: "3-8s",
                    visual: "Demonstração / Contexto",
                    text: isGeneric
                        ? `A Labor tem opções de ${productName} que trabalhamos para sua loja.`
                        : `O ${productName} é item de giro certo. Qualidade que seu cliente confia.`,
                    visual_prompt: isGeneric
                        ? `(Plano Aberto) Prateleiras de estoque cheias de itens da categoria ${adapterInput.category}, variedade de cores e tamanhos.`
                        : `(Close-up) Mãos de um profissional usando o ${productName} em uma obra real.`
                },
                {
                    time: "8-15s",
                    visual: "Logística & Labor",
                    text: `Abasteça seu estoque com entrega rápida em todo o ${region}.`,
                    visual_prompt: `(Motion Graphics) Caminhão baú branco com logo da Labor em movimento rápido numa avenida do ABC.`
                },
                {
                    time: "15-20s",
                    visual: "Chamada para Ação",
                    text: "Não perca venda. Clique no link e peça agora!",
                    visual_prompt: `(Texto 3D) Logo da Labor Atacadista sobre fundo azul corporativo, com botão 'ZAP' pulsando.`
                }
            ],

            // ASSETS (For Editors/Designers)
            assets: {
                narration_text: `"${expertHook}" Aqui na Labor você encontra ${productName} com o melhor preço e entrega rápida no ${region}. Não deixe seu cliente na mão. Link na bio!`,

                // Translated Prompts
                image_prompts: [
                    `[Capa do Vídeo] Foto profissional de ${productName} em ambiente de uso real (obra/casa), iluminação de estúdio.`,
                    `[Estoque] Corredor de armazém logístico organizado, caixas de ${adapterInput.category}, profundidade de campo.`,
                    `[Lojista] Homem de 40 anos, dono de loja de material de construção, sorrindo e segurando o produto com confiança.`,
                    `[Conceito] ${categoryContext.keywords.join(", ")} representados em uma composição visual 3D.`
                ],

                video_prompts: [
                    `[B-Roll] ${categoryContext.visual_cue} em câmera lenta (slow motion).`,
                    `[Logística] Time lapse de empilhadeira carregando paletes da Labor.`
                ]
            },

            caption: `📦 **${isGeneric ? 'Renove seu Estoque' : 'Item Essencial'}**\n\n${expertHook}\n\n${isGeneric ? `Sua seção de ${productName} precisa estar completa.` : `Garanta ${productName} agora mesmo.`}\n\nA Labor entrega no ${region} com a agilidade que você precisa.\n\n📍 ${categoryContext.keywords.join(" • ")}\n\n#LaborAtacadista #B2B #${adapterInput.category.replace(/\s/g, '')} #Lojista`
        };
    },

    /**
     * GENERATE INSTITUTIONAL POST
     * Uses BrandExpert.
     */
    generateInstitutionalScript: (themeId) => {
        const script = BrandExpert.generateInstitutionalScript(themeId);

        return {
            type: "Institucional / Marca",
            title: script.title,
            strategy_focus: "Fortalecimento de Marca & Diferenciação",

            script: [
                { time: "0-5s", visual: "Gancho (Dor)", text: script.hook, visual_prompt: "Rosto preocupado de um lojista olhando para prateleira vazia (Cinematográfico)." },
                { time: "5-12s", visual: "Solução Labor", text: script.body, visual_prompt: script.visual_cue },
                { time: "12-15s", visual: "CTA", text: script.cta, visual_prompt: "Equipe de vendas da Labor reunida sorrindo, uniformizados." }
            ],

            assets: {
                narration_text: `${script.hook} ${script.body} ${script.cta}`,
                image_prompts: [
                    `Caminhão de entrega Labor Atacadista em estrada ensolarada.`,
                    `Centro de distribuição amplo, moderno e organizado.`,
                    `Aperto de mão business focus, close-up.`
                ],
                video_prompts: [
                    `Drone sobrevoando galpão logístico no ABC.`,
                    `Timelapse de carregamento de caminhão.`
                ]
            },

            caption: `🏢 **${script.title}**\n\n${script.body}\n\n👇 ${script.cta}\n\n${script.hashtags}`
        };
    }
};
