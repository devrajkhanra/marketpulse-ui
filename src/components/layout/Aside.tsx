import styles from './Aside.module.css';

export default function Aside() {
  return (
    <aside className={styles.aside}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Recent Activity</h3>
        <ul className={styles.activityList}>
          <li>Stock prices updated.</li>
          <li>Sector performance analyzed.</li>
          <li>New data downloaded.</li>
        </ul>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Quick Links</h3>
        <ul className={styles.quickLinks}>
          <li><a href="#">Market News</a></li>
          <li><a href="#">Watchlist</a></li>
          <li><a href="#">Settings</a></li>
        </ul>
      </div>
    </aside>
  );
}
