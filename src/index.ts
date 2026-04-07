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
import { executeUsersList } from "./commands/users/list";
import { executeUsersInvite } from "./commands/users/invite";
import { executeUsersAssign } from "./commands/users/assign";
import { executeUsersRemove } from "./commands/users/remove";
import { executeUsersSetAdmin } from "./commands/users/set-admin";
import { executeUsersSetOwner } from "./commands/users/set-owner";
import { executeUsersSetRegular } from "./commands/users/set-regular";
import { executeSessionReset } from "./commands/users/session-reset";

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

// ---------------------------------------------------------------------------
// Global flags (parsed manually from process.argv)
// ---------------------------------------------------------------------------

const GLOBAL_FLAGS = new Set(["--json", "--plain"]);
const GLOBAL_FLAGS_WITH_VALUE = new Set(["--profile"]);

function parseGlobalFlags(argv: string[]): {
  json: boolean;
  plain: boolean;
  profile: string | undefined;
  rest: string[];
} {
  let json = false;
  let plain = false;
  let profile: string | undefined;
  const rest: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--json") {
      json = true;
    } else if (arg === "--plain") {
      plain = true;
    } else if (arg === "--profile") {
      profile = argv[i + 1];
      i++;
    } else {
      rest.push(arg);
    }
  }

  return { json, plain, profile, rest };
}

const globalFlags = parseGlobalFlags(process.argv.slice(2));
const jsonFlag = globalFlags.json;
const plainFlag = globalFlags.plain;
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
    command("session", command("reset", object({
      cmd: constant("users-session-reset" as const),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
      mobileOnly: optional(option("--mobile-only", boolValueParser)),
      webOnly: optional(option("--web-only", boolValueParser)),
    }))),
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
// Root parser
// ---------------------------------------------------------------------------

const rootParser = or(tokenCommands, teamsCommands, usersCommands, conversationsCommands);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

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
    const inviteChannelParts = config.channelIds.split(",");
    const inviteFirstChannel = inviteChannelParts[0];
    if (inviteFirstChannel === undefined) {
      throw new Error("--channel-ids must not be empty");
    }
    const inviteChannelIds: [string, ...string[]] = [inviteFirstChannel, ...inviteChannelParts.slice(1)];
    await executeUsersInvite(client, {
      teamId: config.teamId,
      email: config.email,
      channelIds: inviteChannelIds,
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
  default: {
    const _exhaustive: never = config;
    throw new Error(`Unknown command`);
  }
}
