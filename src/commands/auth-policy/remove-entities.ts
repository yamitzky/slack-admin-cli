import type { WebClient } from "@slack/web-api";

interface AuthPolicyRemoveEntitiesOptions {
  entityIds: [string, ...string[]];
  entityType: "USER";
  policyName: "email_password";
}

export async function executeAuthPolicyRemoveEntities(
  client: WebClient,
  opts: AuthPolicyRemoveEntitiesOptions,
): Promise<void> {
  await client.apiCall("admin.auth.policy.removeEntities", {
    entity_ids: opts.entityIds,
    entity_type: opts.entityType,
    policy_name: opts.policyName,
  });
}
