import type { WebClient } from "@slack/web-api";

interface SessionListOptions {
  teamId?: string;
  userId?: string;
  cursor?: string;
  limit?: number;
}

export interface ActiveSession {
  session_id?: string;
  user_id?: string;
  team_id?: string;
}

export async function executeUsersSessionList(
  client: WebClient,
  opts: SessionListOptions,
): Promise<ActiveSession[]> {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined && opts.userId !== undefined) {
    params.team_id = opts.teamId;
    params.user_id = opts.userId;
  } else if (opts.teamId !== undefined || opts.userId !== undefined) {
    throw new Error("--team-id and --user-id must be provided together (or neither)");
  }
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response: unknown = await client.apiCall("admin.users.session.list", params);
  if (typeof response !== "object" || response === null || !("active_sessions" in response)) return [];
  const sessions = response.active_sessions;
  if (!Array.isArray(sessions)) return [];
  return sessions.filter((s): s is ActiveSession => typeof s === "object" && s !== null);
}
