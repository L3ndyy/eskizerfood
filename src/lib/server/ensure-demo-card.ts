import { prisma } from '@/lib/prisma';

const DEMO_LAST_FOURS = ['4242', '1111', '5678', '9999'];

function randomDemoLastFour() {
  return DEMO_LAST_FOURS[Math.floor(Math.random() * DEMO_LAST_FOURS.length)];
}

export async function ensureDemoCard(userId: string) {
  const count = await prisma.paymentCard.count({ where: { userId } });
  if (count > 0) return;

  await prisma.paymentCard.create({
    data: {
      userId,
      lastFour: randomDemoLastFour(),
      brand: Math.random() > 0.5 ? 'Visa' : 'Mastercard',
      isDefault: true,
    },
  });
}
