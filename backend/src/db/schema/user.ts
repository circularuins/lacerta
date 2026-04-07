import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).unique().notNull(),
  username: varchar({ length: 30 }).unique().notNull(),
  displayName: varchar({ length: 50 }),
  passwordHash: text().notNull(),
  passwordSalt: text().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
