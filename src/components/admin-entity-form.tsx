'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'checkbox';
};

export function AdminEntityForm({
  title,
  fields,
  initialValues = {},
  submitUrl,
  method = 'POST',
  onSuccess,
}: {
  title: string;
  fields: Field[];
  initialValues?: Record<string, string | number | boolean>;
  submitUrl: string;
  method?: 'POST' | 'PATCH';
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string | number | boolean>>(initialValues);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
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
      if (!res.ok) throw new Error('Save failed');
      onSuccess?.();
      router.refresh();
    } catch {
      alert('Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-4 rounded-lg border border-border bg-card p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {fields.map((field) => (
        <div key={field.name}>
          <label className="text-sm font-medium">{field.label}</label>
          {field.type === 'checkbox' ? (
            <input
              type="checkbox"
              className="ml-2"
              checked={Boolean(values[field.name])}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.checked }))}
            />
          ) : (
            <Input
              type={field.type === 'number' ? 'number' : 'text'}
              value={String(values[field.name] ?? '')}
              onChange={(e) => setValues((prev) => ({ ...prev, [field.name]: e.target.value }))}
              className="mt-1"
            />
          )}
        </div>
      ))}
      <Button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </form>
  );
}
