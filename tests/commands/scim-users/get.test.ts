import { describe, expect, test, mock } from "bun:test";
import { executeScimUsersGet } from "../../../src/commands/scim-users/get";

describe("scim-users get", () => {
  test("returns user by id", async () => {
    const user = {
      id: "U001",
      userName: "alice",
      active: true,
      emails: [{ value: "alice@ex.com", primary: true }],
      name: { givenName: "Alice", familyName: "Smith" },
      displayName: "Alice Smith",
    };
    const mockGet = mock(() => Promise.resolve(user));
    const client = { users: { get: mockGet } } as any;
    const result = await executeScimUsersGet(client, { id: "U001" });
    expect(result.id).toBe("U001");
    expect(result.userName).toBe("alice");
    expect(mockGet).toHaveBeenCalledWith("U001");
  });
});
