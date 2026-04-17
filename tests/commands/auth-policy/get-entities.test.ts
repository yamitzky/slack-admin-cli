import { describe, expect, test, mock } from "bun:test";
import { executeAuthPolicyGetEntities } from "../../../src/commands/auth-policy/get-entities";

describe("auth-policy get-entities", () => {
  test("returns entities array", async () => {
    const mockApiCall = mock(() =>
      Promise.resolve({ ok: true, entities: [{ entity_id: "T001" }] }),
    );
    const client = { apiCall: mockApiCall } as any;

    const result = await executeAuthPolicyGetEntities(client, {
      policyName: "email_password",
      entityType: "USER",
      cursor: "abc",
      limit: 10,
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.getEntities", {
      policy_name: "email_password",
      entity_type: "USER",
      cursor: "abc",
      limit: 10,
    });
    expect(result).toEqual([{ entity_id: "T001" }]);
  });

  test("omits optional params when not provided", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true, entities: [] }));
    const client = { apiCall: mockApiCall } as any;
    await executeAuthPolicyGetEntities(client, { policyName: "email_password" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.getEntities", {
      policy_name: "email_password",
    });
  });
});
