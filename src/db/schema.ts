import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

const badgeValues = ['new', 'sale', 'exclusive'] as const;
export const badgeEnum = pgEnum('badge', badgeValues);
export type BadgeValue = (typeof badgeValues)[number];

const inventoryValues = ['in-stock', 'backorder', 'pre-order'] as const;
export const inventoryEnum = pgEnum('inventory', inventoryValues);
export type InventoryValue = (typeof inventoryValues)[number];

export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  badge: badgeEnum('badge'),
  inventory: inventoryEnum('inventory').notNull().default('in-stock').notNull(),
  rating: numeric('rating', { precision: 3, scale: 2 }).notNull().default('0'),
  reviews: integer('reviews').notNull().default(0),
  image: varchar('image', { length: 512 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type ProductSelect = typeof products.$inferSelect;
export type ProductInsert = typeof products.$inferInsert;

export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').notNull().default(1),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type CartItemSelect = typeof cartItems.$inferSelect;
export type CartItemInsert = typeof cartItems.$inferInsert;
