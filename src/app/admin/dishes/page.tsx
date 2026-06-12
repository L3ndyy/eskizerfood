'use client';

import { useEffect, useState } from 'react';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { Button } from '@/components/ui/button';
import { fetchAdminList } from '@/lib/fetch-json';

type Dish = {
  id: string;
  name: string;
  slug: string;
  price: number;
  restaurant: { name: string } | null;
  category: { name: string } | null;
};

export default function AdminDishesPage() {
  const [dishes, setDishes] = useState<Dish[]>([]);

  async function reload() {
    setDishes(await fetchAdminList<Dish>('/api/admin/dishes'));
  }

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">CMS: Блюда</h1>
      <div className="mb-8 space-y-3">
        {dishes.map((dish) => (
          <div key={dish.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">{dish.name}</p>
              <p className="text-sm text-muted-foreground">
                {dish.restaurant?.name ?? '—'} • {dish.category?.name ?? '—'} • {dish.price} ₽
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!confirm('Удалить?')) return;
                await fetch(`/api/admin/dishes/${dish.id}`, { method: 'DELETE' });
                reload();
              }}
            >
              Удалить
            </Button>
          </div>
        ))}
      </div>
      <AdminEntityForm
        title="Добавить блюдо"
        submitUrl="/api/admin/dishes"
        onSuccess={reload}
        fields={[
          { name: 'name', label: 'Название' },
          { name: 'slug', label: 'Slug' },
          { name: 'price', label: 'Цена', type: 'number' },
          { name: 'restaurantId', label: 'Restaurant ID' },
          { name: 'categoryId', label: 'Category ID' },
          { name: 'image', label: 'URL изображения' },
        ]}
      />
    </div>
  );
}
