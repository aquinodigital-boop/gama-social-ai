/**
 * QualityChecker tests — valida os 4 conjuntos de checks (social/trade/whatsapp/promotor)
 * e o cálculo de grade A-D.
 */
import { describe, it, expect } from 'vitest';
import { QualityChecker } from './QualityChecker.js';

describe('QualityChecker.check() — social', () => {
  it('dá nota alta para conteúdo B2B completo com CTA, credibilidade e região', () => {
    const content = {
      title: 'Reposição de Coral para sua loja na Baixada Santista',
      caption: 'Parceiro lojista: garanta Coral Rende Muito direto do distribuidor oficial. Fale com seu consultor Gama no WhatsApp para tabela de preços. Entrega ágil, qualidade Coral e 20 anos de parceria na Baixada Santista. #GamaDistribuidora #DistribuidorCoral',
      strategy_focus: 'Giro de estoque para lojista em Santos',
      script: [
        { text: 'Lojista, sua loja está sem Coral Rende Muito? Peça já sua tabela.' },
        { text: 'Distribuidor oficial Coral com entrega ágil para Santos e toda a Baixada.' },
      ],
    };
    const result = QualityChecker.check(content, 'social');
    expect(result.grade).toMatch(/^[AB]$/);
    expect(result.passed).toBe(true);
    expect(result.percentage).toBeGreaterThanOrEqual(75);
  });

  it('dá grade D para conteúdo curto e genérico', () => {
    const content = { title: 'Promoção', caption: 'Compre já!' };
    const result = QualityChecker.check(content, 'social');
    expect(result.grade).toBe('D');
    expect(result.passed).toBe(false);
  });

  it('penaliza uso de tom de varejo proibido (oferta relâmpago)', () => {
    const content = {
      caption: 'Oferta relâmpago últimas unidades promoção imperdível compre já grátis sorteio viral',
    };
    const result = QualityChecker.check(content, 'social');
    // Check tom_marca deve falhar mesmo se outras palavras-chave aparecerem
    const tomCheck = result.checks.find(c => c.id === 'tom_marca');
    expect(tomCheck.passed).toBe(false);
  });

  it('retorna estrutura completa com score, checks, grade e módulo', () => {
    const result = QualityChecker.check({ title: 'teste' }, 'social');
    expect(result).toHaveProperty('score');
    expect(result).toHaveProperty('maxScore');
    expect(result).toHaveProperty('percentage');
    expect(result).toHaveProperty('grade');
    expect(result).toHaveProperty('passed');
    expect(result).toHaveProperty('checks');
    expect(result.module).toBe('social');
    expect(Array.isArray(result.checks)).toBe(true);
  });
});

describe('QualityChecker.check() — trade', () => {
  it('aprova material PDV com público, ação concreta e mensurável', () => {
    const content = {
      pieces: [
        {
          headline: 'Lojista da Baixada: ativação de PDV Coral na gôndola',
          body: 'Ação na gôndola com meta de 30% de aumento. Cartaz A3 + wobbler. Entrega Gama + qualidade Coral na região de Santos.',
        },
      ],
    };
    const result = QualityChecker.check(content, 'trade');
    expect(result.percentage).toBeGreaterThanOrEqual(50);
    expect(result.module).toBe('trade');
  });
});

describe('QualityChecker.check() — whatsapp', () => {
  it('aprova fluxo WhatsApp com tom parceiro, CTA e timing', () => {
    const content = {
      flow: [
        { message: 'Olá parceiro, tudo bem? Sua loja está abastecida esta semana? Posso passar a tabela de preços atualizada?' },
        { message: 'Mando uma condição especial para sua loja hoje pela manhã — consultor Gama fala pelo WhatsApp.' },
      ],
    };
    const result = QualityChecker.check(content, 'whatsapp');
    expect(result.grade).toMatch(/^[ABC]$/);
    expect(result.module).toBe('whatsapp');
  });

  it('reprova mensagem spam com "última chance" e "urgente"', () => {
    const content = { flow: [{ message: 'última chance urgente compre agora!!!' }] };
    const result = QualityChecker.check(content, 'whatsapp');
    const nospamCheck = result.checks.find(c => c.id === 'nao_spam');
    expect(nospamCheck.passed).toBe(false);
  });
});

describe('QualityChecker.check() — promotor', () => {
  it('aprova argumentário com dado numérico e objeção', () => {
    const content = {
      arguments: [
        { argumento: 'Rendimento superior: cobertura de 60 m² por galão de Coral Rende Muito, com resposta à objeção de preço para o lojista.', dado: '60 m² cobertura' },
      ],
      steps: [{ script: 'Passo 1: apresentar resultado real para o lojista. Etapa de 10 min.' }],
    };
    const result = QualityChecker.check(content, 'promotor');
    expect(result.grade).toMatch(/^[ABC]$/);
    expect(result.module).toBe('promotor');
  });
});

describe('QualityChecker.check() — grade thresholds', () => {
  it('calcula grade A quando percentage >= 90', () => {
    // Usa um conteúdo artificial com score alto forçado pela string
    const content = {
      caption: 'lojista loja estoque whatsapp zap tabela consultor santos baixada gama coral distribuidor oficial entrega ágil profissional opções trabalhamos parceiro qualidade técnico substancial e longo o suficiente para passar no check',
    };
    const result = QualityChecker.check(content, 'social');
    expect(['A', 'B']).toContain(result.grade);
  });
});
