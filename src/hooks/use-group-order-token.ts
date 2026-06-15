'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  getStoredGroupOrderToken,
  setStoredGroupOrderToken,
} from '@/lib/group-order-storage';

/** Активный groupToken: из URL или localStorage */
export function useGroupOrderToken() {
  const pathname = usePathname();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const urlToken = new URL(window.location.href).searchParams.get('groupToken');
    if (urlToken) {
      setStoredGroupOrderToken(urlToken);
      setToken(urlToken);
      return;
    }
    setToken(getStoredGroupOrderToken());
  }, [pathname]);

  return token;
}
