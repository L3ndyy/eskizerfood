'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { redirect } from 'next/navigation';
const registerSchema = z.object({
  name: z.string().min(2, 'Имя должно быть не менее 2 символов'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export async function register(formData: FormData) {
  const parsed = registerSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const { name, email, password } = parsed.data;
  const callbackUrl = formData.get('callbackUrl');
  const safeCallbackUrl =
    typeof callbackUrl === 'string' && callbackUrl.startsWith('/') && !callbackUrl.startsWith('//')
      ? callbackUrl
      : '/';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: { email: ['Пользователь с таким email уже существует'] } };
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { name, email, password: hashedPassword, bonusPoints: 100 },
  });

  redirect(
    `/auth/signin?registered=1&email=${encodeURIComponent(email)}&callbackUrl=${encodeURIComponent(safeCallbackUrl)}`
  );
}
