import { describe, expect, test, mock } from "bun:test";
import { executeAppsActivitiesList } from "../../../../src/commands/apps/activities/list";

describe("apps activities list", () => {
  test("calls admin.apps.activities.list with params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, activities: [{ app_id: "A1", trace_id: "t1" }] }),
    );
    const client = { admin: { apps: { activities: { list: mockList } } } } as any;

    const result = await executeAppsActivitiesList(client, {
      appId: "A1",
      minLogLevel: "warn",
      limit: 10,
    });

    expect(mockList).toHaveBeenCalledWith({
      app_id: "A1",
      min_log_level: "warn",
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });

  test("calls with no params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, activities: [] }),
    );
    const client = { admin: { apps: { activities: { list: mockList } } } } as any;

    const result = await executeAppsActivitiesList(client, {});

    expect(mockList).toHaveBeenCalledWith({});
    expect(result).toHaveLength(0);
  });
});
