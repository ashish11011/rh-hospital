import { sql } from "drizzle-orm";
import { integer, pgTable, uuid, varchar } from "drizzle-orm/pg-core";
import { paymentSchema } from "./paymentSchema";

export const invoiceSchema = pgTable("invoice", {
  id: uuid("id").defaultRandom().primaryKey(),
  paymentId: uuid("payment_id")
    .references(() => paymentSchema.id)
    .notNull(),
  invoiceNumber: integer("invoice_number")
    .generatedAlwaysAsIdentity({ startWith: 1, increment: 1 })
    .notNull()
    .unique(),
  invoiceUrl: varchar("invoice_url"),
  financialYear: integer("financial_year")
    .notNull()
    .default(sql`extract(year from current_date)::integer`),
  // Invoice amounts are stored in paise; payment amounts are converted from rupees.
  discountAmount: integer("discount_amount").notNull().default(0),
  taxableAmount: integer("taxable_amount").notNull().default(0),
  gstAmount: integer("gst_amount").notNull().default(0),
  totalAmount: integer("total_amount").notNull().default(0),
});
