'use client';

import { TrendingDown, Award } from 'lucide-react';
import { ProductResult } from '@/lib/types';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './ComparePanel.module.css';

interface ComparePanelProps {
  products: ProductResult[];
  onViewConditions: (product: ProductResult) => void;
}

export default function ComparePanel({ products, onViewConditions }: ComparePanelProps) {
  if (products.length < 2) return null;

  const sorted = [...products].sort(
    (a, b) => (a.precios?.con_iva ?? 0) - (b.precios?.con_iva ?? 0),
  );
  const bestPrice = sorted[0].precios?.con_iva ?? 0;
  const worstPrice = sorted[sorted.length - 1].precios?.con_iva ?? 0;
  const savings = worstPrice - bestPrice;
  const savingsPct = worstPrice > 0 ? ((savings / worstPrice) * 100).toFixed(1) : '0.0';

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
          const conIva = product.precios?.con_iva ?? 0;
          const sinIva = product.precios?.sin_iva ?? 0;
          const sugerido = product.precios?.sugerido ?? null;
          const categoria = product.producto?.categoria ?? '';
          const provNombre = product.proveedor?.nombre ?? '-';
          const brand = getBrandConfig(categoria, provNombre);
          const diffPct = bestPrice > 0
            ? (((conIva - bestPrice) / bestPrice) * 100).toFixed(1)
            : '0.0';

          return (
            <div
              key={product.id_interno}
              className={`${styles.column} ${isBest ? styles.bestColumn : ''}`}
            >
              {isBest && (
                <div className={styles.bestBanner}>
                  <Award size={12} strokeWidth={2.5} fill="currentColor" />
                  Mejor opción
                </div>
              )}

              <div className={styles.columnHeader} style={{ background: brand.gradient }}>
                <span className={styles.columnEmoji}>{brand.emoji}</span>
                <div className={styles.columnHeaderText}>
                  <span className={styles.columnBrand}>{brand.label}</span>
                  <span className={styles.columnProvider}>{provNombre}</span>
                </div>
              </div>

              <div className={styles.columnBody}>
                <div className={styles.columnProduct}>{product.producto?.nombre ?? '-'}</div>

                <div className={`${styles.priceBlock} ${isBest ? styles.priceBlockBest : ''}`}>
                  <span className={styles.priceSubLabel}>Sin IVA</span>
                  <span className={styles.priceSub}>{formatPrice(sinIva)}</span>
                  <span className={styles.priceMainLabel}>Con IVA</span>
                  <span className={styles.priceMain}>{formatPrice(conIva)}</span>
                  {!isBest && (
                    <span className={styles.diffBadge}>+{diffPct}% más caro</span>
                  )}
                  {isBest && (
                    <span className={styles.bestPriceBadge}>✓ Más económico</span>
                  )}
                </div>

                {sugerido != null && (
                  <div className={styles.sugeridoRow}>
                    <span className={styles.sugeridoLabel}>P. Sugerido</span>
                    <span className={styles.sugeridoValue}>{formatPrice(sugerido)}</span>
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
