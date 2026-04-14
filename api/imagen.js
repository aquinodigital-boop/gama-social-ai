/**
 * api/imagen.js — Proxy serverless da Google Imagen API (Vercel).
 *
 * Mantém a chave no servidor. Ativação: setar `GEMINI_API_KEY` no servidor e
 * `VITE_IMAGEN_PROXY_URL=/api/imagen` no build.
 *
 * Body esperado:
 *   { model: 'imagen-4.0-fast-generate-001', payload: { instances, parameters } }
 */

const ALLOWED_MODELS = new Set([
  'imagen-4.0-fast-generate-001',
  'imagen-4.0-generate-001',
]);

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

const MAX_INSTANCES = 2;

const DEV_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

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

  if (req.method === 'OPTIONS') return res.status(allowedOrigin ? 204 : 403).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido. Use POST.' });
  if (!allowedOrigin) return res.status(403).json({ error: 'Origem não permitida.' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY não configurada no servidor.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: 'JSON inválido.' }); }
  }
  if (!body || typeof body !== 'object') return res.status(400).json({ error: 'Body ausente.' });

  const { model, payload } = body;
  if (!model || !ALLOWED_MODELS.has(model)) {
    return res.status(400).json({
      error: `Modelo inválido. Aceitos: ${[...ALLOWED_MODELS].join(', ')}.`,
    });
  }
  if (!payload || !Array.isArray(payload.instances) || payload.instances.length === 0) {
    return res.status(400).json({ error: 'Campo `payload.instances` ausente ou vazio.' });
  }

  // Hardening: tanto `instances.length` quanto `sampleCount` multiplicam o custo.
  // Limitamos os dois para conter fan-out malicioso ou acidental.
  if (payload.instances.length > MAX_INSTANCES) {
    return res.status(400).json({
      error: `Máximo de ${MAX_INSTANCES} instances por request.`,
    });
  }
  if (payload.parameters?.sampleCount && payload.parameters.sampleCount > 4) {
    payload.parameters.sampleCount = 4;
  }

  try {
    const url = `${GEMINI_BASE}/${encodeURIComponent(model)}:predict?key=${apiKey}`;
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: data?.error?.message || `Imagen upstream HTTP ${upstream.status}`,
      });
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: `Falha ao chamar Imagen: ${err.message}` });
  }
}
