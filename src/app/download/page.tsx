import DownloadClient from '@/components/DownloadClient';

export default function DownloadPage() {
  return (
    <div className="container mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-primary-foreground">Download Reports</h1>
        <p className="mt-2 text-muted-foreground">Download the latest bhavcopy and security-wise reports from the NSE.</p>
      </header>
      <DownloadClient />
    </div>
  );
}
