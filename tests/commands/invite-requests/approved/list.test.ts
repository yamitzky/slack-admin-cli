import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsApprovedList } from "../../../../src/commands/invite-requests/approved/list";

describe("invite-requests approved list", () => {
  test("calls admin.inviteRequests.approved.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, approved_requests: [{ id: "IR1" }] }),
    );
    const client = { admin: { inviteRequests: { approved: { list: mockList } } } } as any;
    const result = await executeInviteRequestsApprovedList(client, { teamId: "T1" });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T1" });
    expect(result).toHaveLength(1);
  });
});
