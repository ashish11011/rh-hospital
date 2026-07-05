import { boolean, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

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