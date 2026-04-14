# Gama Social AI

## Descricao
Laboratorio de Conteudo B2B para a Gama Distribuidora (distribuidora oficial Coral/AkzoNobel).
Utiliza Inteligencia Artificial (Google Gemini) para criar conteudo de redes sociais:

- **Formatos**: Reels, Carrossel, Stories, Post Estatico, Banner Site, WhatsApp
- **Angulos**: Expertise Coral, Margem & Lucro, Reconquista, Parceria, Tecnico
- **Personas**: Lojista, Pintor, Arquiteto
- **Modos**: Produto, Categoria, Marca, Institucional

## Features
- Geracao de conteudo com IA (Gemini Flash / Pro)
- Plano semanal automatico (7 dias)
- Pack de prompts (PT/EN)
- Historico com filtros e feedback
- Geracao de imagens (Google Imagen)
- Quality checker automatico (grades A-D)
- Dark mode
- Painel de configuracoes (API key, modelo, tema)
- Layout responsivo (mobile/desktop)

## Stack
- React 19 + Vite 7
- Tailwind CSS v4 + shadcn/ui
- Google Gemini API
- Google Imagen API
- Sonner (toasts)
- Lucide React (icons)

## Setup
```bash
npm install
cp .env.example .env
# Edite .env com sua VITE_GEMINI_API_KEY
npm run dev
```

## Build
```bash
npm run build
```

## Deploy
Deploy automatico via Vercel conectado ao GitHub.

### Modos de autenticação da API Gemini/Imagen

O app suporta dois modos, escolhidos por variáveis de ambiente:

**1. Chave client-side** (dev local / cada usuário configura a própria)
- `VITE_GEMINI_API_KEY` — vai para o bundle do navegador.
- Uso recomendado: desenvolvimento e cenários onde cada consultor usa a própria chave via tela de Configurações.

**2. Proxy serverless** (produção recomendado — chave fora do bundle)
- Setar no projeto Vercel:
  - `GEMINI_API_KEY` (server-side, **sem** prefixo `VITE_`)
  - `VITE_GEMINI_PROXY_URL=/api/gemini`
  - `VITE_IMAGEN_PROXY_URL=/api/imagen`
  - `ALLOWED_ORIGINS` (opcional, CSV) — lista de origens externas que podem chamar o proxy. Por padrão o proxy só aceita same-origin (mesmo host) e `localhost` em dev.
- `api/gemini.js` e `api/imagen.js` são serverless functions que proxiam a Google AI mantendo a chave no servidor.
- Proteções dos proxies: allowlist de modelos, origin check (same-origin + `ALLOWED_ORIGINS`), teto de `maxOutputTokens=8192`, teto de `sampleCount=4` e teto de `instances[]=2` no Imagen, sanitização de mensagens de erro.
- Se o usuário informar chave própria no painel de Configurações, o app usa essa chave direto e ignora o proxy.
