/**
 * ObjectionBank.js — Banco de objeções para equipe comercial Gama Distribuidora
 * Respostas prontas para as objeções mais comuns dos lojistas.
 */

const OBJECTIONS = [
  // ── PREÇO ──
  {
    id: 'preco-01',
    tipo: 'preco',
    tipoLabel: 'Preço',
    objecao: '"Coral é mais caro que Suvinil"',
    resposta: 'O custo por m² pintado da Coral é menor. Rende Muito cobre até 120m²/lata (2 demãos). Suvinil Standard cobre ~80m². Seu cliente gasta menos tinta e volta satisfeito.',
    dados_apoio: 'Rendimento Coral Rende Muito: 120m²/lata (2 demãos) vs Suvinil Standard: ~80m²/lata',
    pergunta_followup: 'Quer que eu faça a conta do custo por m² com os produtos que você mais vende?',
  },
  {
    id: 'preco-02',
    tipo: 'preco',
    tipoLabel: 'Preço',
    objecao: '"O preço de tabela é alto, outro distribuidor dá mais desconto"',
    resposta: 'Nosso preço inclui entrega ágil (24h), consultor dedicado e suporte técnico. Distribuidores mais baratos geralmente não oferecem esse nível de serviço. Quanto custa uma venda perdida por falta de estoque?',
    dados_apoio: 'Entrega em até 24h na região | Consultor dedicado | Suporte pós-venda',
    pergunta_followup: 'Posso montar uma proposta personalizada considerando seu volume mensal?',
  },
  {
    id: 'preco-03',
    tipo: 'preco',
    tipoLabel: 'Preço',
    objecao: '"Meu cliente só quer o mais barato"',
    resposta: 'Coral tem linhas para todos os bolsos. Coralar Econômica compete em preço, e Rende Muito ganha no custo-benefício. O pintor que já usou Coral não quer voltar atrás.',
    dados_apoio: 'Linha Coralar: entrada | Rende Muito: custo-benefício | Decora: premium',
    pergunta_followup: 'Que tal colocar as 3 faixas na gôndola e deixar o cliente escolher?',
  },

  // ── ENTREGA ──
  {
    id: 'entrega-01',
    tipo: 'entrega',
    tipoLabel: 'Entrega',
    objecao: '"Outro distribuidor entrega mais rápido"',
    resposta: 'A Gama entrega em até 24h na Baixada Santista e região do ABC. Temos estoque local e frota própria. Se outro promete mais rápido, pergunte se mantém no período de pico.',
    dados_apoio: 'Frota própria | Estoque local | Entrega em até 24h',
    pergunta_followup: 'Qual sua frequência de pedido? Posso sugerir uma rota fixa pro seu bairro.',
  },
  {
    id: 'entrega-02',
    tipo: 'entrega',
    tipoLabel: 'Entrega',
    objecao: '"Preciso de entrega urgente e vocês não atendem"',
    resposta: 'Temos esquema de entrega expressa para parceiros ativos. Fale com seu consultor — pedidos até 11h geralmente saem no mesmo dia.',
    dados_apoio: 'Pedidos até 11h = entrega no mesmo dia (sujeito a disponibilidade)',
    pergunta_followup: 'Quer cadastrar sua loja na rota prioritária?',
  },

  // ── MIX / MARCA ──
  {
    id: 'mix-01',
    tipo: 'mix',
    tipoLabel: 'Mix',
    objecao: '"Já trabalho com Suvinil, não preciso de Coral"',
    resposta: 'Não precisa tirar Suvinil. Coloque Coral ao lado e deixe o consumidor escolher. Pintor profissional conhece a cobertura Coral — ter as duas marcas aumenta seu faturamento.',
    dados_apoio: 'Lojas com 2+ marcas de tinta faturam em média 30% mais na categoria',
    pergunta_followup: 'Que tal começar com 2-3 itens Coral de alto giro? Posso sugerir quais.',
  },
  {
    id: 'mix-02',
    tipo: 'mix',
    tipoLabel: 'Mix',
    objecao: '"Não tenho espaço na gôndola pra mais uma marca"',
    resposta: 'Nosso consultor pode ajudar a reorganizar sua gôndola. Muitas vezes, otimizar o layout libera espaço e ainda melhora a experiência do cliente.',
    dados_apoio: 'Serviço de consultoria de gôndola gratuito para parceiros Gama',
    pergunta_followup: 'Posso agendar uma visita do consultor para avaliar o layout da sua loja?',
  },
  {
    id: 'mix-03',
    tipo: 'mix',
    tipoLabel: 'Mix',
    objecao: '"Meus clientes não pedem Coral"',
    resposta: 'Coral é a marca mais lembrada do segmento no Brasil. Se os clientes não pedem, é porque não sabem que você tem. Com material de PDV e destaque na gôndola, a demanda aparece.',
    dados_apoio: 'Coral: top of mind em tintas decorativas no Brasil (AkzoNobel)',
    pergunta_followup: 'Posso enviar um kit de PDV (cartazes + stopper) para você testar por 30 dias?',
  },

  // ── QUALIDADE ──
  {
    id: 'qualidade-01',
    tipo: 'qualidade',
    tipoLabel: 'Qualidade',
    objecao: '"Pintor prefere outra marca, diz que Coral não cobre bem"',
    resposta: 'Coral tem cobertura classe A comprovada em teste ABNT. Se o pintor teve problema, provavelmente foi aplicação sem fundo preparador ou diluição errada. Nosso suporte técnico orienta gratuitamente.',
    dados_apoio: 'Coral Decora: cobertura classe A (ABNT NBR 15079) | Suporte técnico gratuito',
    pergunta_followup: 'Quer que nosso técnico faça uma demonstração na sua loja?',
  },
  {
    id: 'qualidade-02',
    tipo: 'qualidade',
    tipoLabel: 'Qualidade',
    objecao: '"Tinta Coral descascou na obra do meu cliente"',
    resposta: 'Em 99% dos casos, descascamento é problema de preparo de superfície (umidade, sem selador, diluição incorreta). A Coral tem garantia e suporte técnico — podemos investigar o caso juntos.',
    dados_apoio: 'Garantia Coral | Suporte técnico Gama | Laudo técnico disponível',
    pergunta_followup: 'Pode me passar fotos da obra? Nosso técnico analisa e orienta a solução.',
  },

  // ── RELACIONAMENTO ──
  {
    id: 'relacao-01',
    tipo: 'relacionamento',
    tipoLabel: 'Relacionamento',
    objecao: '"Já tenho fornecedor de confiança, não quero trocar"',
    resposta: 'Não precisa trocar. A Gama pode ser sua segunda opção — pra quando o fornecedor principal falhar na entrega ou não tiver o produto. Ter backup é inteligência comercial.',
    dados_apoio: '70% dos lojistas trabalham com 2+ distribuidores para não perder venda',
    pergunta_followup: 'Que tal fazer um pedido teste? Sem compromisso de volume mínimo.',
  },
  {
    id: 'relacao-02',
    tipo: 'relacionamento',
    tipoLabel: 'Relacionamento',
    objecao: '"Vocês sumiram, não mandaram mais representante"',
    resposta: 'Peço desculpas pela falha. Reestruturamos nossa equipe e agora cada região tem consultor fixo. Posso agendar uma visita esta semana para recomeçarmos a parceria?',
    dados_apoio: 'Nova estrutura: consultor fixo por região | Visitas programadas',
    pergunta_followup: 'Qual o melhor dia e horário para a visita do nosso consultor?',
  },

  // ── PROGRAMA CL ──
  {
    id: 'programa-01',
    tipo: 'programa',
    tipoLabel: 'Programa CL',
    objecao: '"Não entendo como funciona o Programa CL"',
    resposta: 'O Programa CL tem 3 níveis baseados no volume mensal. Conforme sobe de nível, ganha: transformação de fachada, material de PDV exclusivo, condições especiais e prioridade na entrega.',
    dados_apoio: 'Nível 1: benefícios básicos | Nível 2: fachada + PDV | Nível 3: condições premium',
    pergunta_followup: 'Posso calcular em que nível sua loja se encaixa com o volume atual?',
  },
  {
    id: 'programa-02',
    tipo: 'programa',
    tipoLabel: 'Programa CL',
    objecao: '"Programa de fidelidade não funciona, já tentei com outro fornecedor"',
    resposta: 'O Programa CL é diferente — o benefício é visível. Transformamos a fachada da sua loja com a identidade Coral. Isso atrai cliente novo e mostra que sua loja é referência na região.',
    dados_apoio: 'Lojas com fachada Coral reportam aumento de 15-25% no fluxo de clientes',
    pergunta_followup: 'Quer ver fotos de lojas que já transformamos na região?',
  },
];

export const ObjectionBank = {
  getAll() {
    return OBJECTIONS;
  },

  getByTipo(tipo) {
    return OBJECTIONS.filter(o => o.tipo === tipo);
  },

  search(query) {
    const q = query.toLowerCase();
    return OBJECTIONS.filter(o =>
      o.objecao.toLowerCase().includes(q) ||
      o.resposta.toLowerCase().includes(q) ||
      o.tipoLabel.toLowerCase().includes(q)
    );
  },

  getTipos() {
    return [
      { id: 'preco', label: 'Preço', icon: '💰' },
      { id: 'entrega', label: 'Entrega', icon: '🚛' },
      { id: 'mix', label: 'Mix / Marca', icon: '🏷️' },
      { id: 'qualidade', label: 'Qualidade', icon: '✅' },
      { id: 'relacionamento', label: 'Relacionamento', icon: '🤝' },
      { id: 'programa', label: 'Programa CL', icon: '⭐' },
    ];
  },

  getForProduct(product) {
    // Contextualiza objeções com produto específico
    return OBJECTIONS.map(o => ({
      ...o,
      resposta_contextualizada: o.resposta.replace(/Coral/g, product?.brand || 'Coral'),
    }));
  },

  getCount() {
    return OBJECTIONS.length;
  },
};
