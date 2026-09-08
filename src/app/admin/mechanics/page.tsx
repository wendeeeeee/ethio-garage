"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import styles from '../admin.module.css';
import { Plus } from 'lucide-react';

interface Mechanic {
  id: string;
  name: string;
  phone: string;
  skill: string;
  status: string;
}

export default function MechanicsPage() {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMechanic, setNewMechanic] = useState({ name: '', phone: '', skill: '' });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    fetchMechanics();
  }, []);

  async function fetchMechanics() {
    setLoading(true);
    const { data, error } = await supabase.from('mechanics').select('*').order('created_at', { ascending: false });
    if (data) setMechanics(data);
    setLoading(false);
  }

  async function addMechanic(e: React.FormEvent) {
    e.preventDefault();
    if (newMechanic.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    const { error } = await supabase.from('mechanics').insert([newMechanic]);
    if (!error) {
      setNewMechanic({ name: '', phone: '', skill: '' });
      fetchMechanics();
    } else {
      alert("Error adding mechanic");
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Mechanics Management</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Add New Mechanic</h3>
        <form onSubmit={addMechanic} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Name" 
            required 
            value={newMechanic.name}
            onChange={e => setNewMechanic({...newMechanic, name: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <div>
            <input 
              type="tel" 
              placeholder="Phone Number (10 digits)" 
              required
              maxLength={10}
              value={newMechanic.phone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setNewMechanic({...newMechanic, phone: val});
                if (val.length > 0 && val.length !== 10) {
                  setPhoneError('Phone number must be exactly 10 digits');
                } else {
                  setPhoneError('');
                }
              }}
              style={{ padding: '0.5rem', borderRadius: '4px', border: `1px solid ${phoneError ? 'var(--danger-color)' : 'var(--border-color)'}`, outline: 'none' }}
            />
            {phoneError && <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block' }}>{phoneError}</span>}
          </div>
          <input 
            type="text" 
            placeholder="Skill (e.g., Electrician, Engine)" 
            required 
            value={newMechanic.skill}
            onChange={e => setNewMechanic({...newMechanic, skill: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Add
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Mechanic Directory</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem' }}>Skill</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {mechanics.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem' }}>{m.name}</td>
                  <td style={{ padding: '0.75rem' }}>{m.phone}</td>
                  <td style={{ padding: '0.75rem' }}>{m.skill}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem',
                      background: m.status === 'AVAILABLE' ? 'var(--accent-color)' : 'var(--danger-color)',
                      color: 'white'
                    }}>
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
              {mechanics.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No mechanics found. Add one above.
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
