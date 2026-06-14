'use client';

import { AdminCmsList } from '@/components/admin/admin-cms-list';
import type { AdminField } from '@/components/admin/admin-entity-form';
import { adminDelete, useAdminList } from '@/hooks/use-admin-list';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
};

const BANNER_FIELDS: AdminField[] = [
  { name: 'title', label: 'Заголовок' },
  { name: 'subtitle', label: 'Подзаголовок' },
  { name: 'image', label: 'Изображение (URL)', type: 'image' },
  { name: 'link', label: 'Ссылка', placeholder: '/restaurant/dodo-pizza' },
  { name: 'sortOrder', label: 'Порядок', type: 'number' },
  { name: 'isActive', label: 'Показывать на главной', type: 'checkbox' },
];

export default function AdminBannersPage() {
  const { items, loading, error, reload } = useAdminList<Banner>('/api/admin/banners');

  return (
    <AdminCmsList
      title="Баннеры"
      description="Промо-блоки на главной странице"
      items={items}
      loading={loading}
      error={error}
      onRetry={reload}
      searchPlaceholder="Поиск баннера..."
      searchFilter={(item, q) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle ?? '').toLowerCase().includes(q)
      }
      getRow={(item) => ({
        item,
        title: item.title,
        subtitle: item.subtitle ?? item.link ?? undefined,
        imageUrl: item.image,
        badge: item.isActive ? 'Активен' : 'Скрыт',
        badgeVariant: item.isActive ? 'success' : 'muted',
      })}
      editFields={BANNER_FIELDS}
      getInitialValues={(item) => ({
        title: item.title,
        subtitle: item.subtitle ?? '',
        image: item.image,
        link: item.link ?? '',
        sortOrder: item.sortOrder,
        isActive: item.isActive,
      })}
      getSubmitUrl={(item) => `/api/admin/banners/${item.id}`}
      onSaved={reload}
      onDelete={async (item) => {
        const result = await adminDelete(`/api/admin/banners/${item.id}`);
        if (!result.ok) alert(result.error);
        else reload();
      }}
      createConfig={{
        title: 'Новый баннер',
        submitUrl: '/api/admin/banners',
        fields: BANNER_FIELDS,
        initialValues: { sortOrder: 0, isActive: true },
      }}
    />
  );
}
