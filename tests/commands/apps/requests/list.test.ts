import { describe, expect, test, mock } from "bun:test";
import { executeAppsRequestsList } from "../../../../src/commands/apps/requests/list";

describe("apps requests list", () => {
  test("calls admin.apps.requests.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, app_requests: [{ id: "R1" }] }),
    );
    const client = { admin: { apps: { requests: { list: mockList } } } } as any;

    const result = await executeAppsRequestsList(client, { teamId: "T1" });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1" });
    expect(result).toHaveLength(1);
  });
});
