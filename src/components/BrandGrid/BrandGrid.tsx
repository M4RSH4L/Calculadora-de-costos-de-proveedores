'use client';

import { getBrandConfig } from '@/lib/brands';
import { ProductResult } from '@/lib/types';
import styles from './BrandGrid.module.css';

interface BrandGridProps {
  products: ProductResult[];
  activeMarca: string | null;
  onSelectMarca: (marca: string | null) => void;
}

export default function BrandGrid({ products, activeMarca, onSelectMarca }: BrandGridProps) {
  // Group by categoria first, then by proveedor.nombre as fallback
  const marcaMap = new Map<string, { key: string; count: number }>();

  for (const p of products) {
    const cat = p.producto?.categoria;
    const prov = p.proveedor?.nombre ?? 'Desconocido';
    // Prefer categoria as grouping key; fall back to supplier name
    const key = cat && cat.trim() ? cat.trim() : prov;
    marcaMap.set(key, { key, count: (marcaMap.get(key)?.count ?? 0) + 1 });
  }

  const marcas = [...marcaMap.entries()]
    .map(([key, info]) => ({
      key,
      count: info.count,
      brand: getBrandConfig(key),
    }))
    .sort((a, b) => b.count - a.count);

  const handleClick = (key: string) => {
    onSelectMarca(activeMarca === key ? null : key);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Marcas y líneas disponibles</h2>
        {activeMarca && (
          <button className={styles.clearFilter} onClick={() => onSelectMarca(null)}>
            Limpiar filtro
          </button>
        )}
      </div>
      <div className={styles.grid}>
        {marcas.map(({ key, count, brand }) => {
          const isActive = activeMarca === key;
          const isFiltered = activeMarca !== null && !isActive;
          return (
            <button
              key={key}
              className={`${styles.card} ${isActive ? styles.active : ''} ${isFiltered ? styles.filtered : ''}`}
              onClick={() => handleClick(key)}
              aria-pressed={isActive}
              style={{ '--brand-gradient': brand.gradient } as React.CSSProperties}
            >
              <div className={styles.cardBg} style={{ background: brand.gradient }} />
              <div className={styles.cardContent}>
                <span className={styles.emoji}>{brand.emoji}</span>
                <div className={styles.cardText}>
                  <span className={styles.brandName}>{brand.label}</span>
                  <span className={styles.productCount}>
                    {count} producto{count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
