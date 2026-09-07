"use client";

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface JobMarker {
  id: string;
  problem: string;
  location: string;
  status: string;
}

interface MapPickerProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  activeJobs?: JobMarker[];
  searchedLocation?: [number, number] | null;
}

function MapUpdater({ center }: { center: [number, number] | null | undefined }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 17);
    }
  }, [center, map]);
  return null;
}

export default function MapPicker({ onLocationSelect, activeJobs = [], searchedLocation }: MapPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  useEffect(() => {
    if (searchedLocation) {
      setPosition(searchedLocation);
      // We don't call onLocationSelect here again to prevent loops, the parent already knows it.
    }
  }, [searchedLocation]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (onLocationSelect) {
          setPosition([e.latlng.lat, e.latlng.lng]);
          onLocationSelect(e.latlng.lat, e.latlng.lng);
        }
      },
    });
    return position === null ? null : (
      <Marker position={position}>
        <Popup>New Job Location</Popup>
      </Marker>
    );
  };

  return (
    <MapContainer center={[9.03, 38.74]} zoom={14} maxZoom={22} style={{ height: '400px', width: '100%', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
      <TileLayer 
        url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
        maxZoom={22}
      />
      <MapUpdater center={searchedLocation} />
      <LocationMarker />
      
      {activeJobs.map(job => {
        if (!job.location || !job.location.includes(',')) return null;
        const [latStr, lngStr] = job.location.split(',');
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        if (isNaN(lat) || isNaN(lng)) return null;
        
        return (
          <Marker key={job.id} position={[lat, lng]}>
            <Popup>
              <strong style={{ color: job.status === 'PENDING_DISPATCH' ? 'var(--danger-color)' : 'var(--primary-color)' }}>
                {job.status === 'PENDING_DISPATCH' ? '🚨 SOS Request' : 'Active Job'}
              </strong>
              <p style={{ margin: '0.5rem 0' }}>{job.problem}</p>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
