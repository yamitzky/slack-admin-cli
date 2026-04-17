import { describe, expect, test, mock } from "bun:test";
import { executeAuthPolicyRemoveEntities } from "../../../src/commands/auth-policy/remove-entities";

describe("auth-policy remove-entities", () => {
  test("calls admin.auth.policy.removeEntities", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAuthPolicyRemoveEntities(client, {
      entityIds: ["T001"],
      entityType: "USER",
      policyName: "email_password",
    });
    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.removeEntities", {
      entity_ids: ["T001"],
      entity_type: "USER",
      policy_name: "email_password",
    });
  });
});
