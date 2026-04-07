import {
  pgTable,
  uuid,
  varchar,
  text,
  date,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./user.js";

export const goals = pgTable("goals", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar({ length: 200 }).notNull(),
  description: text(),
  dueDate: date().notNull(),
  genre: varchar({ length: 50 }).notNull(),
  status: varchar({ length: 20 }).default("active").notNull(),
  aiPlan: jsonb(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
