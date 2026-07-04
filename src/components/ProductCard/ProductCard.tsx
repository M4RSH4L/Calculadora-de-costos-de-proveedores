'use client';

import { useState } from 'react';
import { Tag, Package, ChevronDown, Info, Star } from 'lucide-react';
import { ProductNormalized } from '@/lib/types';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  product: ProductNormalized;
  isBestPrice?: boolean;
  onViewConditions: (product: ProductNormalized) => void;
  animationDelay?: number;
}

export default function ProductCard({
  product,
  isBestPrice = false,
  onViewConditions,
  animationDelay = 0,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);
  const brand = getBrandConfig(product.marca);
  const hasIVA = product.precio_con_iva !== product.precio_sin_iva;
  const savings = product.precio_sugerido
    ? product.precio_sugerido - product.precio_con_iva
    : null;
  const margin = savings && product.precio_sugerido
    ? ((savings / product.precio_sugerido) * 100).toFixed(0)
    : null;

  return (
    <div
      className={`${styles.card} ${isBestPrice ? styles.bestPrice : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {isBestPrice && (
        <div className={styles.bestBadge}>
          <Star size={11} strokeWidth={2.5} fill="currentColor" />
          Mejor precio
        </div>
      )}

      {/* Card header with brand color */}
      <div
        className={styles.cardHeader}
        style={{ background: brand.gradient }}
      >
        <div className={styles.brandEmoji}>{brand.emoji}</div>
        <div className={styles.headerInfo}>
          <span className={styles.brandLabel}>{brand.label}</span>
          <span className={styles.proveedorLabel}>{product.proveedorLabel}</span>
        </div>
        {product.presentacion_kg && (
          <div className={styles.sizeBadge}>
            {product.presentacion_kg < 1
              ? `${product.presentacion_kg * 1000}g`
              : `${product.presentacion_kg}kg`}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className={styles.cardBody}>
        <h3 className={styles.productName}>{product.producto}</h3>

        <div className={styles.meta}>
          <span className={styles.sku}>
            <Tag size={11} strokeWidth={2} />
            {product.sku}
          </span>
          {product.categoria && (
            <span className={styles.categoria}>
              <Package size={11} strokeWidth={2} />
              {product.categoria}
            </span>
          )}
        </div>

        {/* Prices */}
        <div className={styles.prices}>
          <div className={styles.priceMain}>
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Sin IVA</span>
              <span className={styles.priceValue}>{formatPrice(product.precio_sin_iva)}</span>
            </div>
            <div className={`${styles.priceRow} ${styles.priceWithIva}`}>
              <span className={styles.priceLabel}>Con IVA (21%)</span>
              <span className={`${styles.priceValue} ${styles.priceHighlight}`}>
                {formatPrice(product.precio_con_iva)}
              </span>
            </div>
            {product.precio_sugerido && (
              <div className={`${styles.priceRow} ${styles.priceSugerido}`}>
                <span className={styles.priceLabel}>P. Sugerido</span>
                <span className={styles.priceValue}>{formatPrice(product.precio_sugerido)}</span>
              </div>
            )}
          </div>

          {margin && (
            <div className={styles.marginBadge}>
              <span className={styles.marginValue}>{margin}%</span>
              <span className={styles.marginLabel}>margen</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            className={styles.conditionsBtn}
            onClick={() => onViewConditions(product)}
          >
            <Info size={14} strokeWidth={2} />
            Ver condiciones
          </button>
          <button
            className={`${styles.expandBtn} ${expanded ? styles.expandedBtn : ''}`}
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Expanded details */}
        {expanded && (
          <div className={styles.details}>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>Proveedor</span>
              <span className={styles.detailValue}>{product.proveedorLabel}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.detailLabel}>SKU</span>
              <span className={`${styles.detailValue} ${styles.monoValue}`}>{product.sku}</span>
            </div>
            {product.categoria && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Categoría</span>
                <span className={styles.detailValue}>{product.categoria}</span>
              </div>
            )}
            {product.presentacion_kg && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Presentación</span>
                <span className={styles.detailValue}>{product.presentacion_kg}kg</span>
              </div>
            )}
            {savings !== null && savings > 0 && (
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Margen estimado</span>
                <span className={`${styles.detailValue} ${styles.successValue}`}>
                  {formatPrice(savings)} ({margin}%)
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
