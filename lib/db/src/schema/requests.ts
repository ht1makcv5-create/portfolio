import { createInsertSchema } from "drizzle-zod";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const requestsTable = pgTable("requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  kind: text("kind", { enum: ["contact", "order"] }).notNull(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  message: text("message").notNull(),
  service: text("service"),
  budget: text("budget"),
  status: text("status", {
    enum: ["new", "in_progress", "completed", "archived"],
  })
    .notNull()
    .default("new"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertRequestSchema = createInsertSchema(requestsTable).pick({
  kind: true,
  name: true,
  contact: true,
  message: true,
  service: true,
  budget: true,
});

export type InsertRequest = z.infer<typeof insertRequestSchema>;
export type Request = typeof requestsTable.$inferSelect;