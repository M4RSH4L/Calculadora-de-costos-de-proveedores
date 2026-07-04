'use client';

import { TrendingDown, Award } from 'lucide-react';
import { ProductNormalized } from '@/lib/types';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './ComparePanel.module.css';

interface ComparePanelProps {
  products: ProductNormalized[];
  onViewConditions: (product: ProductNormalized) => void;
}

export default function ComparePanel({ products, onViewConditions }: ComparePanelProps) {
  if (products.length < 2) return null;

  const sorted = [...products].sort((a, b) => a.precio_con_iva - b.precio_con_iva);
  const bestPrice = sorted[0].precio_con_iva;
  const worstPrice = sorted[sorted.length - 1].precio_con_iva;
  const savings = worstPrice - bestPrice;
  const savingsPct = ((savings / worstPrice) * 100).toFixed(1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <TrendingDown size={16} strokeWidth={2} className={styles.headerIcon} />
          <div>
            <h3 className={styles.title}>Comparación de precios</h3>
            <p className={styles.subtitle}>
              {products.length} proveedores · Diferencia de{' '}
              <strong>{formatPrice(savings)}</strong> ({savingsPct}%)
            </p>
          </div>
        </div>
        <div className={styles.savingsBadge}>
          <span className={styles.savingsLabel}>Ahorro máximo</span>
          <span className={styles.savingsValue}>{formatPrice(savings)}</span>
        </div>
      </div>

      <div className={styles.columns}>
        {sorted.map((product, index) => {
          const isBest = index === 0;
          const brand = getBrandConfig(product.marca);
          const diffPct = ((product.precio_con_iva - bestPrice) / bestPrice * 100).toFixed(1);

          return (
            <div
              key={product.id}
              className={`${styles.column} ${isBest ? styles.bestColumn : ''}`}
            >
              {isBest && (
                <div className={styles.bestBanner}>
                  <Award size={12} strokeWidth={2.5} fill="currentColor" />
                  Mejor opción
                </div>
              )}

              <div
                className={styles.columnHeader}
                style={{ background: brand.gradient }}
              >
                <span className={styles.columnEmoji}>{brand.emoji}</span>
                <div className={styles.columnHeaderText}>
                  <span className={styles.columnBrand}>{brand.label}</span>
                  <span className={styles.columnProvider}>{product.proveedorLabel}</span>
                </div>
              </div>

              <div className={styles.columnBody}>
                <div className={styles.columnProduct}>{product.producto}</div>

                <div className={`${styles.priceBlock} ${isBest ? styles.priceBlockBest : ''}`}>
                  <span className={styles.priceSubLabel}>Sin IVA</span>
                  <span className={styles.priceSub}>{formatPrice(product.precio_sin_iva)}</span>
                  <span className={styles.priceMainLabel}>Con IVA</span>
                  <span className={styles.priceMain}>{formatPrice(product.precio_con_iva)}</span>
                  {!isBest && (
                    <span className={styles.diffBadge}>+{diffPct}% más caro</span>
                  )}
                  {isBest && (
                    <span className={styles.bestPriceBadge}>✓ Más económico</span>
                  )}
                </div>

                {product.precio_sugerido && (
                  <div className={styles.sugeridoRow}>
                    <span className={styles.sugeridoLabel}>P. Sugerido</span>
                    <span className={styles.sugeridoValue}>{formatPrice(product.precio_sugerido)}</span>
                  </div>
                )}

                <button
                  className={styles.conditionsBtn}
                  onClick={() => onViewConditions(product)}
                >
                  Ver condiciones
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
