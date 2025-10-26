'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Download, PieChart, LineChart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDownload } from '@/context/DownloadContext';

const links = [
  { href: '/download', label: 'Download', icon: Download },
  { href: '/sectors', label: 'Sectors', icon: PieChart },
  { href: '/stocks', label: 'Stocks', icon: LineChart },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isDownloading } = useDownload();

  return (
    <aside className="w-64 bg-gray-800 text-white p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-bold">MarketPulse</h2>
      </div>
      <nav>
        <ul>
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link href={link.href} className={cn('flex items-center p-2 rounded-md hover:bg-gray-700', { 'bg-gray-700': isActive })}>
                  <link.icon className="mr-2" />
                  {link.label}
                  {link.href === '/download' && isDownloading && <Loader2 className="ml-auto animate-spin" />}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
