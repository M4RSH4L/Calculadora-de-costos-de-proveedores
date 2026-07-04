export interface ProductNormalized {
  id: string;
  proveedor: string;
  proveedorLabel: string;
  marca: string;
  sku: string;
  producto: string;
  categoria?: string;
  presentacion_kg?: number;
  precio_sin_iva: number;
  precio_con_iva: number;
  precio_sugerido?: number;
}

export interface VentaRecord {
  producto_venta: string;
  cantidad_total: number;
  ingreso_total: number;
}

export interface AppData {
  products: ProductNormalized[];
  stats: {
    totalProducts: number;
    totalProveedores: number;
    totalMarcas: number;
    lastUpdated: string;
    proveedores: string[];
    marcas: string[];
  };
}

export interface BrandConfig {
  marca: string;
  label: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  emoji: string;
}
