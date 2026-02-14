'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Card = { id: string; lastFour: string; brand: string; isDefault: boolean };

export function AccountCards({ cards }: { cards: Card[] }) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!number.replace(/\s/g, '').match(/^\d{16}$/)) {
      alert('Введите 16 цифр карты');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/account/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: number.replace(/\s/g, ''),
          brand: number.startsWith('4') ? 'Visa' : 'Mastercard',
        }),
      });
      if (res.ok) {
        setNumber('');
        setShowAdd(false);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  async function setDefault(id: string) {
    await fetch('/api/account/cards', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isDefault: true }),
    });
    router.refresh();
  }

  async function removeCard(id: string) {
    if (!confirm('Удалить карту?')) return;
    await fetch(`/api/account/cards?id=${id}`, { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      {cards.length === 0 && !showAdd ? (
        <p className="mb-4 text-muted-foreground">Нет привязанных карт</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {cards.map((card) => (
            <li
              key={card.id}
              className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">
                  {card.brand} •••• {card.lastFour}
                </span>
                {card.isDefault && (
                  <span className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    Основная
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {!card.isDefault && (
                  <Button variant="ghost" size="sm" onClick={() => setDefault(card.id)}>
                    Сделать основной
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => removeCard(card.id)}
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
            placeholder="1234 5678 9012 3456"
            value={number}
            onChange={(e) =>
              setNumber(
                e.target.value
                  .replace(/\D/g, '')
                  .replace(/(\d{4})(?=\d)/g, '$1 ')
                  .slice(0, 19)
              )
            }
            maxLength={19}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? '...' : 'Привязать'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setShowAdd(false)}>
              Отмена
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" onClick={() => setShowAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Привязать карту
        </Button>
      )}
    </div>
  );
}
