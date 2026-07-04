'use client';

import { X, Package, Tag, DollarSign, Hash, Info, Building2 } from 'lucide-react';
import { ProductNormalized } from '@/lib/types';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './ConditionsDrawer.module.css';

interface ConditionsDrawerProps {
  product: ProductNormalized | null;
  onClose: () => void;
}

export default function ConditionsDrawer({ product, onClose }: ConditionsDrawerProps) {
  if (!product) return null;

  const brand = getBrandConfig(product.marca);
  const savings = product.precio_sugerido
    ? product.precio_sugerido - product.precio_con_iva
    : null;
  const margin = savings && product.precio_sugerido
    ? ((savings / product.precio_sugerido) * 100).toFixed(1)
    : null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Condiciones del producto">
        {/* Header */}
        <div
          className={styles.drawerHeader}
          style={{ background: brand.gradient }}
        >
          <div className={styles.headerTop}>
            <span className={styles.drawerEmoji}>{brand.emoji}</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <h2 className={styles.drawerTitle}>{product.producto}</h2>
          <div className={styles.drawerMeta}>
            <span>{brand.label}</span>
            <span className={styles.metaDot}>·</span>
            <span>{product.proveedorLabel}</span>
          </div>
        </div>

        {/* Content */}
        <div className={styles.drawerContent}>
          {/* Pricing section */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <DollarSign size={14} strokeWidth={2} />
              Precios
            </h3>
            <div className={styles.priceGrid}>
              <div className={styles.priceCell}>
                <span className={styles.priceCellLabel}>Precio sin IVA</span>
                <span className={styles.priceCellValue}>{formatPrice(product.precio_sin_iva)}</span>
              </div>
              <div className={`${styles.priceCell} ${styles.priceCellHighlight}`}>
                <span className={styles.priceCellLabel}>Precio con IVA (21%)</span>
                <span className={`${styles.priceCellValue} ${styles.priceCellBig}`}>
                  {formatPrice(product.precio_con_iva)}
                </span>
              </div>
              {product.precio_sugerido && (
                <div className={styles.priceCell}>
                  <span className={styles.priceCellLabel}>Precio sugerido venta</span>
                  <span className={styles.priceCellValue}>{formatPrice(product.precio_sugerido)}</span>
                </div>
              )}
              {savings !== null && savings > 0 && (
                <div className={`${styles.priceCell} ${styles.priceCellSuccess}`}>
                  <span className={styles.priceCellLabel}>Margen estimado</span>
                  <span className={styles.priceCellValue}>
                    {formatPrice(savings)} ({margin}%)
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Product info */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Package size={14} strokeWidth={2} />
              Información del producto
            </h3>
            <div className={styles.infoList}>
              <InfoRow
                icon={<Hash size={12} />}
                label="SKU / Código"
                value={product.sku}
                mono
              />
              <InfoRow
                icon={<Tag size={12} />}
                label="Marca"
                value={product.marca}
              />
              <InfoRow
                icon={<Building2 size={12} />}
                label="Proveedor"
                value={product.proveedorLabel}
              />
              {product.categoria && (
                <InfoRow
                  icon={<Info size={12} />}
                  label="Categoría / Línea"
                  value={product.categoria}
                />
              )}
              {product.presentacion_kg && (
                <InfoRow
                  icon={<Package size={12} />}
                  label="Presentación"
                  value={product.presentacion_kg < 1
                    ? `${product.presentacion_kg * 1000} gramos`
                    : `${product.presentacion_kg} kg`}
                />
              )}
            </div>
          </section>

          {/* Notes */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Info size={14} strokeWidth={2} />
              Condiciones comerciales
            </h3>
            <div className={styles.notesBox}>
              <p className={styles.notesText}>
                Las condiciones comerciales específicas (bonificaciones, descuentos,
                financiación, logística) deben consultarse directamente con el
                representante del proveedor <strong>{product.proveedorLabel}</strong>.
              </p>
              <p className={styles.notesNote}>
                ℹ️ Los precios mostrados corresponden a la lista de precios vigente.
                IVA 21% aplicado automáticamente donde no figura en la lista.
              </p>
            </div>
          </section>

          <div className={styles.footer}>
            <span className={styles.footerText}>
              Datos actualizados · Lista de precios 2026
            </span>
            <button className={styles.closeAction} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function InfoRow({
  icon, label, value, mono = false
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoIcon}>{icon}</div>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${mono ? styles.monoValue : ''}`}>{value}</span>
    </div>
  );
}
