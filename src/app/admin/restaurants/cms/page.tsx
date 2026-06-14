'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { AdminEditPanel } from '@/components/admin-edit-panel';
import { fetchAdminList } from '@/lib/fetch-json';

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  coverImage: string | null;
  deliveryTime: number;
  minOrder: number;
  deliveryFee: number;
  cuisineTypes: string;
  address: string;
  isActive: boolean;
};

export default function AdminRestaurantsCmsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  useEffect(() => {
    fetchAdminList<Restaurant>('/api/admin/restaurants').then(setRestaurants).catch(() => {});
  }, []);

  function reload() {
    fetchAdminList<Restaurant>('/api/admin/restaurants').then(setRestaurants).catch(() => {});
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">CMS: Рестораны</h1>
        <Button asChild>
          <Link href="/admin/restaurants/new">Добавить</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {restaurants.map((restaurant) => (
          <AdminEditPanel
            key={restaurant.id}
            title={restaurant.name}
            subtitle={restaurant.slug}
            imageUrl={restaurant.image}
            submitUrl={`/api/admin/restaurants/${restaurant.id}`}
            initialValues={{
              name: restaurant.name,
              slug: restaurant.slug,
              description: restaurant.description,
              image: restaurant.image,
              coverImage: restaurant.coverImage ?? '',
              deliveryTime: restaurant.deliveryTime,
              minOrder: restaurant.minOrder,
              deliveryFee: restaurant.deliveryFee,
              cuisineTypes: restaurant.cuisineTypes,
              address: restaurant.address,
              isActive: restaurant.isActive,
            }}
            fields={[
              { name: 'name', label: 'Название' },
              { name: 'slug', label: 'Slug' },
              { name: 'description', label: 'Описание' },
              { name: 'image', label: 'URL изображения (карточка)' },
              { name: 'coverImage', label: 'URL обложки' },
              { name: 'deliveryTime', label: 'Время доставки (мин)', type: 'number' },
              { name: 'minOrder', label: 'Мин. заказ', type: 'number' },
              { name: 'deliveryFee', label: 'Доставка', type: 'number' },
              { name: 'cuisineTypes', label: 'Кухни (JSON)' },
              { name: 'address', label: 'Адрес' },
              { name: 'isActive', label: 'Активен', type: 'checkbox' },
            ]}
            onSaved={reload}
          />
        ))}
      </div>

      <div className="mt-10">
        <AdminEntityForm
          title="Быстрое добавление ресторана"
          submitUrl="/api/admin/restaurants"
          onSuccess={reload}
          fields={[
            { name: 'name', label: 'Название' },
            { name: 'slug', label: 'Slug' },
            { name: 'description', label: 'Описание' },
            { name: 'image', label: 'URL изображения' },
            { name: 'deliveryTime', label: 'Время доставки (мин)', type: 'number' },
            { name: 'minOrder', label: 'Мин. заказ', type: 'number' },
            { name: 'deliveryFee', label: 'Доставка', type: 'number' },
            { name: 'cuisineTypes', label: 'Кухни (JSON)' },
            { name: 'address', label: 'Адрес' },
          ]}
          initialValues={{
            deliveryTime: 30,
            minOrder: 500,
            deliveryFee: 199,
            cuisineTypes: '["Пицца"]',
            isActive: true,
          }}
        />
      </div>
    </div>
  );
}
