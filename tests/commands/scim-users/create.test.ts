import { describe, expect, test, mock } from "bun:test";
import { executeScimUsersCreate } from "../../../src/commands/scim-users/create";

describe("scim-users create", () => {
  test("creates user with required params", async () => {
    const created = { id: "U999", userName: "newuser", active: true, emails: [{ value: "new@ex.com", primary: true }], name: { givenName: "", familyName: "" } };
    const mockCreate = mock(() => Promise.resolve(created));
    const client = { users: { create: mockCreate } } as any;
    const result = await executeScimUsersCreate(client, { userName: "newuser", email: "new@ex.com" });
    expect(result.id).toBe("U999");
    expect(mockCreate).toHaveBeenCalledWith({ userName: "newuser", email: "new@ex.com" });
  });

  test("passes optional name fields", async () => {
    const created = { id: "U999", userName: "newuser", active: true, emails: [{ value: "new@ex.com", primary: true }], name: { givenName: "New", familyName: "User" } };
    const mockCreate = mock(() => Promise.resolve(created));
    const client = { users: { create: mockCreate } } as any;
    await executeScimUsersCreate(client, { userName: "newuser", email: "new@ex.com", givenName: "New", familyName: "User", displayName: "New User" });
    expect(mockCreate).toHaveBeenCalledWith({ userName: "newuser", email: "new@ex.com", givenName: "New", familyName: "User", displayName: "New User" });
  });
});
