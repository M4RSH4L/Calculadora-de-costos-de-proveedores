import Fuse, { IFuseOptions } from 'fuse.js';
import { ProductResult } from './types';

let fuseInstance: Fuse<ProductResult> | null = null;

const FUSE_OPTIONS: IFuseOptions<ProductResult> = {
  keys: [
    { name: 'producto.nombre', weight: 0.50 },
    { name: 'producto.sku', weight: 0.25 },
    { name: 'producto.categoria', weight: 0.15 },
    { name: 'proveedor.nombre', weight: 0.10 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

export function initSearch(products: ProductResult[]): void {
  fuseInstance = new Fuse(products, FUSE_OPTIONS);
}

export function searchProducts(query: string, products: ProductResult[]): ProductResult[] {
  if (!query.trim()) return [];
  if (!fuseInstance) initSearch(products);
  return fuseInstance!.search(query, { limit: 50 }).map((r) => r.item);
}

export function filterByCategoria(products: ProductResult[], categoria: string): ProductResult[] {
  const lower = categoria.toLowerCase().trim();
  return products.filter(
    (p) =>
      (p.producto.categoria ?? '').toLowerCase().trim() === lower ||
      (p.proveedor.nombre ?? '').toLowerCase().trim() === lower,
  );
}

export function filterByProveedor(products: ProductResult[], proveedor: string): ProductResult[] {
  const lower = proveedor.toLowerCase().trim();
  return products.filter((p) => (p.proveedor.nombre ?? '').toLowerCase().trim() === lower);
}

export function getSuggestions(
  query: string,
  products: ProductResult[],
  limit = 8,
): ProductResult[] {
  return searchProducts(query, products).slice(0, limit);
}
