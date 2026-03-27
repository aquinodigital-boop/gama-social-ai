import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext.jsx';
import { ProductSelector } from './components/ProductSelector';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { Toaster } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import {
  Store, UserCheck, MessageCircle, Image, BarChart3, Settings,
  Menu, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

// Lazy-load modules
const TradeMarketing = React.lazy(() => import('./components/TradeMarketing.jsx').then(m => ({ default: m.TradeMarketing })));
const KitPromotor = React.lazy(() => import('./components/KitPromotor.jsx').then(m => ({ default: m.KitPromotor })));
const WhatsAppHub = React.lazy(() => import('./components/WhatsAppHub.jsx').then(m => ({ default: m.WhatsAppHub })));
const SocialContent = React.lazy(() => import('./components/SocialContent.jsx').then(m => ({ default: m.SocialContent })));
const IntelligencePanel = React.lazy(() => import('./components/IntelligencePanel.jsx').then(m => ({ default: m.IntelligencePanel })));
const SettingsPanel = React.lazy(() => import('./components/SettingsPanel.jsx').then(m => ({ default: m.SettingsPanel })));

const LOGO_URL = "https://assets.agilecdn.com.br/images/logo_gamadistribuidora.png?v=690";

const MODULES = [
  { id: 'trade', label: 'Trade Marketing', Icon: Store, color: 'text-coral', hasSidebar: true },
  { id: 'kit', label: 'Kit Promotor', Icon: UserCheck, color: 'text-coral', hasSidebar: true },
  { id: 'whatsapp', label: 'WhatsApp Hub', Icon: MessageCircle, color: 'text-green-500', hasSidebar: true },
  { id: 'social', label: 'Conteúdo Social', Icon: Image, color: 'text-purple-500', hasSidebar: true },
  { id: 'intelligence', label: 'Inteligência', Icon: BarChart3, color: 'text-blue-500', hasSidebar: false },
  { id: 'settings', label: 'Configurações', Icon: Settings, color: 'text-text-muted', hasSidebar: false },
];

function ModuleRouter({ activeModule, selectedItem }) {
  return (
    <React.Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-2 border-coral border-t-transparent rounded-full" />
      </div>
    }>
      {activeModule === 'trade' && <TradeMarketing item={selectedItem} />}
      {activeModule === 'kit' && <KitPromotor item={selectedItem} />}
      {activeModule === 'whatsapp' && <WhatsAppHub item={selectedItem} />}
      {activeModule === 'social' && <SocialContent item={selectedItem} />}
      {activeModule === 'intelligence' && <IntelligencePanel />}
      {activeModule === 'settings' && <SettingsPanel />}
    </React.Suspense>
  );
}

function NavBar() {
  const { activeModule, setActiveModule } = useAppContext();

  return (
    <nav className="hidden lg:flex flex-col w-14 bg-navy-dark border-r border-white/10 py-3 gap-1 items-center shrink-0">
      {MODULES.map(({ id, label, Icon, color }) => (
        <button
          key={id}
          onClick={() => setActiveModule(id)}
          title={label}
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center transition-all',
            activeModule === id
              ? 'bg-white/15 shadow-sm'
              : 'hover:bg-white/8 opacity-60 hover:opacity-100'
          )}
        >
          <Icon size={20} className={activeModule === id ? color : 'text-white/70'} />
        </button>
      ))}
    </nav>
  );
}

function MobileNav() {
  const { activeModule, setActiveModule } = useAppContext();

  return (
    <nav className="lg:hidden flex overflow-x-auto gap-1 px-3 py-2 bg-navy-dark border-b border-white/10">
      {MODULES.map(({ id, label, Icon, color }) => (
        <button
          key={id}
          onClick={() => setActiveModule(id)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
            activeModule === id
              ? 'bg-white/15 text-white'
              : 'text-white/50 hover:text-white/80'
          )}
        >
          <Icon size={14} className={activeModule === id ? color : ''} />
          {label}
        </button>
      ))}
    </nav>
  );
}

function AppContent() {
  const { activeModule, sidebarOpen, setSidebarOpen } = useAppContext();
  const [selectedItem, setSelectedItem] = useState(null);
  const [logoError, setLogoError] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const moduleDef = MODULES.find(m => m.id === activeModule);
  const showSidebar = moduleDef?.hasSidebar ?? false;

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-gradient-to-br from-navy to-navy-dark text-white shadow-lg">
        <div className="rainbow-gradient h-[3px]" />
        <div className="flex items-center gap-3 px-3 lg:px-6 py-2.5">
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
              className="h-9 w-auto object-contain brightness-0 invert"
              onError={() => setLogoError(true)}
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-gama-azul via-gama-verde to-gama-amarelo rounded-md flex items-center justify-center shrink-0">
              <span className="text-xl font-black text-white leading-none">G</span>
            </div>
          )}

          <span className="h-6 w-px bg-white/20 shrink-0 hidden sm:block" />

          <div className="flex flex-col gap-px min-w-0">
            <span className="text-base font-bold tracking-tight leading-tight truncate">Gama Trade Hub</span>
            <span className="text-[10px] opacity-60 leading-tight hidden sm:block">Plataforma de Inteligência Comercial B2B</span>
          </div>

          <img
            src="/gama-mascote.jpg"
            alt="Mascote Gama"
            className="h-12 w-auto object-contain ml-1 drop-shadow-lg hidden md:block"
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <div className="ml-auto bg-white/12 border border-white/25 rounded-full px-2.5 py-0.5 text-[10px] font-semibold text-white/85 whitespace-nowrap hidden sm:block">
            v2.0
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop NavBar */}
        <NavBar />

        {/* Sidebar (Product Selector) */}
        {showSidebar && (
          <>
            {sidebarOpen && (
              <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}
            <div className={cn(
              'fixed lg:static inset-y-0 left-0 z-40 transform transition-all duration-200',
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
              sidebarCollapsed ? 'lg:w-0 lg:overflow-hidden' : 'w-[340px]'
            )}>
              <div className="w-[340px] h-full relative">
                <ProductSelector
                  onSelect={(product) => { setSelectedItem(product); setSidebarOpen(false); }}
                  onCategorySelect={(cat) => { setSelectedItem(cat); setSidebarOpen(false); }}
                  onBrandSelect={(brand) => { setSelectedItem(brand); setSidebarOpen(false); }}
                  selectedItem={selectedItem}
                />
                <button
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-12 bg-surface-card border border-border rounded-r-md items-center justify-center hover:bg-muted/50 transition-colors z-10"
                  title={sidebarCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
                >
                  {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <ErrorBoundary>
            <ModuleRouter
              activeModule={activeModule}
              selectedItem={selectedItem}
            />
          </ErrorBoundary>
        </main>
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
