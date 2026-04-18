import { describe, expect, test, mock } from "bun:test";
import { executeUsersGetPresence } from "../../../src/commands/users/get-presence";

describe("users get-presence", () => {
  test("returns presence info", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true, presence: "active", online: true }));
    const client = { users: { getPresence: mockGet } } as any;
    const result = await executeUsersGetPresence(client, { user: "U001" });
    expect(result.presence).toBe("active");
    expect(mockGet).toHaveBeenCalledWith({ user: "U001" });
  });
});
