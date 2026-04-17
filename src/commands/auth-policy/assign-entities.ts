import type { WebClient } from "@slack/web-api";

interface AuthPolicyAssignEntitiesOptions {
  entityIds: string[];
  entityType: "USER";
  policyName: "email_password";
}

export async function executeAuthPolicyAssignEntities(
  client: WebClient,
  opts: AuthPolicyAssignEntitiesOptions,
): Promise<void> {
  await client.apiCall("admin.auth.policy.assignEntities", {
    entity_ids: opts.entityIds,
    entity_type: opts.entityType,
    policy_name: opts.policyName,
  });
}
