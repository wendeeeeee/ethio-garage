"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PostCarPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [form, setForm] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    fuel_type: 'Benzine',
    transmission: 'Manual',
    color: '',
    description: '',
    contact_name: '',
    contact_phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    let imageUrl = null;

    // Upload image if selected
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        setIsSubmitting(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('car-images')
        .getPublicUrl(fileName);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase.from('cars_for_sale').insert([{
      ...form,
      price: parseFloat(form.price),
      year: parseInt(form.year.toString()),
      image_url: imageUrl
    }]);

    if (!error) {
      alert('🎉 Your car has been listed successfully!');
      router.push('/cars');
    } else {
      alert('Error posting car: ' + error.message);
    }
    setIsSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.85rem 1rem', borderRadius: '10px',
    border: '1px solid var(--border-color)', background: 'var(--surface-color)',
    fontSize: '1rem', color: 'var(--text-main)', outline: 'none',
    transition: 'border-color 0.2s'
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.9rem'
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      {/* Hero Section */}
      <section style={{ padding: '3rem 5%', flex: 1, maxWidth: '700px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '2.5rem', letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
          Post Your Car <span style={{ color: 'var(--primary-color)' }}>for Sale</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
          Fill in the details below. Your listing will appear on our marketplace instantly.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Car Photo Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📷 Car Photo
            </h3>
            <div
              style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '2rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: 'var(--surface-hover)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => document.getElementById('car-image-input')?.click()}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Car preview"
                  style={{
                    maxWidth: '100%', maxHeight: '300px', borderRadius: '8px', objectFit: 'cover'
                  }}
                />
              ) : (
                <div>
                  <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📸</div>
                  <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Click to upload a photo of your car</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>JPG, PNG up to 5MB</p>
                </div>
              )}
              <input
                id="car-image-input"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
            </div>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview(null); }}
                style={{
                  marginTop: '0.75rem', background: 'none', border: 'none',
                  color: 'var(--danger-color)', cursor: 'pointer', fontSize: '0.875rem', textDecoration: 'underline'
                }}
              >
                Remove photo
              </button>
            )}
          </div>

          {/* Car Details Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🚗 Car Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Make *</label>
                <input name="make" required placeholder="e.g. Toyota" value={form.make} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Model *</label>
                <input name="model" required placeholder="e.g. Corolla" value={form.model} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Year *</label>
                <input name="year" type="number" required min={1990} max={2027} value={form.year} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Color</label>
                <input name="color" placeholder="e.g. White" value={form.color} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Fuel Type</label>
                <select name="fuel_type" value={form.fuel_type} onChange={handleChange} style={inputStyle}>
                  <option value="Benzine">Benzine</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Electric">Electric</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Transmission</label>
                <select name="transmission" value={form.transmission} onChange={handleChange} style={inputStyle}>
                  <option value="Manual">Manual</option>
                  <option value="Automatic">Automatic</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Mileage (km)</label>
                <input name="mileage" placeholder="e.g. 85000" value={form.mileage} onChange={handleChange} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Pricing & Description Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              💰 Price & Description
            </h3>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Price (ETB) *</label>
              <input name="price" type="number" required placeholder="e.g. 1500000" value={form.price} onChange={handleChange} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                placeholder="Tell buyers about the condition, features, history..."
                value={form.description}
                onChange={handleChange}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Contact Card */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📞 Your Contact Info
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Your Name *</label>
                <input name="contact_name" required placeholder="e.g. Abebe" value={form.contact_name} onChange={handleChange} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input 
                  name="contact_phone" 
                  type="tel"
                  required 
                  placeholder="e.g. 0911234567 (10 digits)" 
                  pattern="\d{10}" title="Phone number must be exactly 10 digits" minLength={10} maxLength={10}
                  value={form.contact_phone} 
                  onChange={e => handleChange({ ...e, target: { ...e.target, name: e.target.name, value: e.target.value.replace(/\D/g, '') } } as React.ChangeEvent<HTMLInputElement>)} 
                  style={inputStyle} 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={isSubmitting} style={{
            width: '100%', padding: '1.1rem', fontSize: '1.1rem', borderRadius: '12px',
            fontWeight: 700, marginTop: '0.5rem'
          }}>
            {isSubmitting ? 'Posting...' : '🚀 Post Car for Sale'}
          </button>
        </form>
      </section>
    </div>
  );
}
