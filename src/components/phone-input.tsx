'use client';

import { Input } from '@/components/ui/input';

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  const d = digits.startsWith('7') ? digits.slice(1) : digits;
  let result = '+7';
  if (d.length > 0) result += ` (${d.slice(0, 3)}`;
  if (d.length >= 3) result += `) ${d.slice(3, 6)}`;
  if (d.length >= 6) result += `-${d.slice(6, 8)}`;
  if (d.length >= 8) result += `-${d.slice(8, 10)}`;
  return result;
}

export interface PhoneInputProps
  extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export function PhoneInput({ value, onChange, ...props }: PhoneInputProps) {
  return (
    <Input
      type="tel"
      {...props}
      value={value}
      onChange={(e) => onChange(formatPhone(e.target.value))}
      placeholder="+7 (999) 999-99-99"
      maxLength={18}
    />
  );
}
