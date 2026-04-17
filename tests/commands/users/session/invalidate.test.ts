import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionInvalidate } from "../../../../src/commands/users/session/invalidate";

describe("users session invalidate", () => {
  test("calls admin.users.session.invalidate with team_id and session_id", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { invalidate: mockFn } } } } as any;
    await executeUsersSessionInvalidate(client, { teamId: "T001", sessionId: "S001" });
    expect(mockFn).toHaveBeenCalledWith({ team_id: "T001", session_id: "S001" });
  });
});
