import React, { useState } from 'react';
import { useToast } from '../hooks/useToast.js';
import { copyToClipboard, contentToText, downloadFile } from '../utils/export.js';
import { generateImage } from '../services/ImagenService.js';
import { getImageFromContent } from '../services/ProductImageService.js';

/**
 * GenerateImageButton - Gera imagem a partir do prompt (Flash gratuito ou Pro pago)
 * Quando o produto tem imagem no catálogo, mostra a imagem real como referência.
 * Integra identidade Labor: logo, produto real, embalagem, mascote
 */
function GenerateImageButton({ prompt, format, label, content, withMascot, productImageUrl: productImageUrlProp }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  // Imagem real: prioriza prop, depois busca no catálogo por content
  const productImageUrl = productImageUrlProp ?? (content ? getImageFromContent(content) : null);

  const handleGenerate = async (model) => {
    if (!prompt?.trim()) {
      addToast('Prompt vazio', 'error');
      return;
    }
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const url = await generateImage({
        prompt: prompt.trim(),
        model,
        format: format || 'post_estatico',
        content,
        withMascot: !!withMascot,
      });
      setImageUrl(url);
      addToast(`Imagem gerada (${model === 'flash' ? 'Flash' : 'Pro'})!`, 'success');
    } catch (err) {
      setError(err.message);
      addToast(err.message || 'Erro ao gerar imagem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 'var(--space-2)' }}>
      {productImageUrl && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginBottom: 'var(--space-1)' }}>
            📦 Imagem do produto (catálogo Labor)
          </div>
          <img
            src={productImageUrl}
            alt="Produto"
            style={{
              maxWidth: '120px',
              maxHeight: '120px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              objectFit: 'contain',
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          className="btn btn-secondary"
          onClick={() => handleGenerate('flash')}
          disabled={loading}
          style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
          title="Gratuito, mais rápido"
        >
          {loading ? '⏳' : '⚡'} Flash
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => handleGenerate('pro')}
          disabled={loading}
          style={{ fontSize: 'var(--text-xs)', padding: '4px 10px' }}
          title="Uso pago de tokens"
        >
          {loading ? '⏳' : '✨'} Pro
        </button>
        {withMascot && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)' }} title="Mascote incluído no prompt">
            🧸 Com mascote
          </span>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-error, #dc2626)', marginTop: 'var(--space-1)' }}>
          {error}
        </div>
      )}
      {imageUrl && (
        <div style={{ marginTop: 'var(--space-3)' }}>
          <img
            src={imageUrl}
            alt={label || 'Imagem gerada'}
            style={{
              maxWidth: '100%',
              maxHeight: '320px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              objectFit: 'contain',
            }}
          />
        </div>
      )}
    </div>
  );
}

/**
 * CopyButton - Standalone component (outside render cycle)
 */
function CopyButton({ text }) {
  const { addToast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      addToast('Copiado!', 'success', 1500);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      className="btn btn-ghost"
      onClick={handleCopy}
      title="Copiar"
      style={{ fontSize: 'var(--text-xs)', padding: '2px 6px' }}
    >
      {copied ? '✅' : '📋'}
    </button>
  );
}

/**
 * InlineCopyBtn - Simple copy button using parent state (for prompt-blocks)
 */
function InlineCopyBtn({ text, id, copiedId, onCopy }) {
  return (
    <button
      className="copy-btn"
      onClick={() => onCopy(text, id)}
      title="Copiar"
    >
      {copiedId === id ? '✅' : '📋'}
    </button>
  );
}

/**
 * ContentDisplay
 * Renderiza o conteúdo gerado com base no formato.
 * Suporta: Reels, Carrossel, Stories, Post Estático, Banner, WhatsApp.
 */
export function ContentDisplay({ content, selectedItem }) {
  const { addToast } = useToast();
  const [copiedId, setCopiedId] = useState(null);
  const [withMascot, setWithMascot] = useState(false);

  if (!content) return null;

  // Imagem real do produto: prioriza item selecionado (tem image_url), senão busca no catálogo
  const productImageUrl = selectedItem?.image_url ?? getImageFromContent(content);

  const handleCopy = async (text, label) => {
    const ok = await copyToClipboard(text);
    if (ok) {
      addToast(`Copiado!`, 'success', 1500);
      setCopiedId(label);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      addToast('Erro ao copiar', 'error');
    }
  };

  const handleExport = (format) => {
    const text = contentToText(content, format);
    const ext = format === 'md' ? 'md' : 'txt';
    const filename = `labor-${content.format || 'content'}-${Date.now()}.${ext}`;
    downloadFile(text, filename, 'text/plain');
    addToast(`Arquivo ${filename} baixado!`, 'success');
  };

  const handleCopyAll = async () => {
    const text = contentToText(content, 'txt');
    const ok = await copyToClipboard(text);
    if (ok) addToast('Conteúdo completo copiado!', 'success');
  };

  return (
    <div className="card fade-in" style={{ marginBottom: 'var(--space-4)' }}>
      {/* Header */}
      <div className="card-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--text-lg)' }}>{content.title}</h3>
            {content.format && (
              <span className={`format-tag format-tag-${content.format === 'post_estatico' ? 'post' : content.format === 'banner_site' ? 'banner' : content.format}`}>
                {content.type || content.format}
              </span>
            )}
          </div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginTop: 'var(--space-1)' }}>
            {content.strategy_focus}
            {content.persona_target && ` | ${content.persona_target}`}
            {content.generationTime && (
              <span className="badge badge-primary" style={{ marginLeft: 'var(--space-2)' }}>
                {content.generationTime}ms
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn btn-secondary" onClick={handleCopyAll} style={{ fontSize: 'var(--text-xs)' }}>
            Copiar Tudo
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('md')} style={{ fontSize: 'var(--text-xs)' }}>
            .md
          </button>
          <button className="btn btn-secondary" onClick={() => handleExport('txt')} style={{ fontSize: 'var(--text-xs)' }}>
            .txt
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* ─── REELS Script ─── */}
        {content.script && content.script.length > 0 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
              <h4 style={{ margin: 0, color: 'var(--color-primary)' }}>Roteiro Cena a Cena</h4>
            </div>
            <table className="script-table">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Tempo</th>
                  <th>Visual & Prompt</th>
                  <th>Texto / Áudio</th>
                  <th style={{ width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {content.script.map((scene, i) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{scene.time}</td>
                    <td>
                      <div style={{ fontWeight: 600, marginBottom: 'var(--space-2)' }}>{scene.visual}</div>
                      {scene.visual_prompt && (
                        <div>
                          <div className="prompt-block" style={{
                            background: 'var(--gray-50)',
                            border: '1px solid var(--border-default)',
                            color: 'var(--text-secondary)',
                            fontSize: 'var(--text-xs)',
                            padding: 'var(--space-2)',
                          }}>
                            {scene.visual_prompt}
                          </div>
                          <GenerateImageButton
                            prompt={scene.visual_prompt}
                            format={content.format}
                            label={`Cena ${i + 1}`}
                            content={content}
                            withMascot={withMascot}
                            productImageUrl={productImageUrl}
                          />
                        </div>
                      )}
                    </td>
                    <td style={{ lineHeight: 'var(--leading-relaxed)' }}>{scene.text}</td>
                    <td>
                      <CopyButton text={scene.visual_prompt || scene.text} label={`scene-${i}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ─── CARROSSEL Slides ─── */}
        {content.slides && content.slides.length > 0 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>Slides do Carrossel</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
              {content.slides.map((slide, i) => (
                <div key={i} className="card" style={{ border: '1px solid var(--border-default)' }}>
                  <div style={{
                    background: i === 0
                      ? 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)'
                      : i === content.slides.length - 1
                        ? 'linear-gradient(135deg, var(--color-secondary) 0%, var(--color-secondary-dark) 100%)'
                        : 'var(--gray-50)',
                    color: i === 0 || i === content.slides.length - 1 ? 'white' : 'var(--text-primary)',
                    padding: 'var(--space-4)',
                    minHeight: '120px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontSize: 'var(--text-sm)',
                    fontWeight: 600,
                  }}>
                    <div>
                      <div style={{ fontSize: 'var(--text-xs)', opacity: 0.7, marginBottom: 'var(--space-1)' }}>
                        Slide {slide.slide}
                      </div>
                      {slide.text}
                    </div>
                  </div>
                  <div style={{ padding: 'var(--space-3)', fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                    <div style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>Visual:</div>
                    {slide.visual}
                    {slide.note && (
                      <div style={{ marginTop: 'var(--space-2)', fontStyle: 'italic', color: 'var(--text-muted)' }}>
                        {slide.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── STORIES Sequence ─── */}
        {content.storySequence && content.storySequence.length > 0 && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <h4 style={{ color: 'var(--color-primary)', margin: 0 }}>Stories</h4>
              {content.trend && (
                <span className="badge badge-secondary">Trend: {content.trend}</span>
              )}
            </div>
            {content.trendDescription && (
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                {content.trendDescription}
              </p>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-2)' }}>
              {content.storySequence.map((story, i) => (
                <div key={i} className="story-preview" style={{ minWidth: '180px' }}>
                  <div style={{
                    position: 'absolute',
                    top: 'var(--space-2)',
                    left: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                  }}>
                    {story.type}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2)', fontWeight: 500 }}>
                    {story.text}
                  </div>
                  <div style={{
                    position: 'absolute',
                    bottom: 'var(--space-2)',
                    fontSize: 'var(--text-xs)',
                    opacity: 0.7,
                    padding: '0 var(--space-2)',
                    textAlign: 'center',
                  }}>
                    {story.visual}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── POST ESTÁTICO Layout ─── */}
        {content.layout && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>Layout do Post</h4>
            <div className="card" style={{
              background: 'var(--gray-50)',
              border: '1px solid var(--border-default)',
              padding: 'var(--space-6)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-primary)', marginBottom: 'var(--space-2)' }}>
                {content.layout.headline}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
                {content.layout.subheadline}
              </div>
              <div style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>
                {content.layout.bodyText}
              </div>
              <button className="btn btn-primary" style={{ pointerEvents: 'none' }}>
                {content.layout.cta}
              </button>
            </div>
          </div>
        )}

        {/* ─── BANNER Site ─── */}
        {content.bannerSpecs && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>Especificações do Banner</h4>
            <div style={{
              background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-6) var(--space-8)',
              color: 'white',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              minHeight: '120px',
            }}>
              <div>
                <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, marginBottom: 'var(--space-1)' }}>
                  {content.bannerSpecs.headline}
                </div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.8 }}>
                  {content.bannerSpecs.subheadline}
                </div>
              </div>
              <button className="btn btn-primary" style={{ pointerEvents: 'none', flexShrink: 0 }}>
                {content.bannerSpecs.cta_button}
              </button>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)' }}>
              Dimensões: {content.bannerSpecs.dimensions}
            </div>
          </div>
        )}

        {/* ─── WHATSAPP Messages ─── */}
        {content.messages && (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--space-3)' }}>Mensagens WhatsApp</h4>
            <div style={{ background: '#E5DDD5', padding: 'var(--space-4)', borderRadius: 'var(--radius-lg)' }}>
              {Object.entries(content.messages).map(([tipo, msg]) => (
                <div key={tipo} style={{ marginBottom: 'var(--space-4)' }}>
                  <div className="whatsapp-msg-label" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-1)' }}>
                    {tipo}
                  </div>
                  <div className="whatsapp-msg">
                    {msg}
                    <CopyButton text={msg} label={`whatsapp-${tipo}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── ASSETS / PROMPTS ─── */}
        {content.assets && (
          <div className="dark-box" style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 'var(--space-3)' }}>
              <h4 style={{ color: 'var(--color-secondary)', margin: 0 }}>
                Prompts para IA
              </h4>
              <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer', fontSize: 'var(--text-sm)', color: 'var(--gray-300)' }}>
                <input
                  type="checkbox"
                  checked={withMascot}
                  onChange={(e) => setWithMascot(e.target.checked)}
                  style={{ accentColor: 'var(--color-secondary)' }}
                />
                🧸 Com Mascote
              </label>
            </div>

            {content.assets.narration_text && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span className="section-label">Narração / Áudio</span>
                <div style={{
                  background: 'rgba(255,255,255,0.08)',
                  padding: 'var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  fontStyle: 'italic',
                  lineHeight: 'var(--leading-relaxed)',
                }}>
                  {content.assets.narration_text}
                </div>
                <CopyButton text={content.assets.narration_text} label="narration" />
              </div>
            )}

            {content.assets.image_prompts?.length > 0 && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span className="section-label">Prompts de Imagem</span>
                {content.assets.image_prompts.map((p, i) => (
                  <div key={i} style={{ marginBottom: 'var(--space-3)' }}>
                    <div className="prompt-block">
                      {p}
                      <InlineCopyBtn text={p} id={`img-${i}`} copiedId={copiedId} onCopy={handleCopy} />
                    </div>
                    <GenerateImageButton
                      prompt={p}
                      format={content.format}
                      label={`Imagem ${i + 1}`}
                      content={content}
                      withMascot={withMascot}
                      productImageUrl={productImageUrl}
                    />
                  </div>
                ))}
              </div>
            )}

            {content.assets.video_prompts?.length > 0 && (
              <div>
                <span className="section-label">Prompts de Vídeo</span>
                {content.assets.video_prompts.map((p, i) => (
                  <div key={i} className="prompt-block">
                    {p}
                    <InlineCopyBtn text={p} id={`vid-${i}`} copiedId={copiedId} onCopy={handleCopy} />
                  </div>
                ))}
              </div>
            )}

            {/* PromptPack inline */}
            {content.assets.promptPack && (
              <div style={{ marginTop: 'var(--space-4)', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--space-4)' }}>
                <span className="section-label">Prompt Pack (Copy-Paste para IA)</span>
                {['studio', 'lifestyle', 'institutional'].map(style => (
                  content.assets.promptPack[style] && (
                    <div key={style} style={{ marginBottom: 'var(--space-4)' }}>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-400)', marginBottom: 'var(--space-1)', textTransform: 'capitalize' }}>
                        {style === 'studio' ? 'Foto de Estúdio' : style === 'lifestyle' ? 'Lifestyle B2B' : 'Institucional'}
                      </div>
                      <div className="prompt-block">
                        {content.assets.promptPack[style]}
                        <InlineCopyBtn
                          text={content.assets.promptPack[style]}
                          id={`pack-${style}`}
                          copiedId={copiedId}
                          onCopy={handleCopy}
                        />
                      </div>
                      <GenerateImageButton
                        prompt={content.assets.promptPack[style]}
                        format={content.format}
                        label={style === 'studio' ? 'Estúdio' : style === 'lifestyle' ? 'Lifestyle' : 'Institucional'}
                        content={content}
                        withMascot={withMascot}
                        productImageUrl={productImageUrl}
                      />
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── CAPTION ─── */}
        {content.caption && (
          <div className="caption-block">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
              <strong style={{ color: 'var(--color-primary)' }}>Legenda</strong>
              <CopyButton text={content.caption} label="caption" />
            </div>
            <pre>{content.caption}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
