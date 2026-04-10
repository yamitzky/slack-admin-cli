import { describe, expect, test, mock } from "bun:test";
import { executeScimUsersDeactivate } from "../../../src/commands/scim-users/deactivate";

describe("scim-users deactivate", () => {
  test("calls deactivate with user id", async () => {
    const mockDeactivate = mock(() => Promise.resolve(undefined));
    const client = { users: { deactivate: mockDeactivate } } as any;
    await executeScimUsersDeactivate(client, { id: "U001" });
    expect(mockDeactivate).toHaveBeenCalledWith("U001");
  });
});
