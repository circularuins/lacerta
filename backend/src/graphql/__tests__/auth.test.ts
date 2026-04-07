import { describe, it, expect, beforeEach, afterAll } from "vitest";
import {
  setupTest,
  teardownAll,
  gqlRequest,
  createTestUser,
} from "./helpers.js";

describe("Auth", () => {
  beforeEach(async () => {
    await setupTest();
  });

  afterAll(async () => {
    await teardownAll();
  });

  describe("signup", () => {
    it("creates a new user and returns token", async () => {
      const result = await gqlRequest(
        `mutation {
          signup(email: "new@test.com", password: "password123", username: "newuser") {
            token
            user { id email username }
          }
        }`,
      );

      expect(result.errors).toBeUndefined();
      expect(result.data?.signup).toBeDefined();
      const signup = result.data!.signup as {
        token: string;
        user: { email: string; username: string };
      };
      expect(signup.token).toBeDefined();
      expect(signup.user.email).toBe("new@test.com");
      expect(signup.user.username).toBe("newuser");
    });

    it("rejects duplicate email", async () => {
      await createTestUser({ email: "dup@test.com" });
      const result = await gqlRequest(
        `mutation {
          signup(email: "dup@test.com", password: "password123", username: "other") {
            token
          }
        }`,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain("Email already in use");
    });

    it("rejects short password", async () => {
      const result = await gqlRequest(
        `mutation {
          signup(email: "x@test.com", password: "short", username: "testuser") {
            token
          }
        }`,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toContain("between 8 and 128");
    });
  });

  describe("login", () => {
    it("authenticates with correct credentials", async () => {
      await createTestUser({ email: "login@test.com", password: "mypassword" });
      const result = await gqlRequest(
        `mutation {
          login(email: "login@test.com", password: "mypassword") {
            token
            user { email }
          }
        }`,
      );

      expect(result.errors).toBeUndefined();
      const login = result.data!.login as {
        token: string;
        user: { email: string };
      };
      expect(login.token).toBeDefined();
      expect(login.user.email).toBe("login@test.com");
    });

    it("rejects wrong password", async () => {
      await createTestUser({
        email: "login@test.com",
        username: "wrongpwtest",
        password: "correctpass",
      });
      const result = await gqlRequest(
        `mutation {
          login(email: "login@test.com", password: "wrongpass") {
            token
          }
        }`,
      );

      expect(result.errors).toBeDefined();
      expect(result.errors![0].message).toBe("Invalid credentials");
    });
  });

  describe("me", () => {
    it("returns current user when authenticated", async () => {
      const { token } = await createTestUser();
      const result = await gqlRequest(
        `query { me { id email username } }`,
        undefined,
        token,
      );

      expect(result.errors).toBeUndefined();
      const me = result.data!.me as { email: string };
      expect(me.email).toBe("test@test.com");
    });

    it("returns null when unauthenticated", async () => {
      const result = await gqlRequest(`query { me { id } }`);

      expect(result.errors).toBeUndefined();
      expect(result.data?.me).toBeNull();
    });
  });
});
