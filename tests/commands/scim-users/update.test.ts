import { describe, expect, test, mock } from "bun:test";
import { executeScimUsersUpdate } from "../../../src/commands/scim-users/update";

describe("scim-users update", () => {
  test("builds replace operations for provided fields", async () => {
    const updated = { id: "U001", userName: "alice", active: false, emails: [], name: { givenName: "Alice", familyName: "Smith" } };
    const mockUpdate = mock(() => Promise.resolve(updated));
    const client = { users: { update: mockUpdate } } as any;
    await executeScimUsersUpdate(client, { id: "U001", active: false, title: "Engineer" });
    expect(mockUpdate).toHaveBeenCalledWith("U001", [
      { op: "replace", path: "active", value: false },
      { op: "replace", path: "title", value: "Engineer" },
    ]);
  });

  test("handles single field update", async () => {
    const updated = { id: "U001", userName: "alice-new", active: true, emails: [], name: { givenName: "Alice", familyName: "Smith" } };
    const mockUpdate = mock(() => Promise.resolve(updated));
    const client = { users: { update: mockUpdate } } as any;
    const result = await executeScimUsersUpdate(client, { id: "U001", userName: "alice-new" });
    expect(result.userName).toBe("alice-new");
    expect(mockUpdate).toHaveBeenCalledWith("U001", [
      { op: "replace", path: "userName", value: "alice-new" },
    ]);
  });

  test("updates email using SCIM filter path for primary address", async () => {
    const updated = { id: "U001", emails: [{ value: "new@example.com", primary: true }] };
    const mockUpdate = mock(() => Promise.resolve(updated));
    const client = { users: { update: mockUpdate } } as any;
    await executeScimUsersUpdate(client, { id: "U001", email: "new@example.com" });
    expect(mockUpdate).toHaveBeenCalledWith("U001", [
      { op: "replace", path: 'emails[primary eq true].value', value: "new@example.com" },
    ]);
  });

  test("throws when no fields provided", async () => {
    const client = { users: { update: mock(() => Promise.resolve({})) } } as any;
    await expect(executeScimUsersUpdate(client, { id: "U001" })).rejects.toThrow(
      "At least one field to update must be specified",
    );
  });
});
