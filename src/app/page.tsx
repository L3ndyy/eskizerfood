import { Suspense } from 'react';
import { HomeContent } from '@/components/home-content';
import { RestaurantCardSkeleton } from '@/components/restaurant-card-skeleton';

function RestaurantsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="container mx-auto max-w-7xl w-full px-4 py-8">
      <Suspense fallback={<RestaurantsSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
