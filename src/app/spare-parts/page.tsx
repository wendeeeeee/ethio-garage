"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { Package, Droplet, Disc, Filter, Battery, Circle, Zap, Settings, Car, ClipboardList } from 'lucide-react';

const CATEGORIES = [
  { key: 'All', icon: <Package size={16} strokeWidth={2.5} />, en: 'All Categories', am: 'ሁሉም' },
  { key: 'Oil', icon: <Droplet size={16} strokeWidth={2.5} />, en: 'Oil', am: 'ዘይት' },
  { key: 'Brake', icon: <Disc size={16} strokeWidth={2.5} />, en: 'Brake', am: 'ፍሬን' },
  { key: 'Filter', icon: <Filter size={16} strokeWidth={2.5} />, en: 'Filter', am: 'ፊልተር' },
  { key: 'Battery', icon: <Battery size={16} strokeWidth={2.5} />, en: 'Battery', am: 'ባትሪ' },
  { key: 'Tire', icon: <Circle size={16} strokeWidth={2.5} />, en: 'Tire', am: 'ጎማ' },
  { key: 'Electrical', icon: <Zap size={16} strokeWidth={2.5} />, en: 'Electrical', am: 'ኤሌክትሪክ' },
  { key: 'Engine', icon: <Settings size={16} strokeWidth={2.5} />, en: 'Engine', am: 'ሞተር' },
  { key: 'Body', icon: <Car size={16} strokeWidth={2.5} />, en: 'Body', am: 'ገላ' },
  { key: 'Other', icon: <ClipboardList size={16} strokeWidth={2.5} />, en: 'Other', am: 'ሌላ' },
];

export default function SparePartsPage() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [parts, setParts] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  

  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchParts();
  }, [selectedCategory, page]);

  const fetchParts = async () => {
    setIsSearching(true);
    let query = supabase.from('spare_parts').select('*', { count: 'exact' }).order('name');
    
    if (selectedCategory !== 'All') {
      query = query.eq('category', selectedCategory);
    }
    if (searchQuery.length >= 2) {
      query = query.or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%`);
    }
    
    // Pagination range
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    
    const { data, count } = await query.range(from, to);
    if (data) setParts(data);
    if (count !== null) setTotalCount(count);
    
    setIsSearching(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    fetchParts();
  };

  const totalPages = Math.ceil(totalCount / pageSize);



  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      <main style={{ flex: 1, backgroundColor: 'var(--surface-hover)', padding: '4rem 5%' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3.5rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            {t('genuine_parts')}
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {t('genuine_parts_desc')}
          </p>

          {/* Search Bar & Category Dropdown */}
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', maxWidth: '700px', margin: '0 auto 2rem', display: 'flex', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderRadius: '999px' }}>
            
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              style={{
                padding: '1.1rem 1.5rem',
                fontSize: '1rem',
                border: '2px solid var(--primary-color)',
                borderRight: 'none',
                borderRadius: '999px 0 0 999px',
                outline: 'none',
                background: 'var(--surface-color)',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--text-main)',
                width: '30%',
                appearance: 'none' // Remove default arrow in some browsers for cleaner look (optional)
              }}
            >
              {CATEGORIES.map(cat => (
                <option key={cat.key} value={cat.key}>
                   {language === 'am' ? cat.am : cat.en}
                </option>
              ))}
            </select>
            
            <input 
              type="text" 
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ 
                width: '50%', 
                padding: '1.1rem 1rem', 
                fontSize: '1.05rem', 
                borderTop: '2px solid var(--primary-color)',
                borderBottom: '2px solid var(--primary-color)',
                borderLeft: '1px solid var(--border-color)',
                borderRight: 'none',
                outline: 'none', 
                background: 'var(--surface-color)' 
              }}
            />
            
            <button type="submit" className="btn-primary" style={{ width: '20%', padding: '0', borderRadius: '0 999px 999px 0', fontSize: '1.05rem', fontWeight: 'bold' }}>
              {t('search_btn')}
            </button>
          </form>

          {/* Results Area */}
          {isSearching ? (
            <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading...</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px', margin: '0 auto' }}>
                {parts.map(part => (
                  <div key={part.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', textAlign: 'left', borderRadius: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{part.name}</h4>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, background: 'var(--surface-hover)', border: '1px solid var(--border-color)', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          {CATEGORIES.find(c => c.key === part.category)?.icon} {part.category || 'Other'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <span>Brand: <strong style={{ color: 'var(--text-main)' }}>{part.brand}</strong></span>
                        <span>SKU: {part.part_number}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>{part.price.toFixed(2)} ETB</div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: part.stock > 0 ? 'var(--accent-color)' : 'var(--danger-color)', marginTop: '0.25rem' }}>
                        {part.stock > 0 ? `✓ ${part.stock} ${t('in_stock')}` : `✗ ${t('out_of_stock')}`}
                      </div>
                    </div>
                  </div>
                ))}
                
                {parts.length === 0 && (searchQuery.length >= 2 || selectedCategory !== 'All') && (
                  <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                      {t('no_parts_found')} {searchQuery ? `"${searchQuery}"` : selectedCategory}.
                    </p>
                    <Link href="/request-part">
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.75rem 2rem', borderRadius: '999px', fontSize: '1rem' }}
                      >
                        {t('request_material')}
                      </button>
                    </Link>
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '3rem' }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    style={{ 
                      padding: '0.5rem 1rem', borderRadius: '8px', 
                      background: page === 1 ? 'var(--surface-color)' : 'var(--primary-color)', 
                      color: page === 1 ? 'var(--text-muted)' : 'white',
                      border: '1px solid var(--border-color)', cursor: page === 1 ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    &larr; Prev
                  </button>
                  
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                    Page {page} of {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    style={{ 
                      padding: '0.5rem 1rem', borderRadius: '8px', 
                      background: page === totalPages ? 'var(--surface-color)' : 'var(--primary-color)', 
                      color: page === totalPages ? 'var(--text-muted)' : 'white',
                      border: '1px solid var(--border-color)', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    Next &rarr;
                  </button>
                </div>
              )}
            </>
          )}
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
