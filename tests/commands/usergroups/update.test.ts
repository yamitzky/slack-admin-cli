import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsUpdate } from "../../../src/commands/usergroups/update";

describe("usergroups update", () => {
  test("updates fields", async () => {
    const mockUpdate = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { update: mockUpdate } } as any;
    await executeUsergroupsUpdate(client, { usergroup: "S001", name: "renamed", channels: "C003" });
    expect(mockUpdate).toHaveBeenCalledWith({ usergroup: "S001", name: "renamed", channels: "C003" });
  });
});
