'use client';

import { useState, useEffect } from 'react';

/**
 * Returns true only after the component has mounted.
 * Use this to avoid hydration mismatch when rendering depends on
 * client-only data (e.g. localStorage from Zustand persist).
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);
  return mounted;
}
