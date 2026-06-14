'use client';

import { useCallback, useEffect, useState } from 'react';

export function useAdminList<T>(url: string) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && typeof data === 'object' && 'error' in data && String(data.error)) ||
            `Ошибка загрузки (${res.status})`
        );
      }
      if (!Array.isArray(data)) {
        throw new Error('Сервер вернул неверный формат данных');
      }
      setItems(data as T[]);
    } catch (err) {
      setItems([]);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { items, setItems, loading, error, reload };
}

export async function adminDelete(url: string): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        ok: false,
        error:
          (data && typeof data === 'object' && 'error' in data && String(data.error)) ||
          'Не удалось удалить',
      };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Ошибка сети' };
  }
}
