'use client';

import { AdminEntityForm } from '@/components/admin-entity-form';
import { useRouter } from 'next/navigation';

export default function NewRestaurantPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminEntityForm
        title="Новый ресторан"
        submitUrl="/api/admin/restaurants"
        initialValues={{
          deliveryTime: 30,
          minOrder: 500,
          deliveryFee: 199,
          cuisineTypes: '["Пицца"]',
          isActive: true,
        }}
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
