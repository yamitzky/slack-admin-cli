import { describe, expect, test, mock } from "bun:test";
import { executeScimUsersList } from "../../../src/commands/scim-users/list";

describe("scim-users list", () => {
  test("returns users from SCIM API", async () => {
    const mockList = mock(() =>
      Promise.resolve({
        totalResults: 2,
        itemsPerPage: 100,
        startIndex: 1,
        Resources: [
          { id: "U001", userName: "alice", active: true, emails: [{ value: "alice@ex.com", primary: true }], name: { givenName: "Alice", familyName: "Smith" } },
          { id: "U002", userName: "bob", active: false, emails: [{ value: "bob@ex.com", primary: true }], name: { givenName: "Bob", familyName: "Jones" } },
        ],
      }),
    );
    const client = { users: { list: mockList } } as any;
    const result = await executeScimUsersList(client, {});
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("U001");
    expect(result[1].userName).toBe("bob");
  });

  test("passes pagination and filter params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ totalResults: 0, itemsPerPage: 10, startIndex: 5, Resources: [] }),
    );
    const client = { users: { list: mockList } } as any;
    await executeScimUsersList(client, { startIndex: 5, count: 10, filter: "userName eq \"alice\"" });
    expect(mockList).toHaveBeenCalledWith({ startIndex: 5, count: 10, filter: "userName eq \"alice\"" });
  });

  test("returns empty array when no users", async () => {
    const mockList = mock(() =>
      Promise.resolve({ totalResults: 0, itemsPerPage: 100, startIndex: 1, Resources: [] }),
    );
    const client = { users: { list: mockList } } as any;
    const result = await executeScimUsersList(client, {});
    expect(result).toEqual([]);
  });
});
