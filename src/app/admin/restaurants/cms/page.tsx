'use client';

import { AdminCmsList } from '@/components/admin/admin-cms-list';
import type { AdminField } from '@/components/admin/admin-entity-form';
import { adminDelete, useAdminList } from '@/hooks/use-admin-list';

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

const RESTAURANT_FIELDS: AdminField[] = [
  { name: 'name', label: 'Название' },
  { name: 'slug', label: 'Slug (URL)' },
  { name: 'description', label: 'Описание', type: 'textarea' },
  { name: 'image', label: 'Фото (URL)', type: 'image' },
  { name: 'coverImage', label: 'Обложка (URL)', type: 'image' },
  { name: 'deliveryTime', label: 'Время доставки, мин', type: 'number' },
  { name: 'minOrder', label: 'Мин. заказ, ₽', type: 'number' },
  { name: 'deliveryFee', label: 'Стоимость доставки, ₽', type: 'number' },
  {
    name: 'cuisineTypes',
    label: 'Типы кухни (JSON)',
    type: 'textarea',
    hint: 'Например: ["Пицца","Итальянская"]',
  },
  { name: 'address', label: 'Адрес ресторана' },
  { name: 'isActive', label: 'Показывать на сайте', type: 'checkbox' },
];

export default function AdminRestaurantsCmsPage() {
  const { items, loading, error, reload } = useAdminList<Restaurant>('/api/admin/restaurants');

  const createFields = RESTAURANT_FIELDS;

  return (
    <AdminCmsList
      title="Рестораны"
      description="Управление ресторанами на главной и в меню"
      items={items}
      loading={loading}
      error={error}
      onRetry={reload}
      searchPlaceholder="Поиск по названию или slug..."
      searchFilter={(item, q) =>
        item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
      }
      getRow={(item) => ({
        item,
        title: item.name,
        subtitle: `${item.slug} • ${item.address}`,
        imageUrl: item.image,
        badge: item.isActive ? 'Активен' : 'Скрыт',
        badgeVariant: item.isActive ? 'success' : 'muted',
      })}
      editFields={RESTAURANT_FIELDS}
      getInitialValues={(item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description,
        image: item.image,
        coverImage: item.coverImage ?? '',
        deliveryTime: item.deliveryTime,
        minOrder: item.minOrder,
        deliveryFee: item.deliveryFee,
        cuisineTypes: item.cuisineTypes,
        address: item.address,
        isActive: item.isActive,
      })}
      getSubmitUrl={(item) => `/api/admin/restaurants/${item.id}`}
      onSaved={reload}
      onDelete={async (item) => {
        const result = await adminDelete(`/api/admin/restaurants/${item.id}`);
        if (!result.ok) alert(result.error);
        else reload();
      }}
      createConfig={{
        title: 'Новый ресторан',
        submitUrl: '/api/admin/restaurants',
        fields: createFields,
        initialValues: {
          deliveryTime: 30,
          minOrder: 500,
          deliveryFee: 99,
          cuisineTypes: '["Пицца"]',
          address: 'Москва',
          isActive: true,
        },
      }}
    />
  );
}
