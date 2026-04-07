import { describe, expect, test, mock } from "bun:test";
import { executeAppsApprovedList } from "../../../../src/commands/apps/approved/list";

describe("apps approved list", () => {
  test("calls admin.apps.approved.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, approved_apps: [{ app: { id: "A1" } }] }),
    );
    const client = { admin: { apps: { approved: { list: mockList } } } } as any;

    const result = await executeAppsApprovedList(client, { teamId: "T1", limit: 5 });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1", limit: 5 });
    expect(result).toHaveLength(1);
  });
});
