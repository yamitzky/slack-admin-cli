import { describe, expect, test, mock } from "bun:test";
import { executeUsersProfileSet } from "../../../../src/commands/users/profile/set";

describe("users profile set", () => {
  test("sets single field by name/value", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { users: { profile: { set: mockSet } } } as any;
    await executeUsersProfileSet(client, { user: "U001", name: "title", value: "Engineer" });
    expect(mockSet).toHaveBeenCalledWith({ user: "U001", name: "title", value: "Engineer" });
  });

  test("sets multiple fields via profile JSON", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { users: { profile: { set: mockSet } } } as any;
    await executeUsersProfileSet(client, { user: "U001", profile: { real_name: "Alice" } });
    expect(mockSet).toHaveBeenCalledWith({ user: "U001", profile: { real_name: "Alice" } });
  });
});
