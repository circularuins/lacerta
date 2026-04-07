import Anthropic from "@anthropic-ai/sdk";
import { env } from "../env.js";

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!env.ANTHROPIC_API_KEY) {
    console.warn("[ai] ANTHROPIC_API_KEY not set — AI features disabled");
    return null;
  }
  if (!client) {
    client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  }
  return client;
}

interface PlanInput {
  goalTitle: string;
  goalDescription?: string;
  dueDate: string;
  genre: string;
  templateSteps: { name: string; description: string; estimatedDays: number }[];
}

interface PlanOutput {
  tasks: {
    title: string;
    description: string;
    scheduledDate: string;
  }[];
}

function buildPlanPrompt(input: PlanInput): string {
  const today = new Date().toISOString().split("T")[0];
  const stepsSection =
    input.templateSteps.length > 0
      ? `\nGenre workflow steps:\n${input.templateSteps.map((s, i) => `${i + 1}. ${s.name}: ${s.description} (estimated ${s.estimatedDays} days)`).join("\n")}`
      : "";

  return `You are a task planning assistant. Create a detailed daily task plan to achieve the following goal.

Goal: ${input.goalTitle}
${input.goalDescription ? `Description: ${input.goalDescription}` : ""}
Genre: ${input.genre}
Today: ${today}
Deadline: ${input.dueDate}
${stepsSection}

Break this goal down into concrete, actionable daily tasks. Each task should be completable in a single day.
Distribute tasks evenly across the available time, leaving some buffer days.

Respond in JSON format only:
{
  "tasks": [
    {
      "title": "Brief task title",
      "description": "What to do and how",
      "scheduledDate": "YYYY-MM-DD"
    }
  ]
}

Rules:
- All dates must be between ${today} and ${input.dueDate}
- Tasks should follow the genre workflow steps if provided
- Be realistic about what a person can accomplish in one day
- Include rest/review days for longer projects
- Respond with valid JSON only, no markdown or explanation`;
}

function parsePlanResponse(message: Anthropic.Message): PlanOutput | null {
  const text =
    message.content[0].type === "text" ? message.content[0].text : null;
  if (!text) return null;

  try {
    const parsed = JSON.parse(text) as PlanOutput;
    if (!Array.isArray(parsed.tasks)) return null;

    // Validate task structure
    for (const task of parsed.tasks) {
      if (
        typeof task.title !== "string" ||
        typeof task.description !== "string" ||
        typeof task.scheduledDate !== "string"
      ) {
        return null;
      }
    }

    return parsed;
  } catch {
    console.error("[ai] failed to parse plan response:", text.slice(0, 200));
    return null;
  }
}

export async function generatePlan(
  input: PlanInput,
): Promise<PlanOutput | null> {
  const ai = getClient();
  if (!ai) return null;

  try {
    const message = await ai.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 4096,
      messages: [{ role: "user", content: buildPlanPrompt(input) }],
    });

    return parsePlanResponse(message);
  } catch (err) {
    console.error("[ai] plan generation error:", err);
    return null;
  }
}
