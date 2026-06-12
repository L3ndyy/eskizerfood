'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AdminEntityForm } from '@/components/admin-entity-form';

export default function EditRestaurantPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [restaurant, setRestaurant] = useState<Record<string, string | number | boolean> | null>(null);

  useEffect(() => {
    fetch(`/api/admin/restaurants/${params.id}`)
      .then((res) => res.json())
      .then(setRestaurant)
      .catch(() => {});
  }, [params.id]);

  if (!restaurant) {
    return <div className="container mx-auto px-4 py-8">Загрузка...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminEntityForm
        title="Редактировать ресторан"
        method="PATCH"
        submitUrl={`/api/admin/restaurants/${params.id}`}
        initialValues={restaurant}
        fields={[
          { name: 'name', label: 'Название' },
          { name: 'slug', label: 'Slug' },
          { name: 'description', label: 'Описание' },
          { name: 'image', label: 'URL изображения' },
          { name: 'deliveryTime', label: 'Время доставки', type: 'number' },
          { name: 'minOrder', label: 'Мин. заказ', type: 'number' },
          { name: 'deliveryFee', label: 'Доставка', type: 'number' },
          { name: 'cuisineTypes', label: 'Кухни (JSON)' },
          { name: 'address', label: 'Адрес' },
          { name: 'isActive', label: 'Активен', type: 'checkbox' },
        ]}
        onSuccess={() => router.push('/admin/restaurants/cms')}
      />
    </div>
  );
}
