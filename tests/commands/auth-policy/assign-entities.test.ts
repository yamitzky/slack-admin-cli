import { describe, expect, test, mock } from "bun:test";
import { executeAuthPolicyAssignEntities } from "../../../src/commands/auth-policy/assign-entities";

describe("auth-policy assign-entities", () => {
  test("calls admin.auth.policy.assignEntities with snake_case params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeAuthPolicyAssignEntities(client, {
      entityIds: ["T001", "T002"],
      entityType: "USER",
      policyName: "email_password",
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.assignEntities", {
      entity_ids: ["T001", "T002"],
      entity_type: "USER",
      policy_name: "email_password",
    });
  });
});
