import { integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const workshopSchema = pgTable("workshop", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name").notNull(),
    bannerImage: varchar("banner_image"),
    description: varchar("description").notNull(),
    content: varchar("content").notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    onlinePrice: integer("online_price").notNull(),
    offlinePrice: integer("offline_price").notNull(),

});

export const modeOfAttandaceEnum = pgEnum("modeOfAttandace", ["online", "offline"]);

export const workshopRegistrationSchema = pgTable("workshop_registration", {
    id: uuid("id").defaultRandom().primaryKey(),
    workshopId: uuid("workshop_id").notNull(),
    email: varchar("email").notNull(),
    name: varchar("name").notNull(),
    mobileNumber: varchar("mobile_number").notNull(),
    designation: varchar("designation").notNull(),
    instituteName: varchar("institute_name").notNull(),
    city: varchar("city"),
    modeOfAttandnace: modeOfAttandaceEnum("mode_of_attandnace").notNull().default("online"),
    // add payment status and default as pending
});

export const workshopPaymentSchema = pgTable("workshop_payment", {
    id: uuid("id").defaultRandom().primaryKey(),
    registrationId: uuid("registration_id").references(() => workshopRegistrationSchema.id).notNull(),
    currency: varchar("currency").notNull().default("INR"),

    modeOfPayment: varchar("modeOf_payment"),
    gatewayOrderId: varchar("gateway_order_id").notNull(),
    amount: varchar("amount").notNull(),
    transactionId: varchar("transaction_id").notNull(),
    transactionDate: varchar("transaction_date").notNull(),
    status: varchar("status").notNull().default("pending"),
    email: varchar("email"),
    contact: varchar("contact"),
    tokenId: varchar("token_id"),
    responseObject: jsonb("response_object").notNull(),
});