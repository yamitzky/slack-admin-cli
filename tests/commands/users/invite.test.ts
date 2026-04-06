import { describe, expect, test, mock } from "bun:test";
import { executeUsersInvite } from "../../../src/commands/users/invite";

describe("users invite", () => {
  test("calls invite with required args", async () => {
    const mockInvite = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { invite: mockInvite } } } as any;
    await executeUsersInvite(client, { teamId: "T001", email: "user@example.com", channelIds: ["C001", "C002"] });
    expect(mockInvite).toHaveBeenCalledWith({ team_id: "T001", email: "user@example.com", channel_ids: ["C001", "C002"] });
  });

  test("passes optional params", async () => {
    const mockInvite = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { invite: mockInvite } } } as any;
    await executeUsersInvite(client, { teamId: "T001", email: "guest@example.com", channelIds: ["C001"], isRestricted: true, realName: "Guest User", customMessage: "Welcome!" });
    expect(mockInvite).toHaveBeenCalledWith({ team_id: "T001", email: "guest@example.com", channel_ids: ["C001"], is_restricted: true, real_name: "Guest User", custom_message: "Welcome!" });
  });
});
