import { GraphQLError } from "graphql";
import { eq, and, asc } from "drizzle-orm";
import { builder } from "../builder.js";
import { db } from "../../db/index.js";
import { tasks } from "../../db/schema/task.js";
import { progressLogs } from "../../db/schema/progress-log.js";

const TaskRef = builder.objectRef<{
  id: string;
  goalId: string;
  userId: string;
  title: string;
  description: string | null;
  status: string;
  scheduledDate: string;
  completedAt: Date | null;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}>("Task");

builder.objectType(TaskRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    goalId: t.exposeID("goalId"),
    title: t.exposeString("title"),
    description: t.exposeString("description", { nullable: true }),
    status: t.exposeString("status"),
    scheduledDate: t.exposeString("scheduledDate"),
    completedAt: t.field({
      type: "String",
      nullable: true,
      resolve: (task) => task.completedAt?.toISOString() ?? null,
    }),
    orderIndex: t.exposeInt("orderIndex"),
    createdAt: t.field({
      type: "String",
      resolve: (task) => task.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (task) => task.updatedAt.toISOString(),
    }),
  }),
});

const ProgressLogRef = builder.objectRef<{
  id: string;
  taskId: string;
  userId: string;
  note: string | null;
  status: string;
  loggedAt: Date;
}>("ProgressLog");

builder.objectType(ProgressLogRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    taskId: t.exposeID("taskId"),
    note: t.exposeString("note", { nullable: true }),
    status: t.exposeString("status"),
    loggedAt: t.field({
      type: "String",
      resolve: (log) => log.loggedAt.toISOString(),
    }),
  }),
});

builder.queryFields((t) => ({
  tasksByGoal: t.field({
    type: [TaskRef],
    args: { goalId: t.arg.string({ required: true }) },
    resolve: async (_root, args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      return db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.goalId, args.goalId),
            eq(tasks.userId, ctx.authUser.userId),
          ),
        )
        .orderBy(asc(tasks.scheduledDate), asc(tasks.orderIndex));
    },
  }),

  todayTasks: t.field({
    type: [TaskRef],
    resolve: async (_root, _args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      const today = new Date().toISOString().split("T")[0];
      return db
        .select()
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, ctx.authUser.userId),
            eq(tasks.scheduledDate, today),
          ),
        )
        .orderBy(asc(tasks.orderIndex));
    },
  }),
}));

builder.mutationFields((t) => ({
  logProgress: t.field({
    type: ProgressLogRef,
    args: {
      taskId: t.arg.string({ required: true }),
      status: t.arg.string({ required: true }),
      note: t.arg.string(),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      const validStatuses = ["completed", "partial", "skipped"];
      if (!validStatuses.includes(args.status)) {
        throw new GraphQLError("Invalid status");
      }

      // Verify task ownership
      const [task] = await db
        .select({ id: tasks.id })
        .from(tasks)
        .where(
          and(eq(tasks.id, args.taskId), eq(tasks.userId, ctx.authUser.userId)),
        )
        .limit(1);

      if (!task) throw new GraphQLError("Task not found");

      // Update task status
      const taskStatus =
        args.status === "completed"
          ? "completed"
          : args.status === "skipped"
            ? "skipped"
            : "in_progress";

      await db
        .update(tasks)
        .set({
          status: taskStatus,
          completedAt: args.status === "completed" ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, args.taskId));

      // Create progress log
      const [log] = await db
        .insert(progressLogs)
        .values({
          taskId: args.taskId,
          userId: ctx.authUser.userId,
          note: args.note ?? null,
          status: args.status,
        })
        .returning();

      return log;
    },
  }),
}));
