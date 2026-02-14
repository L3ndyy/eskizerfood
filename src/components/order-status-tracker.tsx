'use client';

import { useEffect, useState } from 'react';
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
  const [currentIndex, setCurrentIndex] = useState(
    STATUS_ORDER.indexOf(status) >= 0 ? STATUS_ORDER.indexOf(status) : 0
  );
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const idx = STATUS_ORDER.indexOf(status);
    if (idx >= 0) setCurrentIndex(idx);
  }, [status]);

  useEffect(() => {
    if (status === 'CANCELLED') {
      setProgress(0);
      return;
    }
    const idx = STATUS_ORDER.indexOf(status);
    const target = idx >= 0 ? ((idx + 1) / STATUS_ORDER.length) * 100 : 0;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= target) return p;
        return Math.min(p + 1, target);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [status]);

  if (status === 'CANCELLED') {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
        <p className="font-semibold text-destructive">Заказ отменён</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Статус заказа</h2>
        <span className="text-sm text-muted-foreground">
          ~{deliveryTime} мин доставки
        </span>
      </div>
      <div className="relative h-2 overflow-hidden rounded-full bg-muted">
        <motion.div
          className="absolute inset-y-0 left-0 bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
      <div className="mt-6 flex justify-between">
        {STEPS.filter((s) => s.key !== 'DELIVERED' || status === 'DELIVERED').map((step, i) => {
          const Icon = step.icon;
          const isActive = i <= currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
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
