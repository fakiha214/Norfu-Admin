import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export type ProductColor = { name: string; hex: string };

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  gender: text("gender", { enum: ["men", "women", "juniors"] }).notNull(),
  fit: text("fit").notNull(),
  price: integer("price").notNull(),
  salePrice: integer("sale_price"),
  badge: text("badge", { enum: ["sale", "new"] }),
  description: text("description").notNull().default(""),
  sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
  colors: jsonb("colors").$type<ProductColor[]>().notNull().default([]),
  imageA: text("image_a").notNull(),
  imageB: text("image_b").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  // Fixed slots the storefront renders: hero-1, promo-1, promo-2,
  // cat-men, cat-women, cat-juniors, cat-sale
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

export type ProductRow = typeof products.$inferSelect;
export type BannerRow = typeof banners.$inferSelect;
export type AnnouncementRow = typeof announcements.$inferSelect;
export type SubscriberRow = typeof subscribers.$inferSelect;
