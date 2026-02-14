'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Address = { id: string; address: string; isDefault: boolean };

export function AccountAddresses({ addresses }: { addresses: Address[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/account/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });
      if (res.ok) {
        setAddress('');
        setShowAdd(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function setDefault(id: string) {
    await fetch('/api/account/addresses', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isDefault: true }),
    });
    router.refresh();
  }

  async function removeAddress(id: string) {
    if (!confirm('Удалить адрес?')) return;
    await fetch(`/api/account/addresses?id=${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {addresses.length === 0 && !showAdd ? (
        <p className="mb-4 text-muted-foreground">Нет сохранённых адресов</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {addresses.map((addr) => (
            <li
              key={addr.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4"
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 shrink-0 text-muted-foreground" />
                <span>{addr.address}</span>
                {addr.isDefault && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    Основной
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!addr.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => setDefault(addr.id)}>
                    Сделать основным
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeAddress(addr.id)}
                >
                  Удалить
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {showAdd ? (
        <form onSubmit={handleAdd} className="space-y-3">
          <Input
            placeholder="ул. Примерная, д. 1, кв. 1"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? '...' : 'Добавить'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить адрес
        </Button>
      )}
    </div>
  );
}
