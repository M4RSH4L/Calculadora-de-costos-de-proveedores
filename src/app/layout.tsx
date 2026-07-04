import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LQMTM · Buscador de Costos',
  description: 'Herramienta interna para búsqueda y comparación de costos de productos de proveedores — Lo Que Mastica Tu Mascota',
  robots: 'noindex, nofollow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
