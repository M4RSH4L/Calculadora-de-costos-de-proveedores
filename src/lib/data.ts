import { ProductResult, AppData } from './types';

// ─── Cache ────────────────────────────────────────────────────────────────────
let cachedData: AppData | null = null;

/**
 * Formats a raw product name to look clean and professional.
 * Removes redundant category prefixes (e.g. "NG EXCELLENT CAT") and formats
 * stages to Title Case, appending them nicely.
 */
function formatProductName(rawName: string): string {
  if (!rawName) return '';
  const parts = rawName.split(' - ').map((p) => p.trim());

  if (parts.length === 4) {
    const [, etapa, producto, peso] = parts;
    const formattedEtapa = etapa.charAt(0).toUpperCase() + etapa.slice(1).toLowerCase();
    return `${producto} - ${peso}, ${formattedEtapa}`;
  }

  if (parts.length === 3) {
    const [, etapa, producto] = parts;
    const formattedEtapa = etapa.charAt(0).toUpperCase() + etapa.slice(1).toLowerCase();
    return `${producto}, ${formattedEtapa}`;
  }

  if (parts.length === 2) {
    const [, producto] = parts;
    return producto;
  }

  return rawName;
}

/**
 * Validates and cleans a raw item from productos_unificados_v2.json.
 * Returns null if the item is missing critical fields (name, SKU) and
 * should be excluded from the UI.
 */
function validateItem(raw: unknown): ProductResult | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;

  // Critical: must have an id and a product object
  if (!item.id_interno || typeof item.id_interno !== 'string') return null;

  const prod = item.producto as Record<string, unknown> | undefined;
  if (!prod) return null;

  const rawNombre = typeof prod.nombre === 'string' ? prod.nombre.trim() : '';
  const nombre = formatProductName(rawNombre);
  const sku = typeof prod.sku === 'string' ? prod.sku.trim() : '';

  // Exclude rows with no meaningful name or SKU
  if (!nombre || !sku) return null;

  const precos = (item.precios as Record<string, unknown>) ?? {};
  const rent = (item.rentabilidad as Record<string, unknown>) ?? {};
  const prov = (item.proveedor as Record<string, unknown>) ?? {};
  const meta = (prov.metadata as Record<string, unknown>) ?? {};

  return {
    id_interno: item.id_interno,
    producto: {
      nombre,
      sku,
      categoria: typeof prod.categoria === 'string' ? prod.categoria.trim() : '',
      presentacion: typeof prod.presentacion === 'string' ? prod.presentacion.trim() : '',
    },
    precios: {
      sin_iva: typeof precos.sin_iva === 'number' ? precos.sin_iva : 0,
      porcentaje_iva: typeof precos.porcentaje_iva === 'number' ? precos.porcentaje_iva : 21,
      con_iva: typeof precos.con_iva === 'number' ? precos.con_iva : 0,
      sugerido: typeof precos.sugerido === 'number' ? precos.sugerido : null,
    },
    rentabilidad: {
      margen_porcentaje:
        typeof rent.margen_porcentaje === 'number' ? rent.margen_porcentaje : null,
      margen_valor: typeof rent.margen_valor === 'number' ? rent.margen_valor : null,
    },
    proveedor: {
      nombre: typeof prov.nombre === 'string' ? prov.nombre.trim() : 'Desconocido',
      metadata: Object.fromEntries(
        Object.entries(meta).map(([k, v]) => [
          k,
          typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' ? v : null,
        ]),
      ),
    },
  };
}

/**
 * Builds aggregate stats from the validated product list.
 */
function buildStats(products: ProductResult[]): AppData['stats'] {
  const proveedores = [...new Set(products.map((p) => p.proveedor.nombre))].sort();
  const categorias = [
    ...new Set(products.map((p) => p.producto.categoria).filter(Boolean)),
  ].sort();

  return {
    totalProducts: products.length,
    totalProveedores: proveedores.length,
    totalCategorias: categorias.length,
    lastUpdated: new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }),
    proveedores,
    categorias,
  };
}

/**
 * Parses the raw JSON array from productos_unificados_v2.json into AppData.
 * Invalid/incomplete rows are silently dropped.
 */
export function normalizeData(raw: unknown[]): AppData {
  const products: ProductResult[] = raw
    .map(validateItem)
    .filter((p): p is ProductResult => p !== null);

  return { products, stats: buildStats(products) };
}

/**
 * Fetches and caches the product data from the API.
 * Busts the cache when called after a server restart.
 */
export async function loadAppData(): Promise<AppData> {
  if (cachedData) return cachedData;

  const response = await fetch('/api/products', { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Failed to load product data: ${response.status} ${response.statusText}`);
  }

  const raw: unknown = await response.json();

  if (!Array.isArray(raw)) {
    throw new Error('Invalid product data: expected an array');
  }

  cachedData = normalizeData(raw);
  return cachedData;
}

/** Clears the in-memory cache (useful for hot-reload scenarios). */
export function clearCache(): void {
  cachedData = null;
}
