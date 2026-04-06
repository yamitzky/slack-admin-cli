import { describe, expect, test, mock } from "bun:test";
import { executeUsersRemove } from "../../../src/commands/users/remove";

describe("users remove", () => {
  test("calls remove with team_id and user_id", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { remove: mockRemove } } } as any;
    await executeUsersRemove(client, { teamId: "T001", userId: "U001" });
    expect(mockRemove).toHaveBeenCalledWith({ team_id: "T001", user_id: "U001" });
  });
});
