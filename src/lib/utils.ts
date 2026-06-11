import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(price);
}

export function normalizePhoneDigits(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('7') || digits.startsWith('8')) {
    return digits.slice(1, 11);
  }
  return digits.slice(0, 10);
}

export function isValidPhone(phone: string): boolean {
  return normalizePhoneDigits(phone).length === 10;
}

export const PHONE_VALIDATION_ERROR =
  'Введите полный номер телефона в формате +7 (999) 999-99-99';
