import { ProductNormalized, AppData } from './types';

const IVA_RATE = 1.21;

interface VitalcanRaw {
  marca: string;
  sku: string;
  producto: string;
  precio_sin_iva: number | null;
  precio_sugerido: number | null;
}

interface PurinaRaw {
  marca: string;
  categoria: string;
  sku: string;
  producto: string;
  presentacion_kg: number | null;
  precio_sin_iva: number | null;
  precio_con_iva: number | null;
  precio_sugerido: number | null;
}

interface RawData {
  vitalcan: VitalcanRaw[];
  purina: PurinaRaw[];
}

let cachedData: AppData | null = null;

export function normalizeData(raw: RawData): AppData {
  const products: ProductNormalized[] = [];

  // Normalize Vitalcan
  for (const item of raw.vitalcan) {
    if (!item.precio_sin_iva || item.sku === '(*)') continue;
    products.push({
      id: `vitalcan_${item.sku}`,
      proveedor: 'vitalcan',
      proveedorLabel: 'Vitalcan',
      marca: item.marca || 'Vitalcan',
      sku: item.sku,
      producto: item.producto,
      precio_sin_iva: item.precio_sin_iva,
      precio_con_iva: Math.round(item.precio_sin_iva * IVA_RATE * 100) / 100,
      precio_sugerido: item.precio_sugerido ?? undefined,
    });
  }

  // Normalize Purina
  for (const item of raw.purina) {
    if (!item.precio_sin_iva) continue;
    const marcaDisplay = item.categoria
      ? categoriaToBrand(item.categoria)
      : (item.marca || 'Purina');

    products.push({
      id: `purina_${item.sku}`,
      proveedor: 'purina',
      proveedorLabel: 'Purina (Nestlé)',
      marca: marcaDisplay,
      sku: item.sku,
      producto: buildPurinaProductName(item),
      categoria: item.categoria,
      presentacion_kg: item.presentacion_kg ?? undefined,
      precio_sin_iva: item.precio_sin_iva,
      precio_con_iva: item.precio_con_iva && item.precio_con_iva > 0
        ? item.precio_con_iva
        : Math.round(item.precio_sin_iva * IVA_RATE * 100) / 100,
      precio_sugerido: item.precio_sugerido ?? undefined,
    });
  }

  const allMarcas = [...new Set(products.map(p => p.marca))].sort();
  const allProveedores = [...new Set(products.map(p => p.proveedorLabel))].sort();

  return {
    products,
    stats: {
      totalProducts: products.length,
      totalProveedores: allProveedores.length,
      totalMarcas: allMarcas.length,
      lastUpdated: new Date().toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      proveedores: allProveedores,
      marcas: allMarcas,
    },
  };
}

function categoriaToBrand(categoria: string): string {
  const map: Record<string, string> = {
    'NG FANCY FEAST': 'Fancy Feast',
    'NG TIDY CATS': 'Tidy Cats',
    'NG GATI': 'Gati',
    'NG BONZO': 'Bonzo',
    'NG DOGUI': 'Dogui',
    'NG DENTALIFE': 'Dentalife',
    'NG EXCELLENT CAT': 'Excellent Cat',
    'NG EXCELLENT DOG': 'Excellent Dog',
    'CONSOLIDADA': 'Purina',
    'CONSOLIDADA1': 'Purina',
    'CONSOLIDADA.': 'Purina',
    'CONSOLIDADO': 'Purina',
  };
  return map[categoria] || 'Purina';
}

function buildPurinaProductName(item: PurinaRaw): string {
  const brand = categoriaToBrand(item.categoria);
  const parts = [brand, item.producto];
  if (item.presentacion_kg) {
    const kgStr = item.presentacion_kg < 1
      ? `${item.presentacion_kg * 1000}g`
      : `${item.presentacion_kg}kg`;
    parts.push(kgStr);
  }
  return parts.join(' ');
}

export async function loadAppData(): Promise<AppData> {
  if (cachedData) return cachedData;

  const response = await fetch('/data/base_datos_app.json');
  if (!response.ok) throw new Error('Failed to load product data');

  const raw: RawData = await response.json();
  cachedData = normalizeData(raw);
  return cachedData;
}
