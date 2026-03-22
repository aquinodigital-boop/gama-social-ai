import React, { useState } from 'react';
import { useToast } from '../hooks/useToast.js';
import { copyToClipboard, downloadFile } from '../utils/export.js';

const FORMAT_LABELS = {
  reels: 'Reels / TikTok (9:16)',
  carrossel: 'Carrossel (1:1)',
  stories: 'Stories (9:16)',
  post_estatico: 'Post Estático (1:1)',
  banner_site: 'Banner Site (3:1)',
  whatsapp: 'WhatsApp (1:1)',
};

export function PromptPackView({ pack }) {
  const { addToast } = useToast();
  const [selectedFormat, setSelectedFormat] = useState('reels');
  const [lang, setLang] = useState('en'); // en or pt

  if (!pack || !pack.packs) return null;

  const currentPack = pack.packs[selectedFormat];
  if (!currentPack) return null;

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) addToast(`${label} copiado!`, 'success', 1500);
  };

  const handleExportAll = () => {
    const lines = [`# Prompt Pack - ${pack.name}\n`, `Categoria: ${pack.category}`, `Keywords: ${pack.keywords.join(', ')}\n`];

    Object.entries(pack.packs).forEach(([fmt, fmtPack]) => {
      lines.push(`\n## ${FORMAT_LABELS[fmt] || fmt}\n`);
      lines.push(`Spec: ${fmtPack.spec.aspect} | ${fmtPack.spec.resolution}\n`);

      Object.entries(fmtPack.prompts).forEach(([_style, prompts]) => {
        lines.push(`### ${prompts.label}\n`);
        if (prompts.prompt_en) lines.push(`**EN:** ${prompts.prompt_en}\n`);
        if (prompts.prompt_pt) lines.push(`**PT:** ${prompts.prompt_pt}\n`);
      });
    });

    downloadFile(lines.join('\n'), `labor-prompts-${pack.name}-${Date.now()}.md`, 'text/plain');
    addToast('Pack completo exportado!', 'success');
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-header">
          <div>
            <h3 style={{ margin: 0 }}>Prompts: {pack.name}</h3>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
              {pack.category} | {pack.keywords.join(', ')}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={handleExportAll}>
            Exportar Tudo (.md)
          </button>
        </div>
      </div>

      {/* Format selector */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        flexWrap: 'wrap',
      }}>
        {Object.keys(pack.packs).map(fmt => (
          <button
            key={fmt}
            className={selectedFormat === fmt ? 'btn btn-navy' : 'btn btn-secondary'}
            onClick={() => setSelectedFormat(fmt)}
            style={{ fontSize: 'var(--text-xs)' }}
          >
            {FORMAT_LABELS[fmt] || fmt}
          </button>
        ))}
      </div>

      {/* Language toggle */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }}>
        <button
          className={lang === 'en' ? 'btn btn-navy' : 'btn btn-secondary'}
          onClick={() => setLang('en')}
          style={{ fontSize: 'var(--text-xs)' }}
        >
          English (para IA)
        </button>
        <button
          className={lang === 'pt' ? 'btn btn-navy' : 'btn btn-secondary'}
          onClick={() => setLang('pt')}
          style={{ fontSize: 'var(--text-xs)' }}
        >
          Português
        </button>
      </div>

      {/* Spec info */}
      <div style={{
        fontSize: 'var(--text-xs)',
        color: 'var(--text-muted)',
        marginBottom: 'var(--space-4)',
        display: 'flex',
        gap: 'var(--space-4)',
      }}>
        <span>Aspect Ratio: <strong>{currentPack.spec.aspect}</strong></span>
        <span>Resolução: <strong>{currentPack.spec.resolution}</strong></span>
        <span>{currentPack.spec.notes}</span>
      </div>

      {/* Prompts */}
      <div className="dark-box">
        {Object.entries(currentPack.prompts).map(([style, prompts]) => {
          const promptText = lang === 'en' ? prompts.prompt_en : prompts.prompt_pt;
          if (!promptText) return null;

          return (
            <div key={style} style={{ marginBottom: 'var(--space-4)' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-2)',
              }}>
                <span className="section-label" style={{ margin: 0 }}>{prompts.label}</span>
                <button
                  className="btn btn-ghost"
                  onClick={() => handleCopy(promptText, prompts.label)}
                  style={{ color: 'var(--gray-400)', fontSize: 'var(--text-xs)' }}
                >
                  Copiar
                </button>
              </div>
              <div className="prompt-block">
                {promptText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
