import { BrandConfig } from './types';

// ─── Brand/supplier configs ──────────────────────────────────────────────────
// Keys: valores que aparecen en producto.categoria o proveedor.nombre del v2.
export const BRAND_CONFIGS: BrandConfig[] = [
  // ── Purina sub-brands (por categoria) ──
  {
    marca: 'NG FANCY FEAST',
    label: 'Fancy Feast',
    gradient: 'linear-gradient(135deg, hsl(45, 80%, 28%) 0%, hsl(45, 75%, 42%) 100%)',
    textColor: 'hsl(45, 90%, 94%)',
    accentColor: 'hsl(45, 100%, 70%)',
    emoji: '🐱',
  },
  {
    marca: 'NG TIDY CATS',
    label: 'Tidy Cats',
    gradient: 'linear-gradient(135deg, hsl(230, 45%, 28%) 0%, hsl(230, 40%, 42%) 100%)',
    textColor: 'hsl(230, 60%, 92%)',
    accentColor: 'hsl(230, 80%, 72%)',
    emoji: '🐾',
  },
  {
    marca: 'NG GATI',
    label: 'Gati',
    gradient: 'linear-gradient(135deg, hsl(315, 55%, 28%) 0%, hsl(315, 50%, 42%) 100%)',
    textColor: 'hsl(315, 70%, 93%)',
    accentColor: 'hsl(315, 80%, 72%)',
    emoji: '🐈',
  },
  {
    marca: 'NG BONZO',
    label: 'Bonzo',
    gradient: 'linear-gradient(135deg, hsl(25, 60%, 28%) 0%, hsl(25, 55%, 42%) 100%)',
    textColor: 'hsl(25, 70%, 92%)',
    accentColor: 'hsl(35, 90%, 65%)',
    emoji: '🐶',
  },
  {
    marca: 'NG DOGUI',
    label: 'Dogui',
    gradient: 'linear-gradient(135deg, hsl(180, 60%, 22%) 0%, hsl(180, 50%, 38%) 100%)',
    textColor: 'hsl(180, 70%, 90%)',
    accentColor: 'hsl(180, 80%, 65%)',
    emoji: '🦴',
  },
  {
    marca: 'NG DENTALIFE',
    label: 'Dentalife',
    gradient: 'linear-gradient(135deg, hsl(195, 70%, 22%) 0%, hsl(195, 65%, 38%) 100%)',
    textColor: 'hsl(195, 75%, 90%)',
    accentColor: 'hsl(195, 90%, 65%)',
    emoji: '🦷',
  },
  {
    marca: 'NG EXCELLENT CAT',
    label: 'Excellent Cat',
    gradient: 'linear-gradient(135deg, hsl(265, 55%, 28%) 0%, hsl(265, 50%, 42%) 100%)',
    textColor: 'hsl(265, 70%, 93%)',
    accentColor: 'hsl(280, 80%, 75%)',
    emoji: '😸',
  },
  {
    marca: 'NG EXCELLENT DOG',
    label: 'Excellent Dog',
    gradient: 'linear-gradient(135deg, hsl(145, 55%, 22%) 0%, hsl(145, 50%, 35%) 100%)',
    textColor: 'hsl(145, 60%, 90%)',
    accentColor: 'hsl(145, 75%, 55%)',
    emoji: '⭐',
  },
  // ── Purina parent brand (fallback cuando categoria es CONSOLIDADA, etc.) ──
  {
    marca: 'Purina',
    label: 'Purina',
    gradient: 'linear-gradient(135deg, hsl(5, 75%, 32%) 0%, hsl(5, 65%, 48%) 100%)',
    textColor: 'hsl(5, 80%, 93%)',
    accentColor: 'hsl(35, 95%, 68%)',
    emoji: '🐾',
  },
  // ── Vitalcan ──
  {
    marca: 'Vitalcan',
    label: 'Vitalcan',
    gradient: 'linear-gradient(135deg, hsl(215, 75%, 22%) 0%, hsl(215, 65%, 38%) 100%)',
    textColor: 'hsl(215, 80%, 90%)',
    accentColor: 'hsl(215, 90%, 70%)',
    emoji: '🐕',
  },
  // ── Sieger ──
  {
    marca: 'Sieger',
    label: 'Sieger',
    gradient: 'linear-gradient(135deg, hsl(0, 0%, 18%) 0%, hsl(0, 0%, 35%) 100%)',
    textColor: 'hsl(0, 0%, 95%)',
    accentColor: 'hsl(35, 95%, 62%)',
    emoji: '🏆',
  },
];

/**
 * Returns the display config for a product.
 * Priority: producto.categoria → proveedor.nombre → fallback.
 */
export function getBrandConfig(categoria: string, proveedorNombre?: string): BrandConfig {
  // 1. Try matching by categoria (most specific)
  if (categoria) {
    const byCategoria = BRAND_CONFIGS.find(
      (b) => b.marca.toLowerCase() === categoria.toLowerCase(),
    );
    if (byCategoria) return byCategoria;
  }

  // 2. Try matching by supplier name
  if (proveedorNombre) {
    const byProveedor = BRAND_CONFIGS.find(
      (b) => b.marca.toLowerCase() === proveedorNombre.toLowerCase(),
    );
    if (byProveedor) return byProveedor;
  }

  // 3. Generic fallback
  return {
    marca: proveedorNombre ?? categoria ?? 'Desconocido',
    label: proveedorNombre ?? categoria ?? 'Desconocido',
    gradient: 'linear-gradient(135deg, hsl(220, 15%, 25%) 0%, hsl(220, 12%, 40%) 100%)',
    textColor: 'hsl(220, 20%, 90%)',
    accentColor: 'hsl(220, 40%, 70%)',
    emoji: '📦',
  };
}

// ─── Currency formatters ──────────────────────────────────────────────────────
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatPriceShort(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  if (price >= 1_000) return `$${(price / 1_000).toFixed(1)}k`;
  return formatPrice(price);
}
