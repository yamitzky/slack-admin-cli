import { describe, expect, test, mock } from "bun:test";
import { executeAppsRestrict } from "../../../src/commands/apps/restrict";

describe("apps restrict", () => {
  test("calls admin.apps.restrict with correct params", async () => {
    const mockRestrict = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { restrict: mockRestrict } } } as any;
    await executeAppsRestrict(client, { appId: "A123", teamId: "T456" });
    expect(mockRestrict).toHaveBeenCalledWith({ app_id: "A123", team_id: "T456" });
  });
});
