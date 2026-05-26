import React, { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { BrandService } from '../logic/BrandService';
import { GamaDataService } from '../logic/GamaDataService';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronDown, Package, Bookmark, Layers } from 'lucide-react';

const TIER_META = {
  premium:    { label: 'Premium',     color: 'var(--color-gama-amarelo)' },
  mainstream: { label: 'Popular',     color: 'var(--color-format-post)' },
  value:      { label: 'C/benefício', color: 'var(--color-status-aprovado)' },
};

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
    return allBrands.filter((b) => b.name.toLowerCase().includes(lower));
  }, [allBrands, debouncedBrandSearch]);

  const filteredProducts = useMemo(() => {
    let prods = allProducts;
    if (selectedCategory) prods = prods.filter((p) => p.category === selectedCategory);
    if (debouncedSearch) {
      const l = debouncedSearch.toLowerCase();
      prods = prods.filter((p) => p.name.toLowerCase().includes(l));
    }
    return prods;
  }, [allProducts, selectedCategory, debouncedSearch]);

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

  const handleShowMore = useCallback(() => setVisibleCount((p) => p + VISIBLE_LIMIT), []);

  const tabs = [
    { id: 'brands',     label: 'Marcas',     count: allBrands.length,    Icon: Bookmark },
    { id: 'categories', label: 'Categorias', count: categories.length,   Icon: Layers },
    { id: 'products',   label: 'Produtos',   count: allProducts.length,  Icon: Package },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--color-surface-card)' }}>
      {/* Header editorial da sidebar */}
      <div
        className="px-4 py-3 flex items-center justify-between"
        style={{ background: 'var(--color-paper-2)', borderBottom: '1px solid var(--color-rule)' }}
      >
        <div>
          <div className="eyebrow">Catálogo · NO. 01</div>
          <div className="display-md mt-0.5" style={{ fontSize: 15 }}>Acervo Gama</div>
        </div>
        <span className="tape" style={{ fontSize: 8, padding: '1px 6px' }}>1200+</span>
      </div>

      {/* Tabs editorial */}
      <div className="flex" style={{ borderBottom: '1px solid var(--color-rule)' }}>
        {tabs.map(({ id, label, count, Icon }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex-1 py-2.5 px-2 flex flex-col items-center gap-0.5 transition-all border-b-2',
                active ? '' : 'opacity-50 hover:opacity-80'
              )}
              style={{
                borderBottomColor: active ? 'var(--color-gama-amarelo)' : 'transparent',
                background: active ? 'var(--color-paper)' : 'transparent',
              }}
            >
              <Icon size={14} style={{ color: active ? 'var(--color-ink)' : 'var(--color-text-muted)' }} />
              <span
                className="mono text-[9px] font-bold"
                style={{
                  color: active ? 'var(--color-ink)' : 'var(--color-text-muted)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                {label} · {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* BRANDS */}
      {activeTab === 'brands' && (
        <>
          <div className="p-3" style={{ borderBottom: '1px solid var(--color-rule)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                placeholder="Buscar marca…"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm"
                style={{
                  background: 'var(--color-paper-2)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: 2,
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
            <div className="mono text-[9px] mt-2" style={{ color: 'var(--color-text-muted)', letterSpacing: '0.08em' }}>
              ▸ {filteredBrands.length} MARCAS PARCEIRAS
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div>
              {filteredBrands.map((brand, i) => {
                const ctx = BrandService.getBrandContext(brand.name);
                const tier = TIER_META[ctx.tier] || TIER_META.mainstream;
                const isSelected = selectedItem?.type === 'brand' && selectedItem?.name === brand.name;
                return (
                  <button
                    key={brand.name}
                    onClick={() => handleBrandClick(brand)}
                    className={cn('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors')}
                    style={{
                      background: isSelected ? 'var(--color-paper-2)' : 'transparent',
                      borderLeft: `3px solid ${isSelected ? (brand.isMain ? 'var(--color-coral)' : 'var(--color-ink)') : 'transparent'}`,
                      borderBottom: '1px solid var(--color-rule)',
                    }}
                  >
                    {/* Chip de tier (mini swatch quadrado) */}
                    <div
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 28, height: 28,
                        background: tier.color,
                        color: '#fff',
                        borderRadius: 1,
                        fontFamily: 'var(--font-display)',
                        fontWeight: 700,
                        fontSize: 14,
                        letterSpacing: '-0.04em',
                      }}
                    >
                      {brand.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold truncate" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                          {brand.name}
                        </span>
                        {brand.isMain && (
                          <span
                            className="mono text-[8px] font-bold px-1 py-0.5 shrink-0"
                            style={{ background: 'var(--color-coral)', color: '#fff', borderRadius: 1, letterSpacing: '0.08em' }}
                          >
                            CORAL · OFICIAL
                          </span>
                        )}
                      </div>
                      <div className="mono text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {ctx.segment} · {tier.label}
                      </div>
                    </div>

                    <span
                      className="mono text-[10px] font-bold shrink-0"
                      style={{
                        color: 'var(--color-text-muted)',
                        border: '1px solid var(--color-rule)',
                        padding: '2px 5px',
                        borderRadius: 1,
                      }}
                    >
                      {brand.productCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </>
      )}

      {/* CATEGORIES */}
      {activeTab === 'categories' && (
        <ScrollArea className="flex-1">
          <div className="p-3">
            {/* Cartão institucional destaque */}
            <button
              onClick={() => onCategorySelect({ type: 'institutional', name: 'Gama Distribuidora' })}
              className="w-full mb-4 paper-card overflow-hidden text-left"
            >
              <span className="paint-band" style={{ background: 'var(--color-gama-amarelo)' }} />
              <div className="p-3">
                <span className="numero">No. 00 · INSTITUCIONAL</span>
                <div className="display-md mt-1" style={{ fontSize: 16 }}>Gama Distribuidora</div>
                <div className="text-[11px] mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Programa CL · Parceria Coral · Expertise Grande SP
                </div>
              </div>
            </button>

            <div className="eyebrow mb-2">Categorias de produto</div>
            <div className="flex flex-col">
              {categories.map((c, i) => {
                const count = GamaDataService.getProductsByCategory(c).length;
                return (
                  <button
                    key={c}
                    onClick={() => onCategorySelect({ type: 'category', name: c })}
                    className="flex items-center gap-3 px-2 py-2.5 text-left transition-colors hover:bg-[var(--color-paper-2)]"
                    style={{
                      borderBottom: '1px solid var(--color-rule)',
                    }}
                  >
                    <span className="mono text-[9px] opacity-50 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="flex-1 text-sm font-medium" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>{c}</span>
                    <span className="mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      )}

      {/* PRODUCTS */}
      {activeTab === 'products' && (
        <>
          <div className="p-3 space-y-2" style={{ borderBottom: '1px solid var(--color-rule)' }}>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-1.5 text-sm"
              style={{
                background: 'var(--color-paper-2)',
                border: '1px solid var(--color-rule)',
                borderRadius: 2,
                fontFamily: 'var(--font-mono)',
                fontSize: 12,
              }}
            >
              <option value="">Todas as categorias ({allProducts.length})</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
              <input
                placeholder="Buscar produto…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm"
                style={{
                  background: 'var(--color-paper-2)',
                  border: '1px solid var(--color-rule)',
                  borderRadius: 2,
                  fontFamily: 'var(--font-mono)',
                }}
              />
            </div>
          </div>
          <div className="px-3 py-1.5 mono text-[9px]" style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-rule)', letterSpacing: '0.08em' }}>
            ▸ {filteredProducts.length} {filteredProducts.length !== allProducts.length && `DE ${allProducts.length}`} PRODUTOS
          </div>
          <ScrollArea className="flex-1">
            {visibleProducts.map((p, i) => {
              const isSelected = selectedItem?.name === p.name;
              return (
                <button
                  key={`${p.id}-${i}`}
                  onClick={() => onSelect(p)}
                  className={cn('w-full px-4 py-3 text-left transition-colors')}
                  style={{
                    background: isSelected ? 'var(--color-paper-2)' : 'transparent',
                    borderLeft: `3px solid ${isSelected ? 'var(--color-gama-amarelo)' : 'transparent'}`,
                    borderBottom: '1px solid var(--color-rule)',
                  }}
                >
                  <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>
                    {p.name}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="mono text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{p.category}</span>
                    {p.brand && (
                      <span
                        className="mono text-[9px] px-1.5 py-0.5"
                        style={{
                          background: 'var(--color-paper-2)',
                          border: '1px solid var(--color-rule)',
                          borderRadius: 1,
                          letterSpacing: '0.06em',
                        }}
                      >
                        {p.brand}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
            {visibleCount < filteredProducts.length && (
              <div className="p-3 text-center">
                <button
                  onClick={handleShowMore}
                  className="mono text-[10px] px-3 py-1.5 transition-all hover:bg-[var(--color-ink)] hover:text-[var(--color-paper)]"
                  style={{
                    border: '1px solid var(--color-ink)',
                    borderRadius: 2,
                    letterSpacing: '0.06em',
                  }}
                >
                  <ChevronDown size={11} className="inline mr-1" />
                  + {filteredProducts.length - visibleCount} RESTANTES
                </button>
              </div>
            )}
          </ScrollArea>
        </>
      )}
    </div>
  );
}
