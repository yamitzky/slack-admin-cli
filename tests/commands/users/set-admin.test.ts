import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetAdmin } from "../../../src/commands/users/set-admin";

describe("users set-admin", () => {
  test("calls setAdmin with team_id and user_id", async () => {
    const mockSetAdmin = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setAdmin: mockSetAdmin } } } as any;
    await executeUsersSetAdmin(client, { teamId: "T001", userId: "U001" });
    expect(mockSetAdmin).toHaveBeenCalledWith({ team_id: "T001", user_id: "U001" });
  });
});
