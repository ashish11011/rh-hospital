import { boolean, integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const courseSchema = pgTable("course", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title").notNull(),
    description: varchar("description").notNull(),
    content: varchar("content").notNull(),
    image: varchar("image").notNull(),
    currency: varchar("currency").default("INR"),
    isActive: boolean("is_active").default(true),
    bannerImageUrl: varchar("banner_image_url").notNull(),
    price: integer("price").notNull().default(0),
    // certificate: 
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseItemSchema = pgTable("course_item", {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").references(() => courseSchema.id).notNull(),
    mediaUrl: varchar("media_url").notNull(),
    mediaType: varchar("media_type").notNull(),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseEnrolment = null;