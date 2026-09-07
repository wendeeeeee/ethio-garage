"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import styles from './page.module.css';

export default function Home() {
  const { t } = useLanguage();
  
  // Emergency State
  const [isRequesting, setIsRequesting] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyVehicle, setEmergencyVehicle] = useState('');
  const [emergencyProblem, setEmergencyProblem] = useState('');
  
  // Tracking State
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null);
  const [trackingJobNumber, setTrackingJobNumber] = useState<string | null>(null);
  const [assignedMechanic, setAssignedMechanic] = useState<any>(null);
  const [manualToken, setManualToken] = useState('');

  useEffect(() => {
    const savedJobId = localStorage.getItem('trackingJobId');
    const savedJobNum = localStorage.getItem('trackingJobNumber');
    if (savedJobId) {
      setTrackingJobId(savedJobId);
      setTrackingJobNumber(savedJobNum);
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (trackingJobId && !assignedMechanic) {
      interval = setInterval(async () => {
        const { data } = await supabase
          .from('jobs')
          .select('mechanic_id, status')
          .eq('id', trackingJobId)
          .single();
        
        if (data && data.mechanic_id) {
          const mechRes = await supabase.from('mechanics').select('*').eq('id', data.mechanic_id).single();
          if (mechRes.data) {
            setAssignedMechanic(mechRes.data);
          }
        }
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [trackingJobId, assignedMechanic]);

  const handleTrackExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken) return;
    
    const { data } = await supabase.from('jobs').select('id, job_number').eq('job_number', manualToken.toUpperCase()).single();
    if (data) {
      setTrackingJobId(data.id);
      setTrackingJobNumber(data.job_number);
      localStorage.setItem('trackingJobId', data.id);
      localStorage.setItem('trackingJobNumber', data.job_number);
    } else {
      alert("Invalid tracking token. Please check and try again.");
    }
  };

  const handleEmergencyRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      setIsRequesting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = position.coords.latitude.toFixed(5);
      const lng = position.coords.longitude.toFixed(5);
      const locationString = `${lat}, ${lng}`;
      const jobNum = 'EMG-' + Math.floor(Math.random() * 10000);

      const { data, error } = await supabase.from('jobs').insert([{
        job_number: jobNum,
        problem: `SOS: ${emergencyProblem} | Vehicle: ${emergencyVehicle} | From: ${emergencyName} (${emergencyPhone})`,
        location: locationString,
        status: 'PENDING_DISPATCH'
      }]).select();

      if (!error && data && data.length > 0) {
        setTrackingJobId(data[0].id);
        setTrackingJobNumber(jobNum);
        localStorage.setItem('trackingJobId', data[0].id);
        localStorage.setItem('trackingJobNumber', jobNum);
      } else {
        alert("Failed to send request. Please call us directly.");
      }
      setIsRequesting(false);
    }, (error) => {
      console.error("Geolocation error:", error);
      alert("Unable to retrieve your location automatically. Please ensure location services are enabled, or call us directly.");
      setIsRequesting(false);
    }, { timeout: 10000, maximumAge: 60000, enableHighAccuracy: true });
  };

  const clearTracking = () => {
    setTrackingJobId(null);
    setTrackingJobNumber(null);
    setAssignedMechanic(null);
    localStorage.removeItem('trackingJobId');
    localStorage.removeItem('trackingJobNumber');
  };

  return (
    <div className={styles.container}>
      <Navbar />

      <main>
        {/* HERO SECTION */}
        <section className={styles.hero} style={{ position: 'relative', overflow: 'hidden', padding: '4rem 5% 3rem' }}>
          <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'var(--primary-color)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }}></div>
          <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--accent-color)', filter: 'blur(150px)', opacity: 0.1, zIndex: 0 }}></div>
          
          <div className={styles.heroContent} style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ fontSize: '4.5rem', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
              {t('hero_title').split(' ')[0]} <span style={{ color: 'var(--primary-color)' }}>{t('hero_title').split(' ')[1] || ''}</span>
            </h1>
            <p style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem', color: 'var(--text-muted)' }}>
              {t('hero_subtitle')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
              
              {!trackingJobId ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '450px' }}>
                  <div className="card glass" style={{ padding: '2rem', textAlign: 'left', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <div style={{ background: 'var(--danger-color)', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>🚨</div>
                      <h3 style={{ margin: 0, color: 'var(--danger-color)' }}>{t('rescue_form_title')}</h3>
                    </div>
                    <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('rescue_form_desc')}</p>
                    <form onSubmit={handleEmergencyRescue} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <input 
                        type="text" placeholder={t('name_placeholder')} required 
                        value={emergencyName} onChange={e => setEmergencyName(e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                      />
                      <input 
                        type="text" placeholder={t('phone_placeholder')} required 
                        value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                      />
                      <input 
                        type="text" placeholder={t('vehicle_placeholder')} required 
                        value={emergencyVehicle} onChange={e => setEmergencyVehicle(e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                      />
                      <select 
                        required 
                        value={emergencyProblem} onChange={e => setEmergencyProblem(e.target.value)}
                        style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', color: emergencyProblem ? 'var(--text-main)' : 'var(--text-muted)' }}
                      >
                        <option value="" disabled>{t('issue_placeholder')}</option>
                        <option value="Engine won't start">{t("Engine won't start")}</option>
                        <option value="Flat tire">{t("Flat tire")}</option>
                        <option value="Battery dead">{t("Battery dead")}</option>
                        <option value="Brake problem">{t("Brake problem")}</option>
                        <option value="Oil leak">{t("Oil leak")}</option>
                        <option value="Overheating">{t("Overheating")}</option>
                        <option value="Transmission issue">{t("Transmission issue")}</option>
                        <option value="Accident / Body damage">{t("Accident / Body damage")}</option>
                        <option value="Towing request">{t("Towing request")}</option>
                        <option value="Car locked / Key issue">{t("Car locked / Key issue")}</option>
                        <option value="Other">{t("Other")}</option>
                      </select>
                      {emergencyProblem === 'Other' && (
                        <input 
                          type="text" placeholder={t('describe_issue')} required 
                          onChange={e => setEmergencyProblem('Other: ' + e.target.value)}
                          style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                        />
                      )}
                      <button type="submit" className="btn-primary" disabled={isRequesting} style={{ background: 'var(--danger-color)', width: '100%', padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                        {isRequesting ? t('locating') : t('request_rescue_btn')}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                <div className="card glass" style={{ width: '100%', maxWidth: '450px', padding: '2.5rem 2rem', textAlign: 'center', border: assignedMechanic ? '1px solid var(--accent-color)' : '1px solid var(--primary-color)' }}>
                   {!assignedMechanic ? (
                     <>
                        <div style={{ fontSize: '3rem', animation: 'pulse 1.5s infinite' }}>⏳</div>
                        <h3 style={{ marginTop: '1rem', color: 'var(--primary-color)' }}>{t('request_sent')}</h3>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>{t('request_sent_desc')}</p>
                        <div style={{ background: 'var(--surface-hover)', padding: '1rem', borderRadius: '8px', marginTop: '1.5rem', border: '1px solid var(--border-color)' }}>
                           <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)' }}>{t('tracking_token')}</p>
                           <strong style={{ fontSize: '1.5rem', color: 'var(--text-main)', letterSpacing: '2px' }}>{trackingJobNumber}</strong>
                        </div>
                     </>
                   ) : (
                     <>
                        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👨‍🔧</div>
                        <h3 style={{ color: 'var(--accent-color)', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{t('help_on_way')}</h3>
                        <div style={{ background: 'var(--surface-hover)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('assigned_mechanic')}</p>
                          <strong style={{ fontSize: '1.25rem', display: 'block', marginTop: '0.25rem' }}>{assignedMechanic.name}</strong>
                          <p style={{ margin: '0.25rem 0 1rem 0', color: 'var(--primary-color)' }}>{t('skill')}: {assignedMechanic.skill}</p>
                          
                          <a href={`tel:${assignedMechanic.phone}`} style={{ display: 'inline-block', background: 'var(--accent-color)', color: 'var(--bg-color)', padding: '0.75rem 1.5rem', borderRadius: '999px', textDecoration: 'none', fontWeight: 'bold', marginBottom: '1rem' }}>
                            📞 {t('call_mechanic')} {assignedMechanic.phone}
                          </a>
                        </div>
                     </>
                   )}
                   <button onClick={clearTracking} style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer' }}>
                     {t('back_home')}
                   </button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ height: '1px', width: '50px', background: 'var(--border-color)' }}></div>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('or_call_us')}</span>
                <div style={{ height: '1px', width: '50px', background: 'var(--border-color)' }}></div>
              </div>

              <a href="tel:0919910089" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.25rem', borderRadius: '999px', boxShadow: 'var(--shadow-glow)' }}>
                📞 0919 91 00 89
              </a>
            </div>
          </div>
        </section>
        {/* QUICK LINKS SECTION */}
        <section className={styles.section} style={{ backgroundColor: 'var(--surface-hover)', padding: '4rem 5%' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <Link href="/spare-parts" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>⚙️</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('genuine_parts')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('genuine_parts_desc')}</p>
                <div style={{ marginTop: '1.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{t('search_inventory_btn')} &rarr;</div>
              </div>
            </Link>

            <Link href="/services" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('premium_services')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('premium_services_desc')}</p>
                <div style={{ marginTop: '1.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{t('view_services_btn')} &rarr;</div>
              </div>
            </Link>

            <Link href="/maintenance" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('book_maintenance')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('book_maintenance_desc')}</p>
                <div style={{ marginTop: '1.5rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>{t('schedule_now_btn')} &rarr;</div>
              </div>
            </Link>
            
            <Link href="/cars" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚗</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('cars_for_sale')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('cars_desc')}</p>
                <div style={{ marginTop: '1.5rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>{t('view_cars_btn')} &rarr;</div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer} style={{ padding: '4rem 5%', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <h3 style={{ marginBottom: '1rem', color: 'var(--primary-color)', fontSize: '1.5rem' }}>{t('footer_title')}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('footer_desc')}</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>&copy; 2026 Ethio Garage. {t('footer_rights')}</p>
      </footer>
    </div>
  );
}
