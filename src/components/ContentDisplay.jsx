import React, { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard, contentToText, downloadFile } from '../utils/export.js';
import { generateImage } from '../services/ImagenService.js';
import { getImageFromContent } from '../services/ProductImageService.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, Download, Zap, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

const FORMAT_TAG_STYLES = {
  reels: 'bg-red-500/10 text-red-600 dark:text-red-400',
  carrossel: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
  stories: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  post_estatico: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  banner_site: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  whatsapp: 'bg-green-500/10 text-green-600 dark:text-green-400',
};

function GenerateImageButton({ prompt, format, label, content, withMascot, productImageUrl: productImageUrlProp }) {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);
  const productImageUrl = productImageUrlProp ?? (content ? getImageFromContent(content) : null);

  const handleGenerate = async (model) => {
    if (!prompt?.trim()) { toast.error('Prompt vazio'); return; }
    setLoading(true); setError(null); setImageUrl(null);
    try {
      const url = await generateImage({ prompt: prompt.trim(), model, format: format || 'post_estatico', content, withMascot: !!withMascot });
      setImageUrl(url);
      toast.success(`Imagem gerada (${model === 'flash' ? 'Flash' : 'Pro'})!`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Erro ao gerar imagem');
    } finally { setLoading(false); }
  };

  return (
    <div className="mt-2">
      {productImageUrl && (
        <div className="mb-3">
          <div className="text-xs text-text-muted mb-1">📦 Imagem do produto (catálogo)</div>
          <img src={productImageUrl} alt="Produto" className="max-w-[120px] max-h-[120px] rounded-md border border-border object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
      )}
      <div className="flex gap-2 items-center flex-wrap">
        <Button variant="outline" size="sm" onClick={() => handleGenerate('flash')} disabled={loading} className="text-xs h-7">
          {loading ? '⏳' : <Zap size={12} className="mr-1" />} Flash
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleGenerate('pro')} disabled={loading} className="text-xs h-7">
          {loading ? '⏳' : <Sparkles size={12} className="mr-1" />} Pro
        </Button>
        {withMascot && <span className="text-xs text-text-muted">🧸 Com mascote</span>}
      </div>
      {error && <div className="text-xs text-error mt-1">{error}</div>}
      {imageUrl && (
        <div className="mt-3">
          <img src={imageUrl} alt={label || 'Imagem gerada'} className="max-w-full max-h-80 rounded-md border border-border object-contain" />
        </div>
      )}
    </div>
  );
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) { toast.success('Copiado!'); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <Button variant="ghost" size="sm" onClick={handleCopy} className="h-6 w-6 p-0">
      {copied ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </Button>
  );
}

function InlineCopyBtn({ text, id, copiedId, onCopy }) {
  return (
    <Button variant="ghost" size="sm" onClick={() => onCopy(text, id)} className="h-6 px-1.5 text-xs">
      {copiedId === id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
    </Button>
  );
}

function FeedbackButtons({ content, onFeedback }) {
  const [feedback, setFeedback] = useState(content?.feedback || null);
  const handleFeedback = (value) => {
    setFeedback(value);
    if (onFeedback) onFeedback(content.id, value);
    toast.success(value === 'up' ? 'Feedback positivo salvo!' : 'Feedback registrado.');
  };
  return (
    <div className="flex gap-1.5 items-center">
      <Button variant={feedback === 'up' ? 'default' : 'outline'} size="sm" onClick={() => handleFeedback('up')} className={cn('h-7 px-2', feedback === 'up' && 'bg-success hover:bg-success/80')}>
        <ThumbsUp size={13} />
      </Button>
      <Button variant={feedback === 'down' ? 'default' : 'outline'} size="sm" onClick={() => handleFeedback('down')} className={cn('h-7 px-2', feedback === 'down' && 'bg-error hover:bg-error/80')}>
        <ThumbsDown size={13} />
      </Button>
    </div>
  );
}

export function ContentDisplay({ content, selectedItem, onFeedback }) {
  const [copiedId, setCopiedId] = useState(null);
  const [withMascot, setWithMascot] = useState(false);

  if (!content) return null;

  const productImageUrl = selectedItem?.image_url ?? getImageFromContent(content);
  const formatKey = content.format === 'post_estatico' ? 'post_estatico' : content.format === 'banner_site' ? 'banner_site' : content.format;

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) { toast.success('Copiado!'); setCopiedId(label); setTimeout(() => setCopiedId(null), 2000); }
    else toast.error('Erro ao copiar');
  };

  const handleExport = (format) => {
    const text = contentToText(content, format);
    const ext = format === 'md' ? 'md' : 'txt';
    const filename = `gama-${content.format || 'content'}-${Date.now()}.${ext}`;
    downloadFile(text, filename, 'text/plain');
    toast.success(`Arquivo ${filename} baixado!`);
  };

  const handleCopyAll = async () => {
    const text = contentToText(content, 'txt');
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Conteúdo completo copiado!');
  };

  return (
    <div className="bg-surface-card border border-border rounded-lg shadow-sm mb-4 fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-4 lg:px-6 py-4 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-text-primary">{content.title}</h3>
            {content.format && (
              <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', FORMAT_TAG_STYLES[formatKey])}>
                {content.type || content.format}
              </span>
            )}
          </div>
          <div className="text-sm text-text-secondary mt-1">
            {content.strategy_focus}
            {content.persona_target && ` | ${content.persona_target}`}
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0 flex-wrap">
          <FeedbackButtons content={content} onFeedback={onFeedback} />
          <Button variant="outline" size="sm" onClick={handleCopyAll} className="text-xs h-7"><Copy size={12} className="mr-1" /> Copiar</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('md')} className="text-xs h-7"><Download size={12} className="mr-1" /> .md</Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('txt')} className="text-xs h-7">.txt</Button>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        {/* REELS Script */}
        {content.script && content.script.length > 0 && (
          <div>
            <h4 className="text-navy dark:text-coral font-semibold mb-3">Roteiro Cena a Cena</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted w-[70px]">Tempo</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted">Visual & Prompt</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-text-muted">Texto / Áudio</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {content.script.map((scene, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3 px-3 text-text-muted font-semibold align-top">{scene.time}</td>
                      <td className="py-3 px-3 align-top">
                        <div className="font-semibold mb-2 text-text-primary">{scene.visual}</div>
                        {scene.visual_prompt && (
                          <div>
                            <div className="bg-muted/50 border border-border text-text-secondary text-xs p-2 rounded-md">{scene.visual_prompt}</div>
                            <GenerateImageButton prompt={scene.visual_prompt} format={content.format} label={`Cena ${i + 1}`} content={content} withMascot={withMascot} productImageUrl={productImageUrl} />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-3 leading-relaxed text-text-primary align-top">{scene.text}</td>
                      <td className="py-3 px-1 align-top"><CopyButton text={scene.visual_prompt || scene.text} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CAROUSEL Slides */}
        {content.slides && content.slides.length > 0 && (
          <div>
            <h4 className="text-navy dark:text-coral font-semibold mb-3">Slides do Carrossel</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
              {content.slides.map((slide, i) => (
                <div key={i} className="border border-border rounded-lg overflow-hidden">
                  <div className={cn(
                    'p-4 min-h-[120px] flex items-center justify-center text-center text-sm font-semibold',
                    i === 0 ? 'bg-gradient-to-br from-navy to-navy-dark text-white' :
                    i === content.slides.length - 1 ? 'bg-gradient-to-br from-coral to-coral-dark text-white' :
                    'bg-muted/50 text-text-primary'
                  )}>
                    <div>
                      <div className="text-xs opacity-70 mb-1">Slide {slide.slide}</div>
                      {slide.text}
                    </div>
                  </div>
                  <div className="p-3 text-xs text-text-secondary">
                    <div className="font-semibold mb-1">Visual:</div>
                    {slide.visual}
                    {slide.note && <div className="mt-2 italic text-text-muted">{slide.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STORIES */}
        {content.storySequence && content.storySequence.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h4 className="text-navy dark:text-coral font-semibold">Stories</h4>
              {content.trend && <Badge variant="secondary">{content.trend}</Badge>}
            </div>
            {content.trendDescription && <p className="text-sm text-text-secondary mb-3">{content.trendDescription}</p>}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {content.storySequence.map((story, i) => (
                <div key={i} className="relative min-w-[180px] bg-gradient-to-b from-navy to-navy-dark text-white rounded-xl aspect-[9/16] flex flex-col justify-between p-4">
                  <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full self-start">{story.type}</span>
                  <div className="text-sm font-medium">{story.text}</div>
                  <div className="text-xs opacity-70 text-center">{story.visual}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* POST LAYOUT */}
        {content.layout && (
          <div>
            <h4 className="text-navy dark:text-coral font-semibold mb-3">Layout do Post</h4>
            <div className="bg-muted/50 border border-border rounded-lg p-6 text-center">
              <div className="text-xl font-extrabold text-navy dark:text-coral mb-2">{content.layout.headline}</div>
              <div className="text-sm text-text-secondary mb-3">{content.layout.subheadline}</div>
              <div className="text-base text-text-primary mb-4">{content.layout.bodyText}</div>
              <Button className="bg-coral hover:bg-coral-dark text-white pointer-events-none">{content.layout.cta}</Button>
            </div>
          </div>
        )}

        {/* BANNER */}
        {content.bannerSpecs && (
          <div>
            <h4 className="text-navy dark:text-coral font-semibold mb-3">Especificações do Banner</h4>
            <div className="bg-gradient-to-br from-navy to-navy-dark rounded-lg p-6 lg:p-8 text-white flex justify-between items-center min-h-[120px]">
              <div>
                <div className="text-xl font-extrabold mb-1">{content.bannerSpecs.headline}</div>
                <div className="text-sm opacity-80">{content.bannerSpecs.subheadline}</div>
              </div>
              <Button className="bg-coral hover:bg-coral-dark text-white shrink-0 pointer-events-none">{content.bannerSpecs.cta_button}</Button>
            </div>
            <div className="text-xs text-text-muted mt-2">Dimensões: {content.bannerSpecs.dimensions}</div>
          </div>
        )}

        {/* WHATSAPP */}
        {content.messages && (
          <div>
            <h4 className="text-navy dark:text-coral font-semibold mb-3">Mensagens WhatsApp</h4>
            <div className="bg-[#E5DDD5] dark:bg-[#0b141a] p-4 rounded-lg space-y-4">
              {Object.entries(content.messages).map(([tipo, msg]) => (
                <div key={tipo}>
                  <div className="text-xs text-text-muted mb-1 capitalize">{tipo}</div>
                  <div className="bg-white dark:bg-[#1f2c34] p-3 rounded-lg text-sm text-text-primary shadow-sm flex items-start gap-2">
                    <span className="flex-1">{msg}</span>
                    <CopyButton text={msg} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ASSETS / PROMPTS */}
        {content.assets && (
          <div className="bg-navy-dark dark:bg-surface-dark rounded-lg p-4 lg:p-6 text-white">
            <div className="flex justify-between items-center flex-wrap gap-2 mb-4 border-b border-white/10 pb-3">
              <h4 className="text-coral font-semibold">Prompts para IA</h4>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
                <input type="checkbox" checked={withMascot} onChange={(e) => setWithMascot(e.target.checked)} className="accent-coral" />
                🧸 Com Mascote
              </label>
            </div>

            {content.assets.narration_text && (
              <div className="mb-4">
                <span className="text-xs text-coral font-semibold uppercase tracking-wider">Narração / Áudio</span>
                <div className="bg-white/[0.08] p-3 rounded-md italic leading-relaxed mt-2 text-sm">{content.assets.narration_text}</div>
                <CopyButton text={content.assets.narration_text} />
              </div>
            )}

            {content.assets.image_prompts?.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-coral font-semibold uppercase tracking-wider">Prompts de Imagem</span>
                {content.assets.image_prompts.map((p, i) => (
                  <div key={i} className="mb-3 mt-2">
                    <div className="bg-white/[0.08] border border-white/10 p-3 rounded-md text-sm flex items-start gap-2">
                      <span className="flex-1">{p}</span>
                      <InlineCopyBtn text={p} id={`img-${i}`} copiedId={copiedId} onCopy={handleCopy} />
                    </div>
                    <GenerateImageButton prompt={p} format={content.format} label={`Imagem ${i + 1}`} content={content} withMascot={withMascot} productImageUrl={productImageUrl} />
                  </div>
                ))}
              </div>
            )}

            {content.assets.video_prompts?.length > 0 && (
              <div className="mb-4">
                <span className="text-xs text-coral font-semibold uppercase tracking-wider">Prompts de Vídeo</span>
                {content.assets.video_prompts.map((p, i) => (
                  <div key={i} className="bg-white/[0.08] border border-white/10 p-3 rounded-md text-sm flex items-start gap-2 mt-2">
                    <span className="flex-1">{p}</span>
                    <InlineCopyBtn text={p} id={`vid-${i}`} copiedId={copiedId} onCopy={handleCopy} />
                  </div>
                ))}
              </div>
            )}

            {content.assets.promptPack && (
              <div className="mt-4 border-t border-white/10 pt-4">
                <span className="text-xs text-coral font-semibold uppercase tracking-wider">Prompt Pack (Copy-Paste para IA)</span>
                {['studio', 'lifestyle', 'institutional'].map(style => (
                  content.assets.promptPack[style] && (
                    <div key={style} className="mb-4 mt-2">
                      <div className="text-xs text-gray-400 mb-1">
                        {style === 'studio' ? 'Foto de Estúdio' : style === 'lifestyle' ? 'Lifestyle B2B' : 'Institucional'}
                      </div>
                      <div className="bg-white/[0.08] border border-white/10 p-3 rounded-md text-sm flex items-start gap-2">
                        <span className="flex-1">{content.assets.promptPack[style]}</span>
                        <InlineCopyBtn text={content.assets.promptPack[style]} id={`pack-${style}`} copiedId={copiedId} onCopy={handleCopy} />
                      </div>
                      <GenerateImageButton prompt={content.assets.promptPack[style]} format={content.format} label={style} content={content} withMascot={withMascot} productImageUrl={productImageUrl} />
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* CAPTION */}
        {content.caption && (
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <strong className="text-navy dark:text-coral">Legenda</strong>
              <CopyButton text={content.caption} />
            </div>
            <pre className="text-sm text-text-primary whitespace-pre-wrap font-sans leading-relaxed">{content.caption}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
