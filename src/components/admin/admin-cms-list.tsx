'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminEntityForm, type AdminField } from '@/components/admin/admin-entity-form';
import { adminDelete } from '@/hooks/use-admin-list';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 20;

export type AdminCmsRow<T> = {
  item: T;
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  badge?: string;
  badgeVariant?: 'default' | 'muted' | 'success' | 'warning';
};

export function AdminCmsList<T extends { id: string }>({
  title,
  description,
  items,
  loading,
  error,
  onRetry,
  searchPlaceholder = 'Поиск...',
  searchFilter,
  getRow,
  editFields,
  getInitialValues,
  getSubmitUrl,
  onSaved,
  onDelete,
  createConfig,
  extraActions,
}: {
  title: string;
  description?: string;
  items: T[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  searchPlaceholder?: string;
  searchFilter: (item: T, query: string) => boolean;
  getRow: (item: T) => Omit<AdminCmsRow<T>, 'item'>;
  editFields: AdminField[] | ((item: T) => AdminField[]);
  getInitialValues: (item: T) => Record<string, string | number | boolean>;
  getSubmitUrl: (item: T) => string;
  onSaved: () => void;
  onDelete?: (item: T) => Promise<void>;
  createConfig?: {
    title: string;
    fields: AdminField[];
    submitUrl: string;
    initialValues?: Record<string, string | number | boolean>;
  };
  extraActions?: React.ReactNode;
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<T | null>(null);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => searchFilter(item, q));
  }, [items, search, searchFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function handleDelete(item: T) {
    if (!onDelete) return;
    if (!confirm('Удалить запись?')) return;
    setDeletingId(item.id);
    await onDelete(item);
    setDeletingId(null);
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
          <p className="mt-2 text-xs text-muted-foreground">
            {loading ? 'Загрузка...' : `${filtered.length} записей`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraActions}
          {createConfig ? (
            <Button onClick={() => setCreating(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          ) : null}
          <Button variant="outline" size="icon" onClick={onRetry} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {error ? (
        <div className="mb-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
          <Button variant="link" className="ml-2 h-auto p-0 text-destructive" onClick={onRetry}>
            Повторить
          </Button>
        </div>
      ) : null}

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {loading && items.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : paged.length === 0 ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            {search ? 'Ничего не найдено' : 'Список пуст'}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {paged.map((item) => {
              const row = getRow(item);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/40"
                >
                  {row.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={row.imageUrl}
                      alt=""
                      loading="lazy"
                      className="h-12 w-12 shrink-0 rounded-lg object-cover bg-muted"
                    />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                      —
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{row.title}</p>
                      {row.badge ? (
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-xs',
                            row.badgeVariant === 'success' && 'bg-green-500/15 text-green-600',
                            row.badgeVariant === 'warning' && 'bg-amber-500/15 text-amber-600',
                            (!row.badgeVariant || row.badgeVariant === 'default') &&
                              'bg-primary/10 text-primary',
                            row.badgeVariant === 'muted' && 'bg-muted text-muted-foreground'
                          )}
                        >
                          {row.badge}
                        </span>
                      ) : null}
                    </div>
                    {row.subtitle ? (
                      <p className="truncate text-sm text-muted-foreground">{row.subtitle}</p>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(item)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Изменить
                    </Button>
                    {onDelete ? (
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === item.id}
                        onClick={() => void handleDelete(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Страница {safePage} из {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : null}

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование</DialogTitle>
          </DialogHeader>
          {editing ? (
            <AdminEntityForm
              key={editing.id}
              compact
              title=""
              method="PATCH"
              submitUrl={getSubmitUrl(editing)}
              fields={typeof editFields === 'function' ? editFields(editing) : editFields}
              initialValues={getInitialValues(editing)}
              onCancel={() => setEditing(null)}
              onSuccess={() => {
                setEditing(null);
                onSaved();
              }}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {createConfig ? (
        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{createConfig.title}</DialogTitle>
            </DialogHeader>
            <AdminEntityForm
              compact
              title=""
              method="POST"
              submitUrl={createConfig.submitUrl}
              fields={createConfig.fields}
              initialValues={createConfig.initialValues}
              onCancel={() => setCreating(false)}
              onSuccess={() => {
                setCreating(false);
                onSaved();
              }}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}
