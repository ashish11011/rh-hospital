import { integer, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userSchema } from "./userSchema";
import { paymentStatusEnumSchema } from "./paymentSchema";


export const workshopSchema = pgTable("workshop", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    bannerImage: varchar("banner_image"),
    description: varchar("description").notNull(),
    content: varchar("content").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    // certificate:
    onlinePrice: integer("online_price").notNull(),
    offlinePrice: integer("offline_price").notNull(),
});

export const modeOfAttandaceEnumSchema = pgEnum("modeOfAttandace", ["online", "offline"]);

export const workshopRegistrationSchema = pgTable("workshop_registration", {
    id: uuid("id").defaultRandom().primaryKey(),
    workshopId: uuid("workshop_id").notNull().references(() => workshopSchema.id),
    userId: uuid('user_id').references(() => userSchema.id).notNull(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    mobileNumber: varchar("mobile_number").notNull(),
    designation: varchar("designation").notNull(),
    instituteName: varchar("institute_name").notNull(),
    city: varchar("city"),
    modeOfAttandnace: modeOfAttandaceEnumSchema("mode_of_attandnace").notNull().default("online"),
    // add payment status and default as pending
    paymentStatus: paymentStatusEnumSchema("payment_status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    workshopAmount: integer("workshop_amount").notNull().default(0),
    couponDiscount: integer("coupon_discount").default(0).notNull(),
    payableAmount: integer("payable_amount").notNull().default(0),
});

export const couponCodeSchema = pgTable("coupon_code", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code").notNull(),
    onlineDiscount: integer("online_discount").default(0).notNull(),
    offlineDiscount: integer("offline_discount").default(0).notNull(),
    workshopId: uuid("workshop_id").notNull().references(() => workshopSchema.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

