import { describe, expect, test, mock } from "bun:test";
import { executeBarriersList } from "../../../src/commands/barriers/list";

describe("barriers list", () => {
  test("returns barriers array", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, barriers: [{ id: "B001" }] }),
    );
    const client = { admin: { barriers: { list: mockList } } } as any;
    const result = await executeBarriersList(client, { cursor: "c", limit: 5 });
    expect(mockList).toHaveBeenCalledWith({ cursor: "c", limit: 5 });
    expect(result).toEqual([{ id: "B001" }]);
  });
});
