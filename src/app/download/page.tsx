import DownloadClient from '@/components/DownloadClient';

export default function DownloadPage() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Download Reports</h1>
      <DownloadClient />
    </main>
  );
}
