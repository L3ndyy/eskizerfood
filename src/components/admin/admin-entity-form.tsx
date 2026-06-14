'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export type AdminFieldOption = { value: string; label: string };

export type AdminField = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'checkbox' | 'textarea' | 'select' | 'image';
  options?: AdminFieldOption[];
  placeholder?: string;
  hint?: string;
};

export function AdminEntityForm({
  title,
  fields,
  initialValues = {},
  submitUrl,
  method = 'POST',
  onSuccess,
  onCancel,
  compact,
}: {
  title: string;
  fields: AdminField[];
  initialValues?: Record<string, string | number | boolean>;
  submitUrl: string;
  method?: 'POST' | 'PATCH';
  onSuccess?: () => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [values, setValues] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {};
      for (const field of fields) {
        const value = values[field.name];
        if (field.type === 'number') payload[field.name] = Number(value);
        else if (field.type === 'checkbox') payload[field.name] = Boolean(value);
        else payload[field.name] = value;
      }

      const res = await fetch(submitUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(
          (data && typeof data === 'object' && 'error' in data && String(data.error)) ||
            'Ошибка сохранения'
        );
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('space-y-4', !compact && 'rounded-xl border border-border bg-card p-6')}
    >
      {!compact && <h2 className="text-lg font-semibold">{title}</h2>}

      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map((field) => {
          const fullWidth =
            field.type === 'textarea' ||
            field.type === 'image' ||
            field.name === 'description' ||
            field.name === 'cuisineTypes';

          return (
            <div key={field.name} className={cn(fullWidth && 'sm:col-span-2')}>
              <label className="mb-1.5 block text-sm font-medium">{field.label}</label>

              {field.type === 'checkbox' ? (
                <label className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-border"
                    checked={Boolean(values[field.name])}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.checked }))
                    }
                  />
                  <span className="text-muted-foreground">Включено</span>
                </label>
              ) : field.type === 'textarea' ? (
                <textarea
                  value={String(values[field.name] ?? '')}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  rows={3}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              ) : field.type === 'select' ? (
                <select
                  value={String(values[field.name] ?? '')}
                  onChange={(e) =>
                    setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                  }
                  className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Выберите...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : (
                <>
                  <Input
                    type={field.type === 'number' ? 'number' : 'text'}
                    value={String(values[field.name] ?? '')}
                    onChange={(e) =>
                      setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                  />
                  {(field.type === 'image' ||
                    field.name === 'image' ||
                    field.name === 'coverImage') &&
                  String(values[field.name] ?? '').startsWith('http') ? (
                    <div className="relative mt-2 h-28 w-full max-w-sm overflow-hidden rounded-lg bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={String(values[field.name])}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                </>
              )}

              {field.hint ? (
                <p className="mt-1 text-xs text-muted-foreground">{field.hint}</p>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Отмена
          </Button>
        ) : null}
      </div>
    </form>
  );
}
