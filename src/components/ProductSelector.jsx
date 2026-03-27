import React, { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { BrandService } from '../logic/BrandService';
import { GamaDataService } from '../logic/GamaDataService';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Search, ChevronDown } from 'lucide-react';

const TIER_STYLES = {
  premium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  mainstream: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  value: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};
const TIER_LABELS = { premium: 'Premium', mainstream: 'Popular', value: 'Custo-benef.' };

const VISIBLE_LIMIT = 50;

export function ProductSelector({ onSelect, onCategorySelect, onBrandSelect, selectedItem }) {
  const [activeTab, setActiveTab] = useState('brands');
  const [searchTerm, setSearchTerm] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [visibleCount, setVisibleCount] = useState(VISIBLE_LIMIT);

  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedBrandSearch = useDebounce(brandSearch, 200);

  const categories = useMemo(() => GamaDataService.getUniqueCategories(), []);
  const allBrands = useMemo(() => BrandService.getBrands(), []);
  const allProducts = useMemo(() => GamaDataService.getProducts(), []);

  const filteredBrands = useMemo(() => {
    if (!debouncedBrandSearch) return allBrands;
    const lower = debouncedBrandSearch.toLowerCase();
    return allBrands.filter(b => b.name.toLowerCase().includes(lower));
  }, [allBrands, debouncedBrandSearch]);

  const filteredProducts = useMemo(() => {
    let prods = allProducts;
    if (selectedCategory) prods = prods.filter(p => p.category === selectedCategory);
    if (debouncedSearch) {
      const l = debouncedSearch.toLowerCase();
      prods = prods.filter(p => p.name.toLowerCase().includes(l));
    }
    return prods;
  }, [allProducts, selectedCategory, debouncedSearch]);

  // Reset visible count when filters change
  React.useEffect(() => { setVisibleCount(VISIBLE_LIMIT); }, [selectedCategory, debouncedSearch]);

  const visibleProducts = useMemo(
    () => filteredProducts.slice(0, visibleCount),
    [filteredProducts, visibleCount]
  );

  const handleBrandClick = useCallback((brand) => {
    if (onBrandSelect) {
      onBrandSelect({
        type: 'brand',
        name: brand.name,
        productCount: brand.productCount,
        categories: brand.categories,
        isMain: brand.isMain,
        ...BrandService.getBrandContext(brand.name),
      });
    }
  }, [onBrandSelect]);

  const handleShowMore = useCallback(() => {
    setVisibleCount(prev => prev + VISIBLE_LIMIT);
  }, []);

  const tabs = [
    { id: 'brands', label: `Marcas (${allBrands.length})` },
    { id: 'categories', label: 'Categorias' },
    { id: 'products', label: `Produtos (${allProducts.length})` },
  ];

  return (
    <div className="h-full bg-surface-card border-r border-border flex flex-col overflow-hidden">
      <div className="rainbow-gradient h-[3px] shrink-0" />

      <div className="flex border-b border-border">
        {tabs.map(t => (
          <button
            key={t.id}
            className={cn(
              'flex-1 py-3 px-2 text-sm font-semibold border-b-2 transition-all',
              activeTab === t.id
                ? 'text-navy dark:text-coral border-navy dark:border-coral'
                : 'text-text-muted border-transparent hover:text-text-primary hover:bg-muted/50'
            )}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'brands' && (
        <>
          <div className="p-3 px-4 border-b border-border">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input placeholder="Buscar marca..." value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
            <div className="text-xs text-text-muted mt-1.5">{filteredBrands.length} marcas parceiras</div>
          </div>
          <ScrollArea className="flex-1">
            <div className="py-1">
              {filteredBrands.map(brand => {
                const ctx = BrandService.getBrandContext(brand.name);
                const isSelected = selectedItem?.type === 'brand' && selectedItem?.name === brand.name;
                return (
                  <div
                    key={brand.name}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors border-l-[3px]',
                      isSelected
                        ? 'bg-navy/[0.06] dark:bg-coral/10 border-l-navy dark:border-l-coral'
                        : 'border-l-transparent hover:bg-muted/50'
                    )}
                    onClick={() => handleBrandClick(brand)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-text-primary">{brand.name}</span>
                        {brand.isMain && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-coral text-white font-bold shrink-0">CORAL</span>}
                        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0', TIER_STYLES[ctx.tier])}>
                          {TIER_LABELS[ctx.tier] || 'Popular'}
                        </span>
                      </div>
                      <div className="text-xs text-text-muted">{ctx.segment}</div>
                    </div>
                    <Badge variant="outline" className="shrink-0">{brand.productCount}</Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {activeTab === 'categories' && (
        <ScrollArea className="flex-1">
          <div className="p-4">
            <div
              onClick={() => onCategorySelect({ type: 'institutional', name: 'Gama Distribuidora' })}
              className="p-4 bg-navy/5 dark:bg-coral/5 border border-navy/20 dark:border-coral/20 rounded-lg cursor-pointer mb-4 hover:bg-navy/10 dark:hover:bg-coral/10 transition-colors"
            >
              <div className="font-bold text-navy dark:text-coral mb-1">Institucional (Gama)</div>
              <div className="text-sm text-text-secondary">Programa CL, Reconquista Santos, Parceria Coral</div>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Categorias de Produto</div>
            <div className="flex flex-col gap-0.5">
              {categories.map(c => {
                const count = GamaDataService.getProductsByCategory(c).length;
                return (
                  <div key={c} onClick={() => onCategorySelect({ type: 'category', name: c })} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border/50 border-l-[3px] border-l-transparent hover:border-l-navy dark:hover:border-l-coral">
                    <span className="text-sm font-medium text-text-primary">{c}</span>
                    <span className="text-xs text-text-muted">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      )}

      {activeTab === 'products' && (
        <>
          <div className="p-3 px-4 border-b border-border space-y-2">
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full h-8 px-2 text-sm border border-border rounded-md bg-surface-card text-text-primary focus:outline-none focus:ring-2 focus:ring-navy/20">
              <option value="">Todas as Categorias ({allProducts.length})</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-muted" />
              <Input placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-8 h-8 text-sm" />
            </div>
          </div>
          <div className="px-4 py-2 text-xs text-text-muted border-b border-border/50">
            {filteredProducts.length} produtos{filteredProducts.length !== allProducts.length && ` (filtrado de ${allProducts.length})`}
          </div>
          <ScrollArea className="flex-1">
            {visibleProducts.map((p, i) => {
              const isSelected = selectedItem?.name === p.name;
              return (
                <div key={`${p.id}-${i}`} className={cn('px-4 py-3 cursor-pointer transition-colors border-l-[3px] border-b border-border/50', isSelected ? 'bg-navy/[0.06] dark:bg-coral/10 border-l-navy dark:border-l-coral' : 'border-l-transparent hover:bg-muted/50')} onClick={() => onSelect(p)}>
                  <div className="text-sm font-semibold text-text-primary">{p.name}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-text-muted">{p.category}</span>
                    {p.brand && <Badge variant="outline" className="text-[10px] h-4 px-1">{p.brand}</Badge>}
                  </div>
                </div>
              );
            })}
            {visibleCount < filteredProducts.length && (
              <div className="p-4 text-center">
                <Button variant="outline" size="sm" onClick={handleShowMore} className="text-xs">
                  <ChevronDown size={14} className="mr-1" />
                  Mostrar mais ({filteredProducts.length - visibleCount} restantes)
                </Button>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
