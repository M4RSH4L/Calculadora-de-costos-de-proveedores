// ============================================================
//  LQMTM – UNIFIED PRODUCT TYPES  (productos_unificados_v2)
//  Array plano – un objeto por producto, nombres ya limpios.
// ============================================================

/** Arbitrary brand-specific metadata (varies per supplier). */
export type ProveedorMetadata = Record<string, string | number | boolean | null | undefined>;

/** Supplier/vendor sub-object. */
export interface ProveedorInfo {
  /** Human-readable supplier name (e.g. "Purina", "Sieger", "Vitalcan"). */
  nombre: string;
  /** Arbitrary extra data from the ETL process. */
  metadata?: ProveedorMetadata;
}

/**
 * A single product entry as it comes from productos_unificados_v2.json.
 * All monetary values are in ARS.
 */
export interface ProductResult {
  /** Composite unique ID from the ETL, e.g. "purina_12345". */
  id_interno: string;

  producto: {
    /**
     * Fully-formatted display name.
     * Already concatenated: "{Pestaña} - {Etapa} - {Producto} - {Peso}"
     */
    nombre: string;
    sku: string;
    /** Brand / line category (e.g. "NG FANCY FEAST", "Sieger"). Empty string when n/a. */
    categoria: string;
    /** Presentation/weight string (e.g. "1.5", "0.085"). Empty string when n/a. */
    presentacion: string;
  };

  precios: {
    sin_iva: number;
    /** IVA rate as an integer percentage (e.g. 21 for 21%). */
    porcentaje_iva: number;
    con_iva: number;
    /** Suggested retail price. Null when not provided. */
    sugerido: number | null;
  };

  rentabilidad: {
    /** Gross margin as a percentage of the suggested price. */
    margen_porcentaje: number | null;
    /** Gross margin in ARS. */
    margen_valor: number | null;
  };

  proveedor: ProveedorInfo;
}

// ─── App-level aggregate ──────────────────────────────────────
export interface AppData {
  products: ProductResult[];
  stats: {
    totalProducts: number;
    totalProveedores: number;
    totalCategorias: number;
    lastUpdated: string;
    proveedores: string[];
    categorias: string[];
  };
}

// ─── Brand display config (unchanged) ────────────────────────
export interface BrandConfig {
  marca: string;
  label: string;
  gradient: string;
  textColor: string;
  accentColor: string;
  emoji: string;
}
