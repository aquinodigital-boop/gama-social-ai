/**
 * /api/generate.js — Vercel serverless function (ESM)
 *
 * Backend proxy pra Claude API. Resolve a vulnerabilidade de API key
 * client-side: a chave fica em `ANTHROPIC_API_KEY` no servidor.
 *
 * Suporta 4 tipos:
 *   - "content"      → conteúdo completo (reels/carrossel/stories/post/banner/whatsapp)
 *   - "weekly_plan"  → plano semanal (7 peças)
 *   - "quick_image"  → ideia rápida pra imagem (1 prompt)
 *   - "quick_video"  → ideia rápida pra vídeo (3 cenas)
 *
 * Usa prompt caching: o system prompt + bloco de regras HARD ficam em cache
 * (1024+ tokens) → custo cai ~90% nas chamadas subsequentes.
 *
 * Modelos default:
 *   - "content"     → claude-sonnet-4-6 (bom equilíbrio qualidade/custo pra criativo)
 *   - "weekly_plan" → claude-sonnet-4-6
 *   - "quick_image" → claude-haiku-4-5 (rápido + barato, output curto)
 *   - "quick_video" → claude-haiku-4-5
 *
 * A Bruna pode trocar via body.modelOverride.
 */
import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt, buildUserPrompt, buildQuickImagePrompt, buildQuickVideoPrompt } from "./_prompts.js";

const DEFAULT_MODELS = {
  content: "claude-sonnet-4-6",
  weekly_plan: "claude-sonnet-4-6",
  quick_image: "claude-haiku-4-5",
  quick_video: "claude-haiku-4-5",
};

const MAX_TOKENS = {
  content: 4096,
  weekly_plan: 8192,
  quick_image: 1024,
  quick_video: 1024,
};

export default async function handler(req, res) {
  // CORS — permite preview deploys + local dev
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "ANTHROPIC_API_KEY não configurada no servidor. Defina em Vercel → Settings → Environment Variables.",
    });
  }

  const body = req.body || {};
  const { type = "content", request: contentRequest = {}, modelOverride } = body;

  if (!DEFAULT_MODELS[type]) {
    return res.status(400).json({ error: `type inválido: ${type}. Use: ${Object.keys(DEFAULT_MODELS).join(", ")}` });
  }

  const client = new Anthropic({ apiKey });
  const model = modelOverride || DEFAULT_MODELS[type];
  const maxTokens = MAX_TOKENS[type];

  try {
    if (type === "weekly_plan") {
      // 7 chamadas em paralelo (uma por dia). Prompt caching torna isso barato.
      const DIAS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
      const formats = ["reels", "carrossel", "stories", "post_estatico", "banner_site", "whatsapp", "reels"];
      const angles = ["coral_expertise", "profit", "partnership", "parceria_confianca", "technical", "produto_margem", "expertise_coral"];

      const plan = await Promise.all(
        DIAS.map(async (dayName, day) => {
          const dayRequest = { ...contentRequest, format: formats[day], angle: angles[day] };
          const content = await callClaude(client, model, maxTokens, "content", dayRequest);
          return { day: day + 1, dayName, format: formats[day], angle: angles[day], contents: [content] };
        })
      );
      return res.status(200).json({ ok: true, type: "weekly_plan", plan });
    }

    const content = await callClaude(client, model, maxTokens, type, contentRequest);
    return res.status(200).json({ ok: true, type, content });
  } catch (err) {
    console.error("[api/generate]", err);
    return res.status(500).json({
      error: err?.message || "Falha ao chamar Claude",
      details: err?.status || null,
    });
  }
}

async function callClaude(client, model, maxTokens, type, contentRequest) {
  const systemPrompt = buildSystemPrompt();

  let userPrompt;
  if (type === "content") userPrompt = buildUserPrompt(contentRequest);
  else if (type === "quick_image") userPrompt = buildQuickImagePrompt(contentRequest);
  else if (type === "quick_video") userPrompt = buildQuickVideoPrompt(contentRequest);
  else throw new Error(`type inesperado em callClaude: ${type}`);

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    // Prompt caching: system prompt vira cache (estável entre requests).
    // Tudo após o cache_control invalida em cada request.
    system: [
      { type: "text", text: systemPrompt, cache_control: { type: "ephemeral" } },
    ],
    messages: [{ role: "user", content: userPrompt }],
  });

  // Anthropic SDK retorna ContentBlock[] — pegar apenas o texto.
  const textBlock = response.content.find((b) => b.type === "text");
  const rawText = textBlock?.text || "";
  if (!rawText) throw new Error("Claude retornou resposta vazia.");

  let parsed;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    // Limpar formatação comum de LLM
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .replace(/,\s*([}\]])/g, "$1")
      .trim();
    parsed = JSON.parse(cleaned);
  }

  parsed.provider = "Claude " + model;
  parsed.generatedAt = Date.now();
  parsed.usage = {
    input_tokens: response.usage?.input_tokens,
    output_tokens: response.usage?.output_tokens,
    cache_read_input_tokens: response.usage?.cache_read_input_tokens,
    cache_creation_input_tokens: response.usage?.cache_creation_input_tokens,
  };
  return parsed;
}
