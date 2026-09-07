"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Job {
  id: string;
  job_number: string;
  problem: string;
  location: string;
  status: string;
  mechanic_id: string | null;
}

export default function ServiceJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [mechanics, setMechanics] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedProblem, setSelectedProblem] = useState<string>('');
  
  // New selections for dropdowns
  const [selectedCustomerIndex, setSelectedCustomerIndex] = useState<number | ''>('');
  const [selectedVehicleMakeModel, setSelectedVehicleMakeModel] = useState<string>('');

  const commonProblems = [
    'Engine won\'t start',
    'Flat tire / Tire issue',
    'Battery dead / Electrical issue',
    'Brake problem',
    'Oil leak / Oil change needed',
    'Overheating / Cooling system',
    'Transmission issue',
    'Suspension / Steering problem',
    'Exhaust / Emission issue',
    'Body / Paint damage',
    'Towing request',
    'General inspection / Diagnosis',
    'Other (describe manually)'
  ];

  const [newJob, setNewJob] = useState({ 
    job_number: 'JOB-' + Math.floor(Math.random() * 10000), 
    problem: '', 
    location: '',
    mechanic_id: '',
    customer_name: '',
    customer_phone: '',
    vehicle: '',
    plate_number: ''
  });

  const [newSosJob, setNewSosJob] = useState<Job | null>(null);
  const [notifiedJobIds, setNotifiedJobIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchJobs();
    fetchMechanics();
    fetchCustomers();
    fetchVehicles();

    // Poll for new jobs every 5 seconds
    const interval = setInterval(async () => {
      const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (data) {
        setJobs(data);
        // Look for any unassigned SOS jobs that we haven't notified about yet
        const unassignedSos = data.find(j => j.status === 'PENDING_DISPATCH' && j.problem.startsWith('SOS:'));
        if (unassignedSos) {
          setNotifiedJobIds(prev => {
            if (!prev.has(unassignedSos.id)) {
              setNewSosJob(unassignedSos);
              const newSet = new Set(prev);
              newSet.add(unassignedSos.id);
              return newSet;
            }
            return prev;
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  async function fetchCustomers() {
    const { data } = await supabase.from('customers').select('*');
    if (data) setCustomers(data);
  }

  async function fetchVehicles() {
    const { data } = await supabase.from('vehicles').select('*');
    if (data) setVehicles(data);
  }

  async function fetchJobs() {
    setLoading(true);
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (data) setJobs(data);
    setLoading(false);
  }

  async function fetchMechanics() {
    const { data } = await supabase.from('mechanics').select('*');
    if (data) setMechanics(data);
  }

  async function createJob(e: React.FormEvent) {
    e.preventDefault();
    if (!newJob.problem && !newJob.customer_name) {
      alert("Please enter a problem description or select a customer vehicle.");
      return;
    }
    if (!newJob.location) {
      alert("Please enter a location.");
      return;
    }
    
    const finalProblem = newJob.customer_name 
      ? `Manual Request: ${newJob.problem} | Vehicle: ${newJob.vehicle} ${newJob.plate_number ? `(${newJob.plate_number})` : ''} | From: ${newJob.customer_name} (${newJob.customer_phone})` 
      : newJob.problem;

    const { error } = await supabase.from('jobs').insert([
      { 
        job_number: newJob.job_number,
        problem: finalProblem,
        location: newJob.location,
        mechanic_id: newJob.mechanic_id || null,
        status: 'PENDING_DISPATCH'
      }
    ]);
    
    if (!error) {
      setNewJob({ job_number: 'JOB-' + Math.floor(Math.random() * 10000), problem: '', location: '', mechanic_id: '', customer_name: '', customer_phone: '', vehicle: '', plate_number: '' });
      setSelectedCustomerIndex('');
      setSelectedVehicleMakeModel('');
      fetchJobs();
    } else {
      alert("Error creating job: " + error.message);
    }
  }

  async function assignMechanicToJob(jobId: string, mechanicId: string) {
    if (!mechanicId) return;
    const { error } = await supabase.from('jobs').update({ mechanic_id: mechanicId, status: 'ASSIGNED' }).eq('id', jobId);
    if (!error) {
      fetchJobs();
    } else {
      alert("Error assigning mechanic: " + error.message);
    }
  }

  async function updateJobStatus(jobId: string, newStatus: string) {
    const { error } = await supabase.from('jobs').update({ status: newStatus }).eq('id', jobId);
    if (!error) {
      fetchJobs();
    } else {
      alert("Error updating status: " + error.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Service Jobs & Dispatch</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>Create New Service Job</h3>
        <form onSubmit={createJob} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <input 
              type="text" 
              placeholder="Job Number" 
              readOnly
              value={newJob.job_number}
              style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--surface-hover)' }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {newJob.problem.startsWith('SOS:') ? (
                <div style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--danger-color)', background: 'rgba(239,68,68,0.05)', color: 'var(--danger-color)', fontWeight: 600 }}>
                  🚨 {newJob.problem}
                </div>
              ) : (
                <>
                  <select
                    value={selectedProblem}
                    onChange={e => {
                      setSelectedProblem(e.target.value);
                      if (e.target.value !== 'Other (describe manually)') {
                        setNewJob({...newJob, problem: e.target.value});
                      } else {
                        setNewJob({...newJob, problem: ''});
                      }
                    }}
                    style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%' }}
                  >
                    <option value="">-- Select a Problem --</option>
                    {commonProblems.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                  {selectedProblem === 'Other (describe manually)' && (
                    <input 
                      type="text" 
                      placeholder="Describe the problem manually..." 
                      required 
                      value={newJob.problem}
                      onChange={e => setNewJob({...newJob, problem: e.target.value})}
                      style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Customer & Vehicle Link */}
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select
              value={selectedCustomerIndex}
              onChange={e => {
                const idx = e.target.value === '' ? '' : Number(e.target.value);
                setSelectedCustomerIndex(idx);
                if (idx !== '') {
                  const cust = customers[idx];
                  setNewJob({...newJob, customer_name: cust.name, customer_phone: cust.phone, vehicle: ''});
                  setSelectedVehicleMakeModel('');
                } else {
                  setNewJob({ job_number: newJob.job_number, problem: '', location: '', mechanic_id: '', customer_name: '', customer_phone: '', vehicle: '', plate_number: '' });
                  setSelectedVehicleMakeModel('');
                }
              }}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="">-- Select Registered Customer --</option>
              {customers.map((c, i) => (
                <option key={c.id} value={i}>{c.name} ({c.phone})</option>
              ))}
            </select>

            <select
              value={selectedVehicleMakeModel}
              onChange={e => {
                setSelectedVehicleMakeModel(e.target.value);
                setNewJob({...newJob, vehicle: e.target.value});
              }}
              disabled={selectedCustomerIndex === ''}
              style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            >
              <option value="">-- Select Customer Vehicle --</option>
              {selectedCustomerIndex !== '' && vehicles
                .map(v => (
                  <option key={v.id} value={`${v.make} ${v.model}`}>
                    {v.make} {v.model}
                  </option>
              ))}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <input 
              type="text" placeholder="License Plate Number (Required)" required 
              value={newJob.plate_number} onChange={e => setNewJob({...newJob, plate_number: e.target.value})}
              style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>Location / Address</label>
            <input 
              type="text" placeholder="e.g. Bole Medhanialem, next to Edna Mall" required 
              value={newJob.location} onChange={e => setNewJob({...newJob, location: e.target.value})}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
             <div style={{ flex: 1 }}>
               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Assign Mechanic</label>
               <select 
                  value={newJob.mechanic_id}
                  onChange={e => setNewJob({...newJob, mechanic_id: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
               >
                 <option value="">-- Do not assign yet --</option>
                 {mechanics.map(m => (
                   <option key={m.id} value={m.id}>{m.name} ({m.skill}) - {m.status}</option>
                 ))}
               </select>
             </div>
             <button type="submit" className="btn-primary" style={{ height: 'max-content' }}>Assign Job</button>
          </div>
        </form>
      </div>

      <div className="card">
        <h3>Active Jobs</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Job #</th>
                <th style={{ padding: '0.75rem' }}>Problem</th>
                <th style={{ padding: '0.75rem' }}>Location</th>
                <th style={{ padding: '0.75rem' }}>Mechanic</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(j => (
                <tr key={j.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                    {j.job_number.startsWith('MNT-') ? <span style={{ color: 'var(--accent-color)' }}>📅 {j.job_number}</span> : j.job_number}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {j.problem.startsWith('Scheduled for') ? (
                      <div style={{ background: 'var(--surface-hover)', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--accent-color)' }}>
                        <strong>{j.problem.split('|')[0]}</strong><br/>
                        <span style={{ fontSize: '0.875rem' }}>{j.problem.split('|').slice(1).join('|')}</span>
                      </div>
                    ) : (
                      j.problem
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.location)}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary-color)', textDecoration: 'underline' }}
                    >
                      📍 {j.location}
                    </a>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    {j.status === 'PENDING_DISPATCH' ? (
                      <select 
                        onChange={(e) => assignMechanicToJob(j.id, e.target.value)}
                        style={{ padding: '0.25rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        defaultValue=""
                      >
                        <option value="" disabled>Select Mechanic...</option>
                        {mechanics.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.skill})</option>
                        ))}
                      </select>
                    ) : (
                      mechanics.find(m => m.id === j.mechanic_id)?.name || 'Unassigned'
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '999px', 
                        fontSize: '0.875rem',
                        background: j.status === 'COMPLETED' ? 'var(--accent-color)' : 'var(--primary-color)',
                        color: 'white'
                      }}>
                        {j.status}
                      </span>
                      {j.status === 'ASSIGNED' && (
                        <button 
                          onClick={() => updateJobStatus(j.id, 'COMPLETED')}
                          style={{ padding: '0.25rem 0.5rem', background: '#10b981', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                        >
                          Complete ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* SOS Popup Modal */}
      {newSosJob && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', padding: '2rem', textAlign: 'center', border: '2px solid var(--danger-color)', animation: 'pulse 2s infinite' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚨</div>
            <h2 style={{ color: 'var(--danger-color)', marginBottom: '0.5rem' }}>NEW SOS REQUEST!</h2>
            <p style={{ color: 'var(--text-main)', fontSize: '1.2rem', marginBottom: '1rem', fontWeight: 'bold' }}>{newSosJob.problem.split('|')[0]}</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              {newSosJob.problem.split('|').slice(1).join('|')} <br/>
              📍 Location: 
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(newSosJob.location)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)', textDecoration: 'underline', marginLeft: '0.5rem' }}
              >
                {newSosJob.location} (Open Map)
              </a>
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select 
                onChange={(e) => {
                  assignMechanicToJob(newSosJob.id, e.target.value);
                  setNewSosJob(null);
                }}
                style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--border-color)', width: '100%', fontSize: '1.1rem' }}
                defaultValue=""
              >
                <option value="" disabled>-- Assign Mechanic Immediately --</option>
                {mechanics.map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.skill})</option>
                ))}
              </select>
              
              <button 
                onClick={() => setNewSosJob(null)} 
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', textDecoration: 'underline', cursor: 'pointer', marginTop: '1rem' }}
              >
                Dismiss for now (Assign later)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
