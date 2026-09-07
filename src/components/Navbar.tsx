"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <header style={{
      padding: '1.5rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)',
      position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: '1rem'
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '-0.02em', textDecoration: 'none' }}>
        Ethio Garage
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', fontWeight: 500, flexWrap: 'wrap' }}>
        <Link href="/">{t('home')}</Link>
        <Link href="/spare-parts">{t('spare_parts')}</Link>
        <Link href="/services">{t('services')}</Link>
        <Link href="/maintenance">{t('book_maintenance')}</Link>
        <Link href="/cars" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>🚗 {t('cars_for_sale')}</Link>
        <button 
          onClick={toggleLanguage}
          style={{ 
            background: 'var(--text-main)', color: 'var(--bg-color)', 
            border: 'none', padding: '0.4rem 0.8rem', borderRadius: '999px', 
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          🌍 {language === 'en' ? 'አማ' : 'EN'}
        </button>
        <Link href="/admin" className="btn-primary" style={{ padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.875rem' }}>{t('admin')}</Link>
      </nav>
    </header>
  );
}
