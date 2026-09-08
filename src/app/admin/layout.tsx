"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './admin.module.css';
import { LayoutDashboard, Users, Car, CarFront, Briefcase, Package, Wrench, Settings, ClipboardList, FileText, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pendingJobsCount, setPendingJobsCount] = useState(0);
  const [pendingMaterialsCount, setPendingMaterialsCount] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      // Pending service jobs (not MAT-)
      const { count: jobsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING_DISPATCH')
        .not('job_number', 'like', 'MAT-%');
        
      if (jobsCount !== null) setPendingJobsCount(jobsCount);

      // Pending material requests (MAT-)
      const { count: materialsCount } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDING_DISPATCH')
        .like('job_number', 'MAT-%');
        
      if (materialsCount !== null) setPendingMaterialsCount(materialsCount);
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.adminContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <h2>Digital Garage</h2>
        </div>
        <nav className={styles.navLinks}>
          <Link href="/admin" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link href="/admin/customers" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={18} /> Customers
          </Link>
          <Link href="/admin/vehicles" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Car size={18} /> Vehicles
          </Link>
          <Link href="/admin/cars" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CarFront size={18} /> Cars for Sale
          </Link>
          
          <Link href="/admin/jobs" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} /> <span>Service Jobs</span>
            </div>
            {pendingJobsCount > 0 && (
              <span style={{ background: 'var(--danger-color)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {pendingJobsCount}
              </span>
            )}
          </Link>
          
          <Link href="/admin/material-requests" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Package size={18} /> <span>Material Requests</span>
            </div>
            {pendingMaterialsCount > 0 && (
              <span style={{ background: 'var(--danger-color)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                {pendingMaterialsCount}
              </span>
            )}
          </Link>
          
          <Link href="/admin/mechanics" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Wrench size={18} /> Mechanics
          </Link>
          <Link href="/admin/parts" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={18} /> Spare Parts
          </Link>
          <Link href="/admin/services" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} /> Services
          </Link>
          <Link href="/admin/reports" className={styles.navLink} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> Reports
          </Link>
          
          <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
            <Link href="/" className={styles.navLink} style={{ color: 'var(--accent-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ArrowLeft size={18} /> Back to Public Website
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
