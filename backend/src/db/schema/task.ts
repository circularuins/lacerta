import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { goals } from "./goal.js";

export const tasks = pgTable("tasks", {
  id: uuid().primaryKey().defaultRandom(),
  goalId: uuid()
    .references(() => goals.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar({ length: 200 }).notNull(),
  description: text(),
  status: varchar({ length: 20 }).default("pending").notNull(),
  scheduledDate: date().notNull(),
  completedAt: timestamp(),
  orderIndex: integer().default(0).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
