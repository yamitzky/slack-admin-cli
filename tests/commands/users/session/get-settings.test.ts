import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionGetSettings } from "../../../../src/commands/users/session/get-settings";

describe("users session get-settings", () => {
  test("returns session_settings array", async () => {
    const mockFn = mock(() =>
      Promise.resolve({
        ok: true,
        session_settings: [{ user_id: "U001", duration: 3600 }],
      }),
    );
    const client = { admin: { users: { session: { getSettings: mockFn } } } } as any;
    const result = await executeUsersSessionGetSettings(client, { userIds: ["U001"] });
    expect(mockFn).toHaveBeenCalledWith({ user_ids: ["U001"] });
    expect(result).toEqual([{ user_id: "U001", duration: 3600 }]);
  });

  test("returns [] when session_settings is missing", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { getSettings: mockFn } } } } as any;
    const result = await executeUsersSessionGetSettings(client, { userIds: ["U001"] });
    expect(result).toEqual([]);
  });
});
