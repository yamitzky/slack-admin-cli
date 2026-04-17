import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionResetBulk } from "../../../../src/commands/users/session/reset-bulk";

describe("users session reset-bulk", () => {
  test("calls admin.users.session.resetBulk with user_ids", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { resetBulk: mockFn } } } } as any;
    await executeUsersSessionResetBulk(client, { userIds: ["U001", "U002"] });
    expect(mockFn).toHaveBeenCalledWith({ user_ids: ["U001", "U002"] });
  });

  test("passes mobile_only and web_only flags when provided", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { resetBulk: mockFn } } } } as any;
    await executeUsersSessionResetBulk(client, {
      userIds: ["U001"],
      mobileOnly: true,
      webOnly: false,
    });
    expect(mockFn).toHaveBeenCalledWith({
      user_ids: ["U001"],
      mobile_only: true,
      web_only: false,
    });
  });
});
