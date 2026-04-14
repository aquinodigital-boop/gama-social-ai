/**
 * ImagenService.js
 * Geração de imagens via Google Imagen API (Gemini).
 * 
 * Modelos:
 * - Flash (imagen-4.0-fast-generate-001): gratuito, mais rápido
 * - Pro (imagen-4.0-generate-001): pago, maior qualidade
 * 
 * Integra ImagePromptEnhancer para alinhar à identidade Gama (Grupo Gama).
 */

import { getGeminiApiKey } from '../providers/index.js';
import { enhanceImagePrompt, extractProductName } from './ImagePromptEnhancer.js';

const MODELS = {
  flash: 'imagen-4.0-fast-generate-001',
  pro: 'imagen-4.0-generate-001',
};

const ASPECT_RATIOS = {
  reels: '9:16',
  carrossel: '1:1',
  stories: '9:16',
  post_estatico: '1:1',
  banner_site: '16:9',
  whatsapp: '1:1',
};

const PROXY_URL = import.meta.env.VITE_IMAGEN_PROXY_URL || '';

export async function generateImage({
  prompt,
  model = 'flash',
  format = 'post_estatico',
  apiKey,
  productName = null,
  withMascot = false,
  content = null,
}) {
  const key = apiKey || getGeminiApiKey();
  if (!key && !PROXY_URL) {
    throw new Error('API Key do Gemini não configurada. Configure VITE_GEMINI_API_KEY ou VITE_IMAGEN_PROXY_URL.');
  }

  // Enriquece o prompt com identidade Gama (logo, produto real, embalagem, mascote)
  const product = productName || (content && extractProductName(content, prompt));
  const enhancedPrompt = enhanceImagePrompt(prompt, {
    productName: product,
    withMascot,
    content,
  });

  const modelId = MODELS[model] || MODELS.flash;
  const aspectRatio = ASPECT_RATIOS[format] || '1:1';

  const payload = {
    instances: [{ prompt: enhancedPrompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio,
      personGeneration: 'allow_adult',
    },
  };

  // Prioridade: chave local (dev/power-user) > proxy serverless (produção).
  let response;
  if (key) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:predict?key=${key}`;
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } else {
    response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: modelId, payload }),
    });
  }

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData?.error?.message || errData?.error || `HTTP ${response.status}`;
    throw new Error(`Imagen API: ${msg}`);
  }

  const data = await response.json();

  // Formato de resposta: predictions ou generatedImages
  const predictions = data.predictions || data.generatedImages;
  if (!predictions || predictions.length === 0) {
    throw new Error('Imagen retornou resposta vazia.');
  }

  const first = predictions[0];

  // Extrair base64 - múltiplos formatos possíveis
  let b64 = first?.bytesBase64Encoded
    || first?.imageBytes
    || first?.image?.imageBytes;

  if (!b64 && typeof first === 'string') {
    b64 = first;
  }

  if (!b64) {
    throw new Error('Formato de resposta Imagen não reconhecido.');
  }

  return `data:image/png;base64,${b64}`;
}

export { MODELS, ASPECT_RATIOS };
