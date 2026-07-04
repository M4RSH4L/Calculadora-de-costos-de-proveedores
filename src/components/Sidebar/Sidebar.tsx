'use client';

import { Package, Building2, Layers, BarChart2, RefreshCw, ChevronRight } from 'lucide-react';
import { AppData } from '@/lib/types';
import { formatPrice } from '@/lib/brands';
import styles from './Sidebar.module.css';

interface SidebarProps {
  data: AppData;
  isOpen: boolean;
}

export default function Sidebar({ data, isOpen }: SidebarProps) {
  const { stats } = data;

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.inner}>
        <div className={styles.sectionHeader}>
          <BarChart2 size={14} strokeWidth={2} />
          <span>Panel de estadísticas</span>
        </div>

        {/* Stats cards */}
        <div className={styles.statsGrid}>
          <StatCard
            icon={<Package size={16} strokeWidth={2} />}
            label="Productos"
            value={stats.totalProducts.toLocaleString('es-AR')}
            color="blue"
          />
          <StatCard
            icon={<Building2 size={16} strokeWidth={2} />}
            label="Proveedores"
            value={stats.totalProveedores.toString()}
            color="purple"
          />
          <StatCard
            icon={<Layers size={16} strokeWidth={2} />}
            label="Marcas"
            value={stats.totalMarcas.toString()}
            color="amber"
          />
        </div>

        {/* Proveedores */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Proveedores activos</h4>
          <div className={styles.list}>
            {stats.proveedores.map(p => (
              <div key={p} className={styles.listItem}>
                <div className={styles.dot} />
                <span>{p}</span>
                <ChevronRight size={12} className={styles.listChevron} />
              </div>
            ))}
          </div>
        </div>

        {/* Marcas */}
        <div className={styles.section}>
          <h4 className={styles.sectionTitle}>Marcas disponibles</h4>
          <div className={styles.tagList}>
            {stats.marcas.map(m => (
              <span key={m} className={styles.tag}>{m}</span>
            ))}
          </div>
        </div>

        {/* Last update */}
        <div className={styles.updateRow}>
          <RefreshCw size={12} strokeWidth={2} />
          <span>Actualizado: {stats.lastUpdated}</span>
        </div>
      </div>
    </aside>
  );
}

function StatCard({
  icon, label, value, color
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: 'blue' | 'purple' | 'amber';
}) {
  return (
    <div className={`${styles.statCard} ${styles[`statCard_${color}`]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statLabel}>{label}</span>
      </div>
    </div>
  );
}
