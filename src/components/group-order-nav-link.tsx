'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getStoredGroupOrderToken } from '@/lib/group-order-storage';

export function GroupOrderNavLink({ className }: { className?: string }) {
  const [href, setHref] = useState('/group-order');

  useEffect(() => {
    const token = getStoredGroupOrderToken();
    if (token) {
      setHref(`/group-order/join/${token}`);
    }
  }, []);

  return (
    <Link href={href} className={className}>
      Групповой заказ
    </Link>
  );
}
