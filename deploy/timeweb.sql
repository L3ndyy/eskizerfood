-- FoodExpress — полная установка БД для Timeweb MySQL 8.0
-- phpMyAdmin: выберите вашу базу → SQL → вставьте ВСЁ → Выполнить

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `Favorite`;
DROP TABLE IF EXISTS `OrderItem`;
DROP TABLE IF EXISTS `Order`;
DROP TABLE IF EXISTS `Dish`;
DROP TABLE IF EXISTS `Category`;
DROP TABLE IF EXISTS `Restaurant`;
DROP TABLE IF EXISTS `SupportMessage`;
DROP TABLE IF EXISTS `SupportConversation`;
DROP TABLE IF EXISTS `UserAddress`;
DROP TABLE IF EXISTS `PaymentCard`;
DROP TABLE IF EXISTS `Session`;
DROP TABLE IF EXISTS `Account`;
DROP TABLE IF EXISTS `VerificationToken`;
DROP TABLE IF EXISTS `User`;
SET FOREIGN_KEY_CHECKS = 1;

-- CreateTable
CREATE TABLE `Account` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token` TEXT NULL,
    `access_token` TEXT NULL,
    `expires_at` INTEGER NULL,
    `token_type` VARCHAR(191) NULL,
    `scope` VARCHAR(191) NULL,
    `id_token` TEXT NULL,
    `session_state` VARCHAR(191) NULL,

    UNIQUE INDEX `Account_provider_providerAccountId_key`(`provider`, `providerAccountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(191) NOT NULL,
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Session_sessionToken_key`(`sessionToken`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `emailVerified` DATETIME(3) NULL,
    `image` VARCHAR(191) NULL,
    `password` VARCHAR(191) NULL,
    `bonusPoints` INTEGER NOT NULL DEFAULT 0,
    `isAdmin` BOOLEAN NOT NULL DEFAULT false,
    `phone` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportConversation` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SupportConversation_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportMessage` (
    `id` VARCHAR(191) NOT NULL,
    `conversationId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `isFromAdmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SupportMessage_conversationId_idx`(`conversationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentCard` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `lastFour` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentCard_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserAddress` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserAddress_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VerificationToken_token_key`(`token`),
    UNIQUE INDEX `VerificationToken_identifier_token_key`(`identifier`, `token`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Restaurant` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `image` VARCHAR(191) NOT NULL,
    `coverImage` VARCHAR(191) NULL,
    `rating` DOUBLE NOT NULL DEFAULT 0,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `deliveryTime` INTEGER NOT NULL,
    `minOrder` INTEGER NOT NULL DEFAULT 0,
    `deliveryFee` INTEGER NOT NULL DEFAULT 0,
    `cuisineTypes` TEXT NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Restaurant_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `Category_name_key`(`name`),
    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dish` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` INTEGER NOT NULL,
    `image` VARCHAR(191) NULL,
    `weight` VARCHAR(191) NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Dish_restaurantId_idx`(`restaurantId`),
    INDEX `Dish_categoryId_idx`(`categoryId`),
    UNIQUE INDEX `Dish_restaurantId_slug_key`(`restaurantId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `total` INTEGER NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `comment` TEXT NULL,
    `deliveryTime` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderItem` (
    `id` VARCHAR(191) NOT NULL,
    `orderId` VARCHAR(191) NOT NULL,
    `dishId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` INTEGER NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Favorite` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `restaurantId` VARCHAR(191) NOT NULL,

    INDEX `Favorite_userId_idx`(`userId`),
    UNIQUE INDEX `Favorite_userId_restaurantId_key`(`userId`, `restaurantId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Account` ADD CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportConversation` ADD CONSTRAINT `SupportConversation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupportMessage` ADD CONSTRAINT `SupportMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `SupportConversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PaymentCard` ADD CONSTRAINT `PaymentCard_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserAddress` ADD CONSTRAINT `UserAddress_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dish` ADD CONSTRAINT `Dish_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_dishId_fkey` FOREIGN KEY (`dishId`) REFERENCES `Dish`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Favorite` ADD CONSTRAINT `Favorite_restaurantId_fkey` FOREIGN KEY (`restaurantId`) REFERENCES `Restaurant`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- === Данные ===

INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_pizza','Пицца','pizza','https://picsum.photos/seed/pizza/200/200',1);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_sushi','Суши и роллы','sushi','https://picsum.photos/seed/sushi/200/200',2);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_burgers','Бургеры','burgers','https://picsum.photos/seed/burgers/200/200',3);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_pasta','Паста','pasta','https://picsum.photos/seed/pasta/200/200',4);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_salads','Салаты','salads','https://picsum.photos/seed/salads/200/200',5);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_desserts','Десерты','desserts','https://picsum.photos/seed/desserts/200/200',6);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_drinks','Напитки','drinks','https://picsum.photos/seed/drinks/200/200',7);
INSERT INTO `Category` (`id`,`name`,`slug`,`image`,`sortOrder`) VALUES ('cat_snacks','Закуски','snacks','https://picsum.photos/seed/snacks/200/200',8);
INSERT INTO `User` (`id`,`name`,`email`,`password`,`bonusPoints`,`isAdmin`,`createdAt`,`updatedAt`) VALUES ('user_admin','Admin','admin@food.ru','$2b$12$AmHSW.YbA1UXcN5l.lLeL.JzeuU.Fi8v6bdNAhpgiQcTOwLW9JjDC',500,1,NOW(3),NOW(3)),('user_test','Test User','user@food.ru','$2b$12$96pHvCc.Y3y/BbpGotXMlu0vZqohItARG3QyxF1lqXJ3wY1OP1Qgm',150,0,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_dodo-pizza','Додо Пицца','dodo-pizza','Идеальная пицца с фирменным томатным соусом и моцареллой. Доставка за 30 минут.','https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800',4.8,1250,30,500,99,'["Пицца","Итальянская"]','ул. Пушкина, 15',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_1','Пепперони','pepperoni','Пикантная салями, моцарелла, томатный соус',449,'https://picsum.photos/seed/pizza/200/200','450 г','cat_pizza','rest_dodo-pizza',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_2','Маргарита','margherita','Классика: томаты, моцарелла, базилик',399,'https://picsum.photos/seed/pizza/200/200','400 г','cat_pizza','rest_dodo-pizza',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_3','Четыре сыра','four-cheese','Моцарелла, пармезан, горгонзола, дор блю',549,'https://picsum.photos/seed/pizza/200/200','450 г','cat_pizza','rest_dodo-pizza',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_4','Гавайская','hawaiian','Ветчина, ананасы, моцарелла',449,'https://picsum.photos/seed/pizza/200/200','430 г','cat_pizza','rest_dodo-pizza',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_5','Мясная','meat','Пепперони, бекон, охотничьи колбаски, курица',599,'https://picsum.photos/seed/pizza/200/200','520 г','cat_pizza','rest_dodo-pizza',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_6','Овощная','vegetable','Перец, грибы, томаты, оливки, моцарелла',399,'https://picsum.photos/seed/pizza/200/200','420 г','cat_pizza','rest_dodo-pizza',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_7','Кола','cola','Coca-Cola 0.5 л',99,'https://picsum.photos/seed/drinks/200/200','500 мл','cat_drinks','rest_dodo-pizza',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_8','Сырные палочки','cheese-sticks','Хрустящие палочки с сыром',249,'https://picsum.photos/seed/snacks/200/200','200 г','cat_snacks','rest_dodo-pizza',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_9','Чизкейк','cheesecake','Классический нью-йоркский чизкейк',199,'https://picsum.photos/seed/desserts/200/200','120 г','cat_desserts','rest_dodo-pizza',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_tanuki','Тануки','tanuki','Японская кухня: суши, роллы, сашими. Свежие ингредиенты каждый день.','https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400','https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=800',4.7,890,45,600,149,'["Суши","Японская"]','пр. Мира, 42',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_10','Филадельфия','philadelphia','Лосось, сливочный сыр, огурец',449,'https://picsum.photos/seed/sushi/200/200','250 г','cat_sushi','rest_tanuki',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_11','Калифорния','california','Краб, авокадо, огурец, икра',399,'https://picsum.photos/seed/sushi/200/200','230 г','cat_sushi','rest_tanuki',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_12','Дракон','dragon','Угорь, огурец, соус унаги',549,'https://picsum.photos/seed/sushi/200/200','260 г','cat_sushi','rest_tanuki',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_13','Сашими лосось','sashimi-salmon','6 кусочков свежего лосося',599,'https://picsum.photos/seed/sushi/200/200','100 г','cat_sushi','rest_tanuki',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_14','Сет Тануки','set-tanuki','12 роллов: Филадельфия, Калифорния, Дракон',1299,'https://picsum.photos/seed/sushi/200/200','450 г','cat_sushi','rest_tanuki',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_15','Мисо суп','miso-soup','Традиционный японский суп',149,'https://picsum.photos/seed/snacks/200/200','300 мл','cat_snacks','rest_tanuki',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_16','Эдемамэ','edamame','Отварные соевые бобы с солью',199,'https://picsum.photos/seed/snacks/200/200','200 г','cat_snacks','rest_tanuki',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_17','Моти','mochi','Японские рисовые десерты 3 шт',249,'https://picsum.photos/seed/desserts/200/200','90 г','cat_desserts','rest_tanuki',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_18','Зелёный чай','green-tea','Японский зелёный чай',99,'https://picsum.photos/seed/drinks/200/200','300 мл','cat_drinks','rest_tanuki',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_burger-king','Burger King','burger-king','Легендарные бургеры на огне. Whopper и не только.','https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400','https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800',4.5,2100,25,400,79,'["Бургеры","Фастфуд"]','ул. Ленина, 8',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_19','Whopper','whopper','Королевский бургер с говядиной',299,'https://picsum.photos/seed/burgers/200/200','290 г','cat_burgers','rest_burger-king',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_20','Двойной Whopper','double-whopper','Две котлеты, двойной вкус',399,'https://picsum.photos/seed/burgers/200/200','400 г','cat_burgers','rest_burger-king',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_21','Чизбургер','cheeseburger','Классика с сыром',149,'https://picsum.photos/seed/burgers/200/200','150 г','cat_burgers','rest_burger-king',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_22','Картофель фри','fries','Хрустящий картофель фри',129,'https://picsum.photos/seed/snacks/200/200','120 г','cat_snacks','rest_burger-king',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_23','Наггетсы','nuggets','Куриные наггетсы 6 шт',199,'https://picsum.photos/seed/snacks/200/200','150 г','cat_snacks','rest_burger-king',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_24','Салат Цезарь','caesar-salad','Курица, салат, соус цезарь',249,'https://picsum.photos/seed/salads/200/200','250 г','cat_salads','rest_burger-king',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_25','Молочный коктейль','milkshake','Ваниль, шоколад или клубника',199,'https://picsum.photos/seed/drinks/200/200','400 мл','cat_drinks','rest_burger-king',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_26','Кола','cola-bk','Coca-Cola 0.5 л',99,'https://picsum.photos/seed/drinks/200/200','500 мл','cat_drinks','rest_burger-king',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_27','Мороженое','ice-cream','Ванильное мороженое',79,'https://picsum.photos/seed/desserts/200/200','100 г','cat_desserts','rest_burger-king',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_sushiwok','Сушивелл','sushiwok','Суши и роллы на любой вкус. Большие порции, доступные цены.','https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=400','https://images.unsplash.com/photo-1553621042-f6e147245754?w=800',4.6,756,40,500,129,'["Суши","Японская"]','ул. Гагарина, 22',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_28','Ролл Креветка темпура','shrimp-tempura','Хрустящие креветки в темпуре',399,'https://picsum.photos/seed/sushi/200/200','240 г','cat_sushi','rest_sushiwok',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_29','Ролл Лосось терияки','salmon-teriyaki','Лосось в соусе терияки',449,'https://picsum.photos/seed/sushi/200/200','250 г','cat_sushi','rest_sushiwok',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_30','Запечённый ролл','baked-roll','Краб, лосось, сыр под соусом',499,'https://picsum.photos/seed/sushi/200/200','280 г','cat_sushi','rest_sushiwok',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_31','Овощной ролл','vegetable-roll','Огурец, авокадо, перец',299,'https://picsum.photos/seed/sushi/200/200','200 г','cat_sushi','rest_sushiwok',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_32','Сет Закат','set-sunset','Филадельфия, Калифорния, Лосось',999,'https://picsum.photos/seed/sushi/200/200','400 г','cat_sushi','rest_sushiwok',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_33','Васаби','wasabi','Японская горчица',29,'https://picsum.photos/seed/snacks/200/200','15 г','cat_snacks','rest_sushiwok',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_34','Имбирный маринад','ginger','Маринованный имбирь',29,'https://picsum.photos/seed/snacks/200/200','30 г','cat_snacks','rest_sushiwok',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_35','Рамен','ramen','Японский лапшачный суп',349,'https://picsum.photos/seed/snacks/200/200','450 г','cat_snacks','rest_sushiwok',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_36','Сакамэ','sake','Японское сакэ',299,'https://picsum.photos/seed/drinks/200/200','180 мл','cat_drinks','rest_sushiwok',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_pasta-pasta','Паста Паста','pasta-pasta','Итальянская кухня: паста, ризотто, лазанья. Домашние рецепты.','https://images.unsplash.com/photo-1551183053-bf91a1d81141?w=400','https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800',4.8,534,35,600,99,'["Итальянская","Паста"]','ул. Итальянская, 7',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_37','Карбонара','carbonara','Спагетти, бекон, яйцо, пармезан',449,'https://picsum.photos/seed/pasta/200/200','350 г','cat_pasta','rest_pasta-pasta',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_38','Болоньезе','bolognese','Спагетти с мясным соусом',399,'https://picsum.photos/seed/pasta/200/200','350 г','cat_pasta','rest_pasta-pasta',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_39','Песто','pesto','Паста с соусом песто и креветками',499,'https://picsum.photos/seed/pasta/200/200','350 г','cat_pasta','rest_pasta-pasta',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_40','Лазанья','lasagna','Классическая лазанья с говядиной',449,'https://picsum.photos/seed/pasta/200/200','400 г','cat_pasta','rest_pasta-pasta',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_41','Ризотто с грибами','risotto-mushrooms','Кремовое ризотто с белыми грибами',399,'https://picsum.photos/seed/pasta/200/200','350 г','cat_pasta','rest_pasta-pasta',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_42','Салат Капрезе','caprese','Моцарелла, томаты, базилик',349,'https://picsum.photos/seed/salads/200/200','250 г','cat_salads','rest_pasta-pasta',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_43','Брускетта','bruschetta','Хлеб с томатами и базиликом',249,'https://picsum.photos/seed/snacks/200/200','150 г','cat_snacks','rest_pasta-pasta',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_44','Тирамису','tiramisu','Классический итальянский десерт',299,'https://picsum.photos/seed/desserts/200/200','150 г','cat_desserts','rest_pasta-pasta',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_45','Лимонад','limonade','Домашний лимонад',149,'https://picsum.photos/seed/drinks/200/200','400 мл','cat_drinks','rest_pasta-pasta',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_shawarma-1','Шаурма №1','shawarma-1','Лучшая шаурма в городе. Свежие ингредиенты, большие порции.','https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400','https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',4.4,1823,20,300,59,'["Шаурма","Уличная еда"]','пл. Центральная, 3',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_46','Шаурма классическая','shawarma-classic','Курица, овощи, соус',249,'https://picsum.photos/seed/burgers/200/200','350 г','cat_burgers','rest_shawarma-1',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_47','Шаурма с говядиной','shawarma-beef','Говядина, овощи, соус',299,'https://picsum.photos/seed/burgers/200/200','380 г','cat_burgers','rest_shawarma-1',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_48','Двойная шаурма','double-shawarma','Двойная порция мяса',399,'https://picsum.photos/seed/burgers/200/200','500 г','cat_burgers','rest_shawarma-1',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_49','Фалафель','falafel','Шарики из нута 6 шт',199,'https://picsum.photos/seed/snacks/200/200','200 г','cat_snacks','rest_shawarma-1',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_50','Хумус','hummus','Нутовая паста с лепёшкой',149,'https://picsum.photos/seed/snacks/200/200','200 г','cat_snacks','rest_shawarma-1',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_51','Свежий салат','fresh-salad','Овощи с оливковым маслом',149,'https://picsum.photos/seed/salads/200/200','250 г','cat_salads','rest_shawarma-1',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_52','Айран','ayran','Традиционный кисломолочный напиток',79,'https://picsum.photos/seed/drinks/200/200','400 мл','cat_drinks','rest_shawarma-1',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_53','Чай','tea','Чёрный или зелёный чай',49,'https://picsum.photos/seed/drinks/200/200','300 мл','cat_drinks','rest_shawarma-1',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_54','Пахлава','baklava','Восточная сладость',149,'https://picsum.photos/seed/desserts/200/200','100 г','cat_desserts','rest_shawarma-1',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_pizza-hut','Пицца Хат','pizza-hut','Толстое тесто, сочные начинки. Американская пицца с душой.','https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400','https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=800',4.5,987,35,550,119,'["Пицца","Американская"]','пр. Победы, 55',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_55','Суприм','supreme','Пепперони, болгарский перец, лук, грибы',549,'https://picsum.photos/seed/pizza/200/200','500 г','cat_pizza','rest_pizza-hut',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_56','BBQ Chicken','bbq-chicken','Курица в соусе BBQ, красный лук',549,'https://picsum.photos/seed/pizza/200/200','480 г','cat_pizza','rest_pizza-hut',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_57','Вегетарианская','vegetarian','Перец, грибы, томаты, оливки, шпинат',449,'https://picsum.photos/seed/pizza/200/200','450 г','cat_pizza','rest_pizza-hut',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_58','Барбекю','bbq','Свинина, соус барбекю, красный лук',499,'https://picsum.photos/seed/pizza/200/200','460 г','cat_pizza','rest_pizza-hut',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_59','Чесночные гренки','garlic-bread','Хрустящий хлеб с чесноком',199,'https://picsum.photos/seed/snacks/200/200','180 г','cat_snacks','rest_pizza-hut',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_60','Крылышки Buffalo','buffalo-wings','Куриные крылышки в остром соусе',399,'https://picsum.photos/seed/snacks/200/200','350 г','cat_snacks','rest_pizza-hut',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_61','Салат с курицей','chicken-salad','Курица гриль, микс салата',299,'https://picsum.photos/seed/salads/200/200','300 г','cat_salads','rest_pizza-hut',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_62','Брауни','brownie','Шоколадный брауни с мороженым',249,'https://picsum.photos/seed/desserts/200/200','150 г','cat_desserts','rest_pizza-hut',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_63','Пепси','pepsi','Pepsi 0.5 л',99,'https://picsum.photos/seed/drinks/200/200','500 мл','cat_drinks','rest_pizza-hut',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_vkusno-tochka','Вкусно — и точка','vkusno-tochka','Бургеры, картофель фри и напитки. Просто и вкусно.','https://images.unsplash.com/photo-1550547660-d9450f859349?w=400','https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800',4.3,3241,20,350,69,'["Бургеры","Фастфуд"]','ул. Советская, 12',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_64','Биг Хит','big-hit','Двойная котлета, сыр, салат',249,'https://picsum.photos/seed/burgers/200/200','280 г','cat_burgers','rest_vkusno-tochka',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_65','Чизбургер делюкс','cheeseburger-deluxe','Котлета, два сыра, маринованные огурцы',199,'https://picsum.photos/seed/burgers/200/200','220 г','cat_burgers','rest_vkusno-tochka',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_66','Гамбургер','hamburger','Классический гамбургер',129,'https://picsum.photos/seed/burgers/200/200','160 г','cat_burgers','rest_vkusno-tochka',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_67','Картофель по-деревенски','country-fries','С хрустящей корочкой',149,'https://picsum.photos/seed/snacks/200/200','150 г','cat_snacks','rest_vkusno-tochka',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_68','Страпсы','straps','Куриные полоски в панировке',179,'https://picsum.photos/seed/snacks/200/200','130 г','cat_snacks','rest_vkusno-tochka',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_69','Овощной салат','veggie-salad','Свежие овощи',129,'https://picsum.photos/seed/salads/200/200','200 г','cat_salads','rest_vkusno-tochka',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_70','Мороженое пломбир','ice-cream-plombir','Классический пломбир',89,'https://picsum.photos/seed/desserts/200/200','80 г','cat_desserts','rest_vkusno-tochka',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_71','Кофе','coffee','Американо или капучино',149,'https://picsum.photos/seed/drinks/200/200','300 мл','cat_drinks','rest_vkusno-tochka',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_72','Сок','juice','Апельсиновый или яблочный',119,'https://picsum.photos/seed/drinks/200/200','400 мл','cat_drinks','rest_vkusno-tochka',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_koreana','Кореана','koreana','Корейская кухня: бибимпап, кимчи, корейские блины.','https://images.unsplash.com/photo-1582878826629-29b7ad1d39a0?w=400','https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800',4.7,412,40,550,129,'["Корейская","Азиатская"]','ул. Азиатская, 18',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_73','Бибимпап','bibimbap','Рис, овощи, яйцо, говядина, кочхучжан',449,'https://picsum.photos/seed/pasta/200/200','400 г','cat_pasta','rest_koreana',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_74','Булгоги','bulgogi','Маринованная говядина на гриле',549,'https://picsum.photos/seed/pasta/200/200','300 г','cat_pasta','rest_koreana',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_75','Кимчи','kimchi','Острое квашеное kimchi',199,'https://picsum.photos/seed/snacks/200/200','200 г','cat_snacks','rest_koreana',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_76','Корейские блины','korean-pancakes','Блины с зелёным луком и морепродуктами',349,'https://picsum.photos/seed/snacks/200/200','250 г','cat_snacks','rest_koreana',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_77','Ттеокбокки','tteokbokki','Рисовые палочки в остром соусе',299,'https://picsum.photos/seed/snacks/200/200','300 г','cat_snacks','rest_koreana',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_78','Салат с ростбифом','beef-salad','Ростбиф, руккола, соус',399,'https://picsum.photos/seed/salads/200/200','280 г','cat_salads','rest_koreana',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_79','Патбинсу','patbingsu','Корейский десерт с красной фасолью',299,'https://picsum.photos/seed/desserts/200/200','350 г','cat_desserts','rest_koreana',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_80','Корейский чай','korean-tea','Традиционный barley tea',99,'https://picsum.photos/seed/drinks/200/200','400 мл','cat_drinks','rest_koreana',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_81','Соджу','soju','Корейская рисовая водка',249,'https://picsum.photos/seed/drinks/200/200','360 мл','cat_drinks','rest_koreana',1,9,NOW(3),NOW(3));
INSERT INTO `Restaurant` (`id`,`name`,`slug`,`description`,`image`,`coverImage`,`rating`,`reviewCount`,`deliveryTime`,`minOrder`,`deliveryFee`,`cuisineTypes`,`address`,`isActive`,`createdAt`,`updatedAt`) VALUES ('rest_sweet-dreams','Sweet Dreams','sweet-dreams','Десерты, торты и кофе. Сладкое настроение каждый день.','https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400','https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=800',4.9,623,30,400,99,'["Десерты","Кофейня"]','ул. Сладкая, 9',1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_82','Торт Наполеон','napoleon','Классический слоёный торт',199,'https://picsum.photos/seed/desserts/200/200','120 г','cat_desserts','rest_sweet-dreams',1,1,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_83','Чизкейк Нью-Йорк','ny-cheesecake','Нежный сливочный чизкейк',249,'https://picsum.photos/seed/desserts/200/200','140 г','cat_desserts','rest_sweet-dreams',1,2,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_84','Эклер','eclair','Заварное пирожное с кремом',149,'https://picsum.photos/seed/desserts/200/200','80 г','cat_desserts','rest_sweet-dreams',1,3,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_85','Макарон','macaron','Французское печенье 3 шт',249,'https://picsum.photos/seed/desserts/200/200','60 г','cat_desserts','rest_sweet-dreams',1,4,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_86','Круассан','croissant','Свежий французский круассан',129,'https://picsum.photos/seed/desserts/200/200','70 г','cat_desserts','rest_sweet-dreams',1,5,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_87','Капучино','cappuccino','Классический капучино',199,'https://picsum.photos/seed/drinks/200/200','250 мл','cat_drinks','rest_sweet-dreams',1,6,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_88','Латте','latte','Кофе с молоком',219,'https://picsum.photos/seed/drinks/200/200','300 мл','cat_drinks','rest_sweet-dreams',1,7,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_89','Горячий шоколад','hot-chocolate','Густой горячий шоколад',199,'https://picsum.photos/seed/drinks/200/200','300 мл','cat_drinks','rest_sweet-dreams',1,8,NOW(3),NOW(3));
INSERT INTO `Dish` (`id`,`name`,`slug`,`description`,`price`,`image`,`weight`,`categoryId`,`restaurantId`,`isAvailable`,`sortOrder`,`createdAt`,`updatedAt`) VALUES ('dish_90','Сэндвич','sandwich','Клубника, сливки, бриошь',279,'https://picsum.photos/seed/snacks/200/200','200 г','cat_snacks','rest_sweet-dreams',1,9,NOW(3),NOW(3));
INSERT INTO `Favorite` (`id`,`userId`,`restaurantId`) VALUES ('fav_1','user_test','rest_dodo-pizza');
INSERT INTO `Favorite` (`id`,`userId`,`restaurantId`) VALUES ('fav_2','user_test','rest_tanuki');
INSERT INTO `Favorite` (`id`,`userId`,`restaurantId`) VALUES ('fav_3','user_test','rest_burger-king');

-- Готово! admin@food.ru / admin123   user@food.ru / user123