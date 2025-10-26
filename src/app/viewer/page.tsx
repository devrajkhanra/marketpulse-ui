import { Suspense } from 'react';
import BhavcopyViewer from '@/components/BhavcopyViewer';
import styles from './page.module.css';

export default function ViewerPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Bhavcopy Viewer</h1>
        <p className={styles.subtitle}>
          Browse and filter the downloaded NSE bhavcopy data.
        </p>
      </header>
      <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
        <BhavcopyViewer />
      </Suspense>
    </div>
  );
}
