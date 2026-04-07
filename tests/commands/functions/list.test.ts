import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsList } from "../../../src/commands/functions/list";

describe("functions list", () => {
  test("calls admin.functions.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, functions: [{ id: "Fn1", title: "My Function" }] }),
    );
    const client = { admin: { functions: { list: mockList } } } as any;

    const result = await executeFunctionsList(client, {
      appIds: ["A1"],
      teamId: "T1",
      limit: 10,
    });

    expect(mockList).toHaveBeenCalledWith({
      app_ids: ["A1"],
      team_id: "T1",
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });
});
