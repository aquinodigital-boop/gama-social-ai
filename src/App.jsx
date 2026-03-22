import React, { useState } from 'react';
import { ProductSelector } from './components/ProductSelector';
import { ContentGenerator } from './components/ContentGenerator';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';

const LOGO_URL = "https://assets.agilecdn.com.br/images/logo_gamadistribuidora.png?v=690";

function App() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [logoError, setLogoError] = useState(false);

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="app-root">
          <header className="labor-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', width: '100%' }}>

              {/* Logo */}
              {!logoError ? (
                <img
                  src={LOGO_URL}
                  alt="Gama Distribuidora"
                  className="header-logo"
                  style={{ height: '40px', width: 'auto', objectFit: 'contain', filter: 'brightness(0) invert(1)' }}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="header-brand-mark">
                  <span className="header-brand-g">G</span>
                </div>
              )}

              <span className="header-divider"></span>

              {/* Título */}
              <div className="header-title-group">
                <span className="header-app-name">Laboratório de Conteúdo</span>
                <span className="tagline">Gama Distribuidora · Distribuidor Oficial Coral/AkzoNobel</span>
              </div>

              {/* Mascote */}
              <img
                src="/gama-mascote.jpg"
                alt="Mascote Gama"
                style={{
                  height: '64px',
                  width: 'auto',
                  objectFit: 'contain',
                  marginLeft: 'var(--space-2)',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))',
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />

              {/* Badge */}
              <div className="header-badge" style={{ marginLeft: 'auto' }}>
                <span>🎨 20 anos</span>
              </div>
            </div>
          </header>

          <div className="app-layout">
            <ProductSelector
              onSelect={(product) => setSelectedItem(product)}
              onCategorySelect={(cat) => setSelectedItem(cat)}
              onBrandSelect={(brand) => setSelectedItem(brand)}
              selectedItem={selectedItem}
            />
            <ErrorBoundary>
              <ContentGenerator item={selectedItem} />
            </ErrorBoundary>
          </div>
        </div>
      </ErrorBoundary>
    </ToastProvider>
  );
}

export default App;
