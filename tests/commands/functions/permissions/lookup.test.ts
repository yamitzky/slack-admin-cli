import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsPermissionsLookup } from "../../../../src/commands/functions/permissions/lookup";

describe("functions permissions lookup", () => {
  test("calls admin.functions.permissions.lookup with correct params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, permissions: { Fn1: { type: "everyone" } } }),
    );
    const client = { admin: { functions: { permissions: { lookup: mockLookup } } } } as any;

    const result = await executeFunctionsPermissionsLookup(client, { functionIds: ["Fn1"] });

    expect(mockLookup).toHaveBeenCalledWith({ function_ids: ["Fn1"] });
    expect(result).toEqual({ Fn1: { type: "everyone" } });
  });
});
