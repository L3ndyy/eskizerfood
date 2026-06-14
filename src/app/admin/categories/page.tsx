'use client';

import { AdminCmsList } from '@/components/admin/admin-cms-list';
import type { AdminField } from '@/components/admin/admin-entity-form';
import { adminDelete, useAdminList } from '@/hooks/use-admin-list';

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  sortOrder: number;
};

const CATEGORY_FIELDS: AdminField[] = [
  { name: 'name', label: 'Название' },
  { name: 'slug', label: 'Slug' },
  { name: 'image', label: 'Иконка (URL)', type: 'image' },
  { name: 'sortOrder', label: 'Порядок', type: 'number' },
];

export default function AdminCategoriesPage() {
  const { items, loading, error, reload } = useAdminList<Category>('/api/admin/categories');

  return (
    <AdminCmsList
      title="Категории"
      description="Пицца, суши, бургеры и другие разделы меню"
      items={items}
      loading={loading}
      error={error}
      onRetry={reload}
      searchPlaceholder="Поиск категории..."
      searchFilter={(item, q) =>
        item.name.toLowerCase().includes(q) || item.slug.toLowerCase().includes(q)
      }
      getRow={(item) => ({
        item,
        title: item.name,
        subtitle: item.slug,
        imageUrl: item.image,
        badge: `#${item.sortOrder}`,
        badgeVariant: 'muted',
      })}
      editFields={CATEGORY_FIELDS}
      getInitialValues={(item) => ({
        name: item.name,
        slug: item.slug,
        image: item.image ?? '',
        sortOrder: item.sortOrder,
      })}
      getSubmitUrl={(item) => `/api/admin/categories/${item.id}`}
      onSaved={reload}
      onDelete={async (item) => {
        const result = await adminDelete(`/api/admin/categories/${item.id}`);
        if (!result.ok) alert(result.error);
        else reload();
      }}
      createConfig={{
        title: 'Новая категория',
        submitUrl: '/api/admin/categories',
        fields: CATEGORY_FIELDS,
        initialValues: { sortOrder: 0 },
      }}
    />
  );
}
