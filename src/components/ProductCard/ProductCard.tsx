'use client';

import { useState } from 'react';
import {
  Tag,
  ChevronDown,
  ExternalLink,
  Star,
  TrendingUp,
  Store,
  Layers,
  DollarSign,
} from 'lucide-react';
import { ProductResult } from '@/lib/types';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './ProductCard.module.css';

// ─── Props ────────────────────────────────────────────────────────────────────
interface ProductCardProps {
  product: ProductResult;
  isBestPrice?: boolean;
  onViewConditions: (product: ProductResult) => void;
  animationDelay?: number;
}

// ─── Safe formatters ──────────────────────────────────────────────────────────
function safePrice(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '$0,00';
  return formatPrice(value);
}

function safePct(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '-';
  return `${value.toFixed(1)}%`;
}

function safeAmount(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return '-';
  return formatPrice(value);
}

/** Render a single metadata key→value row dynamically. */
function MetaRow({ label, value }: { label: string; value: unknown }) {
  const display =
    value == null ? '-' : typeof value === 'boolean' ? (value ? 'Sí' : 'No') : String(value);

  const displayLabel = label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{displayLabel}</span>
      <span className={styles.detailValue}>{display}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductCard({
  product,
  isBestPrice = false,
  onViewConditions,
  animationDelay = 0,
}: ProductCardProps) {
  const [expanded, setExpanded] = useState(false);

  // Safe destructuring with fallbacks at every level
  const nombre = product?.producto?.nombre ?? '-';
  const sku = product?.producto?.sku ?? '-';
  const categoria = product?.producto?.categoria ?? '';
  const presentacion = product?.producto?.presentacion ?? '';

  const sinIva = product?.precios?.sin_iva ?? 0;
  const conIva = product?.precios?.con_iva ?? 0;
  const ivaPct = product?.precios?.porcentaje_iva ?? 21;
  const sugerido = product?.precios?.sugerido ?? null;

  const margenPct = product?.rentabilidad?.margen_porcentaje ?? null;
  const margenValor = product?.rentabilidad?.margen_valor ?? null;
  const hasMargin = margenValor != null && margenValor > 0;

  const provNombre = product?.proveedor?.nombre ?? '-';
  const metadata = product?.proveedor?.metadata ?? null;
  const metadataEntries = metadata ? Object.entries(metadata) : [];

  // Brand config: prefer categoria (more specific), fallback to supplier name
  const brand = getBrandConfig(categoria, provNombre);

  // Presentation label
  const presentacionLabel = presentacion
    ? parseFloat(presentacion) < 1
      ? `${Math.round(parseFloat(presentacion) * 1000)}g`
      : `${presentacion}kg`
    : null;

  // Margin colour tier
  const marginClass =
    (margenPct ?? 0) >= 30
      ? styles.marginHigh
      : (margenPct ?? 0) >= 15
      ? styles.marginMid
      : styles.marginLow;

  return (
    <article
      className={`${styles.card} ${isBestPrice ? styles.bestPrice : ''}`}
      style={{ animationDelay: `${animationDelay}ms` }}
      aria-label={`Producto: ${nombre}`}
    >
      {/* ── Best-price badge ──────────────────────── */}
      {isBestPrice && (
        <div className={styles.bestBadge} aria-label="Mejor precio disponible">
          <Star size={11} strokeWidth={2.5} fill="currentColor" />
          Mejor precio
        </div>
      )}

      {/* ── Coloured header ───────────────────────── */}
      <div className={styles.cardHeader} style={{ background: brand.gradient }}>
        <div className={styles.brandEmoji} aria-hidden="true">
          {brand.emoji}
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.brandLabel}>{brand.label}</span>
          <span className={styles.proveedorLabel}>
            <Store size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 3 }} />
            {provNombre}
          </span>
        </div>
        {presentacionLabel && (
          <div className={styles.sizeBadge}>{presentacionLabel}</div>
        )}
      </div>

      {/* ── Card body ─────────────────────────────── */}
      <div className={styles.cardBody}>
        {/* Product name: the pre-formatted title */}
        <h3 className={styles.productName} title={nombre}>
          {nombre}
        </h3>

        {/* Meta chips */}
        <div className={styles.meta}>
          <span className={styles.sku} title={`SKU: ${sku}`}>
            <Tag size={11} strokeWidth={2} />
            {sku}
          </span>
          {presentacionLabel && (
            <span className={styles.presentacionChip}>
              <Layers size={11} strokeWidth={2} />
              {presentacionLabel}
            </span>
          )}
        </div>

        {/* ── Prices block ──────────────────────── */}
        <div className={styles.prices}>
          <div className={styles.priceMain}>
            {/* Sin IVA */}
            <div className={styles.priceRow}>
              <span className={styles.priceLabel}>Sin IVA</span>
              <span className={styles.priceValue}>{safePrice(sinIva)}</span>
            </div>

            {/* Con IVA — primary */}
            <div className={`${styles.priceRow} ${styles.priceWithIva}`}>
              <span className={styles.priceLabel}>
                Con IVA
                <span className={styles.ivaBadge}>+{ivaPct}%</span>
              </span>
              <span className={`${styles.priceValue} ${styles.priceHighlight}`}>
                {safePrice(conIva)}
              </span>
            </div>

            {/* P. Sugerido */}
            {sugerido != null && (
              <div className={`${styles.priceRow} ${styles.priceSugerido}`}>
                <span className={styles.priceLabel}>
                  <DollarSign size={10} strokeWidth={2} />
                  P. Sugerido
                </span>
                <span className={styles.priceValue}>{safePrice(sugerido)}</span>
              </div>
            )}
          </div>

          {/* Margin badge */}
          {hasMargin && (
            <div
              className={`${styles.marginBadge} ${marginClass}`}
              title="Margen estimado sobre precio sugerido"
            >
              <TrendingUp size={13} strokeWidth={2.5} />
              <span className={styles.marginValue}>{safePct(margenPct)}</span>
              <span className={styles.marginLabel}>margen</span>
            </div>
          )}
        </div>

        {/* ── Actions ──────────────────────────────── */}
        <div className={styles.actions}>
          <button
            id={`conditions-btn-${product?.id_interno ?? 'unknown'}`}
            className={styles.conditionsBtn}
            onClick={() => onViewConditions(product)}
            aria-label={`Ver condiciones de ${provNombre}`}
          >
            <ExternalLink size={14} strokeWidth={2} />
            Ver condiciones
          </button>
          <button
            id={`expand-btn-${product?.id_interno ?? 'unknown'}`}
            className={`${styles.expandBtn} ${expanded ? styles.expandedBtn : ''}`}
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
            aria-label={expanded ? 'Colapsar detalles' : 'Expandir detalles'}
          >
            <ChevronDown size={16} strokeWidth={2} />
          </button>
        </div>

        {/* ── Expanded panel ────────────────────────── */}
        {expanded && (
          <div className={styles.details} role="region" aria-label="Detalles del producto">
            {/* Información base */}
            <div className={styles.detailSection}>
              <span className={styles.detailSectionTitle}>Información base</span>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>SKU</span>
                <span className={`${styles.detailValue} ${styles.monoValue}`}>{sku}</span>
              </div>
              {categoria && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Categoría / Línea</span>
                  <span className={styles.detailValue}>{categoria}</span>
                </div>
              )}
              {presentacionLabel && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Presentación</span>
                  <span className={styles.detailValue}>{presentacionLabel}</span>
                </div>
              )}
            </div>

            {/* Precios */}
            <div className={styles.detailSection}>
              <span className={styles.detailSectionTitle}>Precios</span>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Sin IVA</span>
                <span className={styles.detailValue}>{safePrice(sinIva)}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Con IVA ({ivaPct}%)</span>
                <span className={`${styles.detailValue} ${styles.priceHighlightAlt}`}>
                  {safePrice(conIva)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>P. Sugerido</span>
                <span className={sugerido != null ? styles.detailValue : `${styles.detailValue} ${styles.mutedValue}`}>
                  {sugerido != null ? safePrice(sugerido) : '-'}
                </span>
              </div>
            </div>

            {/* Rentabilidad */}
            <div className={styles.detailSection}>
              <span className={styles.detailSectionTitle}>Rentabilidad</span>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Margen (valor)</span>
                <span
                  className={`${styles.detailValue} ${hasMargin ? styles.successValue : styles.mutedValue}`}
                >
                  {safeAmount(margenValor)}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Margen (%)</span>
                <span
                  className={`${styles.detailValue} ${hasMargin ? styles.successValue : styles.mutedValue}`}
                >
                  {safePct(margenPct)}
                </span>
              </div>
            </div>

            {/* Proveedor */}
            <div className={styles.detailSection}>
              <span className={styles.detailSectionTitle}>Proveedor</span>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Nombre</span>
                <span className={styles.detailValue}>{provNombre}</span>
              </div>
              {/* Dynamic metadata via Object.entries */}
              {metadataEntries.length > 0 &&
                metadataEntries.map(([key, value]) => (
                  <MetaRow key={key} label={key} value={value} />
                ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
