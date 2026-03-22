import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Erro capturado:', error, errorInfo);
    // Futura integração com serviço de monitoramento
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 'var(--space-8, 2rem)',
          textAlign: 'center',
          background: 'var(--color-error-bg, #FEF2F2)',
          borderRadius: 'var(--radius-lg, 8px)',
          border: '1px solid var(--color-error, #EF4444)',
          margin: '1rem',
        }}>
          <h3 style={{ color: 'var(--color-error, #EF4444)', marginBottom: '0.5rem' }}>
            Algo deu errado
          </h3>
          <p style={{ color: 'var(--text-secondary, #666)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            {this.state.error?.message || 'Erro inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn btn-secondary"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
