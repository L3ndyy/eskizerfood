'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/phone-input';
import { AddressMapPicker } from '@/components/address-map-picker-client';
import { CheckoutStepper } from '@/components/checkout-stepper';
import { useCartStore } from '@/store/cart-store';
import { formatPrice, isValidPhone, PHONE_VALIDATION_ERROR } from '@/lib/utils';
import { saveCheckoutDraft } from '@/lib/checkout-draft';

type SavedAddress = {
  id: string;
  address: string;
  city?: string | null;
  apartment?: string | null;
  lat?: number | null;
  lng?: number | null;
  isDefault: boolean;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { items, restaurantId, getTotal } = useCartStore();
  const restaurantName = items[0]?.restaurantName ?? '';
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [apartment, setApartment] = useState('');
  const [lat, setLat] = useState<number | undefined>();
  const [lng, setLng] = useState<number | undefined>();
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [addressesLoaded, setAddressesLoaded] = useState(false);

  const total = getTotal();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/auth/register?callbackUrl=/checkout');
    }
  }, [status, router]);

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart');
    }
  }, [items.length, router]);

  useEffect(() => {
    if (!session?.user) return;

    fetch('/api/account/profile')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.phone) setPhone(data.phone);
      })
      .catch(() => {});

    fetch('/api/account/addresses')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SavedAddress[] | null) => {
        if (!data) return;
        setSavedAddresses(data);
        const defaultAddress = data.find((a) => a.isDefault) ?? data[0];
        if (defaultAddress) {
          setAddress(defaultAddress.address);
          setCity(defaultAddress.city ?? '');
          setApartment(defaultAddress.apartment ?? '');
          setLat(defaultAddress.lat ?? undefined);
          setLng(defaultAddress.lng ?? undefined);
        }
      })
      .catch(() => {})
      .finally(() => setAddressesLoaded(true));
  }, [session?.user]);

  if (status === 'loading' || status === 'unauthenticated' || items.length === 0) {
    return (
      <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  function handleAddressSelect(id: string) {
    const selected = savedAddresses.find((item) => item.id === id);
    if (!selected) return;
    setAddress(selected.address);
    setCity(selected.city ?? '');
    setApartment(selected.apartment ?? '');
    setLat(selected.lat ?? undefined);
    setLng(selected.lng ?? undefined);
    setAddressError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!restaurantId || items.length === 0) return;

    if (address.trim().length < 3) {
      setAddressError('Укажите улицу и дом');
      return;
    }
    if (!lat || !lng) {
      setAddressError('Укажите точку на карте или дождитесь определения адреса');
      return;
    }
    if (!isValidPhone(phone)) {
      setPhoneError(PHONE_VALIDATION_ERROR);
      return;
    }

    setAddressError('');
    setPhoneError('');

    saveCheckoutDraft({
      restaurantId,
      address: apartment ? `${address}, кв. ${apartment}` : address,
      phone,
      comment: comment || undefined,
      lat,
      lng,
      city,
      apartment,
    });

    router.push('/payment');
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <CheckoutStepper current={1} />
      <h1 className="text-2xl font-bold">Оформление заказа</h1>
      <p className="mt-2 text-muted-foreground">{restaurantName}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {savedAddresses.length > 0 && (
          <div>
            <label htmlFor="saved-address" className="block text-sm font-medium">
              Сохранённые адреса
            </label>
            <select
              id="saved-address"
              className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              defaultValue=""
              onChange={(e) => handleAddressSelect(e.target.value)}
            >
              <option value="" disabled>
                Выберите адрес
              </option>
              {savedAddresses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.address}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card/40 p-4 sm:p-5">
          <label className="mb-3 block text-sm font-medium">Адрес доставки</label>
          <AddressMapPicker
            address={address}
            lat={lat}
            lng={lng}
            autoLocate={addressesLoaded && lat == null && lng == null}
            error={addressError}
            onChange={(value) => {
              setAddress(value.address);
              setLat(value.lat);
              setLng(value.lng);
              if (value.city) setCity(value.city);
              if (addressError) setAddressError('');
            }}
          />

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="apartment" className="mb-1.5 block text-sm font-medium">
                Квартира / офис
              </label>
              <Input
                id="apartment"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
                placeholder="12"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium">
                Телефон
              </label>
              <PhoneInput
                id="phone"
                value={phone}
                onChange={(value) => {
                  setPhone(value);
                  if (phoneError) setPhoneError('');
                }}
                required
                aria-invalid={!!phoneError}
              />
              {phoneError && (
                <p className="mt-1 text-sm text-destructive">{phoneError}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium">
            Комментарий к заказу (необязательно)
          </label>
          <Input
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Домофон 123"
            className="mt-2"
          />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="font-semibold">Состав заказа</h3>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            {items.map((i) => (
              <li key={i.dishId}>
                {i.dishName} × {i.quantity} — {formatPrice(i.price * i.quantity)}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-semibold">
            Итого: {formatPrice(total)}
          </p>
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" asChild>
            <Link href="/cart">Назад</Link>
          </Button>
          <Button type="submit" className="flex-1">
            Далее к оплате
          </Button>
        </div>
      </form>
    </div>
  );
}
