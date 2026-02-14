'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/phone-input';

type User = { name: string | null; email: string | null; phone: string | null } | null;

export function AccountProfile({ user }: { user: User }) {
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6 space-y-4">
      <div>
        <label className="text-sm font-medium">Имя</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <label className="text-sm font-medium">Email</label>
        <Input value={user?.email ?? ''} disabled className="mt-1 bg-muted" />
        <p className="text-xs text-muted-foreground mt-1">Email изменить нельзя</p>
      </div>
      <div>
        <label className="text-sm font-medium">Телефон</label>
        <PhoneInput
          value={phone}
          onChange={setPhone}
          className="mt-1"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </form>
  );
}
