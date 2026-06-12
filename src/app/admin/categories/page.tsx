'use client';

import { useEffect, useState } from 'react';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { Button } from '@/components/ui/button';

type Category = { id: string; name: string; slug: string; sortOrder: number };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  async function reload() {
    const res = await fetch('/api/admin/categories');
    setCategories(await res.json());
  }

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">CMS: Категории</h1>
      <div className="mb-8 space-y-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-sm text-muted-foreground">{category.slug}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!confirm('Удалить?')) return;
                await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
                reload();
              }}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
      <AdminEntityForm
        title="Добавить категорию"
        submitUrl="/api/admin/categories"
        onSuccess={reload}
        fields={[
          { name: 'name', label: 'Название' },
          { name: 'slug', label: 'Slug' },
          { name: 'sortOrder', label: 'Порядок', type: 'number' },
        ]}
        initialValues={{ sortOrder: 0 }}
      />
    </div>
  );
}
