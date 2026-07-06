'use client';

import { X, Package, Tag, DollarSign, Hash, Info, Building2, TrendingUp } from 'lucide-react';
import { ProductResult } from '@/lib/types';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './ConditionsDrawer.module.css';

interface ConditionsDrawerProps {
  product: ProductResult | null;
  onClose: () => void;
}

export default function ConditionsDrawer({ product, onClose }: ConditionsDrawerProps) {
  if (!product) return null;

  const nombre = product.producto?.nombre ?? '-';
  const sku = product.producto?.sku ?? '-';
  const categoria = product.producto?.categoria ?? '';
  const presentacion = product.producto?.presentacion ?? '';

  const sinIva = product.precios?.sin_iva ?? 0;
  const conIva = product.precios?.con_iva ?? 0;
  const ivaPct = product.precios?.porcentaje_iva ?? 21;
  const sugerido = product.precios?.sugerido ?? null;

  const margenValor = product.rentabilidad?.margen_valor ?? null;
  const margenPct = product.rentabilidad?.margen_porcentaje ?? null;
  const hasMargin = margenValor != null && margenValor > 0;

  const provNombre = product.proveedor?.nombre ?? '-';
  const metadata = product.proveedor?.metadata ?? null;
  const metadataEntries = metadata ? Object.entries(metadata) : [];

  const brand = getBrandConfig(categoria, provNombre);

  const presentacionLabel = presentacion
    ? parseFloat(presentacion) < 1
      ? `${Math.round(parseFloat(presentacion) * 1000)} gramos`
      : `${presentacion} kg`
    : null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      <div className={styles.drawer} role="dialog" aria-modal="true" aria-label="Condiciones del producto">
        {/* Header */}
        <div className={styles.drawerHeader} style={{ background: brand.gradient }}>
          <div className={styles.headerTop}>
            <span className={styles.drawerEmoji}>{brand.emoji}</span>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
              <X size={18} strokeWidth={2.5} />
            </button>
          </div>
          <h2 className={styles.drawerTitle}>{nombre}</h2>
          <div className={styles.drawerMeta}>
            <span>{brand.label}</span>
            <span className={styles.metaDot}>·</span>
            <span>{provNombre}</span>
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
                <span className={styles.priceCellValue}>{formatPrice(sinIva)}</span>
              </div>
              <div className={`${styles.priceCell} ${styles.priceCellHighlight}`}>
                <span className={styles.priceCellLabel}>Precio con IVA ({ivaPct}%)</span>
                <span className={`${styles.priceCellValue} ${styles.priceCellBig}`}>
                  {formatPrice(conIva)}
                </span>
              </div>
              {sugerido != null && (
                <div className={styles.priceCell}>
                  <span className={styles.priceCellLabel}>Precio sugerido venta</span>
                  <span className={styles.priceCellValue}>{formatPrice(sugerido)}</span>
                </div>
              )}
              {hasMargin && (
                <div className={`${styles.priceCell} ${styles.priceCellSuccess}`}>
                  <span className={styles.priceCellLabel}>Margen estimado</span>
                  <span className={styles.priceCellValue}>
                    {formatPrice(margenValor!)} ({margenPct?.toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Rentabilidad */}
          {hasMargin && (
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <TrendingUp size={14} strokeWidth={2} />
                Rentabilidad
              </h3>
              <div className={styles.infoList}>
                <InfoRow
                  icon={<TrendingUp size={12} />}
                  label="Margen en valor"
                  value={formatPrice(margenValor!)}
                />
                <InfoRow
                  icon={<TrendingUp size={12} />}
                  label="Margen porcentual"
                  value={`${margenPct?.toFixed(1)}%`}
                />
              </div>
            </section>
          )}

          {/* Product info */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>
              <Package size={14} strokeWidth={2} />
              Información del producto
            </h3>
            <div className={styles.infoList}>
              <InfoRow icon={<Hash size={12} />} label="SKU / Código" value={sku} mono />
              <InfoRow icon={<Tag size={12} />} label="Línea / Categoría" value={categoria || '-'} />
              <InfoRow icon={<Building2 size={12} />} label="Proveedor" value={provNombre} />
              {presentacionLabel && (
                <InfoRow icon={<Package size={12} />} label="Presentación" value={presentacionLabel} />
              )}
              {/* Dynamic metadata */}
              {metadataEntries.map(([key, value]) => (
                <InfoRow
                  key={key}
                  icon={<Info size={12} />}
                  label={key.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())}
                  value={value == null ? '-' : String(value)}
                />
              ))}
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
                representante del proveedor <strong>{provNombre}</strong>.
              </p>
              <p className={styles.notesNote}>
                ℹ️ Los precios mostrados corresponden a la lista de precios vigente.
                IVA {ivaPct}% aplicado en origen.
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
  icon,
  label,
  value,
  mono = false,
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
