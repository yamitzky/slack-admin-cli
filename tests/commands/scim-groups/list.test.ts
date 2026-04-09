import { describe, expect, test, mock } from "bun:test";
import { executeScimGroupsList } from "../../../src/commands/scim-groups/list";

describe("scim-groups list", () => {
  test("returns groups from SCIM API", async () => {
    const mockList = mock(() =>
      Promise.resolve({
        totalResults: 2, itemsPerPage: 100, startIndex: 1,
        Resources: [
          { id: "G001", displayName: "Engineering", members: [{ value: "U001" }, { value: "U002" }] },
          { id: "G002", displayName: "Design", members: [{ value: "U003" }] },
        ],
      }),
    );
    const client = { groups: { list: mockList } } as any;
    const result = await executeScimGroupsList(client, {});
    expect(result).toHaveLength(2);
    expect(result[0].displayName).toBe("Engineering");
    expect(result[1].id).toBe("G002");
  });

  test("passes pagination and filter params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ totalResults: 0, itemsPerPage: 10, startIndex: 1, Resources: [] }),
    );
    const client = { groups: { list: mockList } } as any;
    await executeScimGroupsList(client, { startIndex: 1, count: 10, filter: "displayName eq \"Eng\"" });
    expect(mockList).toHaveBeenCalledWith({ startIndex: 1, count: 10, filter: "displayName eq \"Eng\"" });
  });
});
