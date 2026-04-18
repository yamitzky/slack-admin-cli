import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsDisable } from "../../../src/commands/usergroups/disable";

describe("usergroups disable", () => {
  test("disables usergroup", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { disable: mockCall } } as any;
    await executeUsergroupsDisable(client, { usergroup: "S001" });
    expect(mockCall).toHaveBeenCalledWith({ usergroup: "S001" });
  });
});
