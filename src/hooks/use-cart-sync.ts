'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore, type CartItem } from '@/store/cart-store';

function mergeCarts(dbItems: CartItem[], localItems: CartItem[]): CartItem[] {
  if (dbItems.length === 0) return localItems;
  if (localItems.length === 0) return dbItems;

  const dbRestaurantId = dbItems[0]?.restaurantId;
  const localRestaurantId = localItems[0]?.restaurantId;

  if (dbRestaurantId && localRestaurantId && dbRestaurantId !== localRestaurantId) {
    return dbItems;
  }

  const merged = new Map<string, CartItem>();
  for (const item of dbItems) merged.set(item.dishId, { ...item });
  for (const item of localItems) {
    const existing = merged.get(item.dishId);
    if (existing) {
      merged.set(item.dishId, {
        ...existing,
        quantity: existing.quantity + item.quantity,
      });
    } else {
      merged.set(item.dishId, { ...item });
    }
  }
  return Array.from(merged.values());
}

export function useCartSync() {
  const { data: session, status } = useSession();
  const syncedRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.user) {
      syncedRef.current = false;
      return;
    }

    if (syncedRef.current) return;

    async function loadAndMerge() {
      try {
        const res = await fetch('/api/cart');
        if (!res.ok) return;
        const data = await res.json();
        const localItems = useCartStore.getState().items;
        const dbItems: CartItem[] = data.items ?? [];
        const merged = mergeCarts(dbItems, localItems);
        const restaurantId = merged[0]?.restaurantId ?? null;

        useCartStore.setState({ items: merged, restaurantId });

        if (merged.length > 0) {
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: merged, restaurantId }),
          });
        }

        syncedRef.current = true;
      } catch {
        // ignore sync errors
      }
    }

    loadAndMerge();
  }, [status, session?.user]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const unsubscribe = useCartStore.subscribe((state, prev) => {
      if (state.items === prev.items && state.restaurantId === prev.restaurantId) return;
      if (!syncedRef.current) return;

      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        fetch('/api/cart', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: state.items,
            restaurantId: state.restaurantId,
          }),
        }).catch(() => {});
      }, 500);
    });

    return () => {
      unsubscribe();
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [status]);
}
