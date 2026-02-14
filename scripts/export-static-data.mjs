/**
 * Экспорт данных ресторанов для статического деплоя (GitHub Pages).
 * Запуск: node scripts/export-static-data.mjs
 * Требует: сначала npm run db:seed (чтобы были данные), либо мы пишем встроенные данные.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const CATEGORIES = [
  { id: 'cat-pizza', name: 'Пицца', slug: 'pizza' },
  { id: 'cat-sushi', name: 'Суши и роллы', slug: 'sushi' },
  { id: 'cat-burgers', name: 'Бургеры', slug: 'burgers' },
  { id: 'cat-pasta', name: 'Паста', slug: 'pasta' },
  { id: 'cat-salads', name: 'Салаты', slug: 'salads' },
  { id: 'cat-desserts', name: 'Десерты', slug: 'desserts' },
  { id: 'cat-drinks', name: 'Напитки', slug: 'drinks' },
  { id: 'cat-snacks', name: 'Закуски', slug: 'snacks' },
];

const categoryBySlug = Object.fromEntries(CATEGORIES.map((c) => [c.slug, c]));

const RESTAURANTS_DATA = [
  {
    name: 'Додо Пицца',
    slug: 'dodo-pizza',
    description: 'Идеальная пицца с фирменным томатным соусом и моцареллой. Доставка за 30 минут.',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400',
    coverImage: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',
    rating: 4.8,
    reviewCount: 1250,
    deliveryTime: 30,
    minOrder: 500,
    deliveryFee: 99,
    cuisineTypes: ['Пицца', 'Итальянская'],
    address: 'ул. Пушкина, 15',
    dishes: [
      { name: 'Пепперони', slug: 'pepperoni', description: 'Пикантная салями, моцарелла, томатный соус', price: 449, weight: '450 г', categorySlug: 'pizza' },
      { name: 'Маргарита', slug: 'margherita', description: 'Классика: томаты, моцарелла, базилик', price: 399, weight: '400 г', categorySlug: 'pizza' },
      { name: 'Четыре сыра', slug: 'four-cheese', description: 'Моцарелла, пармезан, горгонзола, дор блю', price: 549, weight: '450 г', categorySlug: 'pizza' },
      { name: 'Кола', slug: 'cola', description: 'Coca-Cola 0.5 л', price: 99, weight: '500 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Тануки',
    slug: 'tanuki',
    description: 'Японская кухня: суши, роллы, сашими. Свежие ингредиенты каждый день.',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400',
    coverImage: 'https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',
    rating: 4.7,
    reviewCount: 890,
    deliveryTime: 45,
    minOrder: 600,
    deliveryFee: 149,
    cuisineTypes: ['Суши', 'Японская'],
    address: 'пр. Мира, 42',
    dishes: [
      { name: 'Филадельфия', slug: 'philadelphia', description: 'Лосось, сливочный сыр, огурец', price: 449, weight: '250 г', categorySlug: 'sushi' },
      { name: 'Калифорния', slug: 'california', description: 'Краб, авокадо, огурец, икра', price: 399, weight: '230 г', categorySlug: 'sushi' },
      { name: 'Дракон', slug: 'dragon', description: 'Угорь, огурец, соус унаги', price: 549, weight: '260 г', categorySlug: 'sushi' },
      { name: 'Зелёный чай', slug: 'green-tea', description: 'Японский зелёный чай', price: 99, weight: '300 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Burger King',
    slug: 'burger-king',
    description: 'Легендарные бургеры на огне. Whopper и не только.',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    coverImage: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',
    rating: 4.5,
    reviewCount: 2100,
    deliveryTime: 25,
    minOrder: 400,
    deliveryFee: 79,
    cuisineTypes: ['Бургеры', 'Фастфуд'],
    address: 'ул. Ленина, 8',
    dishes: [
      { name: 'Whopper', slug: 'whopper', description: 'Королевский бургер с говядиной', price: 299, weight: '290 г', categorySlug: 'burgers' },
      { name: 'Чизбургер', slug: 'cheeseburger', description: 'Классика с сыром', price: 149, weight: '150 г', categorySlug: 'burgers' },
      { name: 'Картофель фри', slug: 'fries', description: 'Хрустящий картофель фри', price: 129, weight: '120 г', categorySlug: 'snacks' },
      { name: 'Кола', slug: 'cola-bk', description: 'Coca-Cola 0.5 л', price: 99, weight: '500 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Паста Паста',
    slug: 'pasta-pasta',
    description: 'Итальянская кухня: паста, ризотто, лазанья. Домашние рецепты.',
    image: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400',
    coverImage: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',
    rating: 4.8,
    reviewCount: 534,
    deliveryTime: 35,
    minOrder: 600,
    deliveryFee: 99,
    cuisineTypes: ['Итальянская', 'Паста'],
    address: 'ул. Итальянская, 7',
    dishes: [
      { name: 'Карбонара', slug: 'carbonara', description: 'Спагетти, бекон, яйцо, пармезан', price: 449, weight: '350 г', categorySlug: 'pasta' },
      { name: 'Болоньезе', slug: 'bolognese', description: 'Спагетти с мясным соусом', price: 399, weight: '350 г', categorySlug: 'pasta' },
      { name: 'Тирамису', slug: 'tiramisu', description: 'Классический итальянский десерт', price: 299, weight: '150 г', categorySlug: 'desserts' },
      { name: 'Лимонад', slug: 'limonade', description: 'Домашний лимонад', price: 149, weight: '400 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Sweet Dreams',
    slug: 'sweet-dreams',
    description: 'Десерты, торты и кофе. Сладкое настроение каждый день.',
    image: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400',
    coverImage: 'https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800',
    rating: 4.9,
    reviewCount: 623,
    deliveryTime: 30,
    minOrder: 400,
    deliveryFee: 99,
    cuisineTypes: ['Десерты', 'Кофейня'],
    address: 'ул. Сладкая, 9',
    dishes: [
      { name: 'Торт Наполеон', slug: 'napoleon', description: 'Классический слоёный торт', price: 199, weight: '120 г', categorySlug: 'desserts' },
      { name: 'Чизкейк Нью-Йорк', slug: 'ny-cheesecake', description: 'Нежный сливочный чизкейк', price: 249, weight: '140 г', categorySlug: 'desserts' },
      { name: 'Капучино', slug: 'cappuccino', description: 'Классический капучино', price: 199, weight: '250 мл', categorySlug: 'drinks' },
      { name: 'Латте', slug: 'latte', description: 'Кофе с молоком', price: 219, weight: '300 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Сушивелл',
    slug: 'sushiwok',
    description: 'Суши и роллы на любой вкус. Большие порции, доступные цены.',
    image: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400',
    coverImage: 'https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',
    rating: 4.6,
    reviewCount: 756,
    deliveryTime: 40,
    minOrder: 500,
    deliveryFee: 129,
    cuisineTypes: ['Суши', 'Японская'],
    address: 'ул. Гагарина, 22',
    dishes: [
      { name: 'Ролл Креветка темпура', slug: 'shrimp-tempura', description: 'Хрустящие креветки в темпуре', price: 399, weight: '240 г', categorySlug: 'sushi' },
      { name: 'Сет Закат', slug: 'set-sunset', description: 'Филадельфия, Калифорния, Лосось', price: 999, weight: '400 г', categorySlug: 'sushi' },
      { name: 'Рамен', slug: 'ramen', description: 'Японский лапшачный суп', price: 349, weight: '450 г', categorySlug: 'snacks' },
    ],
  },
  {
    name: 'Пицца Хат',
    slug: 'pizza-hut',
    description: 'Толстое тесто, сочные начинки. Американская пицца с душой.',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400',
    coverImage: 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',
    rating: 4.5,
    reviewCount: 987,
    deliveryTime: 35,
    minOrder: 550,
    deliveryFee: 119,
    cuisineTypes: ['Пицца', 'Американская'],
    address: 'пр. Победы, 55',
    dishes: [
      { name: 'Суприм', slug: 'supreme', description: 'Пепперони, болгарский перец, лук, грибы', price: 549, weight: '500 г', categorySlug: 'pizza' },
      { name: 'BBQ Chicken', slug: 'bbq-chicken', description: 'Курица в соусе BBQ, красный лук', price: 549, weight: '480 г', categorySlug: 'pizza' },
      { name: 'Чесночные гренки', slug: 'garlic-bread', description: 'Хрустящий хлеб с чесноком', price: 199, weight: '180 г', categorySlug: 'snacks' },
    ],
  },
  {
    name: 'Вкусно — и точка',
    slug: 'vkusno-tochka',
    description: 'Бургеры, картофель фри и напитки. Просто и вкусно.',
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400',
    coverImage: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800',
    rating: 4.3,
    reviewCount: 3241,
    deliveryTime: 20,
    minOrder: 350,
    deliveryFee: 69,
    cuisineTypes: ['Бургеры', 'Фастфуд'],
    address: 'ул. Советская, 12',
    dishes: [
      { name: 'Биг Хит', slug: 'big-hit', description: 'Двойная котлета, сыр, салат', price: 249, weight: '280 г', categorySlug: 'burgers' },
      { name: 'Чизбургер делюкс', slug: 'cheeseburger-deluxe', description: 'Котлета, два сыра, маринованные огурцы', price: 199, weight: '220 г', categorySlug: 'burgers' },
      { name: 'Кофе', slug: 'coffee', description: 'Американо или капучино', price: 149, weight: '300 мл', categorySlug: 'drinks' },
    ],
  },
];

function buildRestaurants() {
  return RESTAURANTS_DATA.map((r) => {
    const id = `static-${r.slug}`;
    const dishes = r.dishes.map((d, i) => {
      const cat = categoryBySlug[d.categorySlug];
      const category = cat ?? { id: 'cat-snacks', name: 'Закуски', slug: 'snacks' };
      return {
        id: `static-${r.slug}-${d.slug}`,
        name: d.name,
        slug: d.slug,
        description: d.description,
        price: d.price,
        weight: d.weight,
        image: null,
        categoryId: category.id,
        isAvailable: true,
        sortOrder: i + 1,
        category: { ...category, image: null, sortOrder: i + 1 },
      };
    });
    const now = new Date().toISOString();
    return {
      id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      image: r.image,
      coverImage: r.coverImage ?? r.image,
      rating: r.rating,
      reviewCount: r.reviewCount,
      deliveryTime: r.deliveryTime,
      minOrder: r.minOrder,
      deliveryFee: r.deliveryFee,
      cuisineTypes: r.cuisineTypes,
      address: r.address,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      dishes,
    };
  });
}

const outDir = join(root, 'public', 'data');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, 'restaurants.json');
writeFileSync(outPath, JSON.stringify(buildRestaurants(), null, 2), 'utf8');
console.log('✓ Written', outPath);
