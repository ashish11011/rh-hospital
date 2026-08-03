import { boolean, integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";

export const courseSchema = pgTable("course", {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title").notNull(),
    description: varchar("description").notNull(),
    content: varchar("content"),
    currency: varchar("currency").default("INR"),
    price: integer("price").notNull().default(0),
    isActive: boolean("is_active").default(true),
    bannerImageUrl: varchar("banner_image_url").notNull(),
    // certificate: 
    courseHours: integer("course_hours").notNull().default(0),
    courseDuration:varchar("course_duration"),
    totalLectures: integer("total_lectures").notNull().default(0),
    slug: varchar("slug").notNull(),
    courseOverview: varchar("course_overview"),
    whatYouWillLearn: varchar("what_you_will_learn").array(),
    skillsAcquired: varchar("skills_acquired").array(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseItemSchema = pgTable("course_item", {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").references(() => courseSchema.id).notNull(),
    mediaUrl: varchar("media_url").notNull(),
    mediaType: varchar("media_type").notNull(),
    title:varchar("title"),
    duration: varchar("duration"),
    priority: integer("priority").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseEnrolmentStatusEnumSchema = pgEnum("enrolment_status", ["enrolled", "pending", "expired", "refunded"]);

export const courseEnrolmentSchema = pgTable("course_enrolment", {
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").references(() => courseSchema.id, {onDelete:"cascade"}).notNull(),
    userId: uuid("user_id").references(() => userSchema.id , {onDelete:"cascade"}).notNull(),
    enrolmentStatus: courseEnrolmentStatusEnumSchema("enrolment_status").notNull().default("pending"),
    courseCertificate: varchar("course_certificate"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const lessonProgressSchema = pgTable("lesson_progress", {
    id: uuid("id").defaultRandom().primaryKey(),
    courseItemId: uuid("course_item_id").references(() => courseItemSchema.id, {onDelete:"cascade"}).notNull(),
    userId: uuid("user_id").references(() => userSchema.id , {onDelete:"cascade"}).notNull(),
    progress: integer("progress").notNull().default(0),
    isCompleted: boolean("is_completed").default(false),
    updatedAt: timestamp("updated_at").defaultNow(),
});

export const courseReview = pgTable("course_review",{
    id: uuid("id").defaultRandom().primaryKey(),
    courseId: uuid("course_id").references(() => courseSchema.id, {onDelete: "cascade"}).notNull(),
    userId: uuid("user_id").references(() => userSchema.id, {onDelete: "cascade"}).notNull(),
    rating: integer("rating").notNull().default(0),
    feedback: varchar("feedback").notNull(),
    isApproved: boolean("is_approved").default(false),
    createdAt: timestamp("created_at").defaultNow(),
});