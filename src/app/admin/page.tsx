"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './admin.module.css';
import { Activity, Wrench, AlertCircle, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    activeJobs: 0,
    mechanics: 0,
    lowStockParts: 0
  });

  useEffect(() => {
    async function fetchStats() {
      // 1. Active Jobs (Status != COMPLETED)
      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .neq('status', 'COMPLETED');

      // 2. Total Mechanics
      const { count: mechanicsCount } = await supabase
        .from('mechanics')
        .select('*', { count: 'exact', head: true });

      // 3. (Removed Invoices)

      // 4. Low Stock Parts (Assuming quantity < 5 means low stock)
      const { count: partsCount } = await supabase
        .from('spare_parts')
        .select('*', { count: 'exact', head: true })
        .lt('quantity', 5);

      setStats({
        activeJobs: jobsCount || 0,
        mechanics: mechanicsCount || 0,
        lowStockParts: partsCount || 0
      });
    }

    fetchStats();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dashboard Overview</h1>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={20} /> Active Jobs</h3>
          <div className={styles.value}>{stats.activeJobs}</div>
        </div>
        <div className={styles.statCard}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wrench size={20} /> Available Mechanics</h3>
          <div className={styles.value}>{stats.mechanics}</div>
        </div>

        <div className={styles.statCard}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><AlertCircle size={20} /> Low Stock Parts</h3>
          <div className={styles.value}>{stats.lowStockParts}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={24} /> Recent Activity</h2>
        <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
          Map overview and recent job list will appear here.
        </p>
      </div>
    </div>
  );
}
