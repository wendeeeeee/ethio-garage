"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../admin.module.css';

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    completedJobs: 0,
    pendingJobs: 0,
    inventoryValue: 0,
    totalCarsForSale: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      // 1. Total Jobs
      const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
      
      // 2. Completed Jobs
      const { count: completedJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED');
      
      // 3. Pending/Active Jobs
      const { count: pendingJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).neq('status', 'COMPLETED');
      
      // 4. Cars for Sale
      const { count: totalCarsForSale } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).eq('for_sale', true);
      
      // 5. Total Inventory Value (Calculated client-side for simplicity in MVP)
      const { data: parts } = await supabase.from('spare_parts').select('price, stock');
      const inventoryValue = parts ? parts.reduce((acc, part) => acc + (part.price * part.stock), 0) : 0;

      setStats({
        totalJobs: totalJobs || 0,
        completedJobs: completedJobs || 0,
        pendingJobs: pendingJobs || 0,
        totalCarsForSale: totalCarsForSale || 0,
        inventoryValue
      });
      setLoading(false);
    }
    
    loadReports();
  }, []);

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Analytics & Reports</h1>
      
      {loading ? (
        <p>Loading analytics data...</p>
      ) : (
        <>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Total Jobs Ever</h3>
              <div className={styles.value}>{stats.totalJobs}</div>
            </div>
            <div className={styles.statCard}>
              <h3 style={{ color: 'var(--accent-color)' }}>Completed Jobs</h3>
              <div className={styles.value} style={{ color: 'var(--accent-color)' }}>{stats.completedJobs}</div>
            </div>
            <div className={styles.statCard}>
              <h3 style={{ color: 'var(--danger-color)' }}>Pending Jobs</h3>
              <div className={styles.value} style={{ color: 'var(--danger-color)' }}>{stats.pendingJobs}</div>
            </div>
          </div>

          <div className={styles.statsGrid} style={{ marginTop: '2rem' }}>
            <div className={styles.statCard} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <h3>Cars Listed for Sale</h3>
              <div className={styles.value}>{stats.totalCarsForSale}</div>
            </div>
            <div className={styles.statCard} style={{ background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
              <h3>Total Inventory Value</h3>
              <div className={styles.value}>{stats.inventoryValue.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>ETB</span></div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
