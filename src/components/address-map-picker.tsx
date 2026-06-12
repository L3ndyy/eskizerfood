'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173];

const markerIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type AddressMapPickerProps = {
  address: string;
  lat?: number;
  lng?: number;
  onChange: (value: {
    address: string;
    lat?: number;
    lng?: number;
    city?: string;
  }) => void;
  error?: string;
};

function MapClickHandler({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

async function geocodeAddress(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ru&limit=1`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ru' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.[0]) return null;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    displayName: data[0].display_name as string,
    city: data[0].address?.city || data[0].address?.town || data[0].address?.village,
  };
}

async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ru' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return {
    displayName: data.display_name as string,
    city: data.address?.city || data.address?.town || data.address?.village,
  };
}

export function AddressMapPicker({
  address,
  lat,
  lng,
  onChange,
  error,
}: AddressMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    lat ?? DEFAULT_CENTER[0],
    lng ?? DEFAULT_CENTER[1],
  ]);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (lat && lng) setPosition([lat, lng]);
  }, [lat, lng]);

  function scheduleGeocode(value: string) {
    onChange({ address: value, lat, lng });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 10) return;

    debounceRef.current = setTimeout(async () => {
      const result = await geocodeAddress(value);
      if (!result) return;
      setPosition([result.lat, result.lng]);
      onChange({
        address: result.displayName,
        lat: result.lat,
        lng: result.lng,
        city: result.city,
      });
    }, 600);
  }

  async function handleMapPick(nextLat: number, nextLng: number) {
    setPosition([nextLat, nextLng]);
    const result = await reverseGeocode(nextLat, nextLng);
    onChange({
      address: result?.displayName ?? address,
      lat: nextLat,
      lng: nextLng,
      city: result?.city,
    });
  }

  return (
    <div className="space-y-3">
      <Input
        value={address}
        onChange={(e) => scheduleGeocode(e.target.value)}
        placeholder="ул. Примерная, д. 1, кв. 1"
        required
        aria-invalid={!!error}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        Введите адрес или кликните на карте, чтобы указать точку доставки
      </p>
      <div className="h-64 overflow-hidden rounded-lg border border-border">
        <MapContainer
          center={position}
          zoom={13}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={markerIcon} />
          <MapClickHandler onPick={handleMapPick} />
        </MapContainer>
      </div>
    </div>
  );
}
