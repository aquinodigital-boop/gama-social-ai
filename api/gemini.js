/**
 * api/gemini.js — Proxy serverless da Google Gemini API (Vercel).
 *
 * Objetivo: manter a chave da API no servidor, sem expor no bundle do cliente.
 * Ativação: basta deployar na Vercel com a env var `GEMINI_API_KEY` setada.
 * Uso pelo cliente: setar `VITE_GEMINI_PROXY_URL=/api/gemini` no build.
 *
 * Body esperado:
 *   { model: 'gemini-2.5-flash', payload: { system_instruction, contents, generationConfig } }
 *
 * Resposta: proxy transparente do JSON da Gemini (ou { error } em caso de falha).
 */

const ALLOWED_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-2.5-flash-lite',
]);

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

/**
 * Retorna a origem permitida para este request, ou null se bloqueada.
 * Regra: same-origin (mesmo host) + allowlist via `ALLOWED_ORIGINS` (CSV)
 * + localhost em dev. Rejeita requests sem Origin (browsers sempre enviam em POST
 * cross-origin e our app).
 */
function resolveAllowedOrigin(req) {
  const origin = req.headers.origin || '';
  if (!origin) return null;

  const envAllowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const host = req.headers.host || '';
  const sameOrigin = host ? [`https://${host}`, `http://${host}`] : [];

  const allowed = new Set([
    ...envAllowed,
    ...sameOrigin,
    ...(process.env.NODE_ENV !== 'production' ? DEV_ORIGINS : []),
  ]);

  return allowed.has(origin) ? origin : null;
}

export default async function handler(req, res) {
  const allowedOrigin = resolveAllowedOrigin(req);

  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(allowedOrigin ? 204 : 403).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  }

  if (!allowedOrigin) {
    return res.status(403).json({ error: 'Origem não permitida.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'GEMINI_API_KEY não configurada no servidor. Configure a variável de ambiente na Vercel.',
    });
  }

  let body = req.body;
  // Vercel Node runtime geralmente já parseia JSON, mas garantimos:
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido.' }); }
  }
  if (!body || typeof body !== 'object') {
    return res.status(400).json({ error: 'Body ausente.' });
  }

  const { model, payload } = body;

  if (!model || !ALLOWED_MODELS.has(model)) {
    return res.status(400).json({
      error: `Modelo inválido ou não permitido. Aceitos: ${[...ALLOWED_MODELS].join(', ')}.`,
    });
  }
  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Campo `payload` ausente.' });
  }

  // Hardening: limitar maxOutputTokens para evitar abuso do proxy.
  const generationConfig = payload.generationConfig || {};
  if (generationConfig.maxOutputTokens && generationConfig.maxOutputTokens > 8192) {
    generationConfig.maxOutputTokens = 8192;
  }
  payload.generationConfig = generationConfig;

  try {
    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      // Nunca expõe a chave em mensagens de erro.
      return res.status(upstream.status).json({
        error: data?.error?.message || `Gemini upstream HTTP ${upstream.status}`,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: `Falha ao chamar Gemini: ${err.message}` });
  }
}
