import { integer, jsonb, pgEnum, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


export const itemEnumSchema = pgEnum("item", ["workshop", "product", "course"]);

export const paymentSchema = pgTable("payment", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderType: itemEnumSchema('order_type').notNull().default('workshop'),
    orderId: uuid("order_id").notNull(),
    currency: varchar("currency").notNull().default("INR"),
    gatewayPaymentEventId: varchar("gateway_payment_event_id"),
    modeOfPayment: varchar("modeOf_payment"),
    getewayPaymentId: varchar("geteway_payment_id"),
    gatewayInvoiceId: varchar("gateway_invoice_id"),
    gatewayOrderId: varchar("gateway_order_id").notNull(),
    amount: integer("amount").notNull().default(0),
    amountDue: integer("amount_due").notNull().default(0),
    amountPaid: integer("amount_paid").notNull().default(0),
    transactionId: varchar("transaction_id"),
    transactionDate: timestamp("transaction_date").defaultNow(),
    status: varchar("status").notNull().default("pending"),
    email: varchar("email"),
    contact: varchar("contact"),
    tokenId: varchar("token_id"),
    responseObject: jsonb("response_object"),
    fee: integer("fee").default(0),
    tax: integer("tax").default(0),
    vpa: varchar("vpa"),
    bank: varchar("bank"),
    cardId: varchar("card_id"),
    notes: varchar("notes"),
    description: varchar("description"),
    createdAt: timestamp("created_at").defaultNow()
});

export const paymentStatusEnumSchema = pgEnum("paymentStatus", [
    "pending",
    "processing",
    "completed",
    "failed",
    "cancelled",
    "refunded"
]);
