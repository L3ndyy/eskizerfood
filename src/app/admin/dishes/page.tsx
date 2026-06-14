'use client';

import { useEffect, useState } from 'react';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { AdminEditPanel } from '@/components/admin-edit-panel';
import { fetchAdminList } from '@/lib/fetch-json';

type Dish = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  image: string | null;
  weight: string | null;
  categoryId: string;
  restaurantId: string;
  isAvailable: boolean;
  sortOrder: number;
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
          <AdminEditPanel
            key={dish.id}
            title={dish.name}
            subtitle={`${dish.restaurant?.name ?? '—'} • ${dish.category?.name ?? '—'} • ${dish.price} ₽`}
            imageUrl={dish.image}
            submitUrl={`/api/admin/dishes/${dish.id}`}
            initialValues={{
              name: dish.name,
              slug: dish.slug,
              description: dish.description ?? '',
              price: dish.price,
              image: dish.image ?? '',
              weight: dish.weight ?? '',
              categoryId: dish.categoryId,
              restaurantId: dish.restaurantId,
              isAvailable: dish.isAvailable,
              sortOrder: dish.sortOrder,
            }}
            fields={[
              { name: 'name', label: 'Название' },
              { name: 'slug', label: 'Slug' },
              { name: 'description', label: 'Описание' },
              { name: 'price', label: 'Цена', type: 'number' },
              { name: 'image', label: 'URL изображения' },
              { name: 'weight', label: 'Вес' },
              { name: 'restaurantId', label: 'Restaurant ID' },
              { name: 'categoryId', label: 'Category ID' },
              { name: 'sortOrder', label: 'Порядок', type: 'number' },
              { name: 'isAvailable', label: 'Доступно', type: 'checkbox' },
            ]}
            onSaved={reload}
            onDelete={async () => {
              if (!confirm('Удалить?')) return;
              await fetch(`/api/admin/dishes/${dish.id}`, { method: 'DELETE' });
              reload();
            }}
          />
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
