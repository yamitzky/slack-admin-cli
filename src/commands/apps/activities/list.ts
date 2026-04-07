import type { WebClient } from "@slack/web-api";

interface AppsActivitiesListOptions {
  appId?: string;
  teamId?: string;
  componentId?: string;
  componentType?: string;
  logEventType?: string;
  maxDateCreated?: number;
  minDateCreated?: number;
  minLogLevel?: string;
  sortDirection?: string;
  source?: string;
  traceId?: string;
  cursor?: string;
  limit?: number;
}

export async function executeAppsActivitiesList(
  client: WebClient,
  opts: AppsActivitiesListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.componentId !== undefined) params.component_id = opts.componentId;
  if (opts.componentType !== undefined) params.component_type = opts.componentType;
  if (opts.logEventType !== undefined) params.log_event_type = opts.logEventType;
  if (opts.maxDateCreated !== undefined) params.max_date_created = opts.maxDateCreated;
  if (opts.minDateCreated !== undefined) params.min_date_created = opts.minDateCreated;
  if (opts.minLogLevel !== undefined) params.min_log_level = opts.minLogLevel;
  if (opts.sortDirection !== undefined) params.sort_direction = opts.sortDirection;
  if (opts.source !== undefined) params.source = opts.source;
  if (opts.traceId !== undefined) params.trace_id = opts.traceId;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.apps.activities.list(params);
  return response.activities ?? [];
}
