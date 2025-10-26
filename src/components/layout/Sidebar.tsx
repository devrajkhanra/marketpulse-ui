'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutGrid, ArrowDownToLine, PieChart, TrendingUp } from 'lucide-react';
import styles from './Sidebar.module.css';
import { useDownload } from '@/context/DownloadContext';

export default function Sidebar() {
  const pathname = usePathname();
  const { isDownloading } = useDownload();

  const links = [
    { href: '/', label: 'Home', icon: LayoutGrid },
    { href: '/download', label: 'Download', icon: ArrowDownToLine },
  ];

  const analysisLinks = [
    { href: '/sectors', label: 'Sectors', icon: PieChart },
    { href: '/stocks', label: 'Stocks', icon: TrendingUp },
  ]

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/">
          <span className={styles.logoText}>MarketPulse</span>
        </Link>
      </div>

      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <h2 className={styles.navGroupTitle}>Menu</h2>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.active : ''
              }`}>
              <link.icon className={styles.icon} />
              <span className={styles.label}>{link.label}</span>
              {link.href === '/download' && isDownloading && <div className={styles.downloadIndicator} />}
            </Link>
          ))}
        </div>

        <div className={styles.navGroup}>
          <h2 className={styles.navGroupTitle}>Analysis</h2>
          {analysisLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-label={link.label}
              className={`${styles.navLink} ${
                pathname === link.href ? styles.active : ''
              }`}>
              <link.icon className={styles.icon} />
              <span className={styles.label}>{link.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  );
}
