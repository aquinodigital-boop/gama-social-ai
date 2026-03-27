/**
 * seasonalData.js — Dados sazonais para o mercado de tintas/construção no Brasil
 * Hemisfério Sul: Dez-Fev = Verão, Mar-Mai = Outono, Jun-Ago = Inverno, Set-Nov = Primavera
 */

const SEASONS = {
  verao: {
    name: 'Verão',
    months: [12, 1, 2],
    icon: 'Sun',
    highlights: ['Impermeabilizantes', 'Sol & Chuva', 'Tintas Externas'],
    reason: 'Temporada de chuvas e reformas de verão — proteção de fachadas no litoral',
    campaigns: [
      'Proteção de fachada antes das chuvas de verão',
      'Reforma de verão: pinte a loja antes da alta temporada',
      'Kit impermeabilização para o litoral — Sol & Chuva + Fundo Preparador',
    ],
  },
  outono: {
    name: 'Outono',
    months: [3, 4, 5],
    icon: 'Leaf',
    highlights: ['Tintas Internas', 'Textura Rústica', 'Vernizes'],
    reason: 'Início da temporada de manutenção interna — clima ameno para pintura',
    campaigns: [
      'Renovação pós-verão: repintura de interiores',
      'Dia das Mães: "Renove o lar de quem você ama"',
      'Outono é temporada de verniz — madeiras expostas ao sol de verão',
    ],
  },
  inverno: {
    name: 'Inverno',
    months: [6, 7, 8],
    icon: 'Snowflake',
    highlights: ['Massa Corrida e Selador', 'Fundo Preparador', 'Epóxi'],
    reason: 'Tempo seco ideal para preparação de superfícies e aplicação de massa',
    campaigns: [
      'Inverno = tempo de preparar! Massa corrida e selador em destaque',
      'Dia dos Namorados: "Transforme seu espaço juntos"',
      'Dia do Pintor (27/06): homenagem ao profissional',
    ],
  },
  primavera: {
    name: 'Primavera',
    months: [9, 10, 11],
    icon: 'Flower2',
    highlights: ['Decora', 'Coralar', 'Sprays e Automotivo'],
    reason: 'Renovação para o fim do ano — cores vibrantes e preparação para festas',
    campaigns: [
      'Black Friday de tintas: estoque pro fim de ano',
      'Primavera Colorida: linha Decora em destaque',
      'Prepare a loja pro Natal: kit fachada + interior',
    ],
  },
};

const HOLIDAYS = [
  { month: 1, day: 1, name: 'Ano Novo', marketing: 'Ano novo, cor nova — renovação de interiores' },
  { month: 3, day: 8, name: 'Dia da Mulher', marketing: 'Mulheres na construção — pintoras profissionais' },
  { month: 3, day: 15, name: 'Dia do Consumidor', marketing: 'Promoções especiais para lojistas parceiros' },
  { month: 4, day: 21, name: 'Tiradentes', marketing: 'Feriado de obras — pintura residencial em alta' },
  { month: 5, day: 1, name: 'Dia do Trabalhador', marketing: 'Homenagem aos pintores e profissionais da construção' },
  { month: 5, day: 11, name: 'Dia das Mães', marketing: '"Renove o lar de quem você mais ama" — kits de pintura' },
  { month: 6, day: 12, name: 'Dia dos Namorados', marketing: '"Transforme seu cantinho juntos" — cores para casais' },
  { month: 6, day: 27, name: 'Dia do Pintor', marketing: 'Homenagem ao profissional — promoções exclusivas' },
  { month: 8, day: 11, name: 'Dia do Estudante', marketing: 'Pintura de escolas e instituições — projetos sociais' },
  { month: 8, day: 15, name: 'Dia dos Pais', marketing: '"Seu pai merece um lar renovado" — kits de ferramentas' },
  { month: 9, day: 5, name: 'Dia da Amazônia', marketing: 'Tintas sustentáveis Coral — compromisso ambiental' },
  { month: 10, day: 12, name: 'Dia das Crianças', marketing: 'Quartos infantis coloridos — linha Decora' },
  { month: 11, day: 25, name: 'Black Friday', marketing: 'Black Friday de tintas — estoque pro fim de ano' },
  { month: 12, day: 25, name: 'Natal', marketing: 'Natal colorido — renovação para as festas' },
];

export function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  for (const [key, season] of Object.entries(SEASONS)) {
    if (season.months.includes(month)) return { key, ...season };
  }
  return { key: 'primavera', ...SEASONS.primavera };
}

export function getUpcomingHolidays(days = 60) {
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  return HOLIDAYS.filter(h => {
    const date = new Date(now.getFullYear(), h.month - 1, h.day);
    if (date < now) date.setFullYear(date.getFullYear() + 1);
    return date >= now && date <= end;
  }).map(h => {
    const date = new Date(now.getFullYear(), h.month - 1, h.day);
    if (date < now) date.setFullYear(date.getFullYear() + 1);
    const daysUntil = Math.ceil((date - now) / (24 * 60 * 60 * 1000));
    return { ...h, date, daysUntil };
  }).sort((a, b) => a.daysUntil - b.daysUntil);
}

export function getSeasonalProducts(seasonKey) {
  const season = SEASONS[seasonKey];
  return season ? season.highlights : [];
}

export { SEASONS, HOLIDAYS };
