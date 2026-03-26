import React, { useState } from 'react';
import { ContentDisplay } from './ContentDisplay.jsx';
import { QualityPanel } from './QualityPanel.jsx';
import { weeklyPlanToText, downloadFile, copyToClipboard } from '../utils/export.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Copy, Download, Save } from 'lucide-react';

const FORMAT_LABELS = {
  reels: { label: 'Reels', icon: '🎬', color: 'text-red-500' },
  carrossel: { label: 'Carrossel', icon: '📸', color: 'text-purple-500' },
  stories: { label: 'Stories', icon: '📱', color: 'text-amber-500' },
  post_estatico: { label: 'Post', icon: '📌', color: 'text-blue-500' },
  banner_site: { label: 'Banner', icon: '🖥️', color: 'text-emerald-500' },
  whatsapp: { label: 'WhatsApp', icon: '💬', color: 'text-green-500' },
};

const ANGLE_LABELS = {
  coral_expertise: 'Expertise Coral',
  profit: 'Margem & Lucro',
  reconquista: 'Reconquista',
  partnership: 'Parceria',
  technical: 'Técnico',
};

export function WeeklyPlan({ plan, onSaveToHistory }) {
  const [selectedDay, setSelectedDay] = useState(null);

  if (!plan || plan.length === 0) return null;

  const handleExportPlan = (format) => {
    const text = weeklyPlanToText(plan, format);
    const ext = format === 'md' ? 'md' : 'txt';
    downloadFile(text, `gama-plano-semanal-${Date.now()}.${ext}`, 'text/plain');
    toast.success(`Plano exportado como .${ext}`);
  };

  const handleCopyPlan = async () => {
    const text = weeklyPlanToText(plan, 'txt');
    const ok = await copyToClipboard(text);
    if (ok) toast.success('Plano copiado para clipboard!');
  };

  const handleSaveDay = (day) => {
    day.contents.forEach(c => onSaveToHistory(c));
    toast.success(`${day.dayName} salvo no histórico!`);
  };

  return (
    <div className="fade-in">
      <div className="flex gap-2 mb-4 justify-end flex-wrap">
        <Button variant="outline" size="sm" onClick={handleCopyPlan}><Copy size={14} className="mr-1" /> Copiar</Button>
        <Button variant="outline" size="sm" onClick={() => handleExportPlan('md')}><Download size={14} className="mr-1" /> .md</Button>
        <Button variant="outline" size="sm" onClick={() => handleExportPlan('txt')}>.txt</Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {plan.map((day) => {
          const fmt = FORMAT_LABELS[day.format] || { label: day.format, icon: '📄', color: 'text-gray-500' };
          return (
            <div
              key={day.day}
              className={cn(
                'bg-surface-card border rounded-lg p-3 cursor-pointer transition-all text-center hover:shadow-md',
                selectedDay === day.day
                  ? 'border-coral shadow-md ring-1 ring-coral/30'
                  : 'border-border hover:border-navy/30 dark:hover:border-coral/30'
              )}
              onClick={() => setSelectedDay(selectedDay === day.day ? null : day.day)}
            >
              <div className="text-xs font-semibold text-text-muted">{day.dayName}</div>
              <div className="text-2xl font-bold text-navy dark:text-coral my-1">{day.day}</div>
              <div className={cn('text-xs font-semibold', fmt.color)}>
                {fmt.icon} {fmt.label}
              </div>
              <div className="text-[10px] text-text-muted mt-1">
                {ANGLE_LABELS[day.angle] || day.angle}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <div className="fade-in">
          {plan.filter(d => d.day === selectedDay).map(day => (
            <div key={day.day}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-navy dark:text-coral">{day.dayName} - Dia {day.day}</h3>
                <Button variant="outline" size="sm" onClick={() => handleSaveDay(day)} className="text-xs">
                  <Save size={14} className="mr-1" /> Salvar no Histórico
                </Button>
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
