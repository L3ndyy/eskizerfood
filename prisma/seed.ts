import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { createPrismaClient } from '../src/lib/create-prisma-client';
import { categoryImages, categories, restaurantsData } from './seed-data';

const prisma = createPrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✓ Categories created');

  const hashedPassword = await bcrypt.hash('admin123', 12);
  await prisma.user.upsert({
    where: { email: 'admin@food.ru' },
    update: { isAdmin: true },
    create: {
      name: 'Admin',
      email: 'admin@food.ru',
      password: hashedPassword,
      bonusPoints: 500,
      isAdmin: true,
    },
  });
  console.log('✓ Admin user created (admin@food.ru / admin123)');

  const userPassword = await bcrypt.hash('user123', 12);
  const friendPassword = await bcrypt.hash('friend123', 12);
  const testUser = await prisma.user.upsert({
    where: { email: 'user@food.ru' },
    update: {},
    create: {
      name: 'Test User',
      email: 'user@food.ru',
      password: userPassword,
      bonusPoints: 150,
    },
  });
  console.log('✓ Test user created (user@food.ru / user123)');

  await prisma.user.upsert({
    where: { email: 'friend@food.ru' },
    update: {},
    create: {
      name: 'Friend User',
      email: 'friend@food.ru',
      password: friendPassword,
      bonusPoints: 100,
    },
  });
  console.log('✓ Friend user created (friend@food.ru / friend123)');

  const categoryMap = await prisma.category.findMany().then((cats) =>
    Object.fromEntries(cats.map((c) => [c.slug, c.id]))
  );

  for (const rest of restaurantsData) {
    const restaurant = await prisma.restaurant.upsert({
      where: { slug: rest.slug },
      update: {},
      create: {
        name: rest.name,
        slug: rest.slug,
        description: rest.description,
        image: rest.image,
        coverImage: rest.coverImage,
        rating: rest.rating,
        reviewCount: rest.reviewCount,
        deliveryTime: rest.deliveryTime,
        minOrder: rest.minOrder,
        deliveryFee: rest.deliveryFee,
        cuisineTypes: JSON.stringify(rest.cuisineTypes),
        address: rest.address,
      },
    });

    for (let i = 0; i < rest.dishes.length; i++) {
      const d = rest.dishes[i];
      const categoryId = categoryMap[d.categorySlug];
      if (!categoryId) continue;

      const dishImage = categoryImages[d.categorySlug] ?? null;
      await prisma.dish.upsert({
        where: {
          restaurantId_slug: { restaurantId: restaurant.id, slug: d.slug },
        },
        update: { image: dishImage },
        create: {
          name: d.name,
          slug: d.slug,
          description: d.description,
          price: d.price,
          weight: d.weight,
          image: dishImage,
          categoryId,
          restaurantId: restaurant.id,
          sortOrder: i + 1,
        },
      });
    }
  }
  console.log('✓ Restaurants and dishes created');

  const restaurants = await prisma.restaurant.findMany({ take: 3 });
  for (const r of restaurants) {
    await prisma.favorite.upsert({
      where: {
        userId_restaurantId: { userId: testUser.id, restaurantId: r.id },
      },
      update: {},
      create: { userId: testUser.id, restaurantId: r.id },
    });
  }
  console.log('✓ Favorites created');

  await prisma.siteBanner.deleteMany();
  await prisma.siteBanner.createMany({
    data: [
      {
        title: 'Групповой заказ',
        subtitle: 'Соберите команду и закажите вместе',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200',
        link: '/group-order',
        sortOrder: 0,
      },
      {
        title: 'Бесплатная доставка',
        subtitle: 'При заказе от 1500 ₽',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200',
        link: '/',
        sortOrder: 1,
      },
    ],
  });
  console.log('✓ Banners created');

  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
