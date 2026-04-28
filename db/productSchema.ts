import { boolean, integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";



export const productCategorySchema = pgTable("product_category", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    description: varchar("description").notNull(),
    imageUrl: varchar("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const productSchema = pgTable("product", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    description: varchar("description").notNull(),
    image: varchar("image").notNull(),
    price: integer("price").notNull().default(0),
    minQuantity: integer("min_quantity").notNull().default(1),
    maxQuantity: integer("max_quantity").notNull().default(1),
    color: varchar("color"),
    size: varchar("size"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const productMediaSchema = pgTable("product_media", {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").references(() => productSchema.id).notNull(),
    mediaUrl: varchar("media_url").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    priority: integer("priority").notNull().default(0),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const productShippingSchema = null;