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
  created_at: string;
}

export default function MaterialRequestsAdminPage() {
  const [requests, setRequests] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    setLoading(true);
    // Fetch only material requests (job_number starts with MAT-)
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .like('job_number', 'MAT-%')
      .order('created_at', { ascending: false });

    if (data) {
      setRequests(data);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', id);
      
    if (!error) {
      fetchRequests();
    } else {
      alert("Error updating status: " + error.message);
    }
  }

  async function deleteRequest(id: string) {
    if (confirm("Are you sure you want to delete this request?")) {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', id);
        
      if (!error) {
        fetchRequests();
      } else {
        alert("Error deleting request: " + error.message);
      }
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1>Material Requests</h1>
        <button onClick={fetchRequests} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>
          Refresh List
        </button>
      </div>

      <div className="card">
        {loading ? <p>Loading requests...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--surface-hover)' }}>
                  <th style={{ padding: '1rem' }}>Request #</th>
                  <th style={{ padding: '1rem' }}>Details</th>
                  <th style={{ padding: '1rem' }}>Date</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map(req => {
                  // Parse the problem string which is format:
                  // "Material Request: [PartName] | Brand: [Brand] | Vehicle: [Vehicle] | From: [Name] ([Phone])"
                  const detailsParts = req.problem.replace('Material Request: ', '').split(' | ');
                  
                  return (
                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                        {req.job_number}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {detailsParts.map((part, index) => (
                            <span key={index} style={{ fontSize: index === 0 ? '1rem' : '0.85rem', fontWeight: index === 0 ? 'bold' : 'normal', color: index === 0 ? 'var(--text-main)' : 'var(--text-muted)' }}>
                              {part}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.35rem 0.75rem', 
                          borderRadius: '999px', 
                          fontSize: '0.85rem',
                          fontWeight: 'bold',
                          backgroundColor: req.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 
                                          req.status === 'PENDING_DISPATCH' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                          color: req.status === 'COMPLETED' ? '#10b981' : 
                                req.status === 'PENDING_DISPATCH' ? 'var(--danger-color)' : 'var(--primary-color)'
                        }}>
                          {req.status === 'PENDING_DISPATCH' ? 'NEW REQUEST' : req.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          {req.status !== 'COMPLETED' && (
                            <button 
                              onClick={() => updateStatus(req.id, 'COMPLETED')}
                              style={{ padding: '0.4rem 0.8rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                            >
                              Mark Fulfilled
                            </button>
                          )}
                          <button 
                            onClick={() => deleteRequest(req.id)}
                            style={{ padding: '0.4rem 0.8rem', background: 'transparent', color: 'var(--danger-color)', border: '1px solid var(--danger-color)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No material requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
