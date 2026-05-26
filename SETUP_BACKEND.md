# 🔧 SETUP — Backend Claude (Vercel Serverless)

> Passo a passo pra ativar o backend seguro que esconde a API key e roda Claude com prompt caching.
> Tempo: ~10 minutos.

---

## Por que ter backend

Sem backend, a API key do Gemini vai pro bundle JS. Qualquer pessoa abre DevTools e copia. Em produção pública, vaza em segundos.

O backend `/api/generate.js`:
- Roda como **Vercel Serverless Function** (free tier suficiente)
- Mantém a chave **`ANTHROPIC_API_KEY`** server-side
- Usa **prompt caching** do Claude → custo cai ~90% após a 1ª chamada
- Default: **Sonnet 4.6** pra criativo, **Haiku 4.5** pra quick image/video

---

## 1. Pré-requisitos

- Conta na **Vercel** (free tier funciona)
- Conta na **Anthropic** com créditos
- Repo conectado à Vercel (já está, se você já deploya)

---

## 2. Obter API key da Anthropic

1. Acesse https://console.anthropic.com/settings/keys
2. **Create Key** → dê um nome (ex.: `gama-social-ai-prod`)
3. Copie a chave (`sk-ant-...`) — só aparece uma vez

---

## 3. Configurar na Vercel

### Via dashboard
1. Abra seu projeto na Vercel
2. **Settings → Environment Variables**
3. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** `sk-ant-...` (a chave copiada)
   - **Environments:** marque Production, Preview, Development
4. Salve

### Via CLI (alternativa)
```bash
npm i -g vercel
vercel env add ANTHROPIC_API_KEY production
# cole a chave quando pedir
```

---

## 4. Redeploy

A próxima publicação (`git push` na branch principal) já carrega a env var. Ou force agora:

```bash
vercel --prod
```

Ou na dashboard: **Deployments → ⋯ → Redeploy**.

---

## 5. Testar

### No app deployado
1. Abra o app no navegador
2. No header, ao lado do nome do provider, escolha **Claude (backend)**
3. Gere qualquer conteúdo
4. Se aparecer `Backend /api/generate falhou (500): ANTHROPIC_API_KEY não configurada` → a env var não chegou; redeploy.

### Diretamente no endpoint
```bash
curl -X POST https://SEU-DOMINIO.vercel.app/api/generate \
  -H "Content-Type: application/json" \
  -d '{"type":"quick_image","request":{"name":"Coral Decora","category":"Tintas","angle":"coral_expertise","persona":"lojista"}}'
```

Resposta esperada:
```json
{
  "ok": true,
  "type": "quick_image",
  "content": {
    "type": "quick_image",
    "title": "...",
    "image_prompt": "...",
    "caption": "...",
    "hashtags": "...",
    "usage": {
      "input_tokens": 1234,
      "output_tokens": 567,
      "cache_read_input_tokens": 0,   // 0 na 1ª chamada
      "cache_creation_input_tokens": 1100
    }
  }
}
```

A partir da 2ª chamada (dentro de 5min), `cache_read_input_tokens` > 0 → cache funcionando.

---

## 6. Dev local

### Opção A — Vercel CLI (recomendado)
Roda backend e frontend juntos:

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev:vercel   # ou: vercel dev
```

Abre em `http://localhost:3000` com `/api/generate` funcionando.

### Opção B — Frontend isolado (sem backend)
Só pra mexer em UI:

```bash
npm install
npm run dev
```

Sobe em `http://localhost:5173` mas `/api/generate` não responde — só Gemini ou Local funcionam.

---

## 7. Custos esperados

| Operação | Modelo default | ~Custo por chamada | Notas |
|---|---|---|---|
| Conteúdo completo (reels, carrossel etc) | Sonnet 4.6 | ~$0.015 | Cache derruba pra ~$0.003 após 1ª |
| Plano semanal (7 peças paralelas) | Sonnet 4.6 | ~$0.05 | Todas reusam o mesmo cache |
| Quick Image | Haiku 4.5 | ~$0.002 | Cache derruba pra ~$0.0005 |
| Quick Video | Haiku 4.5 | ~$0.002 | Cache derruba pra ~$0.0005 |

**Estimativa equipe ativa**: 50 peças/mês = **~$0.50–$1.00/mês**. Sai mais barato que o café.

---

## 8. Trocar modelo na UI

A Bruna pode escolher qual modelo o backend usa por chamada. Em Configurações:

- **Sonnet 4.6** (default) — equilíbrio criativo/custo
- **Haiku 4.5** — máxima velocidade e custo baixo
- **Opus 4.7** — máxima qualidade (caro, usar em peças hero)

O backend respeita `modelOverride` no body da request.

---

## 9. Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| 500 "ANTHROPIC_API_KEY não configurada" | env var não chegou no deploy | Settings Vercel → adicionar e Redeploy |
| 401 Unauthorized | chave inválida | Gerar nova no console Anthropic |
| 429 Rate limit | crédito esgotado | Adicionar créditos no console Anthropic |
| 504 timeout | request lenta (raro) | `vercel.json` já tem maxDuration 60s; verificar logs |
| CORS error no console | rare, deploy desincronizado | Forçar Redeploy |

Logs em tempo real: `vercel logs --follow` ou dashboard Vercel → Logs.

---

## 10. Fallback de segurança

Se o backend cair, o app continua funcional:
- **Gemini** (se a chave client-side estiver setada — só dev)
- **Templates Local** (sem IA, mas funcional)

A UI mostra o provider ativo no header e troca automaticamente se o backend não responde.
