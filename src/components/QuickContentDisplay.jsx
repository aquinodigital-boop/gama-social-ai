import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Camera, Video, ExternalLink } from 'lucide-react';

function CopyBlock({ label, text, className }) {
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => toast.success(`${label} copiado!`));
  }, [text, label]);

  return (
    <div className={cn('relative group', className)}>
      <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-1.5">{label}</div>
      <div className="p-3 bg-muted/30 border border-border rounded-md text-sm text-text-primary whitespace-pre-wrap">
        {text}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-0 right-0 h-6 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Copy size={12} className="mr-1" /> Copiar
      </Button>
    </div>
  );
}

export function QuickImageDisplay({ content }) {
  if (!content) return null;

  return (
    <div className="bg-surface-card border border-border rounded-lg p-4 lg:p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Camera size={20} className="text-coral" />
        <h3 className="text-lg font-bold text-text-primary">{content.title || 'Quick Image'}</h3>
        <Badge variant="outline" className="text-xs">{content.format_hint || 'stories'}</Badge>
      </div>

      {content.product && (
        <div className="text-sm text-text-secondary mb-4">
          Produto: <strong className="text-text-primary">{content.product}</strong>
        </div>
      )}

      <div className="space-y-4">
        <CopyBlock label="Prompt para gerar imagem" text={content.image_prompt} />
        <CopyBlock label="Legenda" text={content.caption} />
        {content.hashtags && <CopyBlock label="Hashtags" text={content.hashtags} />}
      </div>

      {content.product && content.url && (
        <a href={content.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-coral hover:underline mt-3">
          <ExternalLink size={12} /> Ver no site
        </a>
      )}
    </div>
  );
}

export function QuickVideoDisplay({ content }) {
  if (!content) return null;

  return (
    <div className="bg-surface-card border border-border rounded-lg p-4 lg:p-6 fade-in">
      <div className="flex items-center gap-2 mb-4">
        <Video size={20} className="text-coral" />
        <h3 className="text-lg font-bold text-text-primary">{content.title || 'Quick Video'}</h3>
        <Badge variant="outline" className="text-xs">{content.duration_hint || '15s'}</Badge>
        <Badge variant="outline" className="text-xs">{content.format_hint || 'reels'}</Badge>
      </div>

      {content.product && (
        <div className="text-sm text-text-secondary mb-4">
          Produto: <strong className="text-text-primary">{content.product}</strong>
        </div>
      )}

      <div className="space-y-4">
        <CopyBlock label="Ideia do vídeo" text={content.video_idea} />

        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Prompts Visuais (3 cenas)</div>
          <div className="grid gap-3">
            {(content.visual_prompts || []).map((prompt, i) => (
              <CopyBlock key={i} label={`Cena ${i + 1}`} text={prompt} />
            ))}
          </div>
        </div>

        {content.caption && <CopyBlock label="Legenda" text={content.caption} />}
      </div>
    </div>
  );
}
