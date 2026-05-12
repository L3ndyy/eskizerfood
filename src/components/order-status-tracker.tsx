'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Clock, Check, ChefHat, Truck } from 'lucide-react';

const STEPS = [
  { key: 'PENDING', label: 'Ожидание', icon: Clock },
  { key: 'CONFIRMED', label: 'Подтверждён', icon: Check },
  { key: 'PREPARING', label: 'Готовится', icon: ChefHat },
  { key: 'DELIVERING', label: 'В пути', icon: Truck },
  { key: 'DELIVERED', label: 'Доставлен', icon: Check },
] as const;

const STATUS_ORDER = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED'];

export function OrderStatusTracker({
  status,
  deliveryTime = 30,
}: {
  status: string;
  deliveryTime?: number | null;
}) {
  const currentIndex = useMemo(() => {
    const idx = STATUS_ORDER.indexOf(status);
    return idx >= 0 ? idx : 0;
  }, [status]);

  const targetProgress = useMemo(() => {
    if (status === 'CANCELLED') return 0;
    const idx = STATUS_ORDER.indexOf(status);
    if (idx < 0) return 0;
    return ((idx + 1) / STATUS_ORDER.length) * 100;
  }, [status]);

  if (status === 'CANCELLED') {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="font-semibold text-destructive">Заказ отменён</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/80 p-6 shadow-sm backdrop-blur-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">Статус заказа</h2>
        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
          ~{deliveryTime} мин
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={false}
          animate={{ width: `${targetProgress}%` }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      <div className="mt-6 flex justify-between gap-1">
        {STEPS.filter((s) => s.key !== 'DELIVERED' || status === 'DELIVERED').map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= currentIndex;
          return (
            <div key={step.key} className="flex min-w-0 flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`mt-2 max-w-[4.5rem] text-center text-[10px] font-medium leading-tight sm:text-xs ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
