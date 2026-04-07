import type { WebClient } from "@slack/web-api";

interface ConversationsCreateOptions {
  name: string;
  isPrivate: boolean;
  teamId?: string;
  orgWide?: boolean;
  description?: string;
}

export async function executeConversationsCreate(
  client: WebClient,
  opts: ConversationsCreateOptions,
) {
  const params: Record<string, unknown> = {
    name: opts.name,
    is_private: opts.isPrivate,
  };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.orgWide !== undefined) params.org_wide = opts.orgWide;
  if (opts.description !== undefined) params.description = opts.description;

  return await client.admin.conversations.create(params);
}
