"use client";

import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function MaintenancePage() {
  const { t } = useLanguage();
  const [isBooking, setIsBooking] = useState(false);
  const [maintName, setMaintName] = useState('');
  const [maintPhone, setMaintPhone] = useState('');
  const [maintVehicle, setMaintVehicle] = useState('');
  const [maintService, setMaintService] = useState('');
  const [maintDate, setMaintDate] = useState('');

  const handleMaintenanceBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsBooking(true);

    const jobNum = 'MNT-' + Math.floor(Math.random() * 10000);
    const problemStr = `Scheduled for [${maintDate}]: ${maintService} | Vehicle: ${maintVehicle} | From: ${maintName} (${maintPhone})`;

    const { error } = await supabase.from('jobs').insert([{
      job_number: jobNum,
      problem: problemStr,
      location: 'Garage / Scheduled Drop-off',
      status: 'PENDING_DISPATCH'
    }]);

    if (!error) {
      alert(t('booking_success'));
      setMaintName('');
      setMaintPhone('');
      setMaintVehicle('');
      setMaintService('');
      setMaintDate('');
    } else {
      alert(t('booking_fail'));
    }
    setIsBooking(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, backgroundColor: 'var(--surface-hover)', padding: '4rem 5%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{t('schedule_title')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem' }}>{t('plan_ahead')}</p>
          
          <form onSubmit={handleMaintenanceBooking} className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left', padding: '2.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('what_service')}</label>
              <select 
                required 
                value={maintService} onChange={e => setMaintService(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
              >
                <option value="" disabled>{t('select_service')}</option>
                <option value="General Inspection">{t('general_inspection')}</option>
                <option value="Oil Change">{t('srv_oil')}</option>
                <option value="Tire Service / Replacement">{t('tire_replacement')}</option>
                <option value="Brake Pad Replacement">{t('brake_replacement')}</option>
                <option value="Battery Replacement">{t('battery_replacement')}</option>
                <option value="Engine Diagnostics">{t('engine_diag')}</option>
                <option value="Body Work / Paint">{t('body_work')}</option>
                <option value="Other Maintenance">{t('other')} {t('srv_repair')}</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('preferred_date')}</label>
              <input 
                type="date" required 
                min={new Date().toISOString().split('T')[0]}
                value={maintDate} onChange={e => setMaintDate(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('vehicle_make_model')}</label>
              <input 
                type="text" placeholder={t('vehicle_placeholder')} required 
                value={maintVehicle} onChange={e => setMaintVehicle(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('name_placeholder')}</label>
              <input 
                type="text" placeholder={t('name_placeholder')} required 
                value={maintName} onChange={e => setMaintName(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('phone_placeholder')}</label>
              <input 
                type="text" placeholder={t('phone_placeholder')} required 
                value={maintPhone} onChange={e => setMaintPhone(e.target.value)}
                style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" className="btn-primary" disabled={isBooking} style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem' }}>
                {isBooking ? t('booking') : `📅 ${t('confirm_booking')}`}
              </button>
            </div>
          </form>
        </div>
      </main>

      <footer style={{ padding: '4rem 5%', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.5rem' }}>{t('footer_title')}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('footer_desc')}</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>&copy; 2026 Ethio Garage. {t('footer_rights')}</p>
      </footer>
    </div>
  );
}
