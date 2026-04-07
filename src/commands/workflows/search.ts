import type { WebClient } from "@slack/web-api";

interface WorkflowsSearchOptions {
  appId?: string;
  collaboratorIds?: [string, ...string[]];
  noCollaborators?: boolean;
  numTriggerIds?: number;
  query?: string;
  sort?: string;
  source?: string;
  sortDir?: string;
  cursor?: string;
  limit?: number;
}

export async function executeWorkflowsSearch(
  client: WebClient,
  opts: WorkflowsSearchOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.collaboratorIds !== undefined) params.collaborator_ids = opts.collaboratorIds;
  if (opts.noCollaborators !== undefined) params.no_collaborators = opts.noCollaborators;
  if (opts.numTriggerIds !== undefined) params.num_trigger_ids = opts.numTriggerIds;
  if (opts.query !== undefined) params.query = opts.query;
  if (opts.sort !== undefined) params.sort = opts.sort;
  if (opts.source !== undefined) params.source = opts.source;
  if (opts.sortDir !== undefined) params.sort_dir = opts.sortDir;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.workflows.search(params);
  return response.workflows ?? [];
}
