import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Digital Garage</h2>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.navLink}>Dashboard</Link>
          <Link href="/admin/customers" className={styles.navLink}>Customers</Link>
          <Link href="/admin/vehicles" className={styles.navLink}>Vehicles</Link>
          <Link href="/admin/cars" className={styles.navLink}>Cars for Sale</Link>
          <Link href="/admin/jobs" className={styles.navLink}>Service Jobs</Link>
          <Link href="/admin/mechanics" className={styles.navLink}>Mechanics</Link>
          <Link href="/admin/parts" className={styles.navLink}>Spare Parts</Link>
          <Link href="/admin/services" className={styles.navLink}>Services</Link>
          <Link href="/admin/reports" className={styles.navLink}>Reports</Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <Link href="/" className={styles.navLink} style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>
              &larr; Back to Public Website
            </Link>
          </div>
        </nav>
      </aside>
      <main className={styles.mainContent}>
        <header className={styles.topbar}>
          <div className={styles.topbarUser}>
            <span>Operator</span>
          </div>
        </header>
        <div className={styles.contentArea}>
          {children}
        </div>
      </main>
    </div>
  );
}
