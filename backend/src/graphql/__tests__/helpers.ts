import { Hono } from "hono";
import { createYoga } from "graphql-yoga";
import { db, client } from "../../db/index.js";
import { initJwtKeys } from "../../auth/jwt.js";
import { authMiddleware, type AuthUser } from "../../auth/middleware.js";
import { builder } from "../builder.js";
import "../types/index.js";
import { sql } from "drizzle-orm";

let app: ReturnType<typeof createTestApp> | null = null;
let initialized = false;

function createTestApp() {
  const schema = builder.toSchema();
  const yoga = createYoga<{ authUser?: AuthUser }>({
    schema,
    maskedErrors: false,
  });

  const hono = new Hono<{ Variables: { authUser?: AuthUser } }>();
  hono.use(authMiddleware);
  hono.on(["GET", "POST"], "/graphql", async (c) => {
    const authUser = c.get("authUser");
    const response = await yoga.handleRequest(c.req.raw, { authUser });
    return response;
  });
  return hono;
}

export async function setupTest() {
  if (!initialized) {
    await initJwtKeys();
    initialized = true;
  }
  if (!app) {
    app = createTestApp();
  }
  await db.execute(sql`TRUNCATE users CASCADE`);
}

export async function teardownAll() {
  await client.end();
}

export async function gqlRequest(
  query: string,
  variables?: Record<string, unknown>,
  token?: string,
) {
  if (!app) throw new Error("Call setupTest() first");

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await app.request("/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  return response.json() as Promise<{
    data?: Record<string, unknown>;
    errors?: { message: string }[];
  }>;
}

export async function createTestUser(
  overrides?: Partial<{
    email: string;
    username: string;
    password: string;
  }>,
) {
  const email = overrides?.email ?? "test@test.com";
  const username = overrides?.username ?? "testuser";
  const password = overrides?.password ?? "password123";

  const result = await gqlRequest(
    `mutation Signup($email: String!, $password: String!, $username: String!) {
      signup(email: $email, password: $password, username: $username) {
        token
        user { id email username displayName createdAt updatedAt }
      }
    }`,
    { email, username, password },
  );

  if (result.errors) {
    throw new Error(`createTestUser failed: ${result.errors[0].message}`);
  }
  const signup = result.data!.signup as {
    token: string;
    user: { id: string };
  };
  return { token: signup.token, user: signup.user };
}
