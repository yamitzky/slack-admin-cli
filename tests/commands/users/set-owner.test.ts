import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetOwner } from "../../../src/commands/users/set-owner";

describe("users set-owner", () => {
  test("calls setOwner with team_id and user_id", async () => {
    const mockSetOwner = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setOwner: mockSetOwner } } } as any;
    await executeUsersSetOwner(client, { teamId: "T001", userId: "U001" });
    expect(mockSetOwner).toHaveBeenCalledWith({ team_id: "T001", user_id: "U001" });
  });
});
