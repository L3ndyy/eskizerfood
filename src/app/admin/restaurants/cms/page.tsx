'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AdminEntityForm } from '@/components/admin-entity-form';

type Restaurant = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
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
    fetch('/api/admin/restaurants')
      .then((res) => res.json())
      .then(setRestaurants)
      .catch(() => {});
  }, []);

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
          <div key={restaurant.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">{restaurant.name}</p>
              <p className="text-sm text-muted-foreground">{restaurant.slug}</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/restaurants/${restaurant.id}/edit`}>Редактировать</Link>
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <AdminEntityForm
          title="Быстрое добавление ресторана"
          submitUrl="/api/admin/restaurants"
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
