import { describe, expect, test, mock } from "bun:test";
import { executeBarriersUpdate } from "../../../src/commands/barriers/update";

describe("barriers update", () => {
  test("updates a barrier", async () => {
    const mockUpdate = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { barriers: { update: mockUpdate } } } as any;
    await executeBarriersUpdate(client, {
      barrierId: "B001",
      primaryUsergroupId: "S001",
      barrieredFromUsergroupIds: ["S002"],
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      barrier_id: "B001",
      primary_usergroup_id: "S001",
      barriered_from_usergroup_ids: ["S002"],
      restricted_subjects: ["im", "mpim", "call"],
    });
  });
});
