import { builder } from "../builder.js";
import { users } from "../../db/schema/user.js";

// Column selection for queries — never select passwordHash/passwordSalt
export const userColumns = {
  id: users.id,
  email: users.email,
  username: users.username,
  displayName: users.displayName,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
};

export const UserRef = builder.objectRef<{
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  createdAt: Date;
  updatedAt: Date;
}>("User");

builder.objectType(UserRef, {
  fields: (t) => ({
    id: t.exposeID("id"),
    email: t.exposeString("email"),
    username: t.exposeString("username"),
    displayName: t.exposeString("displayName", { nullable: true }),
    createdAt: t.field({
      type: "String",
      resolve: (user) => user.createdAt.toISOString(),
    }),
    updatedAt: t.field({
      type: "String",
      resolve: (user) => user.updatedAt.toISOString(),
    }),
  }),
});
