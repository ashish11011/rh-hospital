import { integer, jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { userCardSchema } from "./userSchema";
import { workshopSchema } from "./workshopSchema";

// One row per card keeps the rolling send limit shared across all workshops.
export const workshopMemberVerification = pgTable("workshop_member_verification", {
  cardId: uuid("card_id").primaryKey().references(() => userCardSchema.id, { onDelete: "cascade" }),
  workshopId: uuid("workshop_id").notNull().references(() => workshopSchema.id, { onDelete: "cascade" }),
  challengeId: uuid("challenge_id").notNull().unique(),
  email: varchar("email").notNull(),
  codeHash: varchar("code_hash"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  sentAt: jsonb("sent_at").$type<number[]>().notNull().default([]),
  sessionHash: varchar("session_hash"),
  sessionExpiresAt: timestamp("session_expires_at", { withTimezone: true }),
});
