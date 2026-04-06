import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetRegular } from "../../../src/commands/users/set-regular";

describe("users set-regular", () => {
  test("calls setRegular with team_id and user_id", async () => {
    const mockSetRegular = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setRegular: mockSetRegular } } } as any;
    await executeUsersSetRegular(client, { teamId: "T001", userId: "U001" });
    expect(mockSetRegular).toHaveBeenCalledWith({ team_id: "T001", user_id: "U001" });
  });
});
