"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Pencil, Trash2 } from 'lucide-react';

interface SparePart {
  id: string;
  name: string;
  part_number: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  minimum_stock: number;
}

export default function SparePartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPartId, setEditingPartId] = useState<string | null>(null);
  
  const [newPart, setNewPart] = useState({ 
    name: '', 
    part_number: '', 
    brand: '',
    category: 'Other',
    price: '',
    stock: '',
    minimum_stock: '5'
  });

  useEffect(() => {
    fetchParts();
  }, []);

  async function fetchParts() {
    setLoading(true);
    const { data } = await supabase.from('spare_parts').select('*').order('name', { ascending: true });
    if (data) setParts(data);
    setLoading(false);
  }

  async function submitPart(e: React.FormEvent) {
    e.preventDefault();
    
    const partData = {
      name: newPart.name,
      part_number: newPart.part_number,
      brand: newPart.brand,
      category: newPart.category,
      price: parseFloat(newPart.price),
      stock: parseInt(newPart.stock, 10),
      minimum_stock: parseInt(newPart.minimum_stock, 10),
    };

    if (editingPartId) {
      // Update mode
      const { error } = await supabase.from('spare_parts').update(partData).eq('id', editingPartId);
      if (!error) {
        resetForm();
        fetchParts();
      } else {
        alert("Error updating spare part: " + error.message);
      }
    } else {
      // Add mode
      const { error } = await supabase.from('spare_parts').insert([partData]);
      if (!error) {
        resetForm();
        fetchParts();
      } else {
        alert("Error adding spare part: " + error.message);
      }
    }
  }

  function resetForm() {
    setEditingPartId(null);
    setNewPart({ name: '', part_number: '', brand: '', category: 'Other', price: '', stock: '', minimum_stock: '5' });
  }

  function startEditing(part: SparePart) {
    setEditingPartId(part.id);
    setNewPart({
      name: part.name,
      part_number: part.part_number,
      brand: part.brand,
      category: part.category,
      price: part.price.toString(),
      stock: part.stock.toString(),
      minimum_stock: part.minimum_stock.toString()
    });
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function deletePart(id: string) {
    if (confirm("Are you sure you want to delete this part from inventory?")) {
      const { error } = await supabase.from('spare_parts').delete().eq('id', id);
      if (!error) fetchParts();
      else alert("Error deleting part: " + error.message);
    }
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Spare Parts & Inventory</h1>

      <div className="card" style={{ marginBottom: '2rem', border: editingPartId ? '2px solid var(--primary-color)' : undefined }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ color: editingPartId ? 'var(--primary-color)' : 'inherit' }}>
            {editingPartId ? 'Edit Spare Part' : 'Add New Spare Part'}
          </h3>
          {editingPartId && (
            <button onClick={resetForm} style={{ padding: '0.25rem 0.5rem', background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}>
              Cancel Edit
            </button>
          )}
        </div>
        
        <form onSubmit={submitPart} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <input 
            type="text" placeholder="Part Name (e.g., Brake Pads)" required 
            value={newPart.name} onChange={e => setNewPart({...newPart, name: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <input 
            type="text" placeholder="Part Number (SKU)" required 
            value={newPart.part_number} onChange={e => setNewPart({...newPart, part_number: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <input 
            type="text" placeholder="Brand (e.g., Bosch, Toyota)" required 
            value={newPart.brand} onChange={e => setNewPart({...newPart, brand: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <select 
            value={newPart.category} onChange={e => setNewPart({...newPart, category: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          >
            <option value="Oil">Oil</option>
            <option value="Brake">Brake</option>
            <option value="Filter">Filter</option>
            <option value="Battery">Battery</option>
            <option value="Tire">Tire</option>
            <option value="Electrical">Electrical</option>
            <option value="Engine">Engine</option>
            <option value="Body">Body</option>
            <option value="Other">Other</option>
          </select>
          <input 
            type="number" step="0.01" placeholder="Price (ETB)" required 
            value={newPart.price} onChange={e => setNewPart({...newPart, price: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <input 
            type="number" placeholder="Current Stock Quantity" required 
            value={newPart.stock} onChange={e => setNewPart({...newPart, stock: e.target.value})}
            style={{ padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
          />
          <button type="submit" className="btn-primary" style={{ height: '100%' }}>
            {editingPartId ? 'Save Changes' : 'Add to Inventory'}
          </button>
        </form>
      </div>

      <div className="card">
        <h3>Inventory List</h3>
        {loading ? <p>Loading...</p> : (
          <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem' }}>Part Name</th>
                <th style={{ padding: '0.75rem' }}>Category</th>
                <th style={{ padding: '0.75rem' }}>SKU / Brand</th>
                <th style={{ padding: '0.75rem' }}>Price (ETB)</th>
                <th style={{ padding: '0.75rem' }}>Stock Status</th>
                <th style={{ padding: '0.75rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parts.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)', background: editingPartId === p.id ? 'var(--surface-hover)' : 'transparent' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.5rem', borderRadius: '999px', fontSize: '0.8rem', background: 'var(--surface-hover)', border: '1px solid var(--border-color)' }}>
                      {p.category || 'Other'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ fontSize: '0.875rem' }}>{p.part_number}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                  </td>
                  <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.price.toFixed(2)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '999px', 
                      fontSize: '0.875rem',
                      background: p.stock <= p.minimum_stock ? 'var(--danger-color)' : 'var(--accent-color)',
                      color: 'white'
                    }}>
                      {p.stock} in stock
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                       <button onClick={() => startEditing(p)} className="btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <Pencil size={14} /> Edit
                       </button>
                       <button onClick={() => deletePart(p.id)} style={{ padding: '0.4rem 0.8rem', background: 'var(--danger-color)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <Trash2 size={14} /> Delete
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {parts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Your inventory is empty. Add a spare part above.
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
