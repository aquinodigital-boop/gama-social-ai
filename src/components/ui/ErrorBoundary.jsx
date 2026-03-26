import React from 'react';
import { Button } from '@/components/ui/button';

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
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-error m-4">
          <h3 className="text-error font-semibold mb-2">Algo deu errado</h3>
          <p className="text-text-secondary text-sm mb-4">
            {this.state.error?.message || 'Erro inesperado'}
          </p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Tentar novamente
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
