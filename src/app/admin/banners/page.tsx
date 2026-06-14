'use client';

import { useEffect, useState } from 'react';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { AdminEditPanel } from '@/components/admin-edit-panel';
import { fetchAdminList } from '@/lib/fetch-json';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
  sortOrder: number;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);

  async function reload() {
    setBanners(await fetchAdminList<Banner>('/api/admin/banners'));
  }

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">CMS: Баннеры</h1>
      <div className="mb-8 space-y-3">
        {banners.map((banner) => (
          <AdminEditPanel
            key={banner.id}
            title={banner.title}
            subtitle={banner.subtitle ?? undefined}
            imageUrl={banner.image}
            submitUrl={`/api/admin/banners/${banner.id}`}
            initialValues={{
              title: banner.title,
              subtitle: banner.subtitle ?? '',
              image: banner.image,
              link: banner.link ?? '',
              sortOrder: banner.sortOrder,
              isActive: banner.isActive,
            }}
            fields={[
              { name: 'title', label: 'Заголовок' },
              { name: 'subtitle', label: 'Подзаголовок' },
              { name: 'image', label: 'URL изображения' },
              { name: 'link', label: 'Ссылка' },
              { name: 'sortOrder', label: 'Порядок', type: 'number' },
              { name: 'isActive', label: 'Активен', type: 'checkbox' },
            ]}
            onSaved={reload}
            onDelete={async () => {
              if (!confirm('Удалить?')) return;
              await fetch(`/api/admin/banners/${banner.id}`, { method: 'DELETE' });
              reload();
            }}
          />
        ))}
      </div>
      <AdminEntityForm
        title="Добавить баннер"
        submitUrl="/api/admin/banners"
        onSuccess={reload}
        fields={[
          { name: 'title', label: 'Заголовок' },
          { name: 'subtitle', label: 'Подзаголовок' },
          { name: 'image', label: 'URL изображения' },
          { name: 'link', label: 'Ссылка' },
          { name: 'sortOrder', label: 'Порядок', type: 'number' },
          { name: 'isActive', label: 'Активен', type: 'checkbox' },
        ]}
        initialValues={{ sortOrder: 0, isActive: true }}
      />
    </div>
  );
}
