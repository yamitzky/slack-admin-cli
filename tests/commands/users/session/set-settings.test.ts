import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionSetSettings } from "../../../../src/commands/users/session/set-settings";

describe("users session set-settings", () => {
  test("calls admin.users.session.setSettings with user_ids", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { setSettings: mockFn } } } } as any;
    await executeUsersSessionSetSettings(client, { userIds: ["U001"] });
    expect(mockFn).toHaveBeenCalledWith({ user_ids: ["U001"] });
  });

  test("passes desktop_app_browser_quit and duration when provided", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { setSettings: mockFn } } } } as any;
    await executeUsersSessionSetSettings(client, {
      userIds: ["U001"],
      desktopAppBrowserQuit: true,
      duration: 7200,
    });
    expect(mockFn).toHaveBeenCalledWith({
      user_ids: ["U001"],
      desktop_app_browser_quit: true,
      duration: 7200,
    });
  });
});
