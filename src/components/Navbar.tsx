"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Home, Wrench, Package, Briefcase, CalendarClock, CarFront, ShieldCheck, Globe } from 'lucide-react';

export default function Navbar() {
  const { t, language, toggleLanguage } = useLanguage();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/', label: t('home'), icon: <Home size={18} /> },
    { href: '/spare-parts', label: t('spare_parts'), icon: <Wrench size={18} /> },
    { href: '/request-part', label: t('request_material'), icon: <Package size={18} /> },
    { href: '/services', label: t('services'), icon: <Briefcase size={18} /> },
    { href: '/maintenance', label: t('book_maintenance'), icon: <CalendarClock size={18} /> },
  ];

  return (
    <header style={{
      padding: '1rem 5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link href="/" style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)', letterSpacing: '-0.02em', textDecoration: 'none' }}>
        Ethio Garage
      </Link>
      
      {/* Mobile Menu Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="mobile-only">
        <button 
          onClick={toggleLanguage}
          style={{ 
            background: 'var(--text-main)', color: 'var(--bg-color)', 
            border: 'none', padding: '0.4rem 0.6rem', borderRadius: '999px', 
            cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem',
            display: 'flex', alignItems: 'center', gap: '0.3rem'
          }}
        >
          <Globe size={14} /> {language === 'en' ? 'አማ' : 'EN'}
        </button>
        <button onClick={() => setIsOpen(!isOpen)} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Nav Links */}
      <nav className={`nav-links ${isOpen ? 'open' : ''}`}>
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                fontWeight: isActive ? 700 : 500,
                borderBottom: isActive ? '2px solid var(--primary-color)' : '2px solid transparent',
                paddingBottom: '0.2rem',
                transition: 'all 0.2s',
                textDecoration: 'none'
              }}
              onClick={() => setIsOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          );
        })}
        
        <Link 
          href="/cars" 
          onClick={() => setIsOpen(false)}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: pathname === '/cars' ? 'var(--primary-color)' : 'var(--accent-color)', 
            fontWeight: pathname === '/cars' ? 700 : 600,
            borderBottom: pathname === '/cars' ? '2px solid var(--primary-color)' : '2px solid transparent',
            paddingBottom: '0.2rem',
            textDecoration: 'none'
          }}
        >
          <CarFront size={18} /> {t('cars_for_sale')}
        </Link>

        <button 
          onClick={toggleLanguage}
          className="desktop-only"
          style={{ 
            background: 'var(--text-main)', color: 'var(--bg-color)', 
            border: 'none', padding: '0.4rem 0.8rem', borderRadius: '999px', 
            cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'
          }}
        >
          <Globe size={16} /> {language === 'en' ? 'አማ' : 'EN'}
        </button>
        <Link href="/admin" onClick={() => setIsOpen(false)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 1rem', borderRadius: '999px', fontSize: '0.875rem', textDecoration: 'none' }}>
          <ShieldCheck size={16} />
          {t('admin')}
        </Link>
      </nav>
    </header>
  );
}
