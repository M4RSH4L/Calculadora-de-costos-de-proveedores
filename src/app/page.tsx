'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { ProductNormalized } from '@/lib/types';
import { AppData } from '@/lib/types';
import { loadAppData } from '@/lib/data';
import { initSearch, filterByMarca } from '@/lib/search';
import Header from '@/components/Header/Header';
import SearchBar from '@/components/SearchBar/SearchBar';
import BrandGrid from '@/components/BrandGrid/BrandGrid';
import ProductCard from '@/components/ProductCard/ProductCard';
import ComparePanel from '@/components/ComparePanel/ComparePanel';
import ConditionsDrawer from '@/components/ConditionsDrawer/ConditionsDrawer';
import Sidebar from '@/components/Sidebar/Sidebar';
import styles from './page.module.css';

type ViewMode = 'home' | 'search' | 'brand';

export default function HomePage() {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductNormalized[]>([]);
  const [activeMarca, setActiveMarca] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductNormalized | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    loadAppData()
      .then(data => {
        setAppData(data);
        initSearch(data.products);
        setLoading(false);
      })
      .catch(err => {
        setError('Error al cargar los productos. Por favor, recargá la página.');
        setLoading(false);
      });
  }, []);

  const handleSearch = useCallback((query: string, results: ProductNormalized[]) => {
    setSearchQuery(query);
    setSearchResults(results);
    setViewMode('search');
    setActiveMarca(null);
  }, []);

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setActiveMarca(null);
    setViewMode('home');
  }, []);

  const handleSelectMarca = useCallback((marca: string | null) => {
    setActiveMarca(marca);
    if (marca) {
      setViewMode('brand');
      setSearchQuery('');
      setSearchResults([]);
    } else {
      setViewMode('home');
    }
  }, []);

  const displayedProducts = useMemo(() => {
    if (!appData) return [];
    if (viewMode === 'search') return searchResults;
    if (viewMode === 'brand' && activeMarca) {
      return filterByMarca(appData.products, activeMarca);
    }
    return [];
  }, [appData, viewMode, searchResults, activeMarca]);

  // Find products with same name across providers for comparison
  const compareGroups = useMemo(() => {
    if (!showCompare || displayedProducts.length < 2) return [];
    const groups: Record<string, ProductNormalized[]> = {};
    displayedProducts.forEach(p => {
      const key = p.producto.toLowerCase().trim();
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.values(groups).filter(g => g.length >= 2);
  }, [displayedProducts, showCompare]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error || !appData) {
    return <ErrorScreen message={error || 'Error desconocido'} />;
  }

  const isShowingResults = viewMode !== 'home';

  return (
    <div className={styles.layout}>
      <Header sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)} />

      <div className={styles.body}>
        <main className={styles.main}>
          {/* Hero Search Section */}
          <section className={styles.heroSection}>
            <div className={styles.heroTop}>
              <h1 className={styles.heroTitle}>
                Buscador de <span className={styles.heroAccent}>Costos</span>
              </h1>
              <p className={styles.heroSubtitle}>
                {appData.stats.totalProducts.toLocaleString('es-AR')} productos ·{' '}
                {appData.stats.totalProveedores} proveedores ·{' '}
                {appData.stats.totalMarcas} marcas
              </p>
            </div>

            <SearchBar
              products={appData.products}
              onSearch={handleSearch}
              onClear={handleClear}
            />
          </section>

          {/* Brand Grid — only show on home */}
          {!isShowingResults && (
            <BrandGrid
              products={appData.products}
              activeMarca={activeMarca}
              onSelectMarca={handleSelectMarca}
            />
          )}

          {/* Results Section */}
          {isShowingResults && (
            <section className={styles.resultsSection}>
              <div className={styles.resultsHeader}>
                <div className={styles.resultsInfo}>
                  {viewMode === 'search' ? (
                    <>
                      <Search size={16} strokeWidth={2} className={styles.resultsIcon} />
                      <span className={styles.resultsTitle}>
                        Resultados para{' '}
                        <strong>&ldquo;{searchQuery}&rdquo;</strong>
                      </span>
                      <span className={styles.resultsCount}>
                        {displayedProducts.length} resultado{displayedProducts.length !== 1 ? 's' : ''}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles.resultsTitle}>
                        <strong>{activeMarca}</strong>
                      </span>
                      <span className={styles.resultsCount}>
                        {displayedProducts.length} productos
                      </span>
                    </>
                  )}
                </div>

                <div className={styles.resultsActions}>
                  {displayedProducts.length >= 2 && (
                    <button
                      className={`${styles.compareToggle} ${showCompare ? styles.compareActive : ''}`}
                      onClick={() => setShowCompare(c => !c)}
                    >
                      <SlidersHorizontal size={14} strokeWidth={2} />
                      {showCompare ? 'Ocultar comparación' : 'Comparar precios'}
                    </button>
                  )}
                  <button className={styles.clearBtn} onClick={handleClear}>
                    <X size={14} strokeWidth={2.5} />
                    Limpiar
                  </button>
                </div>
              </div>

              {/* Compare Panel */}
              {showCompare && compareGroups.length > 0 && (
                <div className={styles.compareSection}>
                  {compareGroups.map((group, i) => (
                    <ComparePanel
                      key={i}
                      products={group}
                      onViewConditions={setSelectedProduct}
                    />
                  ))}
                </div>
              )}

              {/* Product grid */}
              {displayedProducts.length === 0 ? (
                <EmptyState query={searchQuery} />
              ) : (
                <div className={styles.productGrid}>
                  {displayedProducts.map((product, index) => {
                    // Find cheapest among same-named products
                    const sameNameProducts = displayedProducts.filter(
                      p => p.producto.toLowerCase() === product.producto.toLowerCase()
                    );
                    const isBest = sameNameProducts.length > 1 &&
                      product.precio_con_iva === Math.min(...sameNameProducts.map(p => p.precio_con_iva));

                    return (
                      <ProductCard
                        key={product.id}
                        product={product}
                        isBestPrice={isBest}
                        onViewConditions={setSelectedProduct}
                        animationDelay={Math.min(index * 40, 400)}
                      />
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Home state empty */}
          {!isShowingResults && (
            <div className={styles.homeHint}>
              <div className={styles.hintCard}>
                <span className={styles.hintEmoji}>💡</span>
                <p>
                  Usá el buscador para encontrar cualquier producto al instante,
                  o hacé click en una marca para ver todos sus productos.
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <Sidebar data={appData} isOpen={sidebarOpen} />
      </div>

      {/* Conditions Drawer */}
      <ConditionsDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        <div className={styles.loadingIcon}>
          <Loader2 size={32} strokeWidth={2} className={styles.spinner} />
        </div>
        <h2 className={styles.loadingTitle}>Cargando productos...</h2>
        <p className={styles.loadingSubtitle}>
          Preparando la base de datos de proveedores
        </p>
        <div className={styles.loadingBar}>
          <div className={styles.loadingBarFill} />
        </div>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className={styles.errorScreen}>
      <div className={styles.errorContent}>
        <span className={styles.errorEmoji}>⚠️</span>
        <h2 className={styles.errorTitle}>Error al cargar</h2>
        <p className={styles.errorMessage}>{message}</p>
        <button
          className={styles.retryBtn}
          onClick={() => window.location.reload()}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <div className={styles.emptyState}>
      <span className={styles.emptyEmoji}>🔍</span>
      <h3 className={styles.emptyTitle}>Sin resultados</h3>
      <p className={styles.emptyText}>
        No encontramos productos para{' '}
        <strong>&ldquo;{query}&rdquo;</strong>.
        <br />
        Intentá con otro nombre, código o marca.
      </p>
    </div>
  );
}
