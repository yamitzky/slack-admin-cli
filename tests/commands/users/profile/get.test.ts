import { describe, expect, test, mock } from "bun:test";
import { executeUsersProfileGet } from "../../../../src/commands/users/profile/get";

describe("users profile get", () => {
  test("returns profile", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true, profile: { real_name: "Alice" } }));
    const client = { users: { profile: { get: mockGet } } } as any;
    const result = await executeUsersProfileGet(client, { user: "U001" });
    expect(result?.real_name).toBe("Alice");
    expect(mockGet).toHaveBeenCalledWith({ user: "U001" });
  });

  test("passes include_labels", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { users: { profile: { get: mockGet } } } as any;
    await executeUsersProfileGet(client, { includeLabels: true });
    expect(mockGet).toHaveBeenCalledWith({ include_labels: true });
  });
});
