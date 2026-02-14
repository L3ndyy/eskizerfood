'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function OrderStatusSimulator({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  const router = useRouter();

  useEffect(() => {
    if (status === 'DELIVERED' || status === 'CANCELLED') return;

    const advance = async () => {
      await fetch(`/api/orders/${orderId}/simulate`, { method: 'POST' });
      router.refresh();
    };

    const delay = status === 'PENDING' ? 5 : status === 'CONFIRMED' ? 10 : status === 'PREPARING' ? 15 : 20;
    const timer = setTimeout(advance, delay * 1000);
    return () => clearTimeout(timer);
  }, [orderId, status, router]);

  return null;
}
