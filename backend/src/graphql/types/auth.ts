import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { GraphQLError } from "graphql";
import { eq } from "drizzle-orm";
import { builder } from "../builder.js";
import { db } from "../../db/index.js";
import { users } from "../../db/schema/user.js";
import { signToken } from "../../auth/jwt.js";
import { UserRef, userColumns } from "./user.js";

const SCRYPT_PARAMS = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS).toString("hex");
}

function verifyPassword(
  password: string,
  salt: string,
  storedHash: string,
): boolean {
  const hash = scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  const stored = Buffer.from(storedHash, "hex");
  return timingSafeEqual(hash, stored);
}

const AuthPayloadRef = builder.objectRef<{
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    createdAt: Date;
    updatedAt: Date;
  };
}>("AuthPayload");

builder.objectType(AuthPayloadRef, {
  fields: (t) => ({
    token: t.exposeString("token"),
    user: t.field({ type: UserRef, resolve: (p) => p.user }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    signup: t.field({
      type: AuthPayloadRef,
      args: {
        email: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
        username: t.arg.string({ required: true }),
      },
      resolve: async (_root, args) => {
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(args.email)) {
          throw new GraphQLError("Invalid email format");
        }

        // Validate password length (DoS prevention for scrypt)
        if (args.password.length < 8 || args.password.length > 128) {
          throw new GraphQLError(
            "Password must be between 8 and 128 characters",
          );
        }

        // Validate username
        const usernameRegex = /^[a-zA-Z0-9_]{2,30}$/;
        if (!usernameRegex.test(args.username)) {
          throw new GraphQLError(
            "Username must be 2-30 characters (letters, numbers, underscore)",
          );
        }

        // Check uniqueness
        const [existingEmail] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.email, args.email))
          .limit(1);
        if (existingEmail) {
          throw new GraphQLError("Email already in use");
        }

        const [existingUsername] = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.username, args.username))
          .limit(1);
        if (existingUsername) {
          throw new GraphQLError("Username already taken");
        }

        // Hash password
        const salt = randomBytes(32).toString("hex");
        const passwordHash = hashPassword(args.password, salt);

        // Insert user
        const [user] = await db
          .insert(users)
          .values({
            email: args.email,
            username: args.username,
            passwordHash,
            passwordSalt: salt,
          })
          .returning(userColumns);

        const token = await signToken(user.id);
        return { token, user };
      },
    }),

    login: t.field({
      type: AuthPayloadRef,
      args: {
        email: t.arg.string({ required: true }),
        password: t.arg.string({ required: true }),
      },
      resolve: async (_root, args) => {
        if (args.password.length > 128) {
          throw new GraphQLError("Invalid credentials");
        }

        const [row] = await db
          .select({
            ...userColumns,
            passwordHash: users.passwordHash,
            passwordSalt: users.passwordSalt,
          })
          .from(users)
          .where(eq(users.email, args.email))
          .limit(1);

        if (!row) {
          throw new GraphQLError("Invalid credentials");
        }

        if (
          !verifyPassword(args.password, row.passwordSalt, row.passwordHash)
        ) {
          throw new GraphQLError("Invalid credentials");
        }

        const token = await signToken(row.id);
        const { passwordHash: _ph, passwordSalt: _ps, ...user } = row;
        return { token, user };
      },
    }),
  }),
});

// Query: me
builder.queryType({
  fields: (t) => ({
    me: t.field({
      type: UserRef,
      nullable: true,
      resolve: async (_root, _args, ctx) => {
        const authUser = ctx.authUser;
        if (!authUser) return null;

        const [user] = await db
          .select(userColumns)
          .from(users)
          .where(eq(users.id, authUser.userId))
          .limit(1);

        return user ?? null;
      },
    }),
  }),
});
