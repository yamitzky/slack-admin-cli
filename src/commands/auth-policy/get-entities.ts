import type { WebClient } from "@slack/web-api";

interface AuthPolicyGetEntitiesOptions {
  policyName: "email_password";
  entityType?: "USER";
  cursor?: string;
  limit?: number;
}

export interface AuthPolicyEntity {
  entity_id?: string;
  entity_type?: string;
}

export async function executeAuthPolicyGetEntities(
  client: WebClient,
  opts: AuthPolicyGetEntitiesOptions,
): Promise<AuthPolicyEntity[]> {
  const params: Record<string, unknown> = { policy_name: opts.policyName };
  if (opts.entityType !== undefined) params.entity_type = opts.entityType;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response: unknown = await client.apiCall("admin.auth.policy.getEntities", params);
  if (typeof response !== "object" || response === null || !("entities" in response)) return [];
  const entities = response.entities;
  if (!Array.isArray(entities)) return [];
  return entities.filter((e): e is AuthPolicyEntity => typeof e === "object" && e !== null);
}
