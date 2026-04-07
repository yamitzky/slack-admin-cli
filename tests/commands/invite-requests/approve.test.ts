import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsApprove } from "../../../src/commands/invite-requests/approve";

describe("invite-requests approve", () => {
  test("calls admin.inviteRequests.approve with correct params", async () => {
    const mockApprove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { inviteRequests: { approve: mockApprove } } } as any;
    await executeInviteRequestsApprove(client, { inviteRequestId: "IR1", teamId: "T1" });
    expect(mockApprove).toHaveBeenCalledWith({ invite_request_id: "IR1", team_id: "T1" });
  });
});
