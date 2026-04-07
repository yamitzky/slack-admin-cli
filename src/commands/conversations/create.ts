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
  const base = {
    name: opts.name,
    is_private: opts.isPrivate,
    ...(opts.description !== undefined ? { description: opts.description } : {}),
  };

  if (opts.orgWide === true) {
    return await client.admin.conversations.create({
      ...base,
      org_wide: true,
    });
  }

  if (opts.teamId === undefined) {
    throw new Error("Either --team-id or --org-wide must be provided.");
  }

  return await client.admin.conversations.create({
    ...base,
    team_id: opts.teamId,
  });
}
