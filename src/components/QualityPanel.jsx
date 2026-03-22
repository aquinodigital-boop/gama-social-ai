import React from 'react';

/**
 * QualityPanel
 * Exibe o resultado do checklist de qualidade do conteúdo.
 */
export function QualityPanel({ quality }) {
  if (!quality) return null;

  return (
    <div className="card" style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
      <div className="card-header" style={{ background: 'var(--gray-50)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span className={`quality-badge quality-${quality.grade}`}>
            {quality.grade}
          </span>
          <div>
            <strong style={{ fontSize: 'var(--text-sm)' }}>
              Qualidade: {quality.percentage}%
            </strong>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              {quality.score}/{quality.maxScore} pontos
            </div>
          </div>
        </div>
        <div>
          {quality.passed ? (
            <span className="badge badge-success">Aprovado</span>
          ) : (
            <span className="badge badge-warning">Ajustar</span>
          )}
        </div>
      </div>

      <div className="card-body" style={{ padding: 'var(--space-4)' }}>
        {quality.checks.map(check => (
          <div key={check.id} className="check-item">
            <span className={`check-icon ${check.passed ? 'check-passed' : 'check-failed'}`}>
              {check.passed ? '✅' : '❌'}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>
                {check.label}
              </div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: check.passed ? 'var(--color-success)' : 'var(--color-error)',
                marginTop: '2px',
              }}>
                {check.detail}
              </div>
            </div>
            <span className="badge" style={{
              background: check.passed ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
              color: check.passed ? 'var(--color-success)' : 'var(--color-error)',
              flexShrink: 0,
            }}>
              +{check.weight}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
