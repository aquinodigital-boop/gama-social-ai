/**
 * export.js
 * Funções de exportação: clipboard, download .txt/.md
 */

/**
 * Copia texto para o clipboard
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback para browsers antigos
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Faz download de arquivo de texto
 * @param {string} content - Conteúdo do arquivo
 * @param {string} filename - Nome do arquivo (com extensão)
 * @param {string} mimeType - Tipo MIME
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Converte ContentResult em texto formatado para export
 * @param {Object} content - ContentResult
 * @param {'txt'|'md'} format
 * @returns {string}
 */
export function contentToText(content, format = 'md') {
  const lines = [];
  const sep = format === 'md' ? '---' : '========================================';
  const h1 = (t) => format === 'md' ? `# ${t}` : `=== ${t} ===`;
  const h2 = (t) => format === 'md' ? `## ${t}` : `--- ${t} ---`;
  const h3 = (t) => format === 'md' ? `### ${t}` : `> ${t}`;
  const bold = (t) => format === 'md' ? `**${t}**` : t.toUpperCase();

  lines.push(h1(content.title || 'Conteúdo Laboratório de Conteúdo'));
  lines.push('');
  lines.push(`${bold('Tipo')}: ${content.type || content.format || ''}`);
  lines.push(`${bold('Estratégia')}: ${content.strategy_focus || ''}`);
  lines.push(`${bold('Persona')}: ${content.persona_target || ''}`);
  lines.push(`${bold('Provider')}: ${content.provider || 'Local'}`);
  lines.push(`${bold('Gerado em')}: ${new Date(content.generatedAt).toLocaleString('pt-BR')}`);
  lines.push('');
  lines.push(sep);
  lines.push('');

  // Script (Reels)
  if (content.script && content.script.length > 0) {
    lines.push(h2('Roteiro Cena a Cena'));
    lines.push('');
    content.script.forEach((scene, i) => {
      lines.push(h3(`Cena ${i + 1} (${scene.time})`));
      lines.push(`Visual: ${scene.visual}`);
      lines.push(`Texto: ${scene.text}`);
      if (scene.visual_prompt) lines.push(`Prompt Visual: ${scene.visual_prompt}`);
      lines.push('');
    });
  }

  // Slides (Carrossel)
  if (content.slides && content.slides.length > 0) {
    lines.push(h2('Slides do Carrossel'));
    lines.push('');
    content.slides.forEach((slide) => {
      lines.push(h3(`Slide ${slide.slide}`));
      lines.push(`Texto: ${slide.text}`);
      lines.push(`Visual: ${slide.visual}`);
      if (slide.note) lines.push(`Nota: ${slide.note}`);
      lines.push('');
    });
  }

  // Stories
  if (content.storySequence && content.storySequence.length > 0) {
    lines.push(h2(`Stories (Trend: ${content.trend || ''})`));
    lines.push(content.trendDescription || '');
    lines.push('');
    content.storySequence.forEach((s, i) => {
      lines.push(h3(`Story ${i + 1} (${s.type})`));
      lines.push(`Texto: ${s.text}`);
      lines.push(`Visual: ${s.visual}`);
      lines.push('');
    });
  }

  // Layout (Post estático)
  if (content.layout) {
    lines.push(h2('Layout do Post'));
    lines.push('');
    Object.entries(content.layout).forEach(([k, v]) => {
      lines.push(`${bold(k)}: ${v}`);
    });
    lines.push('');
  }

  // Banner
  if (content.bannerSpecs) {
    lines.push(h2('Especificações do Banner'));
    lines.push('');
    Object.entries(content.bannerSpecs).forEach(([k, v]) => {
      lines.push(`${bold(k)}: ${v}`);
    });
    lines.push('');
  }

  // Messages (WhatsApp)
  if (content.messages) {
    lines.push(h2('Mensagens WhatsApp'));
    lines.push('');
    Object.entries(content.messages).forEach(([tipo, msg]) => {
      lines.push(h3(tipo.charAt(0).toUpperCase() + tipo.slice(1)));
      lines.push(msg);
      lines.push('');
    });
  }

  // Assets / Prompts
  if (content.assets) {
    lines.push(sep);
    lines.push('');
    lines.push(h2('Prompts para IA'));
    lines.push('');

    if (content.assets.narration_text) {
      lines.push(h3('Narração'));
      lines.push(content.assets.narration_text);
      lines.push('');
    }

    if (content.assets.image_prompts?.length) {
      lines.push(h3('Prompts de Imagem'));
      content.assets.image_prompts.forEach((p, i) => {
        lines.push(`${i + 1}. ${p}`);
      });
      lines.push('');
    }

    if (content.assets.video_prompts?.length) {
      lines.push(h3('Prompts de Vídeo'));
      content.assets.video_prompts.forEach((p, i) => {
        lines.push(`${i + 1}. ${p}`);
      });
      lines.push('');
    }

    // PromptPack
    if (content.assets.promptPack) {
      const pp = content.assets.promptPack;
      lines.push(h3('Prompt Pack'));
      lines.push(`Studio: ${pp.studio}`);
      lines.push('');
      lines.push(`Lifestyle B2B: ${pp.lifestyle}`);
      lines.push('');
      lines.push(`Institucional: ${pp.institutional}`);
      lines.push('');
    }
  }

  // Caption
  if (content.caption) {
    lines.push(sep);
    lines.push('');
    lines.push(h2('Legenda'));
    lines.push(content.caption);
    lines.push('');
  }

  // Quality
  if (content.quality) {
    lines.push(sep);
    lines.push('');
    lines.push(h2(`Qualidade: ${content.quality.grade} (${content.quality.percentage}%)`));
    content.quality.checks.forEach(c => {
      lines.push(`${c.passed ? '✅' : '❌'} ${c.label}: ${c.detail}`);
    });
  }

  lines.push('');
  lines.push(sep);
  lines.push(`Gerado por Laboratório de Conteúdo | ${new Date().toLocaleDateString('pt-BR')}`);

  return lines.join('\n');
}

/**
 * Converte plano semanal completo em texto
 */
export function weeklyPlanToText(plan, format = 'md') {
  const lines = [];
  const h1 = (t) => format === 'md' ? `# ${t}` : `=== ${t} ===`;
  const h2 = (t) => format === 'md' ? `## ${t}` : `--- ${t} ---`;

  lines.push(h1('Plano Semanal de Conteúdo - Laboratório de Conteúdo'));
  lines.push(`Gerado em: ${new Date().toLocaleString('pt-BR')}`);
  lines.push('');

  plan.forEach(day => {
    lines.push(h2(`${day.dayName} (Dia ${day.day})`));
    lines.push(`Formato: ${day.format} | Ângulo: ${day.angle}`);
    lines.push('');

    day.contents.forEach(content => {
      lines.push(contentToText(content, format));
      lines.push('');
    });
  });

  return lines.join('\n');
}
