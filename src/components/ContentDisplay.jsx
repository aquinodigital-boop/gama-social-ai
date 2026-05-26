import React, { useState } from 'react';
import { toast } from 'sonner';
import { copyToClipboard, contentToText, downloadFile } from '../utils/export.js';
import { generateImage } from '../services/ImagenService.js';
import { getImageFromContent } from '../services/ProductImageService.js';
import { QuickImageDisplay, QuickVideoDisplay } from './QuickContentDisplay.jsx';
import { cn } from '@/lib/utils';
import { Copy, Check, Download, Zap, Sparkles, ThumbsUp, ThumbsDown } from 'lucide-react';

/* ─── design tokens por formato (banda colorida + código) ─── */
const FORMAT_META = {
  reels:         { color: 'var(--color-format-reels)',     code: 'REL-01', label: 'Reels' },
  carrossel:     { color: 'var(--color-format-carrossel)', code: 'CAR-02', label: 'Carrossel' },
  stories:       { color: 'var(--color-format-stories)',   code: 'STO-03', label: 'Stories' },
  post_estatico: { color: 'var(--color-format-post)',      code: 'POS-04', label: 'Post Estático' },
  banner_site:   { color: 'var(--color-format-banner)',    code: 'BNR-05', label: 'Banner Site' },
  whatsapp:      { color: 'var(--color-format-whatsapp)',  code: 'WHA-06', label: 'WhatsApp' },
};

/* ─── pequeno botão "ghost editorial" reaproveitado ─── */
function GhostBtn({ children, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-1 px-2 py-1 transition-all hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)] disabled:opacity-30"
      style={{
        border: '1px solid var(--color-rule)',
        borderRadius: 2,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        color: 'var(--color-text-primary)',
        background: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

function CopyBtn({ text, small }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) { toast.success('Copiado!'); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  };
  return (
    <GhostBtn onClick={handleCopy} title="Copiar">
      {copied ? <Check size={11} style={{ color: 'var(--color-status-aprovado)' }} /> : <Copy size={11} />}
      {!small && (copied ? 'Copiado' : 'Copiar')}
    </GhostBtn>
  );
}

/* ─── header de seção interna ─── */
function SectionHead({ children, code }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h4 className="display-md" style={{ fontSize: 18 }}>{children}</h4>
      {code && <span className="mono text-[9px] opacity-50">{code}</span>}
      <div className="regua flex-1" />
    </div>
  );
}

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
        <div className="mb-2">
          <span className="eyebrow">imagem do catálogo</span>
          <img
            src={productImageUrl}
            alt="Produto"
            className="mt-1 max-w-[120px] max-h-[120px] object-contain"
            style={{ border: '1px solid var(--color-rule)', borderRadius: 2 }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div className="flex gap-2 items-center flex-wrap">
        <GhostBtn onClick={() => handleGenerate('flash')} disabled={loading}>
          {loading ? '◌' : <Zap size={11} />} Flash
        </GhostBtn>
        <GhostBtn onClick={() => handleGenerate('pro')} disabled={loading}>
          {loading ? '◌' : <Sparkles size={11} />} Pro
        </GhostBtn>
        {withMascot && <span className="mono text-[9px] opacity-60">▸ COM MASCOTE</span>}
      </div>
      {error && (
        <div className="mono text-[10px] mt-1" style={{ color: 'var(--color-status-recusado)' }}>
          ▸ {error}
        </div>
      )}
      {imageUrl && (
        <div className="mt-3">
          <img
            src={imageUrl}
            alt={label || 'Imagem gerada'}
            className="max-w-full max-h-80 object-contain"
            style={{ border: '1px solid var(--color-rule)', borderRadius: 2 }}
          />
        </div>
      )}
    </div>
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
      <button
        onClick={() => handleFeedback('up')}
        className="p-1.5 transition-colors"
        style={{
          background: feedback === 'up' ? 'var(--color-status-aprovado)' : 'transparent',
          color: feedback === 'up' ? '#fff' : 'var(--color-text-primary)',
          border: '1px solid var(--color-rule)',
          borderRadius: 2,
        }}
        title="Bom resultado"
      >
        <ThumbsUp size={13} />
      </button>
      <button
        onClick={() => handleFeedback('down')}
        className="p-1.5 transition-colors"
        style={{
          background: feedback === 'down' ? 'var(--color-status-recusado)' : 'transparent',
          color: feedback === 'down' ? '#fff' : 'var(--color-text-primary)',
          border: '1px solid var(--color-rule)',
          borderRadius: 2,
        }}
        title="Ruim"
      >
        <ThumbsDown size={13} />
      </button>
    </div>
  );
}

export function ContentDisplay({ content, selectedItem, onFeedback }) {
  const [copiedId, setCopiedId] = useState(null);
  const [withMascot, setWithMascot] = useState(false);

  if (!content) return null;

  if (content.type === 'quick_image') return <QuickImageDisplay content={content} />;
  if (content.type === 'quick_video') return <QuickVideoDisplay content={content} />;

  const productImageUrl = selectedItem?.image_url ?? getImageFromContent(content);
  const fmt = FORMAT_META[content.format] || { color: 'var(--color-ink)', code: '—', label: content.format || 'Peça' };

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) { toast.success('Copiado!'); setCopiedId(label); setTimeout(() => setCopiedId(null), 1500); }
    else toast.error('Erro ao copiar');
  };

  const handleExport = (format) => {
    const text = contentToText(content, format);
    const ext = format === 'md' ? 'md' : 'txt';
    const filename = `gama-${content.format || 'content'}-${Date.now()}.${ext}`;
    downloadFile(text, filename, 'text/plain');
    toast.success(`${filename} baixado!`);
  };

  const handleCopyAll = async () => {
    const text = contentToText(content, 'txt');
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Conteúdo completo copiado!');
  };

  return (
    <article className="fade-in space-y-6">
      {/* ─── Header da peça ─── */}
      <header className="paper-card overflow-hidden">
        <span className="paint-band" style={{ background: fmt.color }} />
        <div className="p-5 flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="mtag" style={{ color: fmt.color }}>{fmt.label} · {fmt.code}</span>
              {content.persona_target && <span className="mtag">persona · {content.persona_target}</span>}
            </div>
            <h3 className="display-lg" style={{ fontSize: 26 }}>{content.title}</h3>
            {content.strategy_focus && (
              <p className="lead mt-2" style={{ fontStyle: 'italic' }}>{content.strategy_focus}</p>
            )}
          </div>
          <div className="flex gap-2 shrink-0 flex-wrap items-start">
            <FeedbackButtons content={content} onFeedback={onFeedback} />
            <GhostBtn onClick={handleCopyAll}><Copy size={11} /> Copiar tudo</GhostBtn>
            <GhostBtn onClick={() => handleExport('md')}><Download size={11} /> .md</GhostBtn>
            <GhostBtn onClick={() => handleExport('txt')}>.txt</GhostBtn>
          </div>
        </div>
      </header>

      {/* ─── REELS Script ─── */}
      {content.script && content.script.length > 0 && (
        <section className="paper-card p-5">
          <SectionHead code="ROT/01">Roteiro · cena a cena</SectionHead>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-ink)' }}>
                  <th className="eyebrow text-left py-2 pr-3 w-[70px]">Tempo</th>
                  <th className="eyebrow text-left py-2 px-3">Visual</th>
                  <th className="eyebrow text-left py-2 px-3">Texto / áudio</th>
                  <th className="w-12" />
                </tr>
              </thead>
              <tbody>
                {content.script.map((scene, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-rule)' }}>
                    <td className="py-3 pr-3 align-top mono text-xs" style={{ color: 'var(--color-gama-amarelo-3)' }}>{scene.time}</td>
                    <td className="py-3 px-3 align-top">
                      <div className="font-semibold mb-2" style={{ fontFamily: 'var(--font-display)' }}>{scene.visual}</div>
                      {scene.visual_prompt && (
                        <>
                          <div
                            className="text-xs p-2"
                            style={{ background: 'var(--color-paper-2)', border: '1px solid var(--color-rule)', borderRadius: 2 }}
                          >
                            {scene.visual_prompt}
                          </div>
                          <GenerateImageButton prompt={scene.visual_prompt} format={content.format} label={`Cena ${i + 1}`} content={content} withMascot={withMascot} productImageUrl={productImageUrl} />
                        </>
                      )}
                    </td>
                    <td className="py-3 px-3 align-top leading-relaxed">{scene.text}</td>
                    <td className="py-3 align-top text-right"><CopyBtn text={scene.visual_prompt || scene.text} small /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ─── CARROSSEL Slides ─── */}
      {content.slides && content.slides.length > 0 && (
        <section className="paper-card p-5">
          <SectionHead code="CAR/02">Carrossel · {content.slides.length} slides</SectionHead>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {content.slides.map((slide, i) => {
              const isFirst = i === 0;
              const isLast = i === content.slides.length - 1;
              const bg = isFirst ? 'var(--color-ink)' : isLast ? 'var(--color-gama-amarelo)' : 'var(--color-paper-2)';
              const fg = isFirst ? 'var(--color-paper)' : isLast ? 'var(--color-ink)' : 'var(--color-text-primary)';
              return (
                <div key={i} style={{ border: '1px solid var(--color-rule)', borderRadius: 2 }}>
                  <div
                    className="aspect-square p-4 flex flex-col items-center justify-center text-center"
                    style={{ background: bg, color: fg }}
                  >
                    <span className="mono text-[9px] mb-2 opacity-60" style={{ letterSpacing: '0.08em' }}>SLIDE {slide.slide}</span>
                    <div className="display-md text-center" style={{ fontSize: 17, lineHeight: 1.15 }}>
                      {slide.text}
                    </div>
                  </div>
                  <div className="p-2.5 text-xs" style={{ background: 'var(--color-surface-card)', color: 'var(--color-text-secondary)' }}>
                    <span className="eyebrow">Visual</span>
                    <div className="mt-1">{slide.visual}</div>
                    {slide.note && <div className="mt-2 italic opacity-70">{slide.note}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── STORIES ─── */}
      {content.storySequence && content.storySequence.length > 0 && (
        <section className="paper-card p-5">
          <SectionHead code="STO/03">
            Stories
            {content.trend && <span className="mtag ml-2" style={{ color: fmt.color }}>{content.trend}</span>}
          </SectionHead>
          {content.trendDescription && (
            <p className="lead mb-3" style={{ fontSize: 13 }}>{content.trendDescription}</p>
          )}
          <div className="flex gap-3 overflow-x-auto pb-2">
            {content.storySequence.map((story, i) => (
              <div
                key={i}
                className="relative min-w-[190px] aspect-[9/16] flex flex-col justify-between p-4"
                style={{
                  background: `linear-gradient(135deg, ${fmt.color} 0%, var(--color-ink) 100%)`,
                  color: '#fff',
                  borderRadius: 2,
                }}
              >
                <span
                  className="mono text-[9px] self-start px-1.5 py-0.5"
                  style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 1, letterSpacing: '0.08em' }}
                >
                  {story.type}
                </span>
                <div className="display-md" style={{ fontSize: 16, fontWeight: 600 }}>{story.text}</div>
                <div className="text-[10px] opacity-70 text-center mono">{story.visual}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── POST LAYOUT ─── */}
      {content.layout && (
        <section className="paper-card p-5">
          <SectionHead code="POS/04">Layout do post</SectionHead>
          <div
            className="p-8 text-center"
            style={{
              background: 'var(--color-paper-2)',
              border: '1px solid var(--color-rule)',
              borderRadius: 2,
            }}
          >
            <div className="display-lg mb-2" style={{ fontSize: 30, color: 'var(--color-ink)' }}>
              {content.layout.headline}
            </div>
            <div className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              {content.layout.subheadline}
            </div>
            <div className="text-base mb-6">{content.layout.bodyText}</div>
            <span className="tape" style={{ pointerEvents: 'none' }}>{content.layout.cta}</span>
          </div>
        </section>
      )}

      {/* ─── BANNER ─── */}
      {content.bannerSpecs && (
        <section className="paper-card p-5">
          <SectionHead code="BNR/05">Banner site · 1920×400 desktop + 600×400 mobile</SectionHead>
          <div
            className="p-8 flex items-center justify-center min-h-[140px] text-center"
            style={{
              background: 'var(--color-ink)',
              color: 'var(--color-paper)',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* faixa amarela inferior */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                background: 'var(--color-gama-amarelo)',
              }}
            />
            <div>
              <div className="display-xl" style={{ fontSize: 36, color: 'var(--color-paper)' }}>
                {content.bannerSpecs.headline}
              </div>
              <div className="lead mt-2" style={{ color: 'rgba(247,244,237,0.7)' }}>
                {content.bannerSpecs.subheadline}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-2 mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
            <span>▸ DESKTOP {content.bannerSpecs.dimensions_desktop || '1920x400'}</span>
            <span>▸ MOBILE {content.bannerSpecs.dimensions_mobile || '600x400'}</span>
            <span style={{ color: 'var(--color-status-recusado)' }}>▸ SEM CTA PILL AMARELO</span>
          </div>
        </section>
      )}

      {/* ─── WHATSAPP ─── */}
      {content.messages && (
        <section className="paper-card p-5">
          <SectionHead code="WHA/06">Mensagens WhatsApp B2B</SectionHead>
          <div
            className="p-4 space-y-3"
            style={{ background: '#E7DDD3', borderRadius: 2 }}
          >
            {Object.entries(content.messages).map(([tipo, msg]) => (
              <div key={tipo}>
                <span className="eyebrow" style={{ color: 'var(--color-ink-2)' }}>{tipo}</span>
                <div
                  className="mt-1 p-3 flex items-start gap-2 text-sm leading-relaxed"
                  style={{ background: '#fff', borderRadius: 2, color: 'var(--color-text-primary)', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}
                >
                  <span className="flex-1 whitespace-pre-wrap">{msg}</span>
                  <CopyBtn text={msg} small />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── ASSETS / PROMPTS (dark editorial card) ─── */}
      {content.assets && (
        <section
          className="paper-card overflow-hidden"
          style={{ background: 'var(--color-ink)', color: 'var(--color-paper)', borderColor: 'var(--color-ink)' }}
        >
          <span className="paint-band" style={{ background: 'var(--color-gama-amarelo)' }} />
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h4 className="display-md" style={{ fontSize: 18, color: 'var(--color-paper)' }}>
                <span style={{ color: 'var(--color-gama-amarelo)' }}>★</span> Prompts pra IA
              </h4>
              <label className="flex items-center gap-2 cursor-pointer mono text-[10px]" style={{ color: 'rgba(247,244,237,0.7)' }}>
                <input
                  type="checkbox"
                  checked={withMascot}
                  onChange={(e) => setWithMascot(e.target.checked)}
                  className="accent-[var(--color-gama-amarelo)]"
                />
                COM MASCOTE GAMA
              </label>
            </div>

            {content.assets.narration_text && (
              <div>
                <span className="eyebrow" style={{ color: 'var(--color-gama-amarelo-2)' }}>narração · áudio</span>
                <div
                  className="mt-2 p-3 italic leading-relaxed text-sm"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
                >
                  {content.assets.narration_text}
                </div>
                <div className="mt-1"><CopyBtn text={content.assets.narration_text} small /></div>
              </div>
            )}

            {content.assets.image_prompts?.length > 0 && (
              <div>
                <span className="eyebrow" style={{ color: 'var(--color-gama-amarelo-2)' }}>prompts de imagem</span>
                {content.assets.image_prompts.map((p, i) => (
                  <div key={i} className="mt-2">
                    <div
                      className="p-3 text-sm flex items-start gap-2"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
                    >
                      <span className="flex-1">{p}</span>
                      <CopyBtn text={p} small />
                    </div>
                    <GenerateImageButton prompt={p} format={content.format} label={`Imagem ${i + 1}`} content={content} withMascot={withMascot} productImageUrl={productImageUrl} />
                  </div>
                ))}
              </div>
            )}

            {content.assets.video_prompts?.length > 0 && (
              <div>
                <span className="eyebrow" style={{ color: 'var(--color-gama-amarelo-2)' }}>prompts de vídeo</span>
                {content.assets.video_prompts.map((p, i) => (
                  <div
                    key={i}
                    className="mt-2 p-3 text-sm flex items-start gap-2"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 2 }}
                  >
                    <span className="flex-1">{p}</span>
                    <CopyBtn text={p} small />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── CAPTION ─── */}
      {content.caption && (
        <section className="paper-card p-5">
          <div className="flex items-center justify-between mb-3">
            <SectionHead code="CAP">Legenda pronta</SectionHead>
            <CopyBtn text={content.caption} />
          </div>
          <div
            className="pullquote"
            style={{ whiteSpace: 'pre-wrap', fontSize: 16, fontStyle: 'normal' }}
          >
            {content.caption}
          </div>
        </section>
      )}
    </article>
  );
}
