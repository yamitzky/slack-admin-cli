import { describe, expect, test, mock } from "bun:test";
import { executeBarriersDelete } from "../../../src/commands/barriers/delete";

describe("barriers delete", () => {
  test("deletes by id", async () => {
    const mockDelete = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { barriers: { delete: mockDelete } } } as any;
    await executeBarriersDelete(client, { barrierId: "B001" });
    expect(mockDelete).toHaveBeenCalledWith({ barrier_id: "B001" });
  });
});
