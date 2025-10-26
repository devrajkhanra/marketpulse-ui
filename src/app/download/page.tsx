import DownloadClient from '@/components/DownloadClient';
import styles from './page.module.css';

export default function DownloadPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Download Reports</h1>
        <p className={styles.subtitle}>
          Download the latest bhavcopy and security-wise reports from the NSE.
        </p>
      </header>
      <DownloadClient />
    </div>
  );
}
