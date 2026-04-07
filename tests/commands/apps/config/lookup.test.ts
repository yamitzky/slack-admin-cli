import { describe, expect, test, mock } from "bun:test";
import { executeAppsConfigLookup } from "../../../../src/commands/apps/config/lookup";

describe("apps config lookup", () => {
  test("calls admin.apps.config.lookup with correct params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, configs: [{ app_id: "A1", domain_restrictions: {} }] }),
    );
    const client = { admin: { apps: { config: { lookup: mockLookup } } } } as any;

    const result = await executeAppsConfigLookup(client, { appIds: ["A1", "A2"] });

    expect(mockLookup).toHaveBeenCalledWith({ app_ids: ["A1", "A2"] });
    expect(result).toHaveLength(1);
  });
});
