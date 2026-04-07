import { describe, expect, test, mock } from "bun:test";
import { executeAppsRestrictedList } from "../../../../src/commands/apps/restricted/list";

describe("apps restricted list", () => {
  test("calls admin.apps.restricted.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, restricted_apps: [{ app: { id: "A1" } }] }),
    );
    const client = { admin: { apps: { restricted: { list: mockList } } } } as any;

    const result = await executeAppsRestrictedList(client, { enterpriseId: "E1" });

    expect(mockList).toHaveBeenCalledWith({ enterprise_id: "E1" });
    expect(result).toHaveLength(1);
  });
});
