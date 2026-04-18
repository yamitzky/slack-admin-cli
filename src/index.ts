#!/usr/bin/env bun
import { object, or } from "@optique/core/constructs";
import { optional } from "@optique/core/modifiers";
import { argument, command, constant, option } from "@optique/core/primitives";
import { string, integer } from "@optique/core/valueparser";
import type { ValueParser, ValueParserResult } from "@optique/core/valueparser";
import { run } from "@optique/run";

import { executeTokenAdd } from "./commands/token/add";
import { executeTokenList } from "./commands/token/list";
import { executeTokenRemove } from "./commands/token/remove";
import { executeTokenStatus } from "./commands/token/status";
import { executeTeamsCreate } from "./commands/teams/create";
import { executeTeamsList } from "./commands/teams/list";
import { executeTeamsAdminsList } from "./commands/teams/admins-list";
import { executeTeamsOwnersList } from "./commands/teams/owners-list";
import { executeSettingsInfo } from "./commands/teams/settings/info";
import { executeSetName } from "./commands/teams/settings/set-name";
import { executeSetIcon } from "./commands/teams/settings/set-icon";
import { executeSetDescription } from "./commands/teams/settings/set-description";
import { executeSetDiscoverability } from "./commands/teams/settings/set-discoverability";
import { executeSetDefaultChannels } from "./commands/teams/settings/set-default-channels";
import { executeUsersList } from "./commands/users/list";
import { executeUsersInvite } from "./commands/users/invite";
import { executeUsersAssign } from "./commands/users/assign";
import { executeUsersRemove } from "./commands/users/remove";
import { executeUsersSetAdmin } from "./commands/users/set-admin";
import { executeUsersSetOwner } from "./commands/users/set-owner";
import { executeUsersSetRegular } from "./commands/users/set-regular";
import { executeSessionReset } from "./commands/users/session-reset";
import { executeUsersSessionClearSettings } from "./commands/users/session/clear-settings";
import { executeUsersSessionGetSettings } from "./commands/users/session/get-settings";
import { executeUsersSessionInvalidate } from "./commands/users/session/invalidate";
import { executeUsersSessionList } from "./commands/users/session/list";
import { executeUsersSessionResetBulk } from "./commands/users/session/reset-bulk";
import { executeUsersSessionSetSettings } from "./commands/users/session/set-settings";
import { executeUsersSetExpiration } from "./commands/users/set-expiration";
import { executeUsersUnsupportedVersionsExport } from "./commands/users/unsupported-versions/export";
import { executeUsersInfo } from "./commands/users/info";
import { executeUsersLookupByEmail } from "./commands/users/lookup-by-email";
import { executeUsersGetPresence } from "./commands/users/get-presence";
import { executeUsersSetPresence } from "./commands/users/set-presence";
import { executeUsersConversations } from "./commands/users/conversations";
import { executeUsersIdentity } from "./commands/users/identity";
import { executeUsersProfileGet } from "./commands/users/profile/get";
import { executeUsersProfileSet } from "./commands/users/profile/set";

import { executeConversationsArchive } from "./commands/conversations/archive";
import { executeConversationsUnarchive } from "./commands/conversations/unarchive";
import { executeConversationsDelete } from "./commands/conversations/delete";
import { executeConversationsRename } from "./commands/conversations/rename";
import { executeConversationsConvertToPrivate } from "./commands/conversations/convert-to-private";
import { executeConversationsConvertToPublic } from "./commands/conversations/convert-to-public";
import { executeConversationsCreate } from "./commands/conversations/create";
import { executeConversationsSearch } from "./commands/conversations/search";
import { executeConversationsInvite } from "./commands/conversations/invite";
import { executeConversationsLookup } from "./commands/conversations/lookup";
import { executeConversationsGetPrefs } from "./commands/conversations/get-prefs";
import { executeConversationsSetPrefs } from "./commands/conversations/set-prefs";
import { executeConversationsGetCustomRetention } from "./commands/conversations/get-custom-retention";
import { executeConversationsSetCustomRetention } from "./commands/conversations/set-custom-retention";
import { executeConversationsRemoveCustomRetention } from "./commands/conversations/remove-custom-retention";
import { executeConversationsGetTeams } from "./commands/conversations/get-teams";
import { executeConversationsSetTeams } from "./commands/conversations/set-teams";
import { executeConversationsDisconnectShared } from "./commands/conversations/disconnect-shared";
import { executeConversationsBulkArchive } from "./commands/conversations/bulk-archive";
import { executeConversationsBulkDelete } from "./commands/conversations/bulk-delete";
import { executeConversationsBulkMove } from "./commands/conversations/bulk-move";
import { executeRestrictAccessAddGroup } from "./commands/conversations/restrict-access/add-group";
import { executeRestrictAccessListGroups } from "./commands/conversations/restrict-access/list-groups";
import { executeRestrictAccessRemoveGroup } from "./commands/conversations/restrict-access/remove-group";
import { executeEkmListOriginalConnectedChannelInfo } from "./commands/conversations/ekm/list-original-connected-channel-info";

import { executeAppsApprove } from "./commands/apps/approve";
import { executeAppsRestrict } from "./commands/apps/restrict";
import { executeAppsClearResolution } from "./commands/apps/clear-resolution";
import { executeAppsUninstall } from "./commands/apps/uninstall";
import { executeAppsActivitiesList } from "./commands/apps/activities/list";
import { executeAppsApprovedList } from "./commands/apps/approved/list";
import { executeAppsRequestsCancel } from "./commands/apps/requests/cancel";
import { executeAppsRequestsList } from "./commands/apps/requests/list";
import { executeAppsRestrictedList } from "./commands/apps/restricted/list";
import { executeAppsConfigLookup } from "./commands/apps/config/lookup";
import { executeAppsConfigSet } from "./commands/apps/config/set";

import { executeInviteRequestsApprove } from "./commands/invite-requests/approve";
import { executeInviteRequestsDeny } from "./commands/invite-requests/deny";
import { executeInviteRequestsList } from "./commands/invite-requests/list";
import { executeInviteRequestsApprovedList } from "./commands/invite-requests/approved/list";
import { executeInviteRequestsDeniedList } from "./commands/invite-requests/denied/list";

import { executeWorkflowsSearch } from "./commands/workflows/search";
import { executeWorkflowsUnpublish } from "./commands/workflows/unpublish";
import { executeWorkflowsPermissionsLookup } from "./commands/workflows/permissions/lookup";
import { executeWorkflowsCollaboratorsAdd } from "./commands/workflows/collaborators/add";
import { executeWorkflowsCollaboratorsRemove } from "./commands/workflows/collaborators/remove";

import { executeFunctionsList } from "./commands/functions/list";
import { executeFunctionsPermissionsLookup } from "./commands/functions/permissions/lookup";
import { executeFunctionsPermissionsSet } from "./commands/functions/permissions/set";

import { executeAuthPolicyAssignEntities } from "./commands/auth-policy/assign-entities";
import { executeAuthPolicyGetEntities } from "./commands/auth-policy/get-entities";
import { executeAuthPolicyRemoveEntities } from "./commands/auth-policy/remove-entities";

import { executeBarriersCreate } from "./commands/barriers/create";
import { executeBarriersDelete } from "./commands/barriers/delete";
import { executeBarriersList } from "./commands/barriers/list";
import { executeBarriersUpdate } from "./commands/barriers/update";

import { executeEmojiAdd } from "./commands/emoji/add";
import { executeEmojiAddAlias } from "./commands/emoji/add-alias";
import { executeEmojiList } from "./commands/emoji/list";
import { executeEmojiRemove } from "./commands/emoji/remove";
import { executeEmojiRename } from "./commands/emoji/rename";

import { executeRolesAddAssignments } from "./commands/roles/add-assignments";
import { executeRolesListAssignments } from "./commands/roles/list-assignments";
import { executeRolesRemoveAssignments } from "./commands/roles/remove-assignments";

import { executeUsergroupsAddChannels } from "./commands/usergroups/add-channels";
import { executeUsergroupsAddTeams } from "./commands/usergroups/add-teams";
import { executeUsergroupsListChannels } from "./commands/usergroups/list-channels";
import { executeUsergroupsRemoveChannels } from "./commands/usergroups/remove-channels";

import { executeScimUsersList } from "./commands/scim-users/list";
import { executeScimUsersGet } from "./commands/scim-users/get";
import { executeScimUsersCreate } from "./commands/scim-users/create";
import { executeScimUsersUpdate } from "./commands/scim-users/update";
import { executeScimUsersDeactivate } from "./commands/scim-users/deactivate";
import { executeScimGroupsList } from "./commands/scim-groups/list";
import { executeScimGroupsGet } from "./commands/scim-groups/get";
import { executeScimGroupsCreate } from "./commands/scim-groups/create";
import { executeScimGroupsUpdate } from "./commands/scim-groups/update";
import { executeScimGroupsDelete } from "./commands/scim-groups/delete";
import { createScimClient } from "./scim-client";

import { ProfileStore } from "./config";
import { createSlackClient } from "./client";
import { formatOutput, type OutputFormat } from "./output";
import type { TeamDiscoverability } from "./commands/teams/create";

// ---------------------------------------------------------------------------
// Custom ValueParsers
// ---------------------------------------------------------------------------

const boolValueParser: ValueParser<"sync", boolean> = {
  $mode: "sync",
  metavar: "BOOL",
  parse(input: string): ValueParserResult<boolean> {
    if (input === "true") return { success: true, value: true };
    if (input === "false") return { success: true, value: false };
    return { success: false, error: [{ type: "text", text: `Invalid boolean: "${input}". Must be "true" or "false".` }] };
  },
  format(value: boolean): string {
    return String(value);
  },
};

const DISCOVERABILITY_VALUES = ["open", "closed", "invite_only", "unlisted"] as const;

function isDiscoverability(value: string): value is TeamDiscoverability {
  return (DISCOVERABILITY_VALUES as readonly string[]).includes(value);
}

const discoverabilityValueParser: ValueParser<"sync", TeamDiscoverability> = {
  $mode: "sync",
  metavar: "DISCOVERABILITY",
  parse(input: string): ValueParserResult<TeamDiscoverability> {
    if (isDiscoverability(input)) return { success: true, value: input };
    return {
      success: false,
      error: [{ type: "text", text: `Invalid discoverability: "${input}". Must be one of: ${DISCOVERABILITY_VALUES.join(", ")}.` }],
    };
  },
  format(value: TeamDiscoverability): string {
    return value;
  },
};

const presenceValueParser: ValueParser<"sync", "auto" | "away"> = {
  $mode: "sync",
  metavar: "PRESENCE",
  parse(input: string): ValueParserResult<"auto" | "away"> {
    if (input === "auto" || input === "away") return { success: true, value: input };
    return { success: false, error: [{ type: "text", text: "Must be 'auto' or 'away'." }] };
  },
  format(value: "auto" | "away"): string {
    return value;
  },
};

// ---------------------------------------------------------------------------
// Global flags (parsed manually from process.argv)
// ---------------------------------------------------------------------------

const GLOBAL_FLAGS = new Set(["--json", "--plain", "--verbose"]);
const GLOBAL_FLAGS_WITH_VALUE = new Set(["--profile"]);

function parseGlobalFlags(argv: string[]): {
  json: boolean;
  plain: boolean;
  verbose: boolean;
  profile: string | undefined;
  rest: string[];
} {
  let json = false;
  let plain = false;
  let verbose = false;
  let profile: string | undefined;
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      json = true;
    } else if (arg === "--plain") {
      plain = true;
    } else if (arg === "--verbose") {
      verbose = true;
    } else if (arg === "--profile") {
      profile = argv[i + 1];
      i++;
    } else {
      rest.push(arg);
    }
  }

  return { json, plain, verbose, profile, rest };
}

const globalFlags = parseGlobalFlags(process.argv.slice(2));
const jsonFlag = globalFlags.json;
const plainFlag = globalFlags.plain;
const verboseFlag = globalFlags.verbose;
const profileFlag = globalFlags.profile;

const outputFormat: OutputFormat = jsonFlag ? "json" : plainFlag ? "plain" : "table";

// ---------------------------------------------------------------------------
// Token commands
// ---------------------------------------------------------------------------

const tokenCommands = command(
  "token",
  or(
    command("add", object({
      cmd: constant("token-add" as const),
      name: argument(string({ metavar: "NAME" })),
      token: argument(string({ metavar: "TOKEN" })),
    })),
    command("list", object({
      cmd: constant("token-list" as const),
    })),
    command("remove", object({
      cmd: constant("token-remove" as const),
      name: argument(string({ metavar: "NAME" })),
    })),
    command("status", object({
      cmd: constant("token-status" as const),
    })),
  ),
);

// ---------------------------------------------------------------------------
// Teams commands
// ---------------------------------------------------------------------------

const teamsSettingsCommands = command(
  "settings",
  or(
    command("info", object({
      cmd: constant("teams-settings-info" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    })),
    command("set-name", object({
      cmd: constant("teams-settings-set-name" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      name: option("--name", string({ metavar: "NAME" })),
    })),
    command("set-icon", object({
      cmd: constant("teams-settings-set-icon" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      imageUrl: option("--image-url", string({ metavar: "IMAGE_URL" })),
    })),
    command("set-description", object({
      cmd: constant("teams-settings-set-description" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      description: option("--description", string({ metavar: "DESCRIPTION" })),
    })),
    command("set-discoverability", object({
      cmd: constant("teams-settings-set-discoverability" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      discoverability: option("--discoverability", discoverabilityValueParser),
    })),
    command("set-default-channels", object({
      cmd: constant("teams-settings-set-default-channels" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
    })),
  ),
);

const teamsCommands = command(
  "teams",
  or(
    command("create", object({
      cmd: constant("teams-create" as const),
      domain: option("--domain", string({ metavar: "DOMAIN" })),
      name: option("--name", string({ metavar: "NAME" })),
      description: optional(option("--description", string({ metavar: "DESCRIPTION" }))),
      discoverability: optional(option("--discoverability", discoverabilityValueParser)),
    })),
    command("list", object({
      cmd: constant("teams-list" as const),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("admins", command("list", object({
      cmd: constant("teams-admins-list" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    }))),
    command("owners", command("list", object({
      cmd: constant("teams-owners-list" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    }))),
    teamsSettingsCommands,
  ),
);

// ---------------------------------------------------------------------------
// Users commands
// ---------------------------------------------------------------------------

const usersCommands = command(
  "users",
  or(
    or(
    command("list", object({
      cmd: constant("users-list" as const),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      isActive: optional(option("--is-active", boolValueParser)),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("invite", object({
      cmd: constant("users-invite" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      email: option("--email", string({ metavar: "EMAIL" })),
      channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
      customMessage: optional(option("--custom-message", string({ metavar: "MESSAGE" }))),
      realName: optional(option("--real-name", string({ metavar: "NAME" }))),
      isRestricted: optional(option("--is-restricted", boolValueParser)),
      isUltraRestricted: optional(option("--is-ultra-restricted", boolValueParser)),
    })),
    command("assign", object({
      cmd: constant("users-assign" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
      channelIds: optional(option("--channel-ids", string({ metavar: "CHANNEL_IDS" }))),
      isRestricted: optional(option("--is-restricted", boolValueParser)),
      isUltraRestricted: optional(option("--is-ultra-restricted", boolValueParser)),
    })),
    command("remove", object({
      cmd: constant("users-remove" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    })),
    command("set-admin", object({
      cmd: constant("users-set-admin" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    })),
    command("set-owner", object({
      cmd: constant("users-set-owner" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    })),
    command("set-regular", object({
      cmd: constant("users-set-regular" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    })),
    ),
    command("session", or(
      command("reset", object({
        cmd: constant("users-session-reset" as const),
        userId: option("--user-id", string({ metavar: "USER_ID" })),
        mobileOnly: optional(option("--mobile-only", boolValueParser)),
        webOnly: optional(option("--web-only", boolValueParser)),
      })),
      command("clear-settings", object({
        cmd: constant("users-session-clear-settings" as const),
        userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
      })),
      command("get-settings", object({
        cmd: constant("users-session-get-settings" as const),
        userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
      })),
      command("invalidate", object({
        cmd: constant("users-session-invalidate" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        sessionId: option("--session-id", string({ metavar: "SESSION_ID" })),
      })),
      command("list", object({
        cmd: constant("users-session-list" as const),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        userId: optional(option("--user-id", string({ metavar: "USER_ID" }))),
        cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
        limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
      })),
      command("reset-bulk", object({
        cmd: constant("users-session-reset-bulk" as const),
        userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
        mobileOnly: optional(option("--mobile-only", boolValueParser)),
        webOnly: optional(option("--web-only", boolValueParser)),
      })),
      command("set-settings", object({
        cmd: constant("users-session-set-settings" as const),
        userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
        desktopAppBrowserQuit: optional(option("--desktop-app-browser-quit", boolValueParser)),
        duration: optional(option("--duration", integer({ metavar: "SECONDS" }))),
      })),
    )),
    command("set-expiration", object({
      cmd: constant("users-set-expiration" as const),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
      expirationTs: option("--expiration-ts", integer({ metavar: "TIMESTAMP" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("unsupported-versions", command("export", object({
      cmd: constant("users-unsupported-versions-export" as const),
      dateEndOfSupport: optional(option("--date-end-of-support", integer({ metavar: "TIMESTAMP" }))),
      dateSessionsStarted: optional(option("--date-sessions-started", integer({ metavar: "TIMESTAMP" }))),
    }))),
    or(
      command("info", object({
        cmd: constant("users-info" as const),
        user: option("--user", string({ metavar: "USER_ID" })),
        includeLocale: optional(option("--include-locale", boolValueParser)),
      })),
      command("lookup-by-email", object({
        cmd: constant("users-lookup-by-email" as const),
        email: option("--email", string({ metavar: "EMAIL" })),
      })),
      command("get-presence", object({
        cmd: constant("users-get-presence" as const),
        user: option("--user", string({ metavar: "USER_ID" })),
      })),
      command("set-presence", object({
        cmd: constant("users-set-presence" as const),
        presence: option("--presence", presenceValueParser),
      })),
      command("conversations", object({
        cmd: constant("users-conversations" as const),
        user: optional(option("--user", string({ metavar: "USER_ID" }))),
        cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
        limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
        types: optional(option("--types", string({ metavar: "TYPES" }))),
        excludeArchived: optional(option("--exclude-archived", boolValueParser)),
      })),
      command("identity", object({
        cmd: constant("users-identity" as const),
      })),
      command("profile", or(
        command("get", object({
          cmd: constant("users-profile-get" as const),
          user: optional(option("--user", string({ metavar: "USER_ID" }))),
          includeLabels: optional(option("--include-labels", boolValueParser)),
        })),
        command("set", object({
          cmd: constant("users-profile-set" as const),
          user: optional(option("--user", string({ metavar: "USER_ID" }))),
          name: optional(option("--name", string({ metavar: "NAME" }))),
          value: optional(option("--value", string({ metavar: "VALUE" }))),
          profile: optional(option("--profile", string({ metavar: "JSON" }))),
        })),
      )),
    ),
  ),
);

// ---------------------------------------------------------------------------
// Conversations commands
// ---------------------------------------------------------------------------

const conversationsRestrictAccessCommands = command(
  "restrict-access",
  or(
    command("add-group", object({
      cmd: constant("conversations-restrict-access-add-group" as const),
      channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      groupId: option("--group-id", string({ metavar: "GROUP_ID" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("list-groups", object({
      cmd: constant("conversations-restrict-access-list-groups" as const),
      channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("remove-group", object({
      cmd: constant("conversations-restrict-access-remove-group" as const),
      channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      groupId: option("--group-id", string({ metavar: "GROUP_ID" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
  ),
);

const conversationsEkmCommands = command(
  "ekm",
  command("list-original-connected-channel-info", object({
    cmd: constant("conversations-ekm-list-original-connected-channel-info" as const),
    teamIds: optional(option("--team-ids", string({ metavar: "TEAM_IDS" }))),
    channelIds: optional(option("--channel-ids", string({ metavar: "CHANNEL_IDS" }))),
    cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
    limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
  })),
);

const conversationsCommands = command(
  "conversations",
  or(
    or(
      command("create", object({
        cmd: constant("conversations-create" as const),
        name: option("--name", string({ metavar: "NAME" })),
        isPrivate: option("--is-private", boolValueParser),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        orgWide: optional(option("--org-wide", boolValueParser)),
        description: optional(option("--description", string({ metavar: "DESCRIPTION" }))),
      })),
      command("delete", object({
        cmd: constant("conversations-delete" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      command("archive", object({
        cmd: constant("conversations-archive" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      command("unarchive", object({
        cmd: constant("conversations-unarchive" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      command("rename", object({
        cmd: constant("conversations-rename" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        name: option("--name", string({ metavar: "NAME" })),
      })),
      command("search", object({
        cmd: constant("conversations-search" as const),
        query: optional(option("--query", string({ metavar: "QUERY" }))),
        teamIds: optional(option("--team-ids", string({ metavar: "TEAM_IDS" }))),
        connectedTeamIds: optional(option("--connected-team-ids", string({ metavar: "TEAM_IDS" }))),
        searchChannelTypes: optional(option("--search-channel-types", string({ metavar: "TYPES" }))),
        sort: optional(option("--sort", string({ metavar: "SORT" }))),
        sortDir: optional(option("--sort-dir", string({ metavar: "DIR" }))),
        totalCountOnly: optional(option("--total-count-only", boolValueParser)),
        cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
        limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
      })),
      command("invite", object({
        cmd: constant("conversations-invite" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
      })),
      command("convert-to-private", object({
        cmd: constant("conversations-convert-to-private" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        name: optional(option("--name", string({ metavar: "NAME" }))),
      })),
      command("convert-to-public", object({
        cmd: constant("conversations-convert-to-public" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      command("get-teams", object({
        cmd: constant("conversations-get-teams" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
        limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
      })),
    ),
    or(
      command("set-teams", object({
        cmd: constant("conversations-set-teams" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        teamIds: optional(option("--team-ids", string({ metavar: "TEAM_IDS" }))),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        orgChannel: optional(option("--org-channel", boolValueParser)),
        allowDisconnect: optional(option("--allow-disconnect", boolValueParser)),
      })),
      command("disconnect-shared", object({
        cmd: constant("conversations-disconnect-shared" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        leavingTeamIds: optional(option("--leaving-team-ids", string({ metavar: "TEAM_IDS" }))),
      })),
      command("get-prefs", object({
        cmd: constant("conversations-get-prefs" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      command("set-prefs", object({
        cmd: constant("conversations-set-prefs" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        prefs: option("--prefs", string({ metavar: "PREFS_JSON" })),
      })),
      command("lookup", object({
        cmd: constant("conversations-lookup" as const),
        teamIds: option("--team-ids", string({ metavar: "TEAM_IDS" })),
        lastMessageActivityBefore: option("--last-message-activity-before", integer({ metavar: "TIMESTAMP" })),
        maxMemberCount: optional(option("--max-member-count", integer({ metavar: "COUNT" }))),
        cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
        limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
      })),
      command("bulk-archive", object({
        cmd: constant("conversations-bulk-archive" as const),
        channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
      })),
      command("bulk-delete", object({
        cmd: constant("conversations-bulk-delete" as const),
        channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
      })),
      command("bulk-move", object({
        cmd: constant("conversations-bulk-move" as const),
        channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
        targetTeamId: option("--target-team-id", string({ metavar: "TEAM_ID" })),
      })),
      command("get-custom-retention", object({
        cmd: constant("conversations-get-custom-retention" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      command("set-custom-retention", object({
        cmd: constant("conversations-set-custom-retention" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
        durationDays: option("--duration-days", integer({ metavar: "DAYS" })),
      })),
    ),
    or(
      command("remove-custom-retention", object({
        cmd: constant("conversations-remove-custom-retention" as const),
        channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
      })),
      conversationsRestrictAccessCommands,
      conversationsEkmCommands,
    ),
  ),
);

// ---------------------------------------------------------------------------
// Apps commands
// ---------------------------------------------------------------------------

const appsActivitiesCommands = command(
  "activities",
  command("list", object({
    cmd: constant("apps-activities-list" as const),
    appId: optional(option("--app-id", string({ metavar: "APP_ID" }))),
    teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    componentId: optional(option("--component-id", string({ metavar: "COMPONENT_ID" }))),
    componentType: optional(option("--component-type", string({ metavar: "TYPE" }))),
    logEventType: optional(option("--log-event-type", string({ metavar: "EVENT_TYPE" }))),
    maxDateCreated: optional(option("--max-date-created", integer({ metavar: "TIMESTAMP" }))),
    minDateCreated: optional(option("--min-date-created", integer({ metavar: "TIMESTAMP" }))),
    minLogLevel: optional(option("--min-log-level", string({ metavar: "LEVEL" }))),
    sortDirection: optional(option("--sort-direction", string({ metavar: "DIR" }))),
    source: optional(option("--source", string({ metavar: "SOURCE" }))),
    traceId: optional(option("--trace-id", string({ metavar: "TRACE_ID" }))),
    cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
    limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
  })),
);

const appsApprovedCommands = command(
  "approved",
  command("list", object({
    cmd: constant("apps-approved-list" as const),
    teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
    certified: optional(option("--certified", boolValueParser)),
    cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
    limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
  })),
);

const appsRequestsCommands = command(
  "requests",
  or(
    command("cancel", object({
      cmd: constant("apps-requests-cancel" as const),
      requestId: option("--request-id", string({ metavar: "REQUEST_ID" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
    })),
    command("list", object({
      cmd: constant("apps-requests-list" as const),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
      certified: optional(option("--certified", boolValueParser)),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
  ),
);

const appsRestrictedCommands = command(
  "restricted",
  command("list", object({
    cmd: constant("apps-restricted-list" as const),
    teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
    certified: optional(option("--certified", boolValueParser)),
    cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
    limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
  })),
);

const appsConfigCommands = command(
  "config",
  or(
    command("lookup", object({
      cmd: constant("apps-config-lookup" as const),
      appIds: option("--app-ids", string({ metavar: "APP_IDS" })),
    })),
    command("set", object({
      cmd: constant("apps-config-set" as const),
      appId: option("--app-id", string({ metavar: "APP_ID" })),
      domainRestrictions: optional(option("--domain-restrictions", string({ metavar: "JSON" }))),
      workflowAuthStrategy: optional(option("--workflow-auth-strategy", string({ metavar: "STRATEGY" }))),
    })),
  ),
);

const appsCommands = command(
  "apps",
  or(
    or(
      command("approve", object({
        cmd: constant("apps-approve" as const),
        appId: optional(option("--app-id", string({ metavar: "APP_ID" }))),
        requestId: optional(option("--request-id", string({ metavar: "REQUEST_ID" }))),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
      })),
      command("restrict", object({
        cmd: constant("apps-restrict" as const),
        appId: optional(option("--app-id", string({ metavar: "APP_ID" }))),
        requestId: optional(option("--request-id", string({ metavar: "REQUEST_ID" }))),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
      })),
      command("clear-resolution", object({
        cmd: constant("apps-clear-resolution" as const),
        appId: option("--app-id", string({ metavar: "APP_ID" })),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
      })),
      command("uninstall", object({
        cmd: constant("apps-uninstall" as const),
        appId: option("--app-id", string({ metavar: "APP_ID" })),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
        enterpriseId: optional(option("--enterprise-id", string({ metavar: "ENTERPRISE_ID" }))),
      })),
    ),
    or(
      appsActivitiesCommands,
      appsApprovedCommands,
      appsRequestsCommands,
      appsRestrictedCommands,
      appsConfigCommands,
    ),
  ),
);

// ---------------------------------------------------------------------------
// Invite Requests commands
// ---------------------------------------------------------------------------

const inviteRequestsApprovedCommands = command(
  "approved",
  command("list", object({
    cmd: constant("invite-requests-approved-list" as const),
    teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
    limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
  })),
);

const inviteRequestsDeniedCommands = command(
  "denied",
  command("list", object({
    cmd: constant("invite-requests-denied-list" as const),
    teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
    limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
  })),
);

const inviteRequestsCommands = command(
  "invite-requests",
  or(
    command("approve", object({
      cmd: constant("invite-requests-approve" as const),
      inviteRequestId: option("--invite-request-id", string({ metavar: "INVITE_REQUEST_ID" })),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    })),
    command("deny", object({
      cmd: constant("invite-requests-deny" as const),
      inviteRequestId: option("--invite-request-id", string({ metavar: "INVITE_REQUEST_ID" })),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
    })),
    command("list", object({
      cmd: constant("invite-requests-list" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    inviteRequestsApprovedCommands,
    inviteRequestsDeniedCommands,
  ),
);

// ---------------------------------------------------------------------------
// Workflows commands
// ---------------------------------------------------------------------------

const workflowsPermissionsCommands = command(
  "permissions",
  command("lookup", object({
    cmd: constant("workflows-permissions-lookup" as const),
    workflowIds: option("--workflow-ids", string({ metavar: "WORKFLOW_IDS" })),
    maxWorkflowTriggers: optional(option("--max-workflow-triggers", integer({ metavar: "COUNT" }))),
  })),
);

const workflowsCollaboratorsCommands = command(
  "collaborators",
  or(
    command("add", object({
      cmd: constant("workflows-collaborators-add" as const),
      collaboratorIds: option("--collaborator-ids", string({ metavar: "USER_IDS" })),
      workflowIds: option("--workflow-ids", string({ metavar: "WORKFLOW_IDS" })),
    })),
    command("remove", object({
      cmd: constant("workflows-collaborators-remove" as const),
      collaboratorIds: option("--collaborator-ids", string({ metavar: "USER_IDS" })),
      workflowIds: option("--workflow-ids", string({ metavar: "WORKFLOW_IDS" })),
    })),
  ),
);

const workflowsCommands = command(
  "workflows",
  or(
    command("search", object({
      cmd: constant("workflows-search" as const),
      appId: optional(option("--app-id", string({ metavar: "APP_ID" }))),
      collaboratorIds: optional(option("--collaborator-ids", string({ metavar: "USER_IDS" }))),
      noCollaborators: optional(option("--no-collaborators", boolValueParser)),
      numTriggerIds: optional(option("--num-trigger-ids", integer({ metavar: "COUNT" }))),
      query: optional(option("--query", string({ metavar: "QUERY" }))),
      sort: optional(option("--sort", string({ metavar: "SORT" }))),
      source: optional(option("--source", string({ metavar: "SOURCE" }))),
      sortDir: optional(option("--sort-dir", string({ metavar: "DIR" }))),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("unpublish", object({
      cmd: constant("workflows-unpublish" as const),
      workflowIds: option("--workflow-ids", string({ metavar: "WORKFLOW_IDS" })),
    })),
    workflowsPermissionsCommands,
    workflowsCollaboratorsCommands,
  ),
);

// ---------------------------------------------------------------------------
// Functions commands
// ---------------------------------------------------------------------------

const functionsPermissionsCommands = command(
  "permissions",
  or(
    command("lookup", object({
      cmd: constant("functions-permissions-lookup" as const),
      functionIds: option("--function-ids", string({ metavar: "FUNCTION_IDS" })),
    })),
    command("set", object({
      cmd: constant("functions-permissions-set" as const),
      functionId: option("--function-id", string({ metavar: "FUNCTION_ID" })),
      visibility: option("--visibility", string({ metavar: "VISIBILITY" })),
      userIds: optional(option("--user-ids", string({ metavar: "USER_IDS" }))),
    })),
  ),
);

const functionsCommands = command(
  "functions",
  or(
    command("list", object({
      cmd: constant("functions-list" as const),
      appIds: option("--app-ids", string({ metavar: "APP_IDS" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    functionsPermissionsCommands,
  ),
);

// ---------------------------------------------------------------------------
// Auth Policy commands
// ---------------------------------------------------------------------------

const authPolicyCommands = command(
  "auth-policy",
  or(
    command("assign-entities", object({
      cmd: constant("auth-policy-assign-entities" as const),
      entityIds: option("--entity-ids", string({ metavar: "ENTITY_IDS" })),
      entityType: option("--entity-type", string({ metavar: "ENTITY_TYPE" })),
      policyName: option("--policy-name", string({ metavar: "POLICY_NAME" })),
    })),
    command("get-entities", object({
      cmd: constant("auth-policy-get-entities" as const),
      policyName: option("--policy-name", string({ metavar: "POLICY_NAME" })),
      entityType: optional(option("--entity-type", string({ metavar: "ENTITY_TYPE" }))),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("remove-entities", object({
      cmd: constant("auth-policy-remove-entities" as const),
      entityIds: option("--entity-ids", string({ metavar: "ENTITY_IDS" })),
      entityType: option("--entity-type", string({ metavar: "ENTITY_TYPE" })),
      policyName: option("--policy-name", string({ metavar: "POLICY_NAME" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// Barriers commands
// ---------------------------------------------------------------------------

const barriersCommands = command(
  "barriers",
  or(
    command("create", object({
      cmd: constant("barriers-create" as const),
      primaryUsergroupId: option("--primary-usergroup-id", string({ metavar: "USERGROUP_ID" })),
      barrieredFromUsergroupIds: option("--barriered-from-usergroup-ids", string({ metavar: "USERGROUP_IDS" })),
    })),
    command("delete", object({
      cmd: constant("barriers-delete" as const),
      barrierId: option("--barrier-id", string({ metavar: "BARRIER_ID" })),
    })),
    command("list", object({
      cmd: constant("barriers-list" as const),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("update", object({
      cmd: constant("barriers-update" as const),
      barrierId: option("--barrier-id", string({ metavar: "BARRIER_ID" })),
      primaryUsergroupId: option("--primary-usergroup-id", string({ metavar: "USERGROUP_ID" })),
      barrieredFromUsergroupIds: option("--barriered-from-usergroup-ids", string({ metavar: "USERGROUP_IDS" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// Emoji commands
// ---------------------------------------------------------------------------

const emojiCommands = command(
  "emoji",
  or(
    command("add", object({
      cmd: constant("emoji-add" as const),
      name: option("--name", string({ metavar: "NAME" })),
      url: option("--url", string({ metavar: "URL" })),
    })),
    command("add-alias", object({
      cmd: constant("emoji-add-alias" as const),
      name: option("--name", string({ metavar: "NAME" })),
      aliasFor: option("--alias-for", string({ metavar: "ALIAS_FOR" })),
    })),
    command("list", object({
      cmd: constant("emoji-list" as const),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("remove", object({
      cmd: constant("emoji-remove" as const),
      name: option("--name", string({ metavar: "NAME" })),
    })),
    command("rename", object({
      cmd: constant("emoji-rename" as const),
      name: option("--name", string({ metavar: "NAME" })),
      newName: option("--new-name", string({ metavar: "NEW_NAME" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// Roles commands
// ---------------------------------------------------------------------------

const rolesCommands = command(
  "roles",
  or(
    command("add-assignments", object({
      cmd: constant("roles-add-assignments" as const),
      roleId: option("--role-id", string({ metavar: "ROLE_ID" })),
      entityIds: option("--entity-ids", string({ metavar: "ENTITY_IDS" })),
      userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
    })),
    command("list-assignments", object({
      cmd: constant("roles-list-assignments" as const),
      entityIds: optional(option("--entity-ids", string({ metavar: "ENTITY_IDS" }))),
      roleIds: optional(option("--role-ids", string({ metavar: "ROLE_IDS" }))),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
      sortDir: optional(option("--sort-dir", string({ metavar: "DIR" }))),
    })),
    command("remove-assignments", object({
      cmd: constant("roles-remove-assignments" as const),
      roleId: option("--role-id", string({ metavar: "ROLE_ID" })),
      entityIds: option("--entity-ids", string({ metavar: "ENTITY_IDS" })),
      userIds: option("--user-ids", string({ metavar: "USER_IDS" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// Usergroups commands
// ---------------------------------------------------------------------------

const usergroupsCommands = command(
  "usergroups",
  or(
    command("add-channels", object({
      cmd: constant("usergroups-add-channels" as const),
      usergroupId: option("--usergroup-id", string({ metavar: "USERGROUP_ID" })),
      channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("add-teams", object({
      cmd: constant("usergroups-add-teams" as const),
      usergroupId: option("--usergroup-id", string({ metavar: "USERGROUP_ID" })),
      teamIds: option("--team-ids", string({ metavar: "TEAM_IDS" })),
      autoProvision: optional(option("--auto-provision", boolValueParser)),
    })),
    command("list-channels", object({
      cmd: constant("usergroups-list-channels" as const),
      usergroupId: option("--usergroup-id", string({ metavar: "USERGROUP_ID" })),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      includeNumMembers: optional(option("--include-num-members", boolValueParser)),
    })),
    command("remove-channels", object({
      cmd: constant("usergroups-remove-channels" as const),
      usergroupId: option("--usergroup-id", string({ metavar: "USERGROUP_ID" })),
      channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// SCIM Users commands
// ---------------------------------------------------------------------------

const scimUsersCommands = command(
  "scim-users",
  or(
    command("list", object({
      cmd: constant("scim-users-list" as const),
      startIndex: optional(option("--start-index", integer({ metavar: "START_INDEX" }))),
      count: optional(option("--count", integer({ metavar: "COUNT" }))),
      filter: optional(option("--filter", string({ metavar: "FILTER" }))),
    })),
    command("get", object({
      cmd: constant("scim-users-get" as const),
      id: option("--id", string({ metavar: "USER_ID" })),
    })),
    command("create", object({
      cmd: constant("scim-users-create" as const),
      userName: option("--user-name", string({ metavar: "USER_NAME" })),
      email: option("--email", string({ metavar: "EMAIL" })),
      givenName: optional(option("--given-name", string({ metavar: "GIVEN_NAME" }))),
      familyName: optional(option("--family-name", string({ metavar: "FAMILY_NAME" }))),
      displayName: optional(option("--display-name", string({ metavar: "DISPLAY_NAME" }))),
    })),
    command("update", object({
      cmd: constant("scim-users-update" as const),
      id: option("--id", string({ metavar: "USER_ID" })),
      active: optional(option("--active", boolValueParser)),
      userName: optional(option("--user-name", string({ metavar: "USER_NAME" }))),
      email: optional(option("--email", string({ metavar: "EMAIL" }))),
      givenName: optional(option("--given-name", string({ metavar: "GIVEN_NAME" }))),
      familyName: optional(option("--family-name", string({ metavar: "FAMILY_NAME" }))),
      displayName: optional(option("--display-name", string({ metavar: "DISPLAY_NAME" }))),
      title: optional(option("--title", string({ metavar: "TITLE" }))),
    })),
    command("deactivate", object({
      cmd: constant("scim-users-deactivate" as const),
      id: option("--id", string({ metavar: "USER_ID" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// SCIM Groups commands
// ---------------------------------------------------------------------------

const scimGroupsCommands = command(
  "scim-groups",
  or(
    command("list", object({
      cmd: constant("scim-groups-list" as const),
      startIndex: optional(option("--start-index", integer({ metavar: "START_INDEX" }))),
      count: optional(option("--count", integer({ metavar: "COUNT" }))),
      filter: optional(option("--filter", string({ metavar: "FILTER" }))),
    })),
    command("get", object({
      cmd: constant("scim-groups-get" as const),
      id: option("--id", string({ metavar: "GROUP_ID" })),
    })),
    command("create", object({
      cmd: constant("scim-groups-create" as const),
      displayName: option("--display-name", string({ metavar: "DISPLAY_NAME" })),
      memberIds: optional(option("--member-ids", string({ metavar: "MEMBER_IDS" }))),
    })),
    command("update", object({
      cmd: constant("scim-groups-update" as const),
      id: option("--id", string({ metavar: "GROUP_ID" })),
      displayName: optional(option("--display-name", string({ metavar: "DISPLAY_NAME" }))),
      addMemberIds: optional(option("--add-member-ids", string({ metavar: "MEMBER_IDS" }))),
      removeMemberIds: optional(option("--remove-member-ids", string({ metavar: "MEMBER_IDS" }))),
    })),
    command("delete", object({
      cmd: constant("scim-groups-delete" as const),
      id: option("--id", string({ metavar: "GROUP_ID" })),
    })),
  ),
);

// ---------------------------------------------------------------------------
// Root parser
// ---------------------------------------------------------------------------

const rootParser = or(
  or(tokenCommands, teamsCommands, usersCommands),
  or(conversationsCommands, appsCommands),
  or(inviteRequestsCommands, workflowsCommands, functionsCommands),
  or(scimUsersCommands, scimGroupsCommands, authPolicyCommands, barriersCommands, emojiCommands, rolesCommands, usergroupsCommands),
);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
const config = await run(rootParser, {
  programName: "sladm",
  help: "both",
  version: { value: "0.1.0", mode: "both" },
  args: globalFlags.rest,
});

const store = new ProfileStore();

switch (config.cmd) {
  case "token-add": {
    await executeTokenAdd(store, config.name, config.token);
    console.log(`Profile '${config.name}' added.`);
    break;
  }
  case "token-list": {
    const profiles = await executeTokenList(store);
    const rows = profiles.map((p) => ({
      name: p.name,
      default: p.default ? "yes" : "no",
    }));
    console.log(formatOutput(rows, ["name", "default"], outputFormat));
    break;
  }
  case "token-remove": {
    await executeTokenRemove(store, config.name);
    console.log(`Profile '${config.name}' removed.`);
    break;
  }
  case "token-status": {
    const resolved = await store.resolveProfileName(profileFlag);
    const status = await executeTokenStatus(store, resolved);
    const rows = [{ name: status.name, token: status.token, default: status.isDefault ? "yes" : "no" }];
    console.log(formatOutput(rows, ["name", "token", "default"], outputFormat));
    break;
  }
  case "teams-create": {
    const client = await createSlackClient(store, profileFlag);
    const result = await executeTeamsCreate(client, {
      teamDomain: config.domain,
      teamName: config.name,
      teamDescription: config.description,
      teamDiscoverability: config.discoverability,
    });
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "teams-list": {
    const client = await createSlackClient(store, profileFlag);
    const teams = await executeTeamsList(client, { cursor: config.cursor, limit: config.limit });
    const teamRows = teams.map((t: { id?: string; name?: string; domain?: string }) => ({
      id: t.id ?? "", name: t.name ?? "", domain: t.domain ?? "",
    }));
    console.log(formatOutput(teamRows, ["id", "name", "domain"], outputFormat));
    break;
  }
  case "teams-admins-list": {
    const client = await createSlackClient(store, profileFlag);
    const adminIds = await executeTeamsAdminsList(client, { teamId: config.teamId });
    const rows = adminIds.map((id: string) => ({ id }));
    console.log(formatOutput(rows, ["id"], outputFormat));
    break;
  }
  case "teams-owners-list": {
    const client = await createSlackClient(store, profileFlag);
    const ownerIds = await executeTeamsOwnersList(client, { teamId: config.teamId });
    const rows = ownerIds.map((id: string) => ({ id }));
    console.log(formatOutput(rows, ["id"], outputFormat));
    break;
  }
  case "teams-settings-info": {
    const client = await createSlackClient(store, profileFlag);
    const team = await executeSettingsInfo(client, { teamId: config.teamId });
    console.log(JSON.stringify(team, null, 2));
    break;
  }
  case "teams-settings-set-name": {
    const client = await createSlackClient(store, profileFlag);
    await executeSetName(client, { teamId: config.teamId, name: config.name });
    console.log("Team name updated.");
    break;
  }
  case "teams-settings-set-icon": {
    const client = await createSlackClient(store, profileFlag);
    await executeSetIcon(client, { teamId: config.teamId, imageUrl: config.imageUrl });
    console.log("Team icon updated.");
    break;
  }
  case "teams-settings-set-description": {
    const client = await createSlackClient(store, profileFlag);
    await executeSetDescription(client, { teamId: config.teamId, description: config.description });
    console.log("Team description updated.");
    break;
  }
  case "teams-settings-set-discoverability": {
    const client = await createSlackClient(store, profileFlag);
    await executeSetDiscoverability(client, { teamId: config.teamId, discoverability: config.discoverability });
    console.log("Team discoverability updated.");
    break;
  }
  case "teams-settings-set-default-channels": {
    const client = await createSlackClient(store, profileFlag);
    const defaultChannelParts = config.channelIds.split(",");
    const defaultChannelFirst = defaultChannelParts[0];
    if (defaultChannelFirst === undefined || defaultChannelFirst === "") {
      throw new Error("--channel-ids must not be empty");
    }
    const defaultChannelIds: [string, ...string[]] = [defaultChannelFirst, ...defaultChannelParts.slice(1)];
    await executeSetDefaultChannels(client, {
      teamId: config.teamId,
      channelIds: defaultChannelIds,
    });
    console.log("Team default channels updated.");
    break;
  }
  case "users-list": {
    const client = await createSlackClient(store, profileFlag);
    const users = await executeUsersList(client, {
      teamId: config.teamId,
      isActive: config.isActive,
      cursor: config.cursor,
      limit: config.limit,
    });
    const userRows = users.map((u: { id?: string; name?: string; email?: string }) => ({
      id: u.id ?? "", name: u.name ?? "", email: u.email ?? "",
    }));
    console.log(formatOutput(userRows, ["id", "name", "email"], outputFormat));
    break;
  }
  case "users-invite": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersInvite(client, {
      teamId: config.teamId,
      email: config.email,
      channelIds: config.channelIds,
      customMessage: config.customMessage,
      realName: config.realName,
      isRestricted: config.isRestricted,
      isUltraRestricted: config.isUltraRestricted,
    });
    console.log(`User '${config.email}' invited.`);
    break;
  }
  case "users-assign": {
    const client = await createSlackClient(store, profileFlag);
    let assignChannelIds: [string, ...string[]] | undefined;
    if (config.channelIds !== undefined) {
      const assignChannelParts = config.channelIds.split(",");
      const assignFirstChannel = assignChannelParts[0];
      if (assignFirstChannel === undefined) {
        throw new Error("--channel-ids must not be empty");
      }
      assignChannelIds = [assignFirstChannel, ...assignChannelParts.slice(1)];
    }
    await executeUsersAssign(client, {
      teamId: config.teamId,
      userId: config.userId,
      channelIds: assignChannelIds,
      isRestricted: config.isRestricted,
      isUltraRestricted: config.isUltraRestricted,
    });
    console.log(`User '${config.userId}' assigned.`);
    break;
  }
  case "users-remove": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersRemove(client, { teamId: config.teamId, userId: config.userId });
    console.log(`User '${config.userId}' removed.`);
    break;
  }
  case "users-set-admin": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersSetAdmin(client, { teamId: config.teamId, userId: config.userId });
    console.log(`User '${config.userId}' set as admin.`);
    break;
  }
  case "users-set-owner": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersSetOwner(client, { teamId: config.teamId, userId: config.userId });
    console.log(`User '${config.userId}' set as owner.`);
    break;
  }
  case "users-set-regular": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersSetRegular(client, { teamId: config.teamId, userId: config.userId });
    console.log(`User '${config.userId}' set as regular member.`);
    break;
  }
  case "users-session-reset": {
    const client = await createSlackClient(store, profileFlag);
    await executeSessionReset(client, {
      userId: config.userId,
      mobileOnly: config.mobileOnly,
      webOnly: config.webOnly,
    });
    console.log(`Session reset for user '${config.userId}'.`);
    break;
  }
  case "users-session-clear-settings": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.userIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--user-ids must not be empty");
    await executeUsersSessionClearSettings(client, { userIds: [first, ...parts.slice(1)] });
    console.log("Session settings cleared.");
    break;
  }
  case "users-session-get-settings": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.userIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--user-ids must not be empty");
    const settings = await executeUsersSessionGetSettings(client, { userIds: [first, ...parts.slice(1)] });
    console.log(JSON.stringify(settings, null, 2));
    break;
  }
  case "users-session-invalidate": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersSessionInvalidate(client, {
      teamId: config.teamId,
      sessionId: config.sessionId,
    });
    console.log(`Session '${config.sessionId}' invalidated.`);
    break;
  }
  case "users-session-list": {
    const client = await createSlackClient(store, profileFlag);
    const sessions = await executeUsersSessionList(client, {
      teamId: config.teamId,
      userId: config.userId,
      cursor: config.cursor,
      limit: config.limit,
    });
    const rows = sessions.map((s) => ({
      session_id: s.session_id ?? "",
      user_id: s.user_id ?? "",
      team_id: s.team_id ?? "",
    }));
    console.log(formatOutput(rows, ["session_id", "user_id", "team_id"], outputFormat));
    break;
  }
  case "users-session-reset-bulk": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.userIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--user-ids must not be empty");
    await executeUsersSessionResetBulk(client, {
      userIds: [first, ...parts.slice(1)],
      mobileOnly: config.mobileOnly,
      webOnly: config.webOnly,
    });
    console.log("Bulk session reset requested.");
    break;
  }
  case "users-session-set-settings": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.userIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--user-ids must not be empty");
    await executeUsersSessionSetSettings(client, {
      userIds: [first, ...parts.slice(1)],
      desktopAppBrowserQuit: config.desktopAppBrowserQuit,
      duration: config.duration,
    });
    console.log("Session settings updated.");
    break;
  }
  case "users-set-expiration": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersSetExpiration(client, {
      userId: config.userId,
      expirationTs: config.expirationTs,
      teamId: config.teamId,
    });
    console.log(`User '${config.userId}' expiration set.`);
    break;
  }
  case "users-unsupported-versions-export": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersUnsupportedVersionsExport(client, {
      dateEndOfSupport: config.dateEndOfSupport,
      dateSessionsStarted: config.dateSessionsStarted,
    });
    console.log("Unsupported versions export requested.");
    break;
  }
  case "users-info": {
    const client = await createSlackClient(store, profileFlag);
    const user = await executeUsersInfo(client, { user: config.user, includeLocale: config.includeLocale });
    console.log(JSON.stringify(user, null, 2));
    break;
  }
  case "users-lookup-by-email": {
    const client = await createSlackClient(store, profileFlag);
    const user = await executeUsersLookupByEmail(client, { email: config.email });
    console.log(JSON.stringify(user, null, 2));
    break;
  }
  case "users-get-presence": {
    const client = await createSlackClient(store, profileFlag);
    const presence = await executeUsersGetPresence(client, { user: config.user });
    console.log(JSON.stringify(presence, null, 2));
    break;
  }
  case "users-set-presence": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsersSetPresence(client, { presence: config.presence });
    console.log(`Presence set to '${config.presence}'.`);
    break;
  }
  case "users-conversations": {
    const client = await createSlackClient(store, profileFlag);
    const channels = await executeUsersConversations(client, {
      user: config.user,
      cursor: config.cursor,
      limit: config.limit,
      types: config.types,
      excludeArchived: config.excludeArchived,
    });
    const rows = channels.map((c: { id?: string; name?: string; is_private?: boolean }) => ({
      id: c.id ?? "", name: c.name ?? "", is_private: c.is_private ?? false,
    }));
    console.log(formatOutput(rows, ["id", "name", "is_private"], outputFormat));
    break;
  }
  case "users-identity": {
    const client = await createSlackClient(store, profileFlag);
    const identity = await executeUsersIdentity(client, {});
    console.log(JSON.stringify(identity, null, 2));
    break;
  }
  case "users-profile-get": {
    const client = await createSlackClient(store, profileFlag);
    const profile = await executeUsersProfileGet(client, {
      user: config.user,
      includeLabels: config.includeLabels,
    });
    console.log(JSON.stringify(profile, null, 2));
    break;
  }
  case "users-profile-set": {
    const client = await createSlackClient(store, profileFlag);
    let profileJson: Record<string, unknown> | undefined;
    if (config.profile !== undefined) {
      const parsed: unknown = JSON.parse(config.profile);
      if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
        throw new Error("--profile must be a JSON object");
      }
      profileJson = { ...parsed };
    }
    await executeUsersProfileSet(client, {
      user: config.user,
      name: config.name,
      value: config.value,
      profile: profileJson,
    });
    console.log("Profile updated.");
    break;
  }
  case "conversations-archive": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsArchive(client, { channelId: config.channelId });
    console.log("Channel archived.");
    break;
  }
  case "conversations-unarchive": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsUnarchive(client, { channelId: config.channelId });
    console.log("Channel unarchived.");
    break;
  }
  case "conversations-delete": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsDelete(client, { channelId: config.channelId });
    console.log("Channel deleted.");
    break;
  }
  case "conversations-rename": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsRename(client, { channelId: config.channelId, name: config.name });
    console.log("Channel renamed.");
    break;
  }
  case "conversations-convert-to-private": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsConvertToPrivate(client, {
      channelId: config.channelId,
      name: config.name,
    });
    console.log("Channel converted to private.");
    break;
  }
  case "conversations-convert-to-public": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsConvertToPublic(client, { channelId: config.channelId });
    console.log("Channel converted to public.");
    break;
  }
  case "conversations-create": {
    const client = await createSlackClient(store, profileFlag);
    const result = await executeConversationsCreate(client, {
      name: config.name,
      isPrivate: config.isPrivate,
      teamId: config.teamId,
      orgWide: config.orgWide,
      description: config.description,
    });
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "conversations-search": {
    const client = await createSlackClient(store, profileFlag);
    const conversations = await executeConversationsSearch(client, {
      query: config.query,
      teamIds: config.teamIds?.split(","),
      connectedTeamIds: config.connectedTeamIds?.split(","),
      searchChannelTypes: config.searchChannelTypes?.split(","),
      sort: config.sort,
      sortDir: config.sortDir,
      totalCountOnly: config.totalCountOnly,
      cursor: config.cursor,
      limit: config.limit,
    });
    const rows = conversations.map((c: { id?: string; name?: string }) => ({
      id: c.id ?? "", name: c.name ?? "",
    }));
    console.log(formatOutput(rows, ["id", "name"], outputFormat));
    break;
  }
  case "conversations-invite": {
    const client = await createSlackClient(store, profileFlag);
    const inviteUserParts = config.userIds.split(",");
    const inviteFirstUser = inviteUserParts[0];
    if (inviteFirstUser === undefined) {
      throw new Error("--user-ids must not be empty");
    }
    const inviteUserIds: [string, ...string[]] = [inviteFirstUser, ...inviteUserParts.slice(1)];
    await executeConversationsInvite(client, { channelId: config.channelId, userIds: inviteUserIds });
    console.log("Users invited to channel.");
    break;
  }
  case "conversations-lookup": {
    const client = await createSlackClient(store, profileFlag);
    const lookupTeamIdParts = config.teamIds.split(",");
    const lookupFirstTeamId = lookupTeamIdParts[0];
    if (lookupFirstTeamId === undefined) {
      throw new Error("--team-ids must not be empty");
    }
    const lookupTeamIds: [string, ...string[]] = [lookupFirstTeamId, ...lookupTeamIdParts.slice(1)];
    const channels = await executeConversationsLookup(client, {
      teamIds: lookupTeamIds,
      lastMessageActivityBefore: config.lastMessageActivityBefore,
      maxMemberCount: config.maxMemberCount,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(channels, null, 2));
    break;
  }
  case "conversations-get-teams": {
    const client = await createSlackClient(store, profileFlag);
    const teams = await executeConversationsGetTeams(client, {
      channelId: config.channelId,
      cursor: config.cursor,
      limit: config.limit,
    });
    const teamRows = teams.map((id: string) => ({ id }));
    console.log(formatOutput(teamRows, ["id"], outputFormat));
    break;
  }
  case "conversations-set-teams": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsSetTeams(client, {
      channelId: config.channelId,
      targetTeamIds: config.teamIds?.split(","),
      teamId: config.teamId,
      orgChannel: config.orgChannel,
      allowDisconnect: config.allowDisconnect ?? false,
    });
    console.log("Channel teams updated.");
    break;
  }
  case "conversations-disconnect-shared": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsDisconnectShared(client, {
      channelId: config.channelId,
      leavingTeamIds: config.leavingTeamIds?.split(","),
    });
    console.log("Channel disconnected from shared workspaces.");
    break;
  }
  case "conversations-get-prefs": {
    const client = await createSlackClient(store, profileFlag);
    const prefs = await executeConversationsGetPrefs(client, { channelId: config.channelId });
    console.log(JSON.stringify(prefs, null, 2));
    break;
  }
  case "conversations-set-prefs": {
    const client = await createSlackClient(store, profileFlag);
    const parsedPrefs: Record<string, unknown> = JSON.parse(config.prefs);
    await executeConversationsSetPrefs(client, { channelId: config.channelId, prefs: parsedPrefs });
    console.log("Channel preferences updated.");
    break;
  }
  case "conversations-bulk-archive": {
    const client = await createSlackClient(store, profileFlag);
    const archiveParts = config.channelIds.split(",");
    const archiveFirst = archiveParts[0];
    if (archiveFirst === undefined) {
      throw new Error("--channel-ids must not be empty");
    }
    const archiveChannelIds: [string, ...string[]] = [archiveFirst, ...archiveParts.slice(1)];
    await executeConversationsBulkArchive(client, { channelIds: archiveChannelIds });
    console.log("Channels archived.");
    break;
  }
  case "conversations-bulk-delete": {
    const client = await createSlackClient(store, profileFlag);
    const deleteParts = config.channelIds.split(",");
    const deleteFirst = deleteParts[0];
    if (deleteFirst === undefined) {
      throw new Error("--channel-ids must not be empty");
    }
    const deleteChannelIds: [string, ...string[]] = [deleteFirst, ...deleteParts.slice(1)];
    await executeConversationsBulkDelete(client, { channelIds: deleteChannelIds });
    console.log("Channels deleted.");
    break;
  }
  case "conversations-bulk-move": {
    const client = await createSlackClient(store, profileFlag);
    const moveParts = config.channelIds.split(",");
    const moveFirst = moveParts[0];
    if (moveFirst === undefined) {
      throw new Error("--channel-ids must not be empty");
    }
    const moveChannelIds: [string, ...string[]] = [moveFirst, ...moveParts.slice(1)];
    await executeConversationsBulkMove(client, { channelIds: moveChannelIds, targetTeamId: config.targetTeamId });
    console.log("Channels moved.");
    break;
  }
  case "conversations-get-custom-retention": {
    const client = await createSlackClient(store, profileFlag);
    const retentionResult = await executeConversationsGetCustomRetention(client, { channelId: config.channelId });
    console.log(JSON.stringify(retentionResult, null, 2));
    break;
  }
  case "conversations-set-custom-retention": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsSetCustomRetention(client, {
      channelId: config.channelId,
      durationDays: config.durationDays,
    });
    console.log("Custom retention policy set.");
    break;
  }
  case "conversations-remove-custom-retention": {
    const client = await createSlackClient(store, profileFlag);
    await executeConversationsRemoveCustomRetention(client, { channelId: config.channelId });
    console.log("Custom retention policy removed.");
    break;
  }
  case "conversations-restrict-access-add-group": {
    const client = await createSlackClient(store, profileFlag);
    await executeRestrictAccessAddGroup(client, {
      channelId: config.channelId,
      groupId: config.groupId,
      teamId: config.teamId,
    });
    console.log("Group added to channel access list.");
    break;
  }
  case "conversations-restrict-access-list-groups": {
    const client = await createSlackClient(store, profileFlag);
    const groupResult = await executeRestrictAccessListGroups(client, {
      channelId: config.channelId,
      teamId: config.teamId,
    });
    console.log(JSON.stringify(groupResult, null, 2));
    break;
  }
  case "conversations-restrict-access-remove-group": {
    const client = await createSlackClient(store, profileFlag);
    await executeRestrictAccessRemoveGroup(client, {
      channelId: config.channelId,
      groupId: config.groupId,
      teamId: config.teamId,
    });
    console.log("Group removed from channel access list.");
    break;
  }
  case "conversations-ekm-list-original-connected-channel-info": {
    const client = await createSlackClient(store, profileFlag);
    const ekmResult = await executeEkmListOriginalConnectedChannelInfo(client, {
      teamIds: config.teamIds?.split(","),
      channelIds: config.channelIds?.split(","),
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(ekmResult, null, 2));
    break;
  }
  case "apps-approve": {
    const client = await createSlackClient(store, profileFlag);
    await executeAppsApprove(client, {
      appId: config.appId,
      requestId: config.requestId,
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
    });
    console.log("App approved.");
    break;
  }
  case "apps-restrict": {
    const client = await createSlackClient(store, profileFlag);
    await executeAppsRestrict(client, {
      appId: config.appId,
      requestId: config.requestId,
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
    });
    console.log("App restricted.");
    break;
  }
  case "apps-clear-resolution": {
    const client = await createSlackClient(store, profileFlag);
    await executeAppsClearResolution(client, {
      appId: config.appId,
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
    });
    console.log("App resolution cleared.");
    break;
  }
  case "apps-uninstall": {
    const client = await createSlackClient(store, profileFlag);
    await executeAppsUninstall(client, {
      appId: config.appId,
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
    });
    console.log("App uninstalled.");
    break;
  }
  case "apps-activities-list": {
    const client = await createSlackClient(store, profileFlag);
    const activities = await executeAppsActivitiesList(client, {
      appId: config.appId,
      teamId: config.teamId,
      componentId: config.componentId,
      componentType: config.componentType,
      logEventType: config.logEventType,
      maxDateCreated: config.maxDateCreated,
      minDateCreated: config.minDateCreated,
      minLogLevel: config.minLogLevel,
      sortDirection: config.sortDirection,
      source: config.source,
      traceId: config.traceId,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(activities, null, 2));
    break;
  }
  case "apps-approved-list": {
    const client = await createSlackClient(store, profileFlag);
    const approvedApps = await executeAppsApprovedList(client, {
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
      certified: config.certified,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(approvedApps, null, 2));
    break;
  }
  case "apps-requests-cancel": {
    const client = await createSlackClient(store, profileFlag);
    await executeAppsRequestsCancel(client, {
      requestId: config.requestId,
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
    });
    console.log("App request cancelled.");
    break;
  }
  case "apps-requests-list": {
    const client = await createSlackClient(store, profileFlag);
    const appRequests = await executeAppsRequestsList(client, {
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
      certified: config.certified,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(appRequests, null, 2));
    break;
  }
  case "apps-restricted-list": {
    const client = await createSlackClient(store, profileFlag);
    const restrictedApps = await executeAppsRestrictedList(client, {
      teamId: config.teamId,
      enterpriseId: config.enterpriseId,
      certified: config.certified,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(restrictedApps, null, 2));
    break;
  }
  case "apps-config-lookup": {
    const client = await createSlackClient(store, profileFlag);
    const configs = await executeAppsConfigLookup(client, {
      appIds: config.appIds.split(","),
    });
    console.log(JSON.stringify(configs, null, 2));
    break;
  }
  case "apps-config-set": {
    const client = await createSlackClient(store, profileFlag);
    await executeAppsConfigSet(client, {
      appId: config.appId,
      domainRestrictions: config.domainRestrictions !== undefined
        ? JSON.parse(config.domainRestrictions)
        : undefined,
      workflowAuthStrategy: config.workflowAuthStrategy,
    });
    console.log("App config updated.");
    break;
  }
  case "invite-requests-approve": {
    const client = await createSlackClient(store, profileFlag);
    await executeInviteRequestsApprove(client, {
      inviteRequestId: config.inviteRequestId,
      teamId: config.teamId,
    });
    console.log("Invite request approved.");
    break;
  }
  case "invite-requests-deny": {
    const client = await createSlackClient(store, profileFlag);
    await executeInviteRequestsDeny(client, {
      inviteRequestId: config.inviteRequestId,
      teamId: config.teamId,
    });
    console.log("Invite request denied.");
    break;
  }
  case "invite-requests-list": {
    const client = await createSlackClient(store, profileFlag);
    const inviteRequests = await executeInviteRequestsList(client, {
      teamId: config.teamId,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(inviteRequests, null, 2));
    break;
  }
  case "invite-requests-approved-list": {
    const client = await createSlackClient(store, profileFlag);
    const approvedRequests = await executeInviteRequestsApprovedList(client, {
      teamId: config.teamId,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(approvedRequests, null, 2));
    break;
  }
  case "invite-requests-denied-list": {
    const client = await createSlackClient(store, profileFlag);
    const deniedRequests = await executeInviteRequestsDeniedList(client, {
      teamId: config.teamId,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(deniedRequests, null, 2));
    break;
  }
  case "workflows-search": {
    const client = await createSlackClient(store, profileFlag);
    const searchCollaboratorIds = config.collaboratorIds?.split(",");
    let workflowsSearchCollaborators: [string, ...string[]] | undefined;
    if (searchCollaboratorIds !== undefined) {
      const first = searchCollaboratorIds[0];
      if (first === undefined) {
        throw new Error("--collaborator-ids must not be empty");
      }
      workflowsSearchCollaborators = [first, ...searchCollaboratorIds.slice(1)];
    }
    const workflows = await executeWorkflowsSearch(client, {
      appId: config.appId,
      collaboratorIds: workflowsSearchCollaborators,
      noCollaborators: config.noCollaborators,
      numTriggerIds: config.numTriggerIds,
      query: config.query,
      sort: config.sort,
      source: config.source,
      sortDir: config.sortDir,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(workflows, null, 2));
    break;
  }
  case "workflows-unpublish": {
    const client = await createSlackClient(store, profileFlag);
    const unpublishParts = config.workflowIds.split(",");
    const unpublishFirst = unpublishParts[0];
    if (unpublishFirst === undefined) {
      throw new Error("--workflow-ids must not be empty");
    }
    const unpublishWorkflowIds: [string, ...string[]] = [unpublishFirst, ...unpublishParts.slice(1)];
    await executeWorkflowsUnpublish(client, { workflowIds: unpublishWorkflowIds });
    console.log("Workflows unpublished.");
    break;
  }
  case "workflows-permissions-lookup": {
    const client = await createSlackClient(store, profileFlag);
    const permLookupParts = config.workflowIds.split(",");
    const permLookupFirst = permLookupParts[0];
    if (permLookupFirst === undefined) {
      throw new Error("--workflow-ids must not be empty");
    }
    const permLookupWorkflowIds: [string, ...string[]] = [permLookupFirst, ...permLookupParts.slice(1)];
    const permissions = await executeWorkflowsPermissionsLookup(client, {
      workflowIds: permLookupWorkflowIds,
      maxWorkflowTriggers: config.maxWorkflowTriggers,
    });
    console.log(JSON.stringify(permissions, null, 2));
    break;
  }
  case "workflows-collaborators-add": {
    const client = await createSlackClient(store, profileFlag);
    const addCollabParts = config.collaboratorIds.split(",");
    const addCollabFirst = addCollabParts[0];
    if (addCollabFirst === undefined) {
      throw new Error("--collaborator-ids must not be empty");
    }
    const addCollaboratorIds: [string, ...string[]] = [addCollabFirst, ...addCollabParts.slice(1)];
    const addWfParts = config.workflowIds.split(",");
    const addWfFirst = addWfParts[0];
    if (addWfFirst === undefined) {
      throw new Error("--workflow-ids must not be empty");
    }
    const addWorkflowIds: [string, ...string[]] = [addWfFirst, ...addWfParts.slice(1)];
    await executeWorkflowsCollaboratorsAdd(client, {
      collaboratorIds: addCollaboratorIds,
      workflowIds: addWorkflowIds,
    });
    console.log("Collaborators added to workflows.");
    break;
  }
  case "workflows-collaborators-remove": {
    const client = await createSlackClient(store, profileFlag);
    const rmCollabParts = config.collaboratorIds.split(",");
    const rmCollabFirst = rmCollabParts[0];
    if (rmCollabFirst === undefined) {
      throw new Error("--collaborator-ids must not be empty");
    }
    const rmCollaboratorIds: [string, ...string[]] = [rmCollabFirst, ...rmCollabParts.slice(1)];
    const rmWfParts = config.workflowIds.split(",");
    const rmWfFirst = rmWfParts[0];
    if (rmWfFirst === undefined) {
      throw new Error("--workflow-ids must not be empty");
    }
    const rmWorkflowIds: [string, ...string[]] = [rmWfFirst, ...rmWfParts.slice(1)];
    await executeWorkflowsCollaboratorsRemove(client, {
      collaboratorIds: rmCollaboratorIds,
      workflowIds: rmWorkflowIds,
    });
    console.log("Collaborators removed from workflows.");
    break;
  }
  case "functions-list": {
    const client = await createSlackClient(store, profileFlag);
    const functions = await executeFunctionsList(client, {
      appIds: config.appIds.split(","),
      teamId: config.teamId,
      cursor: config.cursor,
      limit: config.limit,
    });
    console.log(JSON.stringify(functions, null, 2));
    break;
  }
  case "functions-permissions-lookup": {
    const client = await createSlackClient(store, profileFlag);
    const fnLookupParts = config.functionIds.split(",");
    const fnLookupFirst = fnLookupParts[0];
    if (fnLookupFirst === undefined) {
      throw new Error("--function-ids must not be empty");
    }
    const fnLookupIds: [string, ...string[]] = [fnLookupFirst, ...fnLookupParts.slice(1)];
    const fnPermissions = await executeFunctionsPermissionsLookup(client, { functionIds: fnLookupIds });
    console.log(JSON.stringify(fnPermissions, null, 2));
    break;
  }
  case "functions-permissions-set": {
    const client = await createSlackClient(store, profileFlag);
    let fnSetUserIds: [string, ...string[]] | undefined;
    if (config.userIds !== undefined) {
      const fnSetParts = config.userIds.split(",");
      const fnSetFirst = fnSetParts[0];
      if (fnSetFirst === undefined) {
        throw new Error("--user-ids must not be empty");
      }
      fnSetUserIds = [fnSetFirst, ...fnSetParts.slice(1)];
    }
    await executeFunctionsPermissionsSet(client, {
      functionId: config.functionId,
      visibility: config.visibility,
      userIds: fnSetUserIds,
    });
    console.log("Function permissions updated.");
    break;
  }
  case "scim-users-list": {
    const client = await createScimClient(store, profileFlag);
    const users = await executeScimUsersList(client, {
      startIndex: config.startIndex,
      count: config.count,
      filter: config.filter,
    });
    const rows = users.map((u) => ({
      id: u.id,
      userName: u.userName,
      email: u.emails?.find((e) => e.primary)?.value ?? u.emails?.[0]?.value ?? "",
      active: String(u.active),
    }));
    console.log(formatOutput(rows, ["id", "userName", "email", "active"], outputFormat));
    break;
  }
  case "scim-users-get": {
    const client = await createScimClient(store, profileFlag);
    const user = await executeScimUsersGet(client, { id: config.id });
    console.log(JSON.stringify(user, null, 2));
    break;
  }
  case "scim-users-create": {
    const client = await createScimClient(store, profileFlag);
    const created = await executeScimUsersCreate(client, {
      userName: config.userName,
      email: config.email,
      givenName: config.givenName,
      familyName: config.familyName,
      displayName: config.displayName,
    });
    console.log(JSON.stringify(created, null, 2));
    break;
  }
  case "scim-users-update": {
    const client = await createScimClient(store, profileFlag);
    const updated = await executeScimUsersUpdate(client, {
      id: config.id,
      active: config.active,
      userName: config.userName,
      email: config.email,
      givenName: config.givenName,
      familyName: config.familyName,
      displayName: config.displayName,
      title: config.title,
    });
    console.log(JSON.stringify(updated, null, 2));
    break;
  }
  case "scim-users-deactivate": {
    const client = await createScimClient(store, profileFlag);
    await executeScimUsersDeactivate(client, { id: config.id });
    console.log(`User '${config.id}' deactivated.`);
    break;
  }
  case "scim-groups-list": {
    const client = await createScimClient(store, profileFlag);
    const groups = await executeScimGroupsList(client, {
      startIndex: config.startIndex,
      count: config.count,
      filter: config.filter,
    });
    const rows = groups.map((g) => ({
      id: g.id,
      displayName: g.displayName,
      memberCount: String(g.members?.length ?? 0),
    }));
    console.log(formatOutput(rows, ["id", "displayName", "memberCount"], outputFormat));
    break;
  }
  case "scim-groups-get": {
    const client = await createScimClient(store, profileFlag);
    const group = await executeScimGroupsGet(client, { id: config.id });
    console.log(JSON.stringify(group, null, 2));
    break;
  }
  case "scim-groups-create": {
    const client = await createScimClient(store, profileFlag);
    let groupMemberIds: string[] | undefined;
    if (config.memberIds !== undefined) {
      groupMemberIds = config.memberIds.split(",");
    }
    const created = await executeScimGroupsCreate(client, {
      displayName: config.displayName,
      memberIds: groupMemberIds,
    });
    console.log(JSON.stringify(created, null, 2));
    break;
  }
  case "scim-groups-update": {
    const client = await createScimClient(store, profileFlag);
    let groupAddMemberIds: string[] | undefined;
    let groupRemoveMemberIds: string[] | undefined;
    if (config.addMemberIds !== undefined) {
      groupAddMemberIds = config.addMemberIds.split(",");
    }
    if (config.removeMemberIds !== undefined) {
      groupRemoveMemberIds = config.removeMemberIds.split(",");
    }
    const updated = await executeScimGroupsUpdate(client, {
      id: config.id,
      displayName: config.displayName,
      addMemberIds: groupAddMemberIds,
      removeMemberIds: groupRemoveMemberIds,
    });
    console.log(JSON.stringify(updated, null, 2));
    break;
  }
  case "scim-groups-delete": {
    const client = await createScimClient(store, profileFlag);
    await executeScimGroupsDelete(client, { id: config.id });
    console.log(`Group '${config.id}' deleted.`);
    break;
  }
  case "auth-policy-assign-entities": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.entityIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--entity-ids must not be empty");
    const entityIds: [string, ...string[]] = [first, ...parts.slice(1)];
    if (config.entityType !== "USER") throw new Error('--entity-type must be "USER"');
    if (config.policyName !== "email_password") throw new Error('--policy-name must be "email_password"');
    await executeAuthPolicyAssignEntities(client, {
      entityIds,
      entityType: "USER",
      policyName: "email_password",
    });
    console.log(`Assigned ${entityIds.length} entities to policy '${config.policyName}'.`);
    break;
  }
  case "auth-policy-get-entities": {
    const client = await createSlackClient(store, profileFlag);
    if (config.entityType !== undefined && config.entityType !== "USER") {
      throw new Error('--entity-type must be "USER"');
    }
    if (config.policyName !== "email_password") throw new Error('--policy-name must be "email_password"');
    const entities = await executeAuthPolicyGetEntities(client, {
      policyName: "email_password",
      entityType: config.entityType === "USER" ? "USER" : undefined,
      cursor: config.cursor,
      limit: config.limit,
    });
    const rows = entities.map((e) => ({
      entity_id: e.entity_id ?? "",
      entity_type: e.entity_type ?? "",
    }));
    console.log(formatOutput(rows, ["entity_id", "entity_type"], outputFormat));
    break;
  }
  case "auth-policy-remove-entities": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.entityIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--entity-ids must not be empty");
    const entityIds: [string, ...string[]] = [first, ...parts.slice(1)];
    if (config.entityType !== "USER") throw new Error('--entity-type must be "USER"');
    if (config.policyName !== "email_password") throw new Error('--policy-name must be "email_password"');
    await executeAuthPolicyRemoveEntities(client, {
      entityIds,
      entityType: "USER",
      policyName: "email_password",
    });
    console.log(`Removed ${entityIds.length} entities from policy '${config.policyName}'.`);
    break;
  }
  case "barriers-create": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.barrieredFromUsergroupIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--barriered-from-usergroup-ids must not be empty");
    const barrieredFromUsergroupIds = [first, ...parts.slice(1)];
    const result = await executeBarriersCreate(client, {
      primaryUsergroupId: config.primaryUsergroupId,
      barrieredFromUsergroupIds,
    });
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "barriers-delete": {
    const client = await createSlackClient(store, profileFlag);
    await executeBarriersDelete(client, { barrierId: config.barrierId });
    console.log(`Barrier '${config.barrierId}' deleted.`);
    break;
  }
  case "barriers-list": {
    const client = await createSlackClient(store, profileFlag);
    const barriers = await executeBarriersList(client, { cursor: config.cursor, limit: config.limit });
    const rows = barriers.map((b) => ({
      id: b.id ?? "",
      primary_usergroup_id: b.primary_usergroup?.id ?? "",
    }));
    console.log(formatOutput(rows, ["id", "primary_usergroup_id"], outputFormat));
    break;
  }
  case "barriers-update": {
    const client = await createSlackClient(store, profileFlag);
    const parts = config.barrieredFromUsergroupIds.split(",");
    const first = parts[0];
    if (first === undefined || first === "") throw new Error("--barriered-from-usergroup-ids must not be empty");
    const barrieredFromUsergroupIds = [first, ...parts.slice(1)];
    const result = await executeBarriersUpdate(client, {
      barrierId: config.barrierId,
      primaryUsergroupId: config.primaryUsergroupId,
      barrieredFromUsergroupIds,
    });
    console.log(JSON.stringify(result, null, 2));
    break;
  }
  case "emoji-add": {
    const client = await createSlackClient(store, profileFlag);
    await executeEmojiAdd(client, { name: config.name, url: config.url });
    console.log(`Emoji '${config.name}' added.`);
    break;
  }
  case "emoji-add-alias": {
    const client = await createSlackClient(store, profileFlag);
    await executeEmojiAddAlias(client, { name: config.name, aliasFor: config.aliasFor });
    console.log(`Alias '${config.name}' for '${config.aliasFor}' added.`);
    break;
  }
  case "emoji-list": {
    const client = await createSlackClient(store, profileFlag);
    const rows = await executeEmojiList(client, { cursor: config.cursor, limit: config.limit });
    console.log(formatOutput(rows, ["name", "url"], outputFormat));
    break;
  }
  case "emoji-remove": {
    const client = await createSlackClient(store, profileFlag);
    await executeEmojiRemove(client, { name: config.name });
    console.log(`Emoji '${config.name}' removed.`);
    break;
  }
  case "emoji-rename": {
    const client = await createSlackClient(store, profileFlag);
    await executeEmojiRename(client, { name: config.name, newName: config.newName });
    console.log(`Emoji renamed '${config.name}' -> '${config.newName}'.`);
    break;
  }
  case "roles-add-assignments": {
    const client = await createSlackClient(store, profileFlag);
    const entityParts = config.entityIds.split(",");
    const userParts = config.userIds.split(",");
    const eFirst = entityParts[0];
    const uFirst = userParts[0];
    if (eFirst === undefined || eFirst === "") throw new Error("--entity-ids must not be empty");
    if (uFirst === undefined || uFirst === "") throw new Error("--user-ids must not be empty");
    await executeRolesAddAssignments(client, {
      roleId: config.roleId,
      entityIds: [eFirst, ...entityParts.slice(1)],
      userIds: [uFirst, ...userParts.slice(1)],
    });
    console.log(`Role '${config.roleId}' assigned.`);
    break;
  }
  case "roles-list-assignments": {
    const client = await createSlackClient(store, profileFlag);
    const sortDir =
      config.sortDir === "asc" || config.sortDir === "desc" ? config.sortDir : undefined;
    if (config.sortDir !== undefined && sortDir === undefined) {
      throw new Error('--sort-dir must be "asc" or "desc"');
    }
    const assignments = await executeRolesListAssignments(client, {
      entityIds: config.entityIds?.split(","),
      roleIds: config.roleIds?.split(","),
      cursor: config.cursor,
      limit: config.limit,
      sortDir,
    });
    const rows = assignments.map((a) => ({
      role_id: a.role_id ?? "",
      entity_id: a.entity_id ?? "",
      user_id: a.user_id ?? "",
    }));
    console.log(formatOutput(rows, ["role_id", "entity_id", "user_id"], outputFormat));
    break;
  }
  case "roles-remove-assignments": {
    const client = await createSlackClient(store, profileFlag);
    const entityParts = config.entityIds.split(",");
    const userParts = config.userIds.split(",");
    const eFirst = entityParts[0];
    const uFirst = userParts[0];
    if (eFirst === undefined || eFirst === "") throw new Error("--entity-ids must not be empty");
    if (uFirst === undefined || uFirst === "") throw new Error("--user-ids must not be empty");
    await executeRolesRemoveAssignments(client, {
      roleId: config.roleId,
      entityIds: [eFirst, ...entityParts.slice(1)],
      userIds: [uFirst, ...userParts.slice(1)],
    });
    console.log(`Role '${config.roleId}' removed.`);
    break;
  }
  case "usergroups-add-channels": {
    const client = await createSlackClient(store, profileFlag);
    const channelIds = config.channelIds.split(",");
    if (channelIds.length === 0 || channelIds[0] === "") {
      throw new Error("--channel-ids must not be empty");
    }
    await executeUsergroupsAddChannels(client, {
      usergroupId: config.usergroupId,
      channelIds,
      teamId: config.teamId,
    });
    console.log(`Channels added to usergroup '${config.usergroupId}'.`);
    break;
  }
  case "usergroups-add-teams": {
    const client = await createSlackClient(store, profileFlag);
    const teamIds = config.teamIds.split(",");
    if (teamIds.length === 0 || teamIds[0] === "") {
      throw new Error("--team-ids must not be empty");
    }
    await executeUsergroupsAddTeams(client, {
      usergroupId: config.usergroupId,
      teamIds,
      autoProvision: config.autoProvision,
    });
    console.log(`Teams added to usergroup '${config.usergroupId}'.`);
    break;
  }
  case "usergroups-list-channels": {
    const client = await createSlackClient(store, profileFlag);
    const channels = await executeUsergroupsListChannels(client, {
      usergroupId: config.usergroupId,
      teamId: config.teamId,
      includeNumMembers: config.includeNumMembers,
    });
    const rows = channels.map((c) => ({
      id: c.id ?? "",
      name: c.name ?? "",
      num_members: c.num_members ?? "",
    }));
    console.log(formatOutput(rows, ["id", "name", "num_members"], outputFormat));
    break;
  }
  case "usergroups-remove-channels": {
    const client = await createSlackClient(store, profileFlag);
    const channelIds = config.channelIds.split(",");
    if (channelIds.length === 0 || channelIds[0] === "") {
      throw new Error("--channel-ids must not be empty");
    }
    await executeUsergroupsRemoveChannels(client, {
      usergroupId: config.usergroupId,
      channelIds,
    });
    console.log(`Channels removed from usergroup '${config.usergroupId}'.`);
    break;
  }
  default: {
    const _exhaustive: never = config;
    throw new Error(`Unknown command`);
  }
}
}

main().catch((err) => {
  if (verboseFlag) {
    throw err;
  }
  if (err.code === "slack_webapi_platform_error" && err.data) {
    console.error(`Slack API error: ${err.data.error}`);
    if (err.data.needed) {
      console.error(`  needed scope: ${err.data.needed}`);
    }
    if (err.data.provided) {
      console.error(`  provided scopes: ${err.data.provided}`);
    }
    if (err.data.response_metadata?.messages) {
      for (const msg of err.data.response_metadata.messages) {
        console.error(`  ${msg}`);
      }
    }
  } else {
    console.error(`Error: ${err.message ?? err}`);
  }
  process.exit(1);
});
