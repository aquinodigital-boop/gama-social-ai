import React, { useState } from 'react';
import { copyToClipboard, downloadFile } from '../utils/export.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Download } from 'lucide-react';

const FORMAT_LABELS = {
  reels: 'Reels / TikTok (9:16)',
  carrossel: 'Carrossel (1:1)',
  stories: 'Stories (9:16)',
  post_estatico: 'Post Estático (1:1)',
  banner_site: 'Banner Site (3:1)',
  whatsapp: 'WhatsApp (1:1)',
};

export function PromptPackView({ pack }) {
  const [selectedFormat, setSelectedFormat] = useState('reels');
  const [lang, setLang] = useState('en');

  if (!pack || !pack.packs) return null;

  const currentPack = pack.packs[selectedFormat];
  if (!currentPack) return null;

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) toast.success(`${label} copiado!`);
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
    downloadFile(lines.join('\n'), `gama-prompts-${pack.name}-${Date.now()}.md`, 'text/plain');
    toast.success('Pack completo exportado!');
  };

  return (
    <div className="fade-in">
      <div className="bg-surface-card border border-border rounded-lg overflow-hidden mb-4">
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-border">
          <div>
            <h3 className="text-lg font-bold text-text-primary">Prompts: {pack.name}</h3>
            <div className="text-sm text-text-secondary mt-1">{pack.category} | {pack.keywords.join(', ')}</div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExportAll}>
            <Download size={14} className="mr-1" /> Exportar Tudo
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {Object.keys(pack.packs).map(fmt => (
          <Button key={fmt} variant={selectedFormat === fmt ? 'default' : 'outline'} size="sm" onClick={() => setSelectedFormat(fmt)} className={cn('text-xs', selectedFormat === fmt && 'bg-navy dark:bg-coral')}>
            {FORMAT_LABELS[fmt] || fmt}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <Button variant={lang === 'en' ? 'default' : 'outline'} size="sm" onClick={() => setLang('en')} className={cn('text-xs', lang === 'en' && 'bg-navy dark:bg-coral')}>
          English (para IA)
        </Button>
        <Button variant={lang === 'pt' ? 'default' : 'outline'} size="sm" onClick={() => setLang('pt')} className={cn('text-xs', lang === 'pt' && 'bg-navy dark:bg-coral')}>
          Português
        </Button>
      </div>

      <div className="text-xs text-text-muted mb-4 flex gap-4">
        <span>Aspect Ratio: <strong>{currentPack.spec.aspect}</strong></span>
        <span>Resolução: <strong>{currentPack.spec.resolution}</strong></span>
        {currentPack.spec.notes && <span>{currentPack.spec.notes}</span>}
      </div>

      <div className="bg-navy-dark dark:bg-surface-dark rounded-lg p-4 lg:p-6 text-white">
        {Object.entries(currentPack.prompts).map(([style, prompts]) => {
          const promptText = lang === 'en' ? prompts.prompt_en : prompts.prompt_pt;
          if (!promptText) return null;

          return (
            <div key={style} className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-coral font-semibold uppercase tracking-wider">{prompts.label}</span>
                <Button variant="ghost" size="sm" onClick={() => handleCopy(promptText, prompts.label)} className="text-gray-400 hover:text-white text-xs h-7">
                  <Copy size={12} className="mr-1" /> Copiar
                </Button>
              </div>
              <div className="bg-white/[0.08] border border-white/10 p-3 rounded-md text-sm leading-relaxed">
                {promptText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
