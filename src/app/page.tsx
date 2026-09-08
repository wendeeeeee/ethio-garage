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
  const [emergencyPhoneError, setEmergencyPhoneError] = useState('');
  const [emergencyVehicle, setEmergencyVehicle] = useState('');
  const [emergencyProblem, setEmergencyProblem] = useState('');
  const [emergencyLocation, setEmergencyLocation] = useState('');
  const [emergencyPhoto, setEmergencyPhoto] = useState<File | null>(null);
  const [emergencyPhotoPreview, setEmergencyPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Tracking State
  const [trackingJobId, setTrackingJobId] = useState<string | null>(null);
  const [trackingJobNumber, setTrackingJobNumber] = useState<string | null>(null);
  const [assignedMechanic, setAssignedMechanic] = useState<any>(null);
  const [manualToken, setManualToken] = useState('');
  const [activeTab, setActiveTab] = useState<'request' | 'track'>('request');

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
      alert(t('invalid_token'));
    }
  };

  const handleEmergencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (emergencyPhone.length !== 10) {
      setEmergencyPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    
    setIsRequesting(true);

    const jobNum = 'EMG-' + Math.floor(Math.random() * 10000);

    let photoUrl = '';
    if (emergencyPhoto) {
      setUploadingPhoto(true);
      
      // Convert to Base64 to bypass Supabase Storage bucket requirements
      photoUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(emergencyPhoto);
      });
      
      setUploadingPhoto(false);
    }

    const problemStr = `SOS: ${emergencyProblem} | Vehicle: ${emergencyVehicle} | From: ${emergencyName} (${emergencyPhone})${photoUrl ? ' | Photo: ' + photoUrl : ''}`;

    const { data, error } = await supabase.from('jobs').insert([{
      job_number: jobNum,
      problem: problemStr,
      location: emergencyLocation,
      status: 'PENDING_DISPATCH'
    }]).select();

    if (!error && data && data.length > 0) {
      setTrackingJobId(data[0].id);
      setTrackingJobNumber(jobNum);
      localStorage.setItem('trackingJobId', data[0].id);
      localStorage.setItem('trackingJobNumber', jobNum);
    } else {
      alert(t('request_failed'));
    }
    setIsRequesting(false);
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
                  
                  {/* Tabs */}
                  <div style={{ display: 'flex', background: 'var(--surface-color)', padding: '0.5rem', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => setActiveTab('request')}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: activeTab === 'request' ? 'var(--surface-hover)' : 'transparent', color: activeTab === 'request' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'request' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      🚨 {t('request_rescue_tab')}
                    </button>
                    <button 
                      onClick={() => setActiveTab('track')}
                      style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', background: activeTab === 'track' ? 'var(--surface-hover)' : 'transparent', color: activeTab === 'track' ? 'var(--primary-color)' : 'var(--text-muted)', fontWeight: activeTab === 'track' ? 'bold' : 'normal', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      📍 {t('track_job_tab')}
                    </button>
                  </div>

                  {activeTab === 'request' && (
                    <div className="card glass" style={{ padding: '2rem', textAlign: 'left', border: '1px solid rgba(239, 68, 68, 0.3)', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ background: 'var(--danger-color)', color: 'white', padding: '0.5rem', borderRadius: '50%', display: 'flex' }}>🚨</div>
                        <h3 style={{ margin: 0, color: 'var(--danger-color)' }}>{t('rescue_form_title')}</h3>
                      </div>
                      <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>{t('rescue_form_desc')}</p>
                      <form onSubmit={handleEmergencySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input 
                          type="text" placeholder={t('name_placeholder')} required 
                          value={emergencyName} onChange={e => setEmergencyName(e.target.value)}
                          style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                        />
                        <div>
                          <input 
                            type="tel" placeholder={t('phone_placeholder')} required 
                            maxLength={10}
                            value={emergencyPhone} 
                            onChange={e => {
                              const val = e.target.value.replace(/\D/g, '');
                              setEmergencyPhone(val);
                              if (val.length > 0 && val.length !== 10) {
                                setEmergencyPhoneError('Phone number must be exactly 10 digits');
                              } else {
                                setEmergencyPhoneError('');
                              }
                            }}
                            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: `1px solid ${emergencyPhoneError ? 'var(--danger-color)' : 'var(--border-color)'}`, background: 'var(--surface-color)', outline: 'none' }}
                          />
                          {emergencyPhoneError && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block', textAlign: 'left' }}>{emergencyPhoneError}</span>}
                        </div>
                        <input 
                          type="text" placeholder={t('vehicle_placeholder')} required 
                          value={emergencyVehicle} onChange={e => setEmergencyVehicle(e.target.value)}
                          style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)' }}
                        />
                        <input 
                          type="text" placeholder={t('location_placeholder')} required 
                          value={emergencyLocation} onChange={e => setEmergencyLocation(e.target.value)}
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

                        {/* Photo Upload */}
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '1rem', textAlign: 'center', background: 'var(--surface-hover)' }}>
                          <label style={{ cursor: 'pointer', display: 'block' }}>
                            {emergencyPhotoPreview ? (
                              <div style={{ position: 'relative' }}>
                                <img src={emergencyPhotoPreview} alt="Preview" style={{ maxHeight: '120px', borderRadius: '8px', objectFit: 'cover' }} />
                                <p style={{ margin: '0.5rem 0 0', color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.85rem' }}>{t('photo_attached')}</p>
                                <button type="button" onClick={(ev) => { ev.preventDefault(); setEmergencyPhoto(null); setEmergencyPhotoPreview(null); }} style={{ position: 'absolute', top: '4px', right: '4px', background: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.7rem' }}>✕</button>
                              </div>
                            ) : (
                              <>
                                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>📷</div>
                                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)' }}>{t('upload_photo_rescue')}</p>
                                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('photo_optional')}</p>
                              </>
                            )}
                            <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { const file = e.target.files?.[0]; if (file) { setEmergencyPhoto(file); setEmergencyPhotoPreview(URL.createObjectURL(file)); } }} />
                          </label>
                        </div>

                        <button type="submit" className="btn-primary" disabled={isRequesting || uploadingPhoto} style={{ background: 'var(--danger-color)', width: '100%', padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                          {uploadingPhoto ? t('uploading_photo') : isRequesting ? t('sending') : t('request_rescue_btn')}
                        </button>
                      </form>
                    </div>
                  )}
                  
                  {activeTab === 'track' && (
                    <div className="card glass" style={{ padding: '2.5rem 2rem', textAlign: 'center', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                      <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary-color)' }}>{t('track_your_job')}</h3>
                      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{t('track_job_desc')}</p>
                      
                      <form onSubmit={handleTrackExisting} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input 
                          type="text" placeholder={t('track_job_placeholder')} required 
                          value={manualToken} onChange={e => setManualToken(e.target.value)}
                          style={{ padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--surface-color)', fontSize: '1.1rem', textAlign: 'center', letterSpacing: '1px' }}
                        />
                        <button type="submit" className="btn-primary" style={{ padding: '1rem', borderRadius: '8px', fontWeight: 'bold' }}>
                          {t('track_job_btn')}
                        </button>
                      </form>
                    </div>
                  )}
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

            <Link href="/request-part" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="card glass" style={{ padding: '3rem 2rem', textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', border: '1px solid var(--accent-color)' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{t('request_material')}</h3>
                <p style={{ color: 'var(--text-muted)' }}>{t('request_material_desc')}</p>
                <div style={{ marginTop: '1.5rem', color: 'var(--accent-color)', fontWeight: 'bold' }}>{t('request_btn')} &rarr;</div>
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
