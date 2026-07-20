import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

export type ProductColor = { name: string; hex: string };

// Categories are admin-managed and self-referencing: a row with parentId = null
// is a top-level category; a row with a parentId is a sub-category of it. The
// storefront navigation, homepage tiles and collection pages are all built from
// this table (the shop is men/unisex only, so there is no gender/age axis).
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  parentId: integer("parent_id").references((): AnyPgColumn => categories.id, {
    onDelete: "cascade",
  }),
  imageUrl: text("image_url").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  // The category a product belongs to (top-level or sub-category). Null means
  // uncategorised; the product stays searchable but is not filed under any
  // navigation collection.
  categoryId: integer("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  fit: text("fit").notNull(),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  badge: text("badge", { enum: ["sale", "new"] }),
  description: text("description").notNull().default(""),
  colors: jsonb("colors").$type<ProductColor[]>().notNull().default([]),
  imageA: text("image_a").notNull(),
  imageB: text("image_b").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const productSizes = pgTable(
  "product_sizes",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    stock: integer("stock").notNull().default(0),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [unique("product_sizes_product_size_unique").on(t.productId, t.size)]
);

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  notes: text("notes").notNull().default(""),
  paymentMethod: text("payment_method", { enum: ["cod", "bank-transfer"] })
    .notNull()
    .default("cod"),
  subtotal: integer("subtotal").notNull(),
  shippingFee: integer("shipping_fee").notNull().default(0),
  total: integer("total").notNull(),
  status: text("status", {
    enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
  })
    .notNull()
    .default("pending"),
  // The team sends order-confirmation emails manually; this tracks it.
  emailSent: boolean("email_sent").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id"),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  size: text("size").notNull(),
  color: text("color").notNull().default(""),
  image: text("image").notNull().default(""),
  unitPrice: integer("unit_price").notNull(),
  qty: integer("qty").notNull(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  // Content slots the storefront renders: hero-1, promo-1, promo-2.
  // (Homepage category tiles are now driven by the categories table, not banners.)
  slot: text("slot").notNull().unique(),
  kicker: text("kicker").notNull().default(""),
  title: text("title").notNull().default(""),
  copy: text("copy").notNull().default(""),
  ctaLabel: text("cta_label").notNull().default(""),
  href: text("href").notNull().default("/"),
  imageUrl: text("image_url").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  message: text("message").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type CategoryRow = typeof categories.$inferSelect;
export type ProductRow = typeof products.$inferSelect;
export type ProductSizeRow = typeof productSizes.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
export type BannerRow = typeof banners.$inferSelect;
export type AnnouncementRow = typeof announcements.$inferSelect;
export type SubscriberRow = typeof subscribers.$inferSelect;
