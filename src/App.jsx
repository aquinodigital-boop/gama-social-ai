import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { ProductSelector } from './components/ProductSelector';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';

// Lazy-load módulos pesados
const TradeMarketing    = React.lazy(() => import('./components/TradeMarketing.jsx').then(m => ({ default: m.TradeMarketing })));
const KitPromotor       = React.lazy(() => import('./components/KitPromotor.jsx').then(m => ({ default: m.KitPromotor })));
const WhatsAppHub       = React.lazy(() => import('./components/WhatsAppHub.jsx').then(m => ({ default: m.WhatsAppHub })));
const SocialContent     = React.lazy(() => import('./components/SocialContent.jsx').then(m => ({ default: m.SocialContent })));
const IntelligencePanel = React.lazy(() => import('./components/IntelligencePanel.jsx').then(m => ({ default: m.IntelligencePanel })));
const SettingsPanel     = React.lazy(() => import('./components/SettingsPanel.jsx').then(m => ({ default: m.SettingsPanel })));

/**
 * MODULES — cada módulo é um "cartão Pantone" com código próprio.
 *   code   → "PANTONE code" exibido no swatch
 *   letter → letra grande no swatch (display)
 *   label  → nome editorial
 *   color  → cor do swatch
 */
const MODULES = [
  { id: 'trade',        code: 'GMA-001', letter: 'T', label: 'Trade Marketing', color: 'var(--color-chip-trade)',    hasSidebar: true  },
  { id: 'kit',          code: 'GMA-002', letter: 'K', label: 'Kit Promotor',    color: 'var(--color-chip-kit)',      hasSidebar: true  },
  { id: 'whatsapp',     code: 'GMA-003', letter: 'W', label: 'WhatsApp B2B',    color: 'var(--color-chip-whatsapp)', hasSidebar: true  },
  { id: 'social',       code: 'GMA-004', letter: 'S', label: 'Conteúdo Social', color: 'var(--color-chip-social)',   hasSidebar: true  },
  { id: 'intelligence', code: 'GMA-005', letter: 'I', label: 'Inteligência',    color: 'var(--color-chip-intel)',    hasSidebar: false },
  { id: 'settings',     code: 'GMA-099', letter: '⚙', label: 'Configurações',   color: 'var(--color-chip-settings)', hasSidebar: false },
];

function ModuleRouter({ activeModule, selectedItem }) {
  return (
    <React.Suspense fallback={<RouteSpinner />}>
      {activeModule === 'trade'        && <TradeMarketing item={selectedItem} />}
      {activeModule === 'kit'          && <KitPromotor item={selectedItem} />}
      {activeModule === 'whatsapp'     && <WhatsAppHub item={selectedItem} />}
      {activeModule === 'social'       && <SocialContent item={selectedItem} />}
      {activeModule === 'intelligence' && <IntelligencePanel />}
      {activeModule === 'settings'     && <SettingsPanel />}
    </React.Suspense>
  );
}

function RouteSpinner() {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="spinner" />
      <span className="eyebrow">carregando módulo</span>
    </div>
  );
}

/** Sidebar nav desktop — chips Pantone empilhados verticalmente */
function NavBar() {
  const { activeModule, setActiveModule } = useAppContext();

  return (
    <nav
      className="hidden lg:flex flex-col w-[76px] shrink-0 items-center gap-3 py-6"
      style={{ background: 'var(--color-paper-2)', borderRight: '1px solid var(--color-rule)' }}
    >
      <div
        className="eyebrow text-center"
        style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginBottom: 8 }}
      >
        MÓDULOS · NO. 06
      </div>

      <div className="flex flex-col gap-2.5">
        {MODULES.map(({ id, letter, label, code, color }) => {
          const active = activeModule === id;
          return (
            <button
              key={id}
              onClick={() => setActiveModule(id)}
              className={cn('swatch group relative', active && 'active')}
              data-code={code}
              style={{ background: color }}
              title={label}
              aria-label={label}
            >
              <span>{letter}</span>
              {/* tooltip lateral */}
              <span
                className="absolute left-[60px] top-1/2 -translate-y-1/2 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'var(--color-ink)',
                  color: 'var(--color-paper)',
                  padding: '4px 8px',
                  borderRadius: 2,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto eyebrow opacity-50 text-center" style={{ fontSize: 8 }}>v2.1</div>
    </nav>
  );
}

/** Mobile nav — chips em fila horizontal */
function MobileNav() {
  const { activeModule, setActiveModule } = useAppContext();
  return (
    <nav
      className="lg:hidden flex overflow-x-auto gap-2 px-4 py-3"
      style={{ background: 'var(--color-paper-2)', borderBottom: '1px solid var(--color-rule)' }}
    >
      {MODULES.map(({ id, label, letter, color }) => {
        const active = activeModule === id;
        return (
          <button
            key={id}
            onClick={() => setActiveModule(id)}
            className={cn('flex items-center gap-2 px-3 py-1.5 shrink-0 transition-all', active && 'shadow-[2px_2px_0_var(--color-ink)]')}
            style={{
              background: active ? color : 'transparent',
              color: active ? '#fff' : 'var(--color-text-primary)',
              border: `1px solid ${active ? color : 'var(--color-rule)'}`,
              borderRadius: 2,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              fontWeight: 600,
              opacity: active ? 1 : 0.75,
            }}
          >
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700 }}>{letter}</span>
            {label}
          </button>
        );
      })}
    </nav>
  );
}

/** Header editorial — dateline magazine + brand + breadcrumb com código do módulo */
function Header({ activeModuleDef }) {
  const { sidebarOpen, setSidebarOpen } = useAppContext();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <header className="sticky top-0 z-20" style={{ background: 'var(--color-paper)', borderBottom: '1px solid var(--color-rule)' }}>
      {/* Faixa amarela (assinatura visual) */}
      <div
        className="h-[6px] w-full"
        style={{ background: 'linear-gradient(90deg, var(--color-gama-amarelo-3) 0%, var(--color-gama-amarelo) 50%, var(--color-gama-amarelo-3) 100%)' }}
      />

      <div className="px-4 lg:px-8 py-3 flex items-center gap-4">
        <button
          className="lg:hidden p-1.5"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menu"
          style={{ border: '1px solid var(--color-rule)', borderRadius: 2 }}
        >
          {sidebarOpen ? <X size={16} /> : <Menu size={16} />}
        </button>

        {/* Brand */}
        <div className="flex items-baseline gap-3 min-w-0">
          <div className="display-md font-bold tracking-tight whitespace-nowrap" style={{ color: 'var(--color-ink)' }}>
            Gama<span style={{ color: 'var(--color-gama-amarelo-3)' }}>·</span>
            <span style={{ position: 'relative' }}>
              <span style={{ position: 'relative', zIndex: 1 }}>Trade Hub</span>
              <span className="stroke-y" />
            </span>
          </div>
          <span className="eyebrow hidden sm:inline">Est. 2005 · Grande SP</span>
        </div>

        {/* Right: dateline + breadcrumb + tape */}
        <div className="ml-auto flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end gap-0.5">
            <span className="eyebrow" style={{ fontSize: 9 }}>{today}</span>
            {activeModuleDef && (
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5" style={{ background: activeModuleDef.color, borderRadius: 1 }} />
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, letterSpacing: '-0.02em' }}>
                  {activeModuleDef.label}
                </span>
                <span className="mono text-[10px] opacity-50">{activeModuleDef.code}</span>
              </div>
            )}
          </div>

          <span className="tape hidden sm:inline-flex">DIST · CORAL</span>
        </div>
      </div>

      {/* Sub-header com info estratégica em mono */}
      <div className="px-4 lg:px-8 py-1.5 flex flex-wrap gap-x-4 gap-y-1 items-center" style={{ background: 'var(--color-paper-2)', borderTop: '1px solid var(--color-rule)' }}>
        <span className="eyebrow" style={{ fontSize: 9 }}>Área:</span>
        <span className="mono text-[10px]" style={{ color: 'var(--color-ink-2)' }}>Grande SP · ABC · Zona Oeste · Alphaville</span>
        <span className="opacity-30">|</span>
        <span className="eyebrow" style={{ fontSize: 9 }}>Linhas Coral:</span>
        <span className="mono text-[10px]" style={{ color: 'var(--color-ink-2)' }}>Coralar · Decora · Sparlack · Mactra · Sol&amp;Chuva</span>
      </div>
    </header>
  );
}

function AppContent() {
  const { activeModule, sidebarOpen, setSidebarOpen } = useAppContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const moduleDef = MODULES.find((m) => m.id === activeModule);
  const showSidebar = moduleDef?.hasSidebar ?? false;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-paper)' }}>
      <Header activeModuleDef={moduleDef} />
      <MobileNav />

      <div className="flex flex-1 overflow-hidden">
        <NavBar />

        {showSidebar && (
          <>
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 lg:hidden"
                onClick={() => setSidebarOpen(false)}
                style={{ background: 'rgba(11,11,15,0.55)' }}
              />
            )}
            <aside
              className={cn(
                'fixed lg:static inset-y-0 left-0 z-40 transform transition-all duration-200',
                sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden' : 'w-[340px]'
              )}
              style={{ background: 'var(--color-surface-card)', borderRight: '1px solid var(--color-rule)' }}
            >
              <div className="w-[340px] h-full relative">
                <ProductSelector
                  onSelect={(p) => { setSelectedItem(p); setSidebarOpen(false); }}
                  onCategorySelect={(c) => { setSelectedItem(c); setSidebarOpen(false); }}
                  onBrandSelect={(b) => { setSelectedItem(b); setSidebarOpen(false); }}
                  selectedItem={selectedItem}
                />
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 items-center justify-center z-10"
                  style={{
                    background: 'var(--color-surface-card)',
                    border: '1px solid var(--color-rule)',
                    borderLeft: 'none',
                    borderRadius: '0 2px 2px 0',
                  }}
                  title={sidebarCollapsed ? 'Expandir' : 'Recolher'}
                >
                  {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              </div>
            </aside>
          </>
        )}

        {/* Main content com max-width editorial e padding generoso */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1280px] mx-auto px-5 lg:px-10 py-8">
            <ErrorBoundary>
              <ModuleRouter activeModule={activeModule} selectedItem={selectedItem} />
            </ErrorBoundary>
          </div>
        </main>
      </div>

      <Toaster
        position="bottom-right"
        richColors
        toastOptions={{
          style: {
            fontFamily: 'var(--font-sans)',
            border: '1px solid var(--color-ink)',
            borderRadius: 2,
            background: 'var(--color-surface-card)',
            color: 'var(--color-text-primary)',
          },
        }}
      />
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
