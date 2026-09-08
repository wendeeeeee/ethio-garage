"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import { CarFront, Car, Fuel, Cog, Ruler, Palette, Phone } from 'lucide-react';

interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: string;
  fuel_type: string;
  transmission: string;
  color: string;
  description: string;
  image_url: string | null;
  contact_name: string;
  contact_phone: string;
  created_at: string;
}

export default function CarsForSalePage() {
  const { t } = useLanguage();
  const [cars, setCars] = useState<CarListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCars();
  }, []);

  async function fetchCars() {
    setLoading(true);
    const { data } = await supabase
      .from('cars_for_sale')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCars(data);
    setLoading(false);
  }

  const filteredCars = cars.filter(car => {
    const q = searchQuery.toLowerCase();
    return (
      car.make.toLowerCase().includes(q) ||
      car.model.toLowerCase().includes(q) ||
      car.year.toString().includes(q)
    );
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-ET').format(price);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        padding: '4rem 5% 3rem', textAlign: 'center',
        background: 'linear-gradient(to bottom, var(--surface-color), var(--bg-color))',
        borderBottom: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '400px', height: '400px', background: 'var(--accent-color)', filter: 'blur(150px)', opacity: 0.08, zIndex: 0 }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '400px', height: '400px', background: 'var(--primary-color)', filter: 'blur(150px)', opacity: 0.08, zIndex: 0 }}></div>

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '3.5rem', letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            <CarFront size={48} /> 
            <div>{t('cars_for_sale').split(' ')[0]} <span style={{ color: 'var(--primary-color)' }}>{t('cars_for_sale').split(' ').slice(1).join(' ')}</span></div>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            {t('cars_for_sale_subtitle')}
          </p>

          <div style={{ position: 'relative', maxWidth: '550px', margin: '0 auto' }}>
            <input
              type="text"
              placeholder={t('search_cars')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%', padding: '1.1rem 1.5rem', fontSize: '1.05rem',
                borderRadius: '999px', border: '2px solid var(--primary-color)',
                outline: 'none', boxShadow: 'var(--shadow-md)', background: 'var(--surface-color)'
              }}
            />
          </div>
        </div>
      </section>

      {/* Car Listings */}
      <section style={{ padding: '3rem 5%', flex: 1 }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 0' }}>Loading listings...</p>
        ) : filteredCars.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ color: 'var(--text-main)', marginBottom: '1rem' }}><Car size={64} /></div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>{t('bringing_new_cars')}</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {t('showing')} <strong style={{ color: 'var(--text-main)' }}>{filteredCars.length}</strong> {t('listings')}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredCars.map(car => (
                <div key={car.id} className="card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
                  {/* Car Image Header */}
                  <div style={{
                    height: '200px',
                    background: car.image_url ? 'var(--surface-hover)' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    position: 'relative', overflow: 'hidden'
                  }}>
                    {car.image_url ? (
                      <img src={car.image_url} alt={`${car.make} ${car.model}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ color: 'var(--bg-color)' }}><CarFront size={64} /></div>
                    )}
                    <div style={{
                      position: 'absolute', top: '0.75rem', right: '0.75rem',
                      background: 'rgba(0,0,0,0.4)', color: 'white',
                      padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem'
                    }}>
                      {timeAgo(car.created_at)}
                    </div>
                  </div>

                  {/* Car Info */}
                  <div style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <div>
                        <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{car.make} {car.model}</h3>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{car.year}</span>
                      </div>
                      <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-color)', whiteSpace: 'nowrap' }}>
                        {formatPrice(car.price)} ETB
                      </div>
                    </div>

                    {/* Tags */}
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                      {car.fuel_type && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Fuel size={14} /> {car.fuel_type}
                        </span>
                      )}
                      {car.transmission && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Cog size={14} /> {car.transmission}
                        </span>
                      )}
                      {car.mileage && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Ruler size={14} /> {car.mileage} km
                        </span>
                      )}
                      {car.color && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'var(--surface-hover)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          <Palette size={14} /> {car.color}
                        </span>
                      )}
                    </div>

                    {car.description && (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                        {car.description.length > 100 ? car.description.substring(0, 100) + '...' : car.description}
                      </p>
                    )}

                    {/* Contact */}
                    <div style={{
                      borderTop: '1px solid var(--border-color)', paddingTop: '1rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ fontSize: '0.875rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{t('contact_seller')} </span>
                        <strong>{car.contact_name}</strong>
                      </div>
                      <a href={`tel:${car.contact_phone}`} className="btn-primary" style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1.25rem', borderRadius: '999px', fontSize: '0.875rem'
                      }}>
                        <Phone size={16} /> Call
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer style={{ padding: '3rem 5%', textAlign: 'center', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--surface-color)' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>&copy; 2026 Ethio Garage. {t('footer_rights')}</p>
      </footer>
    </div>
  );
}
