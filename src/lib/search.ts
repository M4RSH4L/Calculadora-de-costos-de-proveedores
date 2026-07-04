import Fuse, { IFuseOptions } from 'fuse.js';
import { ProductNormalized } from './types';

let fuseInstance: Fuse<ProductNormalized> | null = null;

const FUSE_OPTIONS: IFuseOptions<ProductNormalized> = {
  keys: [
    { name: 'producto', weight: 0.40 },
    { name: 'marca', weight: 0.25 },
    { name: 'sku', weight: 0.20 },
    { name: 'categoria', weight: 0.10 },
    { name: 'proveedor', weight: 0.05 },
  ],
  threshold: 0.35,
  includeScore: true,
  minMatchCharLength: 2,
  ignoreLocation: true,
};

export function initSearch(products: ProductNormalized[]): void {
  fuseInstance = new Fuse(products, FUSE_OPTIONS);
}

export function searchProducts(query: string, products: ProductNormalized[]): ProductNormalized[] {
  if (!query.trim()) return [];

  if (!fuseInstance) {
    initSearch(products);
  }

  const results = fuseInstance!.search(query, { limit: 50 });
  return results.map(r => r.item);
}

export function filterByMarca(products: ProductNormalized[], marca: string): ProductNormalized[] {
  return products.filter(p =>
    p.marca.toLowerCase() === marca.toLowerCase()
  );
}

export function filterByProveedor(products: ProductNormalized[], proveedor: string): ProductNormalized[] {
  return products.filter(p =>
    p.proveedor.toLowerCase() === proveedor.toLowerCase()
  );
}

export function getSuggestions(query: string, products: ProductNormalized[], limit = 8): ProductNormalized[] {
  return searchProducts(query, products).slice(0, limit);
}
