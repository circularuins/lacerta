import { GraphQLError } from "graphql";
import { eq, and, desc } from "drizzle-orm";
import { builder } from "../builder.js";
import { db } from "../../db/index.js";
import { goals } from "../../db/schema/goal.js";
import { tasks } from "../../db/schema/task.js";
import { generatePlan } from "../../services/ai.js";
import { genreTemplates } from "../../db/schema/genre-template.js";

const GoalRef = builder.objectRef<{
  id: string;
  userId: string;
  title: string;
  description: string | null;
  dueDate: string;
  genre: string;
  status: string;
  aiPlan: unknown;
  createdAt: Date;
  updatedAt: Date;
}>("Goal");

builder.objectType(GoalRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    title: t.exposeString("title"),
    description: t.exposeString("description", { nullable: true }),
    dueDate: t.exposeString("dueDate"),
    genre: t.exposeString("genre"),
    status: t.exposeString("status"),
    aiPlan: t.field({
      type: "JSON",
      nullable: true,
      resolve: (goal) => goal.aiPlan,
    }),
    createdAt: t.field({
      type: "String",
      resolve: (goal) => goal.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (goal) => goal.updatedAt.toISOString(),
    }),
  }),
});

// Register JSON scalar
builder.scalarType("JSON", {
  serialize: (value) => value,
  parseValue: (value) => value,
});

builder.queryFields((t) => ({
  myGoals: t.field({
    type: [GoalRef],
    resolve: async (_root, _args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      return db
        .select()
        .from(goals)
        .where(eq(goals.userId, ctx.authUser.userId))
        .orderBy(desc(goals.createdAt));
    },
  }),

  goal: t.field({
    type: GoalRef,
    nullable: true,
    args: { id: t.arg.string({ required: true }) },
    resolve: async (_root, args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      const [goal] = await db
        .select()
        .from(goals)
        .where(
          and(eq(goals.id, args.id), eq(goals.userId, ctx.authUser.userId)),
        )
        .limit(1);

      return goal ?? null;
    },
  }),
}));

builder.mutationFields((t) => ({
  createGoal: t.field({
    type: GoalRef,
    args: {
      title: t.arg.string({ required: true }),
      description: t.arg.string(),
      dueDate: t.arg.string({ required: true }),
      genre: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      if (args.title.length > 200) {
        throw new GraphQLError("Title must be 200 characters or less");
      }

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(args.dueDate)) {
        throw new GraphQLError("Invalid date format (expected YYYY-MM-DD)");
      }

      const [goal] = await db
        .insert(goals)
        .values({
          userId: ctx.authUser.userId,
          title: args.title,
          description: args.description ?? null,
          dueDate: args.dueDate,
          genre: args.genre,
        })
        .returning();

      // Try AI plan generation (non-blocking: if AI fails, goal is still created)
      try {
        const [template] = await db
          .select()
          .from(genreTemplates)
          .where(eq(genreTemplates.genre, args.genre))
          .limit(1);

        const templateSteps = template
          ? (template.steps as {
              name: string;
              description: string;
              estimatedDays: number;
            }[])
          : [];

        const plan = await generatePlan({
          goalTitle: args.title,
          goalDescription: args.description ?? undefined,
          dueDate: args.dueDate,
          genre: args.genre,
          templateSteps,
        });

        if (plan) {
          // Store AI plan on goal
          await db
            .update(goals)
            .set({ aiPlan: plan, updatedAt: new Date() })
            .where(eq(goals.id, goal.id));

          // Create tasks from plan
          for (let i = 0; i < plan.tasks.length; i++) {
            const task = plan.tasks[i];
            await db.insert(tasks).values({
              goalId: goal.id,
              userId: ctx.authUser.userId,
              title: task.title,
              description: task.description,
              scheduledDate: task.scheduledDate,
              orderIndex: i,
            });
          }

          return { ...goal, aiPlan: plan };
        }
      } catch (err) {
        console.error("[ai] plan generation failed:", err);
        // Goal still returned without AI plan
      }

      return goal;
    },
  }),

  updateGoalStatus: t.field({
    type: GoalRef,
    args: {
      id: t.arg.string({ required: true }),
      status: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.authUser) throw new GraphQLError("Authentication required");

      const validStatuses = ["active", "completed", "archived"];
      if (!validStatuses.includes(args.status)) {
        throw new GraphQLError("Invalid status");
      }

      const [updated] = await db
        .update(goals)
        .set({ status: args.status, updatedAt: new Date() })
        .where(
          and(eq(goals.id, args.id), eq(goals.userId, ctx.authUser.userId)),
        )
        .returning();

      if (!updated) throw new GraphQLError("Goal not found");
      return updated;
    },
  }),
}));
