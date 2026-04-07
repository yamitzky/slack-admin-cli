import type { WebClient } from "@slack/web-api";

export async function executeAppsConfigLookup(
  client: WebClient,
  args: { appIds: string[] },
) {
  const response = await client.admin.apps.config.lookup({ app_ids: args.appIds });
  return response.configs ?? [];
}
