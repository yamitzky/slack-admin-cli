import { describe, expect, test, mock } from "bun:test";
import { executeUsersAssign } from "../../../src/commands/users/assign";

describe("users assign", () => {
  test("calls assign with team_id and user_id", async () => {
    const mockAssign = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { assign: mockAssign } } } as any;
    await executeUsersAssign(client, { teamId: "T001", userId: "U001" });
    expect(mockAssign).toHaveBeenCalledWith({ team_id: "T001", user_id: "U001" });
  });

  test("passes optional guest params", async () => {
    const mockAssign = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { assign: mockAssign } } } as any;
    await executeUsersAssign(client, { teamId: "T001", userId: "U001", channelIds: ["C001"], isRestricted: true });
    expect(mockAssign).toHaveBeenCalledWith({ team_id: "T001", user_id: "U001", channel_ids: ["C001"], is_restricted: true });
  });
});
