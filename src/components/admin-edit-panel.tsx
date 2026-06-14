'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AdminEntityForm } from '@/components/admin-entity-form';

type Field = {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'checkbox';
};

export function AdminEditPanel({
  title,
  subtitle,
  imageUrl,
  fields,
  initialValues,
  submitUrl,
  onSaved,
  onDelete,
}: {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  fields: Field[];
  initialValues: Record<string, string | number | boolean>;
  submitUrl: string;
  onSaved: () => void;
  onDelete?: () => void;
}) {
  const [editing, setEditing] = useState(false);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 gap-4">
          {imageUrl ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
              <Image src={imageUrl} alt="" fill className="object-cover" unoptimized />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="font-medium">{title}</p>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing((v) => !v)}>
            <Pencil className="mr-1 h-4 w-4" />
            {editing ? 'Скрыть' : 'Изменить'}
          </Button>
          {onDelete ? (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </div>

      {editing ? (
        <div className="mt-4 border-t border-border pt-4">
          <AdminEntityForm
            title={`Редактировать: ${title}`}
            method="PATCH"
            submitUrl={submitUrl}
            fields={fields}
            initialValues={initialValues}
            onSuccess={() => {
              setEditing(false);
              onSaved();
            }}
          />
        </div>
      ) : null}
    </div>
  );
}
