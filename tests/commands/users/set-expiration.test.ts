import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetExpiration } from "../../../src/commands/users/set-expiration";

describe("users set-expiration", () => {
  test("calls admin.users.setExpiration", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setExpiration: mockFn } } } as any;
    await executeUsersSetExpiration(client, {
      userId: "U001",
      expirationTs: 1700000000,
      teamId: "T001",
    });
    expect(mockFn).toHaveBeenCalledWith({
      user_id: "U001",
      expiration_ts: 1700000000,
      team_id: "T001",
    });
  });
});
