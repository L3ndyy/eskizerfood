'use client';

import { motion } from 'framer-motion';

export function RestaurantCardSkeleton({ index = 0 }: { index?: number }) {
  return (
    <motion.div
      className="overflow-hidden rounded-2xl border border-border bg-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <div className="aspect-[16/10] animate-shimmer bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-2/3 animate-shimmer rounded bg-muted" />
        <div className="h-4 w-full animate-shimmer rounded bg-muted" />
        <div className="h-4 w-1/2 animate-shimmer rounded bg-muted" />
        <div className="flex justify-between gap-2">
          <div className="h-4 w-20 animate-shimmer rounded bg-muted" />
          <div className="h-4 w-24 animate-shimmer rounded bg-muted" />
        </div>
      </div>
    </motion.div>
  );
}
