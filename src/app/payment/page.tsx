'use client';

import { Suspense } from 'react';
import PaymentContent from './payment-content';

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex max-w-2xl items-center justify-center px-4 py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
