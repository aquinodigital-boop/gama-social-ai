# Gama Social AI

> Laboratório de Conteúdo B2B para a Gama Distribuidora — distribuidor oficial Coral/AkzoNobel na **Grande São Paulo**.

Plataforma de inteligência comercial que gera conteúdo de redes sociais, materiais de trade marketing, scripts de WhatsApp B2B e copy de banners — tudo aderente às **regras HARD da marca** (validador automático bloqueia saída fora do padrão).

---

## ✨ Features

### Geração de conteúdo
- **Formatos**: Reels, Carrossel, Stories, Post Estático, Banner Site, WhatsApp B2B
- **Ângulos estratégicos**: Expertise Coral, Margem & Resultado, Parceria 20 anos, Programa CL, Suporte Técnico
- **Personas B2B**: Lojista (carteira/prospecção), Balconista, Pintor profissional, Eng./Arquiteto
- **Modos**: Produto, Categoria, Marca parceira, Institucional
- **Plano semanal automático** (7 peças, formatos rotativos, paralelizado)
- **Quick Image** / **Quick Video** (ideias rápidas de 1 clique)

### Controle de qualidade
- **`HardRulesValidator`** (regex blocklist) bloqueia automaticamente saídas que violam regras HARD da Gama (Santos/Baixada, Reconquista, Viapol, claim inventado, B2C, "linha completa"…)
- **`QualityChecker`** com 4 conjuntos de critérios (social/trade/whatsapp/promotor) e grade A–F
- Itens bloqueados (HARD violation) recebem grade **F** + lista das violações

### Workflow de equipe
- **Pipeline de aprovação**: rascunho → revisado → aprovado → agendado → publicado
- **Histórico** persistente com filtros por formato e status, pipeline visual e log de transições
- **Feedback** 👍/👎 por peça

### Backend seguro (Claude)
- `/api/generate` (Vercel Serverless Function) chama Claude com `ANTHROPIC_API_KEY` **server-side**
- **Prompt caching** ativo (custo cai ~90% após a 1ª chamada)
- Modelos: **Sonnet 4.6** (criativo, default) · **Haiku 4.5** (volume/quick) · **Opus 4.7** (hero peças)
- Fallback automático: Gemini (legado client-side) ou Templates Local (offline)

---

## 🚀 Setup rápido

### Produção (recomendado)
1. Siga **[`SETUP_BACKEND.md`](SETUP_BACKEND.md)** — configura `ANTHROPIC_API_KEY` na Vercel em ~10min.
2. Deploy automático via git push.

### Dev local
```bash
npm install
cp .env.example .env.local
# Edite .env.local: ANTHROPIC_API_KEY=sk-ant-...

npm run dev:vercel   # frontend + backend (porta 3000)
# ou
npm run dev          # só frontend (porta 5173, Claude desativado)
```

### Build
```bash
npm run build
```

---

## 🏗️ Stack

- **Frontend**: React 19 + Vite 7 + Tailwind CSS v4 + shadcn/ui
- **Backend**: Vercel Serverless Functions (Node 20 ESM) + `@anthropic-ai/sdk`
- **IA**: Anthropic Claude (Sonnet 4.6 / Haiku 4.5 / Opus 4.7) com prompt caching
- **Fallback IA**: Google Gemini API (legado), Templates Local (offline)
- **UI**: Sonner (toasts), Lucide React (icons), next-themes (dark mode)

---

## 📂 Arquitetura

```
api/
├── generate.js              ← endpoint único (content | weekly_plan | quick_image | quick_video)
└── _prompts.js              ← system prompt + user prompts (server-side)

src/
├── providers/
│   ├── ClaudeProvider.js    ← cliente que chama /api/generate
│   ├── GeminiProvider.js    ← legado client-side
│   ├── LocalProvider.js     ← templates offline
│   └── index.js             ← registry com Claude como default
├── engine/
│   ├── HardRulesValidator.js ← regex blocklist (regras HARD Gama)
│   ├── QualityChecker.js     ← grade A-F (HARD bloqueia grade F)
│   └── PromptGenerator.js    ← pack PT/EN pra imagem/vídeo
├── logic/
│   ├── BrandBrain.js         ← DNA da marca (Grande SP only)
│   ├── BrandExpert.js / CategoryExpert.js
│   ├── ObjectionBank.js / WhatsAppTemplates.js
│   └── SuggestionsEngine.js
├── hooks/
│   └── useContentHistory.js  ← histórico + workflow status
└── components/
    ├── HistoryPanel.jsx      ← pipeline visual + filtros por status
    ├── WorkflowStatusBadge.jsx
    └── ... (Trade, Kit, WhatsApp, Social, Intelligence, Settings)
```

---

## 🚨 Regras HARD da Gama

Aplicadas **antes** de qualquer saída chegar ao histórico. Quebrar uma = grade F + bloqueio de publicação.

1. **Área de atuação:** APENAS Grande São Paulo. Proibido citar Santos/Baixada/litoral.
2. **"Distribuidor Oficial":** somente Coral. Tigre/Tramontina/Norton = "parceiros".
3. **Viapol:** proibido em peça Gama (era da Labor — encerrada).
4. **Sem claims inventados:** rankings, volumes, "líder em…", "+500 lojistas".
5. **B2B sempre:** sem "pinte sua casa", "transforme sua sala".
6. **Vocabulário proibido:** "linha completa", "mix completo", "todo o portfólio".
7. **Banner site:** 1920×400 desktop + 600×400 mobile, sem CTA pill amarelo.
8. **Tom profissional:** sem exclamação dupla, caps de impacto ou clickbait.

Detalhes em [`src/engine/HardRulesValidator.js`](src/engine/HardRulesValidator.js).

---

## 🛣️ Roadmap

Análise estratégica completa em `00_SITE-ECOSSISTEMA-2026/99_DOCUMENTACAO/ANALISE-GAMA-SOCIAL-AI.md` (Drive Bruna).

- ✅ **Onda 1** — HARD rules + cleanup ([PR #2](../../pull/2))
- ✅ **Onda 2A** — Backend Claude + Prompt caching + Workflow status (esta versão)
- ⏳ **Onda 2B** — Calendário visual + exportação ZIP estruturada
- ⏳ **Onda 3** — Supabase auth + multi-usuário + feedback de performance + integração WhatsApp Business API
