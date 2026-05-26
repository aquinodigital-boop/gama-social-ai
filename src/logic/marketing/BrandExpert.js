/**
 * BrandExpert.js — Gama Distribuidora
 * Temas institucionais e conteúdo de marca.
 *
 * HARD: área de atuação = Grande São Paulo APENAS.
 * Banido: Santos, Baixada Santista, litoral, Reconquista Santos.
 */
import { BrandBrain } from '../BrandBrain';

export const BrandExpert = {
    themes: [
        {
            id: 'coral_parceiro',
            label: '🎨 Distribuidor Coral',
            title: 'Parceiro Oficial Coral',
            context: 'Destaque o status de distribuidor OFICIAL Coral/AkzoNobel. Expertise, portfólio das linhas, suporte técnico.'
        },
        {
            id: 'expertise_coral',
            label: '🧠 Expertise Coral',
            title: 'Domínio Técnico das Linhas',
            context: 'Posicionar a Gama como referência técnica em Coral. Quem entende Coralar, Decora, Sparlack, Mactra. Suporte de aplicação.'
        },
        {
            id: 'programa_cl',
            label: '⭐ Programa CL',
            title: 'Cresça com a Gama',
            context: 'Sistema de níveis CL: quanto mais o lojista investe no mix Coral, mais a Gama investe na loja dele. Fachada, benefícios, parceria.'
        },
        {
            id: 'logistica',
            label: '🚛 Logística Grande SP',
            title: 'Cobertura Grande São Paulo',
            context: 'Entrega ágil em toda Grande SP — Capital, ABC, Zona Oeste, Alphaville. Abastecimento confiável.'
        },
        {
            id: 'aniversario',
            label: '🏅 20 Anos de Mercado',
            title: 'Tradição que Abastece',
            context: '20+ anos como parceiro Coral. Solidez, confiança, história com os lojistas.'
        },
        {
            id: 'parceria_humana',
            label: '🤝 Parceria & Confiança',
            title: 'O Consultor que Visita sua Loja',
            context: 'Relacionamento humano, consultor dedicado, atendimento próximo. O que diferencia da grande indústria distante.'
        }
    ],

    generateInstitutionalScript: (themeId) => {
        const theme = BrandExpert.themes.find(t => t.id === themeId) || BrandExpert.themes[0];

        if (theme.id === 'coral_parceiro') {
            return {
                title: 'Distribuidor Oficial Coral na Grande SP',
                hook: `Tem distribuidora Coral perto de você — e ela já tem 20 anos de história.`,
                body: `A Gama é parceira OFICIAL Coral/AkzoNobel na Grande São Paulo. Isso significa acesso às linhas que trabalhamos: Coralar, Decora, Proteção Sol & Chuva, Sparlack e mais. Não é só entregar produto — é garantir que sua loja tenha o que o cliente final precisa.`,
                visual_cue: `Latas Coral alinhadas em prateleiras profissionais. Logo Gama + logo Coral lado a lado. Ambiente de distribuição organizado.`,
                cta: `Quer saber o que trabalhamos? Fale com nosso consultor.`,
                hashtags: `#GamaDistribuidora #DistribuidorCoral #AkzoNobel #TintasCoral`
            };
        }

        if (theme.id === 'expertise_coral') {
            return {
                title: 'Quem Entende de Coral na Grande SP',
                hook: `Sua dúvida técnica sobre Coralar, Sparlack ou Mactra tem resposta — e ela mora aqui.`,
                body: `A Gama é o distribuidor OFICIAL Coral que combina os 20 anos no mercado com domínio técnico das linhas. Sabemos qual produto cabe em qual obra. Coralar pra grandes áreas, Decora pra acabamento fino, Sparlack pra madeira, Mactra pra esmaltes industriais. Isso é expertise — não é só estoque.`,
                visual_cue: `Consultor Gama explicando lata Coral para lojista no balcão. Lata Sparlack em destaque ao lado. Iluminação técnica.`,
                cta: `Tem dúvida técnica? Chama no Zap, a gente resolve.`,
                hashtags: `#ExpertiseCoral #GamaDistribuidora #DistribuidorOficialCoral`
            };
        }

        if (theme.id === 'programa_cl') {
            return {
                title: 'O Programa que Transforma sua Loja',
                hook: `E se sua loja virasse uma vitrine Coral? Isso é o Programa CL.`,
                body: `Quanto mais você investe no mix Coral — Tinting, Sparlack, Mactra — mais você sobe de nível. E conforme você evolui, a Gama e a Coral investem na transformação da sua loja. Fachada, comunicação visual, exposição de produtos. Suas lojas parceiras já entenderam isso.`,
                visual_cue: `Antes e depois: fachada de loja simples vs. loja transformada com identidade Coral. Placas, vitrine, comunicação visual profissional.`,
                cta: `Quer saber em qual nível você está? Pergunte pro seu consultor.`,
                hashtags: `#ProgramaCL #TransformeSuaLoja #DistribuidorCoral #GamaDistribuidora`
            };
        }

        if (theme.id === 'logistica') {
            return {
                title: 'Cobertura Grande SP — A Gama Chega',
                hook: `Cansado de esperar tinta enquanto a obra não para?`,
                body: `A Gama atende toda a Grande São Paulo — Capital, ABC, Zona Oeste, Alphaville. Pediu, a gente resolve. Nosso foco é garantir que sua loja nunca perca uma venda por falta de produto Coral no estoque. Atendimento ágil, entrega confiável.`,
                visual_cue: `Mapa da Grande SP com rota marcada. Caminhão Gama em movimento em via metropolitana.`,
                cta: `Consulte disponibilidade de estoque agora.`,
                hashtags: `#GamaDistribuidora #EntregaGrandeSP #LogisticaConfiavel #DistribuidorCoral`
            };
        }

        if (theme.id === 'parceria_humana') {
            return {
                title: 'O Consultor que Visita sua Loja',
                hook: `Atendimento por bot? Aqui não. Aqui tem consultor que entra na sua loja.`,
                body: `A Gama tem um diferencial que não cabe em catálogo: o consultor dedicado. A gente visita, ouve, ajusta o pedido junto, sugere mix, resolve quando dá ruim. 20 anos fazendo isso com lojistas da Grande SP. Tinta é commodity — relacionamento, não.`,
                visual_cue: `Consultor Gama sentado com lojista no balcão, conversa próxima, prateleira Coral ao fundo.`,
                cta: `Quer agendar uma visita? Chame no WhatsApp.`,
                hashtags: `#ParceriaGama #ConsultorDedicado #DistribuidorCoral`
            };
        }

        // aniversario
        return {
            title: '20 Anos Distribuindo Qualidade',
            hook: `20 anos não é tempo — é história com cada lojista parceiro.`,
            body: `A Gama chegou nessa marca com um propósito que nunca mudou: ser o distribuidor que resolve, que aparece, que mantém o estoque da sua loja abastecido com Coral e marcas que você confia. Obrigado a cada parceiro que fez essa história.`,
            visual_cue: `Colagem de fotos da história da Gama. Evento de 20 anos. Logo comemorativo. Clima celebrativo e profissional.`,
            cta: `Faz parte dessa história? Conta pra gente.`,
            hashtags: `#Gama20Anos #GamaDistribuidora #DistribuidorCoral`
        };
    }
};
