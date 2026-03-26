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
