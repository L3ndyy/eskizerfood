'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  isAdmin: boolean;
  bonusPoints: number;
  createdAt: string;
};

const DEFAULT_PASSWORDS: Record<string, string> = {
  'admin@food.ru': 'admin123',
  'user@food.ru': 'user123',
};

export function AdminUserResetButton({ user }: { user: UserRow }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lastPassword, setLastPassword] = useState<string | null>(null);

  async function handleReset() {
    const defaultPassword = DEFAULT_PASSWORDS[user.email] ?? 'password123';
    if (
      !confirm(
        `Сбросить пароль для ${user.email}?\nНовый пароль: ${defaultPassword}`
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user.id}/reset-password`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сброса');
      setLastPassword(data.password);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Ошибка сброса пароля');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleReset}
        disabled={loading}
      >
        {loading ? 'Сброс...' : 'Сбросить пароль'}
      </Button>
      {lastPassword && (
        <span className="text-xs text-muted-foreground">
          Новый пароль: {lastPassword}
        </span>
      )}
    </div>
  );
}
