import React, { useState, useMemo, useCallback } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { BrandService } from '../logic/BrandService';
import { LaborDataService } from '../logic/LaborDataService';

const TIER_STYLES = {
  premium: { bg: '#FEF3C7', color: '#92400E', label: 'Premium' },
  mainstream: { bg: '#DBEAFE', color: '#1E40AF', label: 'Popular' },
  value: { bg: '#DCFCE7', color: '#166534', label: 'Custo-benef.' },
};

export function ProductSelector({ onSelect, onCategorySelect, onBrandSelect, selectedItem }) {
  const [activeTab, setActiveTab] = useState('brands');
  const [searchTerm, setSearchTerm] = useState('');
  const [brandSearch, setBrandSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const debouncedSearch = useDebounce(searchTerm, 300);
  const debouncedBrandSearch = useDebounce(brandSearch, 200);

  const categories = useMemo(() => LaborDataService.getUniqueCategories(), []);
  const allBrands = useMemo(() => BrandService.getBrands(), []);
  const allProducts = useMemo(() => LaborDataService.getProducts(), []);

  const filteredBrands = useMemo(() => {
    if (!debouncedBrandSearch) return allBrands;
    const lower = debouncedBrandSearch.toLowerCase();
    return allBrands.filter(b => b.name.toLowerCase().includes(lower));
  }, [allBrands, debouncedBrandSearch]);

  const filteredProducts = useMemo(() => {
    let prods = allProducts;
    if (selectedCategory) prods = prods.filter(p => p.category === selectedCategory);
    if (debouncedSearch) { const l = debouncedSearch.toLowerCase(); prods = prods.filter(p => p.name.toLowerCase().includes(l)); }
    return prods;
  }, [allProducts, selectedCategory, debouncedSearch]);

  const handleBrandClick = useCallback((brand) => {
    if (onBrandSelect) {
      onBrandSelect({ type: 'brand', name: brand.name, productCount: brand.productCount, categories: brand.categories, isMain: brand.isMain, ...BrandService.getBrandContext(brand.name) });
    }
  }, [onBrandSelect]);

  return (
    <div className="sidebar">
      <div className="tabs">
        <button className={`tab ${activeTab === 'brands' ? 'active' : ''}`} onClick={() => setActiveTab('brands')}>Marcas</button>
        <button className={`tab ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>Categorias</button>
        <button className={`tab ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>Produtos</button>
      </div>

      {/* MARCAS */}
      {activeTab === 'brands' && (
        <>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-default)' }}>
            <input type="text" placeholder="Buscar marca..." value={brandSearch} onChange={(e) => setBrandSearch(e.target.value)} />
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-1)' }}>{filteredBrands.length} marcas parceiras</div>
          </div>
          <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-2) 0' }}>
            {filteredBrands.map(brand => {
              const ctx = BrandService.getBrandContext(brand.name);
              const tierStyle = TIER_STYLES[ctx.tier] || TIER_STYLES.mainstream;
              const isSelected = selectedItem?.type === 'brand' && selectedItem?.name === brand.name;
              return (
                <div key={brand.name} className={`product-item ${isSelected ? 'selected' : ''}`} onClick={() => handleBrandClick(brand)} style={{ padding: 'var(--space-3) var(--space-4)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: '2px' }}>
                      <span className="product-name" style={{ fontWeight: 700 }}>{brand.name}</span>
                      {brand.isMain && <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: 'var(--radius-full)', background: 'var(--color-secondary)', color: 'white', fontWeight: 700, flexShrink: 0 }}>CORAL</span>}
                      <span style={{ fontSize: '10px', fontWeight: 600, padding: '1px 6px', borderRadius: 'var(--radius-full)', background: tierStyle.bg, color: tierStyle.color, flexShrink: 0 }}>{tierStyle.label}</span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{ctx.segment}</div>
                  </div>
                  <span className="badge badge-primary" style={{ flexShrink: 0 }}>{brand.productCount}</span>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* CATEGORIAS */}
      {activeTab === 'categories' && (
        <div className="sidebar-content" style={{ padding: 'var(--space-4)', overflowY: 'auto', flex: 1 }}>
          <div onClick={() => onCategorySelect({ type: 'institutional', name: 'Gama Distribuidora' })} style={{ padding: 'var(--space-4)', background: 'linear-gradient(135deg, rgba(30,58,95,0.08) 0%, rgba(30,58,95,0.04) 100%)', border: '1px solid rgba(30,58,95,0.2)', borderRadius: 'var(--radius-lg)', cursor: 'pointer', marginBottom: 'var(--space-4)', transition: 'all var(--transition-fast)' }}>
            <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>🏢 Institucional (Gama)</div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Programa CL, Reconquista Santos, Parceria Coral</div>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}>Categorias de Produto</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            {categories.map(c => (
              <div key={c} onClick={() => onCategorySelect({ type: 'category', name: c })} className="product-item" style={{ borderBottom: '1px solid var(--gray-100)' }}>
                <div className="product-name" style={{ fontWeight: 500 }}>{c}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRODUTOS */}
      {activeTab === 'products' && (
        <>
          <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--border-default)' }}>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} style={{ marginBottom: 'var(--space-2)' }}>
              <option value="">Todas as Categorias ({allProducts.length})</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input type="text" placeholder="Buscar produto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <div style={{ padding: 'var(--space-2) var(--space-4)', fontSize: 'var(--text-xs)', color: 'var(--text-muted)', borderBottom: '1px solid var(--gray-100)' }}>
            {filteredProducts.length} produtos
          </div>
          <div className="sidebar-content" style={{ flex: 1, overflowY: 'auto' }}>
            {filteredProducts.map((p, i) => {
              const isSelected = selectedItem?.name === p.name;
              return (
                <div key={i} className={`product-item ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(p)} style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="product-name">{p.name}</div>
                    <div className="product-category">{p.category}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
