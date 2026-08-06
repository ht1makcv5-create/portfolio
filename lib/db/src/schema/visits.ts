import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const visitsTable = pgTable("visits", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull(),
  path: text("path").notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Visit = typeof visitsTable.$inferSelect;