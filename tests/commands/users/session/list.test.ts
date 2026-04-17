import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionList } from "../../../../src/commands/users/session/list";

describe("users session list", () => {
  test("returns active_sessions array with team+user", async () => {
    const mockApiCall = mock(() =>
      Promise.resolve({ ok: true, active_sessions: [{ session_id: "S1" }] }),
    );
    const client = { apiCall: mockApiCall } as any;
    const result = await executeUsersSessionList(client, {
      teamId: "T001",
      userId: "U001",
      cursor: "c",
      limit: 5,
    });
    expect(mockApiCall).toHaveBeenCalledWith("admin.users.session.list", {
      team_id: "T001",
      user_id: "U001",
      cursor: "c",
      limit: 5,
    });
    expect(result).toEqual([{ session_id: "S1" }]);
  });

  test("works with neither team nor user", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true, active_sessions: [] }));
    const client = { apiCall: mockApiCall } as any;
    await executeUsersSessionList(client, {});
    expect(mockApiCall).toHaveBeenCalledWith("admin.users.session.list", {});
  });

  test("rejects when only team_id is provided", async () => {
    const client = { apiCall: mock(() => Promise.resolve({ ok: true })) } as any;
    await expect(executeUsersSessionList(client, { teamId: "T001" })).rejects.toThrow();
  });

  test("rejects when only user_id is provided", async () => {
    const client = { apiCall: mock(() => Promise.resolve({ ok: true })) } as any;
    await expect(executeUsersSessionList(client, { userId: "U001" })).rejects.toThrow();
  });

  test("returns [] when active_sessions is missing", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    const result = await executeUsersSessionList(client, {});
    expect(result).toEqual([]);
  });
});
