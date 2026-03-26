import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { ProductSelector } from './components/ProductSelector';
import { ContentGenerator } from './components/ContentGenerator';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { Menu, X } from 'lucide-react';

const LOGO_URL = "https://assets.agilecdn.com.br/images/logo_gamadistribuidora.png?v=690";

function AppContent() {
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [logoError, setLogoError] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-br from-navy to-navy-dark text-white shadow-lg">
        <div className="rainbow-gradient h-[3px]" />
        <div className="flex items-center gap-4 px-4 lg:px-8 py-3 max-w-[1440px] mx-auto">
          <button
            className="lg:hidden p-1.5 rounded-md hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {!logoError ? (
            <img
              src={LOGO_URL}
              alt="Gama Distribuidora"
              className="h-10 w-auto object-contain brightness-0 invert"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-11 h-11 bg-gradient-to-br from-gama-azul via-gama-verde to-gama-amarelo rounded-md flex items-center justify-center shrink-0">
              <span className="text-2xl font-black text-white leading-none">G</span>
            </div>
          )}

          <span className="h-7 w-px bg-white/20 shrink-0 hidden sm:block" />

          <div className="flex flex-col gap-px">
            <span className="text-lg font-bold tracking-tight leading-tight">Laboratório de Conteúdo</span>
            <span className="text-xs opacity-65 leading-tight hidden sm:block">Gama Distribuidora · Distribuidor Oficial Coral/AkzoNobel</span>
          </div>

          <img
            src="/gama-mascote.jpg"
            alt="Mascote Gama"
            className="h-16 w-auto object-contain ml-2 drop-shadow-lg hidden md:block"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="ml-auto bg-white/12 border border-white/25 rounded-full px-3 py-1 text-xs font-semibold text-white/85 whitespace-nowrap">
            🎨 20 anos
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[360px_1fr] h-[calc(100vh-76px)]">
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <div className={`fixed lg:static inset-y-0 left-0 z-40 w-[360px] transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <ProductSelector
            onSelect={(product) => { setSelectedItem(product); setSidebarOpen(false); }}
            onCategorySelect={(cat) => { setSelectedItem(cat); setSidebarOpen(false); }}
            onBrandSelect={(brand) => { setSelectedItem(brand); setSidebarOpen(false); }}
            selectedItem={selectedItem}
          />
        </div>

        <ErrorBoundary>
          <ContentGenerator item={selectedItem} />
        </ErrorBoundary>
      </div>

      <Toaster position="bottom-right" theme="dark" richColors />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </AppProvider>
  );
}
