/**
 * BrandExpert.js — Gama Distribuidora
 * Temas institucionais e conteúdo de marca.
 */
import { BrandBrain } from '../BrandBrain';

export const BrandExpert = {
    themes: [
        {
            id: 'coral_parceiro',
            label: '🎨 Distribuidor Coral',
            title: 'Parceiro Oficial Coral',
            context: 'Destaque o status de distribuidor oficial Coral/AkzoNobel. Expertise, portfólio completo, suporte técnico.'
        },
        {
            id: 'reconquista',
            label: '🏆 Projeto Reconquista Santos',
            title: 'De Volta em Santos',
            context: 'Retomada da presença em Santos. Relacionamento com lojistas. Diferencial vs. Suvinil.'
        },
        {
            id: 'programa_cl',
            label: '⭐ Programa CL',
            title: 'Cresça com a Gama',
            context: 'Sistema de níveis CL: quanto mais o lojista investe no mix Coral, mais a Gama investe na loja dele. Fachada, benefícios, parceria.'
        },
        {
            id: 'logistica',
            label: '🚛 Logística Regional',
            title: 'Grande SP e Baixada Santista',
            context: 'Entrega ágil nas duas regiões. Abastecimento confiável. Não deixar loja sem estoque.'
        },
        {
            id: 'aniversario',
            label: '🏅 20 Anos de Mercado',
            title: 'Tradição que Abastece',
            context: '20+ anos como parceiro Coral. Solidez, confiança, história com os lojistas.'
        }
    ],

    generateInstitutionalScript: (themeId) => {
        const theme = BrandExpert.themes.find(t => t.id === themeId) || BrandExpert.themes[0];

        if (theme.id === 'coral_parceiro') {
            return {
                title: 'Distribuidor Oficial Coral na sua Região',
                hook: `Tem distribuidora Coral perto de você — e ela já tem 20 anos de história.`,
                body: `A Gama é parceira oficial Coral/AkzoNobel na Grande São Paulo e Baixada Santista. Isso significa acesso às melhores linhas: Coralar, Decora, Proteção Sol & Chuva, Sparlack e mais. Não é só entregar produto — é garantir que você tenha o que seu cliente precisa.`,
                visual_cue: `Latas Coral alinhadas em prateleiras profissionais. Logo Gama + logo Coral lado a lado. Ambiente de distribuição organizado.`,
                cta: `Quer saber o que trabalhamos? Fale com nosso consultor.`,
                hashtags: `#GamaDistribuidora #DistribuidorCoral #AkzoNobel #TintasCoral`
            };
        }

        if (theme.id === 'reconquista') {
            return {
                title: 'Gama está de volta em Santos',
                hook: `Se você é lojista em Santos — a gente tem uma conversa pra ter.`,
                body: `A Gama está reforçando sua presença na Baixada Santista. Sabemos que a concorrência é forte por lá. Por isso trouxemos o que importa: Coral nas prateleiras, preço competitivo e um consultor que visita sua loja. Vamos reconquistar esse mercado juntos?`,
                visual_cue: `Vista de Santos ao fundo, primeiro plano: consultor Gama entregando pedido para lojista. Aperto de mão.`,
                cta: `Lojista de Santos? Chame no Zap, queremos visitar você.`,
                hashtags: `#GamaEmSantos #LojistaSantos #BaixadaSantista #TintaCoral`
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
                title: 'De São Paulo ao Litoral — a Gama Chega',
                hook: `Cansado de esperar tinta enquanto a obra não para?`,
                body: `A Gama atende a Grande São Paulo e a Baixada Santista. Pediu, a gente resolve. Nosso foco é garantir que você nunca perca uma venda por falta de produto Coral no estoque. Atendimento ágil, entrega confiável.`,
                visual_cue: `Mapa da Grande SP + litoral com rota marcada. Caminhão em movimento na Anchieta ou Imigrantes.`,
                cta: `Consulte disponibilidade de estoque agora.`,
                hashtags: `#GamaDistribuidora #EntregaSP #BaixadaSantista #LogisticaConfiavel`
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
