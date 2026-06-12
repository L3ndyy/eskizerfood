'use client';

import { useEffect, useState } from 'react';
import { AdminEntityForm } from '@/components/admin-entity-form';
import { Button } from '@/components/ui/button';

type Banner = {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  link: string | null;
  isActive: boolean;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);

  async function reload() {
    const res = await fetch('/api/admin/banners');
    setBanners(await res.json());
  }

  useEffect(() => {
    reload().catch(() => {});
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">CMS: Баннеры</h1>
      <div className="mb-8 space-y-3">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="font-medium">{banner.title}</p>
              <p className="text-sm text-muted-foreground">{banner.subtitle}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                if (!confirm('Удалить?')) return;
                await fetch(`/api/admin/banners/${banner.id}`, { method: 'DELETE' });
                reload();
              }}
            >
              Удалить
            </Button>
          </div>
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
