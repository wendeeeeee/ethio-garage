"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';

interface DynamicService {
  id: string;
  icon: string;
  title_en: string;
  title_am: string;
  desc_en: string;
  desc_am: string;
}

export default function ServicesPage() {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<DynamicService[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadServices() {
      const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true });
      if (data) setServices(data);
      setLoading(false);
    }
    loadServices();
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1 }}>
        <section style={{ padding: '6rem 5%', backgroundColor: 'var(--bg-color)' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{t('premium_services')}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem' }}>{t('services_subtitle')}</p>
          </div>
          
          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading services...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
              {services.map((s) => (
                <Link href="/maintenance" key={s.id} className="card glass" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '2rem', borderRadius: '16px' }}>
                  <div style={{ fontSize: '2.5rem' }}>{s.icon}</div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>
                    {language === 'en' ? s.title_en : s.title_am}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flex: 1 }}>
                    {language === 'en' ? s.desc_en : s.desc_am}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', color: 'var(--primary-color)', fontSize: '0.875rem', fontWeight: 700, marginTop: '1rem' }}>
                    {t('learn_more')} <span style={{ marginLeft: '0.5rem' }}>&rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <footer style={{ padding: '4rem 5%', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.5rem' }}>{t('footer_title')}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('footer_desc')}</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>&copy; 2026 Ethio Garage. {t('footer_rights')}</p>
      </footer>
    </div>
  );
}
