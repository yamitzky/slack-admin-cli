import type { WebClient } from "@slack/web-api";

interface AuthPolicyGetEntitiesOptions {
  policyName: "email_password";
  entityType?: "USER";
  cursor?: string;
  limit?: number;
}

export async function executeAuthPolicyGetEntities(
  client: WebClient,
  opts: AuthPolicyGetEntitiesOptions,
) {
  const params: Record<string, unknown> = { policy_name: opts.policyName };
  if (opts.entityType !== undefined) params.entity_type = opts.entityType;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.apiCall("admin.auth.policy.getEntities", params);
  const entities = (response as { entities?: unknown[] }).entities;
  return entities ?? [];
}
