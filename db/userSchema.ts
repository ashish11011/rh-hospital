import { boolean, index, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const userSchema = pgTable("user", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email").notNull().unique(),
    mobileNumber: varchar("mobile_number").notNull(),
    designation: varchar("designation").notNull(),
    instituteName: varchar("institute_name").notNull(),
    city: varchar("city"),
    isActive: boolean("is_active").default(true),
    isVarifiedEmail: boolean("is_varified_email").default(false),
    isVarifiedMobileNumber: boolean("is_varified_mobile_number").default(false),
    password: varchar("password").notNull(),
    role: varchar("role").notNull().default("user"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const contactSchema = pgTable("contact", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    email: varchar("email"),
    mobileNumber: varchar("mobile_number"),
    message: varchar("message"),
    createdAt: timestamp("created_at").defaultNow(),
    formSource: varchar("form_source"),
});

export const blogStatusEnumSchema = pgEnum("blog_status_enum",["draft", "published", "archived"]);

export const blogSchema = pgTable(
  "blogs",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Content
    title: varchar("title", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    shortDescription: varchar("short_description", { length: 500 }),
    content: text("content").notNull(),

    // Author
    authorName: varchar("author_name", { length: 150 }).notNull(),

    // Media
    featuredImage: text("featured_image"),
    bannerImage: text("banner_image"),

    // SEO
    metaTitle: varchar("meta_title", { length: 255 }),
    metaDescription: varchar("meta_description", { length: 300 }),
    metaKeywords: text("meta_keywords"),

    // Classification
    category: varchar("category", { length: 100 }),
    tags: varchar("tags").array(),

    // Status
    status: blogStatusEnumSchema("status").default("published").notNull(),
    isFeatured: boolean("is_featured").default(false).notNull(),

    // Publish
    publishedAt: timestamp("published_at"),

    // Audit
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("blogs_status_idx").on(table.status),
    categoryIdx: index("blogs_category_idx").on(table.category),
    publishedIdx: index("blogs_published_at_idx").on(table.publishedAt),
  })
);