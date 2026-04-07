import type { WebClient } from "@slack/web-api";

interface FunctionsPermissionsSetOptions {
  functionId: string;
  visibility: string;
  userIds?: [string, ...string[]];
}

export async function executeFunctionsPermissionsSet(
  client: WebClient,
  opts: FunctionsPermissionsSetOptions,
): Promise<void> {
  const params: Record<string, unknown> = {
    function_id: opts.functionId,
    visibility: opts.visibility,
  };
  if (opts.userIds !== undefined) params.user_ids = opts.userIds;
  await client.apiCall("admin.functions.permissions.set", params);
}
