import React, { useState } from 'react';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { useToast } from '../hooks/useToast.js';
import { weeklyPlanToText, downloadFile, copyToClipboard } from '../utils/export.js';

const FORMAT_LABELS = {
  reels: { label: 'Reels', icon: '🎬', tag: 'format-tag-reels' },
  carrossel: { label: 'Carrossel', icon: '📸', tag: 'format-tag-carrossel' },
  stories: { label: 'Stories', icon: '📱', tag: 'format-tag-stories' },
  post_estatico: { label: 'Post', icon: '📌', tag: 'format-tag-post' },
  banner_site: { label: 'Banner', icon: '🖥️', tag: 'format-tag-banner' },
  whatsapp: { label: 'WhatsApp', icon: '💬', tag: 'format-tag-whatsapp' },
};

const ANGLE_LABELS = {
  logistics: 'Logística Ágil',
  profit: 'Margem & Lucro',
  partnership: 'Parceria',
  problem_solution: 'Solução',
};

export function WeeklyPlan({ plan, onSaveToHistory }) {
  const { addToast } = useToast();
  const [selectedDay, setSelectedDay] = useState(null);

  if (!plan || plan.length === 0) return null;

  const handleExportPlan = (format) => {
    const text = weeklyPlanToText(plan, format);
    const ext = format === 'md' ? 'md' : 'txt';
    downloadFile(text, `labor-plano-semanal-${Date.now()}.${ext}`, 'text/plain');
    addToast(`Plano exportado como .${ext}`, 'success');
  };

  const handleCopyPlan = async () => {
    const text = weeklyPlanToText(plan, 'txt');
    const ok = await copyToClipboard(text);
    if (ok) addToast('Plano copiado para clipboard!', 'success');
  };

  const handleSaveDay = (day) => {
    day.contents.forEach(c => onSaveToHistory(c));
    addToast(`${day.dayName} salvo no histórico!`, 'success');
  };

  return (
    <div className="fade-in">
      {/* Export bar */}
      <div style={{
        display: 'flex',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
        justifyContent: 'flex-end',
      }}>
        <button className="btn btn-secondary" onClick={handleCopyPlan}>
          Copiar Plano
        </button>
        <button className="btn btn-secondary" onClick={() => handleExportPlan('md')}>
          Exportar .md
        </button>
        <button className="btn btn-secondary" onClick={() => handleExportPlan('txt')}>
          Exportar .txt
        </button>
      </div>

      {/* Weekly grid */}
      <div className="weekly-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {plan.map((day) => {
          const fmt = FORMAT_LABELS[day.format] || { label: day.format, icon: '📄', tag: '' };
          return (
            <div
              key={day.day}
              className={`day-card ${selectedDay === day.day ? 'active' : ''}`}
              onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
            >
              <div className="day-label">{day.dayName}</div>
              <div className="day-number">{day.day}</div>
              <div style={{ marginTop: 'var(--space-2)' }}>
                <span className={`format-tag ${fmt.tag}`}>
                  {fmt.icon} {fmt.label}
                </span>
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                marginTop: 'var(--space-1)',
              }}>
                {ANGLE_LABELS[day.angle] || day.angle}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div className="fade-in">
          {plan.filter(d => d.day === selectedDay).map(day => (
            <div key={day.day}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--space-4)',
              }}>
                <h3 style={{ margin: 0, color: 'var(--color-primary)' }}>
                  {day.dayName} - Dia {day.day}
                </h3>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleSaveDay(day)}
                  style={{ fontSize: 'var(--text-xs)' }}
                >
                  Salvar no Histórico
                </button>
              </div>
              {day.contents.map((content, i) => (
                <div key={i}>
                  <ContentDisplay content={content} />
                  {content.quality && <QualityPanel quality={content.quality} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
