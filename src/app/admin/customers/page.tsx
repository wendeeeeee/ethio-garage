"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Eye } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
    if (data) setCustomers(data);
    setLoading(false);
  }

  async function addCustomer(e: React.FormEvent) {
    e.preventDefault();
    if (newCustomer.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }
    const { error } = await supabase.from('customers').insert([newCustomer]);
    if (!error) {
      setNewCustomer({ name: '', phone: '' });
      fetchCustomers();
    } else {
      alert("Error adding customer");
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Customers Management</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Register New Customer</h3>
        <form onSubmit={addCustomer} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" 
            placeholder="Full Name" 
            required 
            value={newCustomer.name}
            onChange={e => setNewCustomer({...newCustomer, name: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <div>
            <input 
              type="tel" 
              placeholder="Phone Number (10 digits)" 
              required 
              maxLength={10}
              value={newCustomer.phone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '');
                setNewCustomer({...newCustomer, phone: val});
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
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Plus size={16} /> Register
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Customer Database</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Name</th>
                <th style={{ padding: '0.75rem' }}>Phone</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{c.name}</td>
                  <td style={{ padding: '0.75rem' }}>{c.phone}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.25rem',
                      padding: '0.25rem 0.5rem', 
                      background: 'var(--surface-hover)', 
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      color: 'var(--text-main)'
                    }}>
                      <Eye size={14} /> View Vehicles
                    </button>
                  </td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No customers found.
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
