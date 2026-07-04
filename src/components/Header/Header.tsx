'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import styles from './Header.module.css';

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('es-AR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })
      );
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoImageWrapper}>
            <Image
              src="/logotipo-lqmtm.png"
              alt="Lo Que Mastica Tu Mascota"
              width={160}
              height={52}
              priority
              className={styles.logoImage}
            />
          </div>
          <div className={styles.logoDivider} />
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Buscador de Costos</span>
            <span className={styles.logoSub}>Herramienta interna</span>
          </div>
        </div>

        {/* Center badge */}
        <div className={styles.center}>
          <div className={styles.appBadge}>
            <span className={styles.badgeDot} />
            <span>Solo para uso del equipo</span>
          </div>
        </div>

        {/* Right: date + user */}
        <div className={styles.right}>
          <div className={styles.dateBlock}>
            <span className={styles.datePrimary}>{currentTime}</span>
            <span className={styles.dateSecondary}>{currentDate}</span>
          </div>

          <div className={styles.divider} />

          <button
            className={styles.sidebarToggle}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
            title="Ver estadísticas"
          >
            <div className={`${styles.toggleIcon} ${sidebarOpen ? styles.toggleActive : ''}`}>
              <span />
              <span />
              <span />
            </div>
            <div className={styles.avatar}>
              <span>US</span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
