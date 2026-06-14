'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { formatShortAddress } from '@/lib/format-address';
import 'leaflet/dist/leaflet.css';

// Убираем флаг из стандартной подписи Leaflet (prefix с SVG)
L.Control.Attribution.prototype.options.prefix = '';

const DEFAULT_CENTER: [number, number] = [55.7558, 37.6173];

const MAP_TILES = {
  url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

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
  autoLocate?: boolean;
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

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

function CleanAttribution() {
  const map = useMap();
  useEffect(() => {
    map.attributionControl?.setPrefix('');
  }, [map]);
  return null;
}

async function geocodeAddress(query: string) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=ru&limit=1&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ru' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.[0]) return null;
  const parts = data[0].address as Record<string, string> | undefined;
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
    shortAddress: formatShortAddress(parts, data[0].display_name as string),
    city: parts?.city || parts?.town || parts?.village,
  };
}

async function reverseGeocode(lat: number, lng: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
  const res = await fetch(url, {
    headers: { 'Accept-Language': 'ru' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  const parts = data.address as Record<string, string> | undefined;
  return {
    shortAddress: formatShortAddress(parts, data.display_name as string),
    city: parts?.city || parts?.town || parts?.village,
  };
}

export function AddressMapPicker({
  address,
  lat,
  lng,
  autoLocate = false,
  onChange,
  error,
}: AddressMapPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    lat ?? DEFAULT_CENTER[0],
    lng ?? DEFAULT_CENTER[1],
  ]);
  const [locating, setLocating] = useState(false);
  const [geoHint, setGeoHint] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoLocateDone = useRef(false);

  useEffect(() => {
    if (lat && lng) setPosition([lat, lng]);
  }, [lat, lng]);

  const applyCoordinates = useCallback(
    async (nextLat: number, nextLng: number, fallbackAddress?: string) => {
      setPosition([nextLat, nextLng]);
      const result = await reverseGeocode(nextLat, nextLng);
      onChange({
        address: result?.shortAddress || fallbackAddress || address,
        lat: nextLat,
        lng: nextLng,
        city: result?.city,
      });
    },
    [address, onChange]
  );

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoHint('Геолокация недоступна в этом браузере');
      return;
    }

    setLocating(true);
    setGeoHint(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        void applyCoordinates(pos.coords.latitude, pos.coords.longitude).finally(() =>
          setLocating(false)
        );
      },
      (err) => {
        setLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoHint('Разрешите доступ к местоположению в настройках браузера');
        } else {
          setGeoHint('Не удалось определить местоположение');
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  }, [applyCoordinates]);

  useEffect(() => {
    if (!autoLocate || autoLocateDone.current || (lat && lng)) return;
    autoLocateDone.current = true;
    requestLocation();
  }, [autoLocate, lat, lng, requestLocation]);

  function scheduleGeocode(value: string) {
    onChange({ address: value, lat, lng });
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 4) return;

    debounceRef.current = setTimeout(async () => {
      const result = await geocodeAddress(value);
      if (!result) return;
      setPosition([result.lat, result.lng]);
      onChange({
        address: result.shortAddress,
        lat: result.lat,
        lng: result.lng,
        city: result.city,
      });
    }, 600);
  }

  async function handleMapPick(nextLat: number, nextLng: number) {
    await applyCoordinates(nextLat, nextLng);
    setGeoHint(null);
  }

  const hasPin = Boolean(lat && lng);

  return (
    <div className="space-y-4">
      <div className="relative h-56 overflow-hidden rounded-xl border border-border sm:h-64">
        <MapContainer
          center={position}
          zoom={hasPin ? 16 : 12}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer attribution={MAP_TILES.attribution} url={MAP_TILES.url} />
          <CleanAttribution />
          {hasPin && <Marker position={position} icon={markerIcon} />}
          <MapRecenter center={position} zoom={hasPin ? 16 : 12} />
          <MapClickHandler onPick={handleMapPick} />
        </MapContainer>

        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="absolute bottom-3 right-3 z-[1000] shadow-md"
          onClick={requestLocation}
          disabled={locating}
        >
          <LocateFixed className={`mr-2 h-4 w-4 ${locating ? 'animate-pulse' : ''}`} />
          {locating ? 'Определяем...' : 'Где я сейчас'}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Нажмите «Где я сейчас» или укажите точку на карте. Адрес заполнится автоматически.
      </p>

      {geoHint && <p className="text-xs text-amber-600 dark:text-amber-400">{geoHint}</p>}

      <div>
        <label htmlFor="delivery-street" className="mb-1.5 block text-sm font-medium">
          Улица и дом
        </label>
        <Input
          id="delivery-street"
          value={address}
          onChange={(e) => scheduleGeocode(e.target.value)}
          placeholder="Театральный проезд, д. 2"
          required
          aria-invalid={!!error}
        />
        {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
