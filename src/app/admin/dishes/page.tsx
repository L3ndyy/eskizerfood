'use client';

import { useMemo } from 'react';
import { AdminCmsList } from '@/components/admin/admin-cms-list';
import type { AdminField } from '@/components/admin/admin-entity-form';
import { adminDelete, useAdminList } from '@/hooks/use-admin-list';
import { formatPrice } from '@/lib/utils';

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

type Option = { id: string; name: string };

export default function AdminDishesPage() {
  const dishes = useAdminList<Dish>('/api/admin/dishes');
  const restaurants = useAdminList<Option>('/api/admin/restaurants');
  const categories = useAdminList<Option>('/api/admin/categories');

  const loading = dishes.loading || restaurants.loading || categories.loading;
  const error = dishes.error || restaurants.error || categories.error;

  const restaurantOptions = useMemo(
    () => restaurants.items.map((r) => ({ value: r.id, label: r.name })),
    [restaurants.items]
  );
  const categoryOptions = useMemo(
    () => categories.items.map((c) => ({ value: c.id, label: c.name })),
    [categories.items]
  );

  const dishFields = useMemo(
    (): AdminField[] => [
      { name: 'name', label: 'Название' },
      { name: 'slug', label: 'Slug' },
      { name: 'description', label: 'Описание', type: 'textarea' },
      { name: 'price', label: 'Цена, ₽', type: 'number' },
      { name: 'image', label: 'Фото (URL)', type: 'image' },
      { name: 'weight', label: 'Вес / объём' },
      {
        name: 'restaurantId',
        label: 'Ресторан',
        type: 'select',
        options: restaurantOptions,
      },
      {
        name: 'categoryId',
        label: 'Категория',
        type: 'select',
        options: categoryOptions,
      },
      { name: 'sortOrder', label: 'Порядок сортировки', type: 'number' },
      { name: 'isAvailable', label: 'Доступно для заказа', type: 'checkbox' },
    ],
    [restaurantOptions, categoryOptions]
  );

  function reloadAll() {
    void dishes.reload();
    void restaurants.reload();
    void categories.reload();
  }

  return (
    <AdminCmsList
      title="Блюда"
      description="Меню всех ресторанов — цены, фото, доступность"
      items={dishes.items}
      loading={loading}
      error={error}
      onRetry={reloadAll}
      searchPlaceholder="Поиск по названию, ресторану..."
      searchFilter={(item, q) =>
        item.name.toLowerCase().includes(q) ||
        (item.restaurant?.name ?? '').toLowerCase().includes(q) ||
        (item.category?.name ?? '').toLowerCase().includes(q)
      }
      getRow={(item) => ({
        item,
        title: item.name,
        subtitle: `${item.restaurant?.name ?? '—'} • ${item.category?.name ?? '—'}`,
        imageUrl: item.image,
        badge: formatPrice(item.price),
        badgeVariant: item.isAvailable ? 'default' : 'warning',
      })}
      editFields={dishFields}
      getInitialValues={(item) => ({
        name: item.name,
        slug: item.slug,
        description: item.description ?? '',
        price: item.price,
        image: item.image ?? '',
        weight: item.weight ?? '',
        restaurantId: item.restaurantId,
        categoryId: item.categoryId,
        isAvailable: item.isAvailable,
        sortOrder: item.sortOrder,
      })}
      getSubmitUrl={(item) => `/api/admin/dishes/${item.id}`}
      onSaved={reloadAll}
      onDelete={async (item) => {
        const result = await adminDelete(`/api/admin/dishes/${item.id}`);
        if (!result.ok) alert(result.error);
        else reloadAll();
      }}
      createConfig={{
        title: 'Новое блюдо',
        submitUrl: '/api/admin/dishes',
        fields: dishFields.filter((f) => f.name !== 'isAvailable'),
        initialValues: {
          price: 299,
          sortOrder: 0,
          restaurantId: restaurantOptions[0]?.value ?? '',
          categoryId: categoryOptions[0]?.value ?? '',
        },
      }}
    />
  );
}
