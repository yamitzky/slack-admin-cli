import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionClearSettings } from "../../../../src/commands/users/session/clear-settings";

describe("users session clear-settings", () => {
  test("calls admin.users.session.clearSettings with user_ids", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { clearSettings: mockFn } } } } as any;
    await executeUsersSessionClearSettings(client, { userIds: ["U001", "U002"] });
    expect(mockFn).toHaveBeenCalledWith({ user_ids: ["U001", "U002"] });
  });
});
