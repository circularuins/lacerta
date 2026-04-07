import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./user.js";
import { tasks } from "./task.js";

export const progressLogs = pgTable("progress_logs", {
  id: uuid().primaryKey().defaultRandom(),
  taskId: uuid()
    .references(() => tasks.id, { onDelete: "cascade" })
    .notNull(),
  userId: uuid()
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  note: text(),
  status: varchar({ length: 20 }).notNull(),
  loggedAt: timestamp().defaultNow().notNull(),
});
