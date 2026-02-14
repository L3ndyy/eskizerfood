import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const url = process.env.DATABASE_URL || 'file:./dev.db';
const adapter = new PrismaBetterSqlite3({ url });
const prisma = new PrismaClient({ adapter });

// picsum.photos - reliable placeholder images by category
const categoryImages: Record<string, string> = {
  pizza: 'https://picsum.photos/seed/pizza/200/200',
  sushi: 'https://picsum.photos/seed/sushi/200/200',
  burgers: 'https://picsum.photos/seed/burgers/200/200',
  pasta: 'https://picsum.photos/seed/pasta/200/200',
  salads: 'https://picsum.photos/seed/salads/200/200',
  desserts: 'https://picsum.photos/seed/desserts/200/200',
  drinks: 'https://picsum.photos/seed/drinks/200/200',
  snacks: 'https://picsum.photos/seed/snacks/200/200',
};

const categories = [
  { name: 'Пицца', slug: 'pizza', sortOrder: 1 },
  { name: 'Суши и роллы', slug: 'sushi', sortOrder: 2 },
  { name: 'Бургеры', slug: 'burgers', sortOrder: 3 },
  { name: 'Паста', slug: 'pasta', sortOrder: 4 },
  { name: 'Салаты', slug: 'salads', sortOrder: 5 },
  { name: 'Десерты', slug: 'desserts', sortOrder: 6 },
  { name: 'Напитки', slug: 'drinks', sortOrder: 7 },
  { name: 'Закуски', slug: 'snacks', sortOrder: 8 },
];

const restaurantsData = [
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
      { name: 'Гавайская', slug: 'hawaiian', description: 'Ветчина, ананасы, моцарелла', price: 449, weight: '430 г', categorySlug: 'pizza' },
      { name: 'Мясная', slug: 'meat', description: 'Пепперони, бекон, охотничьи колбаски, курица', price: 599, weight: '520 г', categorySlug: 'pizza' },
      { name: 'Овощная', slug: 'vegetable', description: 'Перец, грибы, томаты, оливки, моцарелла', price: 399, weight: '420 г', categorySlug: 'pizza' },
      { name: 'Кола', slug: 'cola', description: 'Coca-Cola 0.5 л', price: 99, weight: '500 мл', categorySlug: 'drinks' },
      { name: 'Сырные палочки', slug: 'cheese-sticks', description: 'Хрустящие палочки с сыром', price: 249, weight: '200 г', categorySlug: 'snacks' },
      { name: 'Чизкейк', slug: 'cheesecake', description: 'Классический нью-йоркский чизкейк', price: 199, weight: '120 г', categorySlug: 'desserts' },
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
      { name: 'Сашими лосось', slug: 'sashimi-salmon', description: '6 кусочков свежего лосося', price: 599, weight: '100 г', categorySlug: 'sushi' },
      { name: 'Сет Тануки', slug: 'set-tanuki', description: '12 роллов: Филадельфия, Калифорния, Дракон', price: 1299, weight: '450 г', categorySlug: 'sushi' },
      { name: 'Мисо суп', slug: 'miso-soup', description: 'Традиционный японский суп', price: 149, weight: '300 мл', categorySlug: 'snacks' },
      { name: 'Эдемамэ', slug: 'edamame', description: 'Отварные соевые бобы с солью', price: 199, weight: '200 г', categorySlug: 'snacks' },
      { name: 'Моти', slug: 'mochi', description: 'Японские рисовые десерты 3 шт', price: 249, weight: '90 г', categorySlug: 'desserts' },
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
      { name: 'Двойной Whopper', slug: 'double-whopper', description: 'Две котлеты, двойной вкус', price: 399, weight: '400 г', categorySlug: 'burgers' },
      { name: 'Чизбургер', slug: 'cheeseburger', description: 'Классика с сыром', price: 149, weight: '150 г', categorySlug: 'burgers' },
      { name: 'Картофель фри', slug: 'fries', description: 'Хрустящий картофель фри', price: 129, weight: '120 г', categorySlug: 'snacks' },
      { name: 'Наггетсы', slug: 'nuggets', description: 'Куриные наггетсы 6 шт', price: 199, weight: '150 г', categorySlug: 'snacks' },
      { name: 'Салат Цезарь', slug: 'caesar-salad', description: 'Курица, салат, соус цезарь', price: 249, weight: '250 г', categorySlug: 'salads' },
      { name: 'Молочный коктейль', slug: 'milkshake', description: 'Ваниль, шоколад или клубника', price: 199, weight: '400 мл', categorySlug: 'drinks' },
      { name: 'Кола', slug: 'cola-bk', description: 'Coca-Cola 0.5 л', price: 99, weight: '500 мл', categorySlug: 'drinks' },
      { name: 'Мороженое', slug: 'ice-cream', description: 'Ванильное мороженое', price: 79, weight: '100 г', categorySlug: 'desserts' },
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
      { name: 'Ролл Лосось терияки', slug: 'salmon-teriyaki', description: 'Лосось в соусе терияки', price: 449, weight: '250 г', categorySlug: 'sushi' },
      { name: 'Запечённый ролл', slug: 'baked-roll', description: 'Краб, лосось, сыр под соусом', price: 499, weight: '280 г', categorySlug: 'sushi' },
      { name: 'Овощной ролл', slug: 'vegetable-roll', description: 'Огурец, авокадо, перец', price: 299, weight: '200 г', categorySlug: 'sushi' },
      { name: 'Сет Закат', slug: 'set-sunset', description: 'Филадельфия, Калифорния, Лосось', price: 999, weight: '400 г', categorySlug: 'sushi' },
      { name: 'Васаби', slug: 'wasabi', description: 'Японская горчица', price: 29, weight: '15 г', categorySlug: 'snacks' },
      { name: 'Имбирный маринад', slug: 'ginger', description: 'Маринованный имбирь', price: 29, weight: '30 г', categorySlug: 'snacks' },
      { name: 'Рамен', slug: 'ramen', description: 'Японский лапшачный суп', price: 349, weight: '450 г', categorySlug: 'snacks' },
      { name: 'Сакамэ', slug: 'sake', description: 'Японское сакэ', price: 299, weight: '180 мл', categorySlug: 'drinks' },
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
      { name: 'Песто', slug: 'pesto', description: 'Паста с соусом песто и креветками', price: 499, weight: '350 г', categorySlug: 'pasta' },
      { name: 'Лазанья', slug: 'lasagna', description: 'Классическая лазанья с говядиной', price: 449, weight: '400 г', categorySlug: 'pasta' },
      { name: 'Ризотто с грибами', slug: 'risotto-mushrooms', description: 'Кремовое ризотто с белыми грибами', price: 399, weight: '350 г', categorySlug: 'pasta' },
      { name: 'Салат Капрезе', slug: 'caprese', description: 'Моцарелла, томаты, базилик', price: 349, weight: '250 г', categorySlug: 'salads' },
      { name: 'Брускетта', slug: 'bruschetta', description: 'Хлеб с томатами и базиликом', price: 249, weight: '150 г', categorySlug: 'snacks' },
      { name: 'Тирамису', slug: 'tiramisu', description: 'Классический итальянский десерт', price: 299, weight: '150 г', categorySlug: 'desserts' },
      { name: 'Лимонад', slug: 'limonade', description: 'Домашний лимонад', price: 149, weight: '400 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Шаурма №1',
    slug: 'shawarma-1',
    description: 'Лучшая шаурма в городе. Свежие ингредиенты, большие порции.',
    image: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400',
    coverImage: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',
    rating: 4.4,
    reviewCount: 1823,
    deliveryTime: 20,
    minOrder: 300,
    deliveryFee: 59,
    cuisineTypes: ['Шаурма', 'Уличная еда'],
    address: 'пл. Центральная, 3',
    dishes: [
      { name: 'Шаурма классическая', slug: 'shawarma-classic', description: 'Курица, овощи, соус', price: 249, weight: '350 г', categorySlug: 'burgers' },
      { name: 'Шаурма с говядиной', slug: 'shawarma-beef', description: 'Говядина, овощи, соус', price: 299, weight: '380 г', categorySlug: 'burgers' },
      { name: 'Двойная шаурма', slug: 'double-shawarma', description: 'Двойная порция мяса', price: 399, weight: '500 г', categorySlug: 'burgers' },
      { name: 'Фалафель', slug: 'falafel', description: 'Шарики из нута 6 шт', price: 199, weight: '200 г', categorySlug: 'snacks' },
      { name: 'Хумус', slug: 'hummus', description: 'Нутовая паста с лепёшкой', price: 149, weight: '200 г', categorySlug: 'snacks' },
      { name: 'Свежий салат', slug: 'fresh-salad', description: 'Овощи с оливковым маслом', price: 149, weight: '250 г', categorySlug: 'salads' },
      { name: 'Айран', slug: 'ayran', description: 'Традиционный кисломолочный напиток', price: 79, weight: '400 мл', categorySlug: 'drinks' },
      { name: 'Чай', slug: 'tea', description: 'Чёрный или зелёный чай', price: 49, weight: '300 мл', categorySlug: 'drinks' },
      { name: 'Пахлава', slug: 'baklava', description: 'Восточная сладость', price: 149, weight: '100 г', categorySlug: 'desserts' },
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
      { name: 'Вегетарианская', slug: 'vegetarian', description: 'Перец, грибы, томаты, оливки, шпинат', price: 449, weight: '450 г', categorySlug: 'pizza' },
      { name: 'Барбекю', slug: 'bbq', description: 'Свинина, соус барбекю, красный лук', price: 499, weight: '460 г', categorySlug: 'pizza' },
      { name: 'Чесночные гренки', slug: 'garlic-bread', description: 'Хрустящий хлеб с чесноком', price: 199, weight: '180 г', categorySlug: 'snacks' },
      { name: 'Крылышки Buffalo', slug: 'buffalo-wings', description: 'Куриные крылышки в остром соусе', price: 399, weight: '350 г', categorySlug: 'snacks' },
      { name: 'Салат с курицей', slug: 'chicken-salad', description: 'Курица гриль, микс салата', price: 299, weight: '300 г', categorySlug: 'salads' },
      { name: 'Брауни', slug: 'brownie', description: 'Шоколадный брауни с мороженым', price: 249, weight: '150 г', categorySlug: 'desserts' },
      { name: 'Пепси', slug: 'pepsi', description: 'Pepsi 0.5 л', price: 99, weight: '500 мл', categorySlug: 'drinks' },
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
      { name: 'Гамбургер', slug: 'hamburger', description: 'Классический гамбургер', price: 129, weight: '160 г', categorySlug: 'burgers' },
      { name: 'Картофель по-деревенски', slug: 'country-fries', description: 'С хрустящей корочкой', price: 149, weight: '150 г', categorySlug: 'snacks' },
      { name: 'Страпсы', slug: 'straps', description: 'Куриные полоски в панировке', price: 179, weight: '130 г', categorySlug: 'snacks' },
      { name: 'Овощной салат', slug: 'veggie-salad', description: 'Свежие овощи', price: 129, weight: '200 г', categorySlug: 'salads' },
      { name: 'Мороженое пломбир', slug: 'ice-cream-plombir', description: 'Классический пломбир', price: 89, weight: '80 г', categorySlug: 'desserts' },
      { name: 'Кофе', slug: 'coffee', description: 'Американо или капучино', price: 149, weight: '300 мл', categorySlug: 'drinks' },
      { name: 'Сок', slug: 'juice', description: 'Апельсиновый или яблочный', price: 119, weight: '400 мл', categorySlug: 'drinks' },
    ],
  },
  {
    name: 'Кореана',
    slug: 'koreana',
    description: 'Корейская кухня: бибимпап, кимчи, корейские блины.',
    image: 'https://images.unsplash.com/photo-1582878826629-29b7ad1d39a0?w=400',
    coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',
    rating: 4.7,
    reviewCount: 412,
    deliveryTime: 40,
    minOrder: 550,
    deliveryFee: 129,
    cuisineTypes: ['Корейская', 'Азиатская'],
    address: 'ул. Азиатская, 18',
    dishes: [
      { name: 'Бибимпап', slug: 'bibimbap', description: 'Рис, овощи, яйцо, говядина, кочхучжан', price: 449, weight: '400 г', categorySlug: 'pasta' },
      { name: 'Булгоги', slug: 'bulgogi', description: 'Маринованная говядина на гриле', price: 549, weight: '300 г', categorySlug: 'pasta' },
      { name: 'Кимчи', slug: 'kimchi', description: 'Острое квашеное kimchi', price: 199, weight: '200 г', categorySlug: 'snacks' },
      { name: 'Корейские блины', slug: 'korean-pancakes', description: 'Блины с зелёным луком и морепродуктами', price: 349, weight: '250 г', categorySlug: 'snacks' },
      { name: 'Ттеокбокки', slug: 'tteokbokki', description: 'Рисовые палочки в остром соусе', price: 299, weight: '300 г', categorySlug: 'snacks' },
      { name: 'Салат с ростбифом', slug: 'beef-salad', description: 'Ростбиф, руккола, соус', price: 399, weight: '280 г', categorySlug: 'salads' },
      { name: 'Патбинсу', slug: 'patbingsu', description: 'Корейский десерт с красной фасолью', price: 299, weight: '350 г', categorySlug: 'desserts' },
      { name: 'Корейский чай', slug: 'korean-tea', description: 'Традиционный barley tea', price: 99, weight: '400 мл', categorySlug: 'drinks' },
      { name: 'Соджу', slug: 'soju', description: 'Корейская рисовая водка', price: 249, weight: '360 мл', categorySlug: 'drinks' },
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
      { name: 'Эклер', slug: 'eclair', description: 'Заварное пирожное с кремом', price: 149, weight: '80 г', categorySlug: 'desserts' },
      { name: 'Макарон', slug: 'macaron', description: 'Французское печенье 3 шт', price: 249, weight: '60 г', categorySlug: 'desserts' },
      { name: 'Круассан', slug: 'croissant', description: 'Свежий французский круассан', price: 129, weight: '70 г', categorySlug: 'desserts' },
      { name: 'Капучино', slug: 'cappuccino', description: 'Классический капучино', price: 199, weight: '250 мл', categorySlug: 'drinks' },
      { name: 'Латте', slug: 'latte', description: 'Кофе с молоком', price: 219, weight: '300 мл', categorySlug: 'drinks' },
      { name: 'Горячий шоколад', slug: 'hot-chocolate', description: 'Густой горячий шоколад', price: 199, weight: '300 мл', categorySlug: 'drinks' },
      { name: 'Сэндвич', slug: 'sandwich', description: 'Клубника, сливки, бриошь', price: 279, weight: '200 г', categorySlug: 'snacks' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log('✓ Categories created');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.upsert({
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

  // Create test user
  const userPassword = await bcrypt.hash('user123', 12);
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

  // Create restaurants and dishes
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

  // Add some favorites for test user
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
