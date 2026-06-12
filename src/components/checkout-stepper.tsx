import Link from 'next/link';
import { cn } from '@/lib/utils';

const STEPS = [
  { label: 'Корзина', href: '/cart' },
  { label: 'Адрес', href: '/checkout' },
  { label: 'Оплата', href: '/payment' },
  { label: 'Готово', href: null },
] as const;

export function CheckoutStepper({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <ol className="mb-8 flex flex-wrap items-center gap-2 text-sm">
      {STEPS.map((step, index) => (
        <li key={step.label} className="flex items-center gap-2">
          {index > 0 && <span className="text-muted-foreground">→</span>}
          {step.href && index <= current ? (
            <Link
              href={step.href}
              className={cn(
                'rounded-full px-3 py-1 transition-colors',
                index === current
                  ? 'bg-primary text-primary-foreground'
                  : index < current
                    ? 'bg-muted text-foreground hover:bg-muted/80'
                    : 'text-muted-foreground'
              )}
            >
              {step.label}
            </Link>
          ) : (
            <span
              className={cn(
                'rounded-full px-3 py-1',
                index === current
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              )}
            >
              {step.label}
            </span>
          )}
        </li>
      ))}
    </ol>
  );
}
