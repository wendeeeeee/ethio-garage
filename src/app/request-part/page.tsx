"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';

export default function RequestPartPage() {
  const { t } = useLanguage();
  const [isRequesting, setIsRequesting] = useState(false);
  const [reqPartName, setReqPartName] = useState('');
  const [reqBrand, setReqBrand] = useState('');
  const [reqVehicle, setReqVehicle] = useState('');
  const [reqName, setReqName] = useState('');
  const [reqPhone, setReqPhone] = useState('');
  const [partPhoto, setPartPhoto] = useState<File | null>(null);
  const [partPhotoPreview, setPartPhotoPreview] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handleMaterialRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequesting(true);

    const jobNum = 'MAT-' + Math.floor(Math.random() * 10000);

    let photoUrl = '';
    if (partPhoto) {
      setUploadingPhoto(true);
      
      // Convert to Base64 to bypass Supabase Storage bucket requirements
      photoUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(partPhoto);
      });
      
      setUploadingPhoto(false);
    }

    const problemStr = `Material Request: ${reqPartName} | Brand: ${reqBrand || 'Any'} | Vehicle: ${reqVehicle} | From: ${reqName} (${reqPhone})${photoUrl ? ' | Photo: ' + photoUrl : ''}`;

    const { error } = await supabase.from('jobs').insert([{
      job_number: jobNum,
      problem: problemStr,
      location: 'Store / Delivery',
      status: 'PENDING_DISPATCH'
    }]);

    if (!error) {
      alert(t('request_success'));
      setReqPartName('');
      setReqBrand('');
      setReqVehicle('');
      setReqName('');
      setReqPhone('');
      setPartPhoto(null);
      setPartPhotoPreview(null);
    } else {
      alert(t('request_fail'));
    }
    setIsRequesting(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, backgroundColor: 'var(--surface-hover)', padding: '4rem 5%' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', marginBottom: '1rem', letterSpacing: '-0.02em' }}>{t('request_material')}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '3rem' }}>{t('request_material_desc')}</p>
          
          <div className="card" style={{ padding: '2.5rem', textAlign: 'left', border: '1px solid var(--accent-color)' }}>
            <form onSubmit={handleMaterialRequest} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('part_name_placeholder')}</label>
                <input 
                  type="text" placeholder={t('part_name_placeholder')} required 
                  value={reqPartName} onChange={e => setReqPartName(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('brand_preference')}</label>
                <input 
                  type="text" placeholder={t('brand_preference')} 
                  value={reqBrand} onChange={e => setReqBrand(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('vehicle_placeholder')}</label>
                <input 
                  type="text" placeholder={t('vehicle_placeholder')} required 
                  value={reqVehicle} onChange={e => setReqVehicle(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('name_placeholder')}</label>
                <input 
                  type="text" placeholder={t('name_placeholder')} required 
                  value={reqName} onChange={e => setReqName(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('phone_placeholder')}</label>
                <input 
                  type="text" placeholder={t('phone_placeholder')} required 
                  value={reqPhone} onChange={e => setReqPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)' }}
                />
              </div>
              
              {/* Photo Upload */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>{t('upload_photo')}</label>
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', background: 'var(--surface-hover)', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    {partPhotoPreview ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={partPhotoPreview} alt="Preview" style={{ maxHeight: '150px', borderRadius: '8px', objectFit: 'cover' }} />
                        <p style={{ margin: '0.5rem 0 0', color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.9rem' }}>{t('photo_attached')}</p>
                        <button type="button" onClick={(ev) => { ev.preventDefault(); setPartPhoto(null); setPartPhotoPreview(null); }} style={{ position: 'absolute', top: '-8px', right: '-8px', background: 'var(--danger-color)', color: 'white', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-main)', fontSize: '1.05rem' }}>{t('upload_photo_part')}</p>
                        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{t('photo_optional')}</p>
                      </>
                    )}
                    <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={e => { const file = e.target.files?.[0]; if (file) { setPartPhoto(file); setPartPhotoPreview(URL.createObjectURL(file)); } }} />
                  </label>
                </div>
              </div>

              <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" disabled={isRequesting || uploadingPhoto} style={{ width: '100%', padding: '1rem', borderRadius: '8px', fontSize: '1.1rem' }}>
                  {uploadingPhoto ? t('uploading_photo') : isRequesting ? '...' : t('request_btn')}
                </button>
              </div>
            </form>
          </div>
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
