'use client';

import { BRAND_CONFIGS, getBrandConfig } from '@/lib/brands';
import { ProductNormalized } from '@/lib/types';
import styles from './BrandGrid.module.css';

interface BrandGridProps {
  products: ProductNormalized[];
  activeMarca: string | null;
  onSelectMarca: (marca: string | null) => void;
}

export default function BrandGrid({ products, activeMarca, onSelectMarca }: BrandGridProps) {
  // Get marcas that actually have products
  const marcasWithCount = BRAND_CONFIGS
    .map(config => ({
      ...config,
      count: products.filter(p =>
        p.marca.toLowerCase() === config.marca.toLowerCase()
      ).length,
    }))
    .filter(m => m.count > 0);

  // Also include any marcas not in BRAND_CONFIGS
  const knownMarcas = new Set(BRAND_CONFIGS.map(b => b.marca.toLowerCase()));
  const unknownMarcas = [...new Set(products.map(p => p.marca))]
    .filter(m => !knownMarcas.has(m.toLowerCase()))
    .map(m => ({
      ...getBrandConfig(m),
      count: products.filter(p => p.marca === m).length,
    }));

  const allMarcas = [...marcasWithCount, ...unknownMarcas];

  const handleClick = (marca: string) => {
    onSelectMarca(activeMarca === marca ? null : marca);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Marcas disponibles</h2>
        {activeMarca && (
          <button
            className={styles.clearFilter}
            onClick={() => onSelectMarca(null)}
          >
            Limpiar filtro
          </button>
        )}
      </div>
      <div className={styles.grid}>
        {allMarcas.map((brand) => {
          const isActive = activeMarca === brand.marca;
          const isFiltered = activeMarca !== null && !isActive;
          return (
            <button
              key={brand.marca}
              className={`${styles.card} ${isActive ? styles.active : ''} ${isFiltered ? styles.filtered : ''}`}
              onClick={() => handleClick(brand.marca)}
              aria-pressed={isActive}
              style={{ '--brand-gradient': brand.gradient } as React.CSSProperties}
            >
              <div
                className={styles.cardBg}
                style={{ background: brand.gradient }}
              />
              <div className={styles.cardContent}>
                <span className={styles.emoji}>{brand.emoji}</span>
                <div className={styles.cardText}>
                  <span className={styles.brandName}>{brand.label}</span>
                  <span className={styles.productCount}>
                    {brand.count} producto{brand.count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
              {isActive && (
                <div className={styles.activeIndicator} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
