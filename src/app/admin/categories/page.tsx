'use client';

import { useEffect, useState } from 'react';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { AdminEditPanel } from '@/components/admin-edit-panel';
import { fetchAdminList } from '@/lib/fetch-json';

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  async function reload() {
    setCategories(await fetchAdminList<Category>('/api/admin/categories'));
  }

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">CMS: Категории</h1>
      <div className="mb-8 space-y-3">
        {categories.map((category) => (
          <AdminEditPanel
            key={category.id}
            title={category.name}
            subtitle={category.slug}
            imageUrl={category.image}
            submitUrl={`/api/admin/categories/${category.id}`}
            initialValues={{
              name: category.name,
              slug: category.slug,
              image: category.image ?? '',
              sortOrder: category.sortOrder,
            }}
            fields={[
              { name: 'name', label: 'Название' },
              { name: 'slug', label: 'Slug' },
              { name: 'image', label: 'URL изображения' },
              { name: 'sortOrder', label: 'Порядок', type: 'number' },
            ]}
            onSaved={reload}
            onDelete={async () => {
              if (!confirm('Удалить?')) return;
              await fetch(`/api/admin/categories/${category.id}`, { method: 'DELETE' });
              reload();
            }}
          />
        ))}
      </div>
      <AdminEntityForm
        title="Добавить категорию"
        submitUrl="/api/admin/categories"
        onSuccess={reload}
        fields={[
          { name: 'name', label: 'Название' },
          { name: 'slug', label: 'Slug' },
          { name: 'image', label: 'URL изображения' },
          { name: 'sortOrder', label: 'Порядок', type: 'number' },
        ]}
        initialValues={{ sortOrder: 0 }}
      />
    </div>
  );
}
