import React from 'react';

const GRADE = {
  A: { color: '#10B981', label: 'Excelente' },
  B: { color: '#3B82F6', label: 'Bom' },
  C: { color: '#F59E0B', label: 'Ajustar' },
  D: { color: '#F97316', label: 'Refazer' },
  F: { color: '#EF4444', label: 'Bloqueado' },
};

export function QualityPanel({ quality }) {
  if (!quality) return null;
  const g = GRADE[quality.grade] || GRADE.D;
  const max = Math.max(quality.maxScore || 1, 1);
  const pct = Math.min(100, Math.round((quality.score / max) * 100));

  return (
    <section className="paper-card overflow-hidden">
      <span className="paint-band" style={{ background: g.color }} />
      <div className="p-5">
        {/* Top: grade gigantona + barra */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="display-xl shrink-0 flex items-center justify-center"
            style={{
              width: 72, height: 72,
              background: g.color,
              color: '#fff',
              fontSize: 44,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              borderRadius: 2,
              fontFamily: 'var(--font-display)',
            }}
          >
            {quality.grade}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="display-lg" style={{ fontSize: 22 }}>{g.label}</span>
              <span className="mono text-[11px] opacity-60">{quality.score}/{quality.maxScore} pts</span>
            </div>
            {/* Barra editorial — dashed em vez de barra cheia */}
            <div className="mt-2 relative" style={{ height: 8, background: 'var(--color-paper-2)', border: '1px solid var(--color-rule)', borderRadius: 1 }}>
              <div
                className="absolute inset-y-0 left-0"
                style={{ width: `${pct}%`, background: g.color, borderRight: '1px solid var(--color-ink)' }}
              />
            </div>
            <div className="mono text-[10px] mt-1 opacity-60">{pct}% de aderência ao DNA Gama</div>
          </div>
        </div>

        {/* Quando bloqueado */}
        {quality.blocked && (
          <div
            className="mb-4 p-3"
            style={{
              background: 'rgba(239,68,68,0.08)',
              borderLeft: `4px solid ${g.color}`,
              borderRadius: 2,
            }}
          >
            <span className="mono text-[11px] font-bold" style={{ color: g.color, letterSpacing: '0.06em' }}>
              ★ PUBLICAÇÃO BLOQUEADA — VIOLOU UMA REGRA HARD
            </span>
          </div>
        )}

        {/* Checks */}
        {quality.checks?.length > 0 && (
          <>
            <div className="eyebrow mb-2">Critérios</div>
            <div className="flex flex-col" style={{ borderTop: '1px solid var(--color-rule)' }}>
              {quality.checks.map((check) => (
                <div
                  key={check.id}
                  className="flex items-start gap-3 py-2"
                  style={{ borderBottom: '1px solid var(--color-rule)' }}
                >
                  <span
                    className="mono text-[10px] font-bold shrink-0 w-5 text-center"
                    style={{
                      color: check.passed ? 'var(--color-status-aprovado)' : 'var(--color-status-recusado)',
                    }}
                  >
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ fontFamily: 'var(--font-display)' }}>{check.label}</div>
                    {check.detail && (
                      <div
                        className="text-xs mt-0.5"
                        style={{ color: check.passed ? 'var(--color-status-aprovado)' : 'var(--color-status-recusado)', opacity: 0.85 }}
                      >
                        {check.detail}
                      </div>
                    )}
                  </div>
                  <span
                    className="mono text-[10px] shrink-0 px-1.5 py-0.5"
                    style={{
                      border: '1px solid var(--color-rule)',
                      borderRadius: 1,
                      color: 'var(--color-text-muted)',
                    }}
                  >
                    +{check.weight}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Soft warnings */}
        {quality.softWarnings?.length > 0 && (
          <div className="mt-4">
            <div className="eyebrow mb-2">Avisos · não bloqueiam</div>
            <ul className="space-y-1 text-sm">
              {quality.softWarnings.map((w, i) => (
                <li key={i} className="flex gap-2" style={{ color: 'var(--color-warning)' }}>
                  <span className="mono text-[10px] mt-0.5 shrink-0">▸</span>
                  <span><strong>{w.label}:</strong> {w.snippet}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}
