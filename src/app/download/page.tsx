import DownloadClient from '@/components/DownloadClient';

export default function DownloadPage() {
  return (
    <div style={{
      animation: 'fadeIn 0.5s ease-out',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          background: 'linear-gradient(135deg, #60a5fa 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
          marginBottom: '0.75rem'
        }}>
          Download Reports
        </h1>
        <p style={{
          color: '#94a3b8',
          fontSize: '1.125rem',
          fontWeight: '400'
        }}>
          Download the latest bhavcopy and security-wise reports from the NSE.
        </p>
      </header>
      <DownloadClient />
    </div>
  );
}