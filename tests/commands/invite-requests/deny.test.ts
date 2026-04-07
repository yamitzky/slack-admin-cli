import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsDeny } from "../../../src/commands/invite-requests/deny";

describe("invite-requests deny", () => {
  test("calls admin.inviteRequests.deny with correct params", async () => {
    const mockDeny = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { inviteRequests: { deny: mockDeny } } } as any;
    await executeInviteRequestsDeny(client, { inviteRequestId: "IR1", teamId: "T1" });
    expect(mockDeny).toHaveBeenCalledWith({ invite_request_id: "IR1", team_id: "T1" });
  });
});
