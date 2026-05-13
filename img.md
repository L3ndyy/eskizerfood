# img.md — структура картинок (кастомные фото + fallback)

Цель: чтобы ты мог **сам подставлять свои фотки**, и при этом:

- если кастомной фотки **нет** — всё остаётся **как сейчас**
- если ты **добавил** фотку в нужную папку/с нужным именем — она **заменит** дефолт

Проект использует папку `public/` (Next.js). Всё, что лежит в `public`, доступно по URL вида:

- файл `public/images/custom/dishes/pizza.webp` будет доступен как `/images/custom/dishes/pizza.webp`

---

## 0) Готовые папки уже созданы

Я уже создал все нужные папки (в git они “держатся” файлами `.gitkeep`), тебе осталось только **закинуть изображения**.

Дерево:

```
public/
  images/
    custom/
      restaurants/
        dodo-pizza/
        tanuki/
        burger-king/
        sushiwok/
        pasta-pasta/
        shawarma-1/
        pizza-hut/
        vkusno-tochka/
        koreana/
        sweet-dreams/
      dishes/
        pizza/
        sushi/
        burgers/
        pasta/
        salads/
        desserts/
        drinks/
        snacks/
```

---

## 1) Главные правила

### 1.1 Какие расширения поддерживаются
Для всех кастомных картинок можно использовать **любое из**:

- `.webp` (лучше всего)
- `.png`
- `.jpg`
- `.jpeg`

Если ты положишь несколько форматов — будет выбран первый по приоритету:
\(.webp → .png → .jpg → .jpeg\)

### 1.2 Названия (важно)
Имена файлов должны совпадать **с тем, что ожидает система** (см. ниже).
Все имена — **латиница**, без пробелов (используй `-`).

### 1.3 Приоритет (как выбирается картинка)
- **Сначала** ищем твою картинку в нужной папке `public/images/custom/...`
- Если не нашли — показываем **как сейчас** (URL из базы)
- Если у блюда в базе картинки нет — остаётся текущий **плейсхолдер-эмодзи**

---

## 2) Рестораны

### 2.1 Картинка ресторана в карточке (главная страница)
Где показывается: список ресторанов (карточки).

Файл (путь в проекте):

- `public/images/custom/restaurants/<restaurant-slug>/card.webp`

URL:

- `/images/custom/restaurants/<restaurant-slug>/card.webp`

Примеры:

- `public/images/custom/restaurants/dodo-pizza/card.webp`
- `public/images/custom/restaurants/burger-king/card.jpg`

Если файла нет — используется то, что уже хранится в базе (сейчас это ссылки на Unsplash).

### 2.2 Обложка ресторана (верх баннер на странице ресторана)
Где показывается: страница ресторана `/restaurant/<slug>` — большой баннер сверху.

Файл:

- `public/images/custom/restaurants/<restaurant-slug>/cover.webp`

Примеры:

- `public/images/custom/restaurants/dodo-pizza/cover.webp`
- `public/images/custom/restaurants/tanuki/cover.png`

Если файла нет — остаётся как сейчас (`coverImage` из базы, или `image`).

---

## 3) Блюда

Где показывается: меню ресторана + избранное.

### 3.1 Рекомендуемая структура “по отделам (категориям)”
Так тебе удобнее: открываешь нужный “отдел” (pizza/sushi/…) и кидаешь туда фотки.

Папка:

- `public/images/custom/dishes/<category-slug>/`

Файл:

- `public/images/custom/dishes/<category-slug>/<dish-slug>.webp`

Примеры:

- `public/images/custom/dishes/pizza/pepperoni.webp`
- `public/images/custom/dishes/sushi/philadelphia.jpg`
- `public/images/custom/dishes/drinks/cola.png`

Если файла нет — включится fallback (см. ниже).

### 3.2 Старый формат (поддерживается тоже)
Если тебе проще без папок — можно как раньше:

- `public/images/custom/dishes/<dish-slug>.webp`

URL:

- `/images/custom/dishes/<dish-slug>.webp`

Примеры:

- `public/images/custom/dishes/pepperoni.webp`
- `public/images/custom/dishes/philadelphia.jpg`
- `public/images/custom/dishes/cola.png`

Если файла нет — остаётся как сейчас:

- если у блюда уже есть `image` в базе — будет она
- если `image` нет — показывается текущий плейсхолдер (эмодзи по категории)

---

## 4) Где взять `<restaurant-slug>` и `<dish-slug>`

### Restaurant slug
Это `slug` ресторана (например `dodo-pizza`, `burger-king`).

- видно в URL: `/restaurant/dodo-pizza`

### Dish slug
Это `slug` блюда (например `pepperoni`, `philadelphia`).

- тоже используется в данных/в URL (где применимо)

---

## 5) Быстрый чек-лист “я добавил фотку — она должна замениться”

- Файл лежит именно в `public/images/custom/...`
- Имя папки ресторана = **slug** ресторана
- Имя файла = строго `card` или `cover` (для ресторана) / `dish-slug` (для блюда)
- Расширение одно из: `.webp/.png/.jpg/.jpeg`
- Перезапусти dev-сервер (иногда Next кеширует статику):
  - `npm run dev` заново

---

## 6) “Шпаргалка” — все отделы и все блюда (копируй slug и называй файл)

Ниже список из `prisma/seed.ts`. **Тебе нужен только `dish-slug`** (имя файла) и **папка категории** (отдел).

### Отделы (category-slug)
- `pizza` — Пицца
- `sushi` — Суши и роллы
- `burgers` — Бургеры
- `pasta` — Паста
- `salads` — Салаты
- `desserts` — Десерты
- `drinks` — Напитки
- `snacks` — Закуски

### pizza (Пицца)
- Пепперони → `pepperoni`
- Маргарита → `margherita`
- Четыре сыра → `four-cheese`
- Гавайская → `hawaiian`
- Мясная → `meat`
- Овощная → `vegetable`
- Суприм → `supreme`
- BBQ Chicken → `bbq-chicken`
- Вегетарианская → `vegetarian`
- Барбекю → `bbq`

### sushi (Суши и роллы)
- Филадельфия → `philadelphia`
- Калифорния → `california`
- Дракон → `dragon`
- Сашими лосось → `sashimi-salmon`
- Сет Тануки → `set-tanuki`
- Ролл Креветка темпура → `shrimp-tempura`
- Ролл Лосось терияки → `salmon-teriyaki`
- Запечённый ролл → `baked-roll`
- Овощной ролл → `vegetable-roll`
- Сет Закат → `set-sunset`

### burgers (Бургеры)
- Whopper → `whopper`
- Двойной Whopper → `double-whopper`
- Чизбургер → `cheeseburger`
- Шаурма классическая → `shawarma-classic`
- Шаурма с говядиной → `shawarma-beef`
- Двойная шаурма → `double-shawarma`
- Биг Хит → `big-hit`
- Чизбургер делюкс → `cheeseburger-deluxe`
- Гамбургер → `hamburger`

### pasta (Паста)
- Карбонара → `carbonara`
- Болоньезе → `bolognese`
- Песто → `pesto`
- Лазанья → `lasagna`
- Ризотто с грибами → `risotto-mushrooms`
- Бибимпап → `bibimbap`
- Булгоги → `bulgogi`

### salads (Салаты)
- Салат Цезарь → `caesar-salad`
- Салат Капрезе → `caprese`
- Свежий салат → `fresh-salad`
- Салат с курицей → `chicken-salad`
- Овощной салат → `veggie-salad`
- Салат с ростбифом → `beef-salad`

### desserts (Десерты)
- Чизкейк → `cheesecake`
- Моти → `mochi`
- Мороженое → `ice-cream`
- Тирамису → `tiramisu`
- Пахлава → `baklava`
- Брауни → `brownie`
- Мороженое пломбир → `ice-cream-plombir`
- Патбинсу → `patbingsu`
- Торт Наполеон → `napoleon`
- Чизкейк Нью-Йорк → `ny-cheesecake`
- Эклер → `eclair`
- Макарон → `macaron`
- Круассан → `croissant`

### drinks (Напитки)
- Кола → `cola`
- Зелёный чай → `green-tea`
- Молочный коктейль → `milkshake`
- Кола → `cola-bk`
- Сакамэ → `sake`
- Лимонад → `limonade`
- Айран → `ayran`
- Чай → `tea`
- Пепси → `pepsi`
- Кофе → `coffee`
- Сок → `juice`
- Корейский чай → `korean-tea`
- Соджу → `soju`
- Капучино → `cappuccino`
- Латте → `latte`
- Горячий шоколад → `hot-chocolate`

### snacks (Закуски)
- Сырные палочки → `cheese-sticks`
- Мисо суп → `miso-soup`
- Эдемамэ → `edamame`
- Картофель фри → `fries`
- Наггетсы → `nuggets`
- Васаби → `wasabi`
- Имбирный маринад → `ginger`
- Рамен → `ramen`
- Брускетта → `bruschetta`
- Фалафель → `falafel`
- Хумус → `hummus`
- Чесночные гренки → `garlic-bread`
- Крылышки Buffalo → `buffalo-wings`
- Картофель по-деревенски → `country-fries`
- Страпсы → `straps`
- Кимчи → `kimchi`
- Корейские блины → `korean-pancakes`
- Ттеокбокки → `tteokbokki`
- Сэндвич → `sandwich`

---

## 7) Примеры “что куда кидать” (самые частые)

### Пример 1 — Пепперони (пицца)
Кидаешь файл:

- `public/images/custom/dishes/pizza/pepperoni.webp`

### Пример 2 — Кола (напитки)
Кидаешь файл:

- `public/images/custom/dishes/drinks/cola.png`

### Пример 3 — обложка ресторана Додо Пицца
Кидаешь файл:

- `public/images/custom/restaurants/dodo-pizza/cover.jpg`

### Пример 4 — картинка ресторана в карточке (Burger King)
Кидаешь файл:

- `public/images/custom/restaurants/burger-king/card.webp`


