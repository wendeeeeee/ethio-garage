"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  created_at: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '' });

  useEffect(() => {
    fetchVehicles();
  }, []);

  async function fetchVehicles() {
    setLoading(true);
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (data) setVehicles(data);
    setLoading(false);
  }

  async function addVehicle(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.from('vehicles').insert([newVehicle]);
    if (!error) {
      setNewVehicle({ make: '', model: '' });
      fetchVehicles();
    } else {
      alert("Error adding vehicle: " + error.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Vehicles Management</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Register New Vehicle</h3>
        <form onSubmit={addVehicle} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Make (Brand)</label>
            <input 
              type="text" placeholder="e.g. Toyota" required 
              value={newVehicle.make} onChange={e => setNewVehicle({...newVehicle, make: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Model</label>
            <input 
              type="text" placeholder="e.g. Vitz" required 
              value={newVehicle.model} onChange={e => setNewVehicle({...newVehicle, model: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%' }}>+ Add Vehicle</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Registered Vehicles Database</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>Make</th>
                <th style={{ padding: '1rem' }}>Model</th>
                <th style={{ padding: '1rem' }}>Date Added</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map(v => (
                <tr key={v.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{v.make}</td>
                  <td style={{ padding: '0.75rem' }}>{v.model}</td>
                  <td style={{ padding: '0.75rem' }}>{new Date(v.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No vehicles registered yet.
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
