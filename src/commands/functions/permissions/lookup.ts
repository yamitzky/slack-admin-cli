import type { WebClient } from "@slack/web-api";

export async function executeFunctionsPermissionsLookup(
  client: WebClient,
  args: { functionIds: [string, ...string[]] },
) {
  const response = await client.admin.functions.permissions.lookup({
    function_ids: args.functionIds,
  });
  return response.permissions ?? {};
}
