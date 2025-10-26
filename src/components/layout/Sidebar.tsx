'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDownload } from '@/context/DownloadContext';

const links = [
  { href: '/download', label: 'Download'},
  { href: '/sectors', label: 'Sectors' },
  { href: '/stocks', label: 'Stocks' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isDownloading } = useDownload();

  return (
    <aside className="w-64 bg-card text-card-foreground p-4 border-r border-border">
      <div className="mb-8 flex items-center justify-center">
        <h2 className="text-2xl font-bold text-primary-foreground">MarketPulse</h2>
      </div>
      <nav>
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className={`flex items-center p-3 rounded-md hover:bg-muted ${isActive ? 'bg-muted' : ''}`}>
                  <span className="mr-3 h-5 w-5 text-muted-foreground">ICON</span>
                  <span className="font-medium text-foreground">{link.label}</span>
                  {link.href === '/download' && isDownloading && <span className="ml-auto h-5 w-5 animate-spin text-primary">LOADING</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
