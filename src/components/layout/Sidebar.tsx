'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Download, BarChart2, TrendingUp } from 'lucide-react';
import styles from './Sidebar.module.css';

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/download', label: 'Download', icon: Download },
  { href: '/sectors', label: 'Sectors', icon: BarChart2 },
  { href: '/stocks', label: 'Stocks', icon: TrendingUp },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <Link href="/">
          MarketPulse
        </Link>
      </div>
      <ul className={styles.navList}>
        {links.map(link => (
          <li key={link.href}>
            <Link href={link.href} className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}>
              <link.icon className={styles.icon} />
              <span className={styles.label}>{link.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
