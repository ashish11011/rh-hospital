import { boolean, integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const itemEnumSchema = pgEnum("item", ["workshop", "product", "course"]);

export const paymentSchema = pgTable("payment", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderType: itemEnumSchema('order_type').notNull().default('workshop'),
    orderId: uuid("order_id").notNull(),
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

export const paymentStatusEnumSchema = pgEnum("paymentStatus", [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
    "refunded"
]);
