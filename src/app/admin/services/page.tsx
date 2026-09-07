"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../admin.module.css';

interface Service {
  id: string;
  icon: string;
  title_en: string;
  title_am: string;
  desc_en: string;
  desc_am: string;
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newService, setNewService] = useState({ 
    icon: '🔧', 
    title_en: '', 
    title_am: '', 
    desc_en: '', 
    desc_am: '' 
  });

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    setLoading(true);
    const { data } = await supabase.from('services').select('*').order('created_at', { ascending: true });
    if (data) setServices(data);
    setLoading(false);
  }

  async function addService(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('services').insert([newService]);
    if (!error) {
      setNewService({ icon: '🔧', title_en: '', title_am: '', desc_en: '', desc_am: '' });
      fetchServices();
    } else {
      alert("Error adding service: " + error.message);
    }
  }

  async function deleteService(id: string) {
    if (confirm("Are you sure you want to remove this service?")) {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (!error) fetchServices();
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Dynamic Services Management</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Services added here will instantly appear on the public Services page, complete with English and Amharic translations.
      </p>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Service</h3>
        <form onSubmit={addService} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Service Icon (Emoji)</label>
            <input 
              type="text" required 
              value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})}
              style={{ width: '100px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '1.5rem', textAlign: 'center' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Title (English)</label>
            <input 
              type="text" required 
              value={newService.title_en} onChange={e => setNewService({...newService, title_en: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Title (Amharic)</label>
            <input 
              type="text" required 
              value={newService.title_am} onChange={e => setNewService({...newService, title_am: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Description (English)</label>
            <textarea 
              required rows={3}
              value={newService.desc_en} onChange={e => setNewService({...newService, desc_en: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.25rem', color: 'var(--text-muted)' }}>Description (Amharic)</label>
            <textarea 
              required rows={3}
              value={newService.desc_am} onChange={e => setNewService({...newService, desc_am: e.target.value})}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', resize: 'vertical' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }}>Add Service</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Active Services</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem', width: '60px' }}>Icon</th>
                <th style={{ padding: '0.75rem' }}>English Content</th>
                <th style={{ padding: '0.75rem' }}>Amharic Content</th>
                <th style={{ padding: '0.75rem', width: '100px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontSize: '2rem' }}>{s.icon}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{s.title_en}</strong><br/>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.desc_en}</span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <strong>{s.title_am}</strong><br/>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{s.desc_am}</span>
                  </td>
                  <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                     <button onClick={() => deleteService(s.id)} style={{ padding: '0.25rem 0.5rem', background: 'var(--danger-color)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>
                       Delete
                     </button>
                  </td>
                </tr>
              ))}
              {services.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No services found. Add one above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
