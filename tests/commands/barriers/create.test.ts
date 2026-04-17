import { describe, expect, test, mock } from "bun:test";
import { executeBarriersCreate } from "../../../src/commands/barriers/create";

describe("barriers create", () => {
  test("creates a barrier with restricted_subjects defaulted", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, barrier: { id: "B001" } }));
    const client = { admin: { barriers: { create: mockCreate } } } as any;
    await executeBarriersCreate(client, {
      primaryUsergroupId: "S001",
      barrieredFromUsergroupIds: ["S002", "S003"],
    });
    expect(mockCreate).toHaveBeenCalledWith({
      primary_usergroup_id: "S001",
      barriered_from_usergroup_ids: ["S002", "S003"],
      restricted_subjects: ["im", "mpim", "call"],
    });
  });
});
