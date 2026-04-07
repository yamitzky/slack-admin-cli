import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsList } from "../../../src/commands/invite-requests/list";

describe("invite-requests list", () => {
  test("calls admin.inviteRequests.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, invite_requests: [{ id: "IR1" }] }),
    );
    const client = { admin: { inviteRequests: { list: mockList } } } as any;
    const result = await executeInviteRequestsList(client, { teamId: "T1", limit: 10 });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T1", limit: 10 });
    expect(result).toHaveLength(1);
  });
});
