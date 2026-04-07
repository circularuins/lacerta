import { pgTable, uuid, varchar, jsonb, timestamp } from "drizzle-orm/pg-core";

export const genreTemplates = pgTable("genre_templates", {
  id: uuid().primaryKey().defaultRandom(),
  genre: varchar({ length: 50 }).unique().notNull(),
  name: varchar({ length: 100 }).notNull(),
  steps: jsonb().notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
