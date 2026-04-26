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
    isVarified: boolean("is_varified").default(false),
    password: varchar("password").notNull(),
    role: varchar("role").notNull().default("user"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});