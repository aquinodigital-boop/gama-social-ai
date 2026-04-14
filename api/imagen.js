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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido. Use POST.' });

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
  if (!payload || !Array.isArray(payload.instances)) {
    return res.status(400).json({ error: 'Campo `payload.instances` ausente.' });
  }

  // Hardening: limitar sampleCount pra evitar abuso.
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
