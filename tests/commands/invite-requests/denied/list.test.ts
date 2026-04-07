import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsDeniedList } from "../../../../src/commands/invite-requests/denied/list";

describe("invite-requests denied list", () => {
  test("calls admin.inviteRequests.denied.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, denied_requests: [{ id: "IR1" }] }),
    );
    const client = { admin: { inviteRequests: { denied: { list: mockList } } } } as any;
    const result = await executeInviteRequestsDeniedList(client, { teamId: "T1" });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T1" });
    expect(result).toHaveLength(1);
  });
});
