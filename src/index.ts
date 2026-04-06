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

function extractFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function extractFlagValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return undefined;
  return process.argv[idx + 1];
}

const jsonFlag = extractFlag("--json");
const plainFlag = extractFlag("--plain");
const profileFlag = extractFlagValue("--profile");

const outputFormat: OutputFormat = jsonFlag ? "json" : plainFlag ? "plain" : "table";

// ---------------------------------------------------------------------------
// Token commands
// ---------------------------------------------------------------------------

const tokenAddCommand = command(
  "token",
  command(
    "add",
    object({
      cmd: constant("token-add" as const),
      name: argument(string({ metavar: "NAME" })),
      token: argument(string({ metavar: "TOKEN" })),
    }),
  ),
);

const tokenListCommand = command(
  "token",
  command(
    "list",
    object({
      cmd: constant("token-list" as const),
    }),
  ),
);

const tokenRemoveCommand = command(
  "token",
  command(
    "remove",
    object({
      cmd: constant("token-remove" as const),
      name: argument(string({ metavar: "NAME" })),
    }),
  ),
);

const tokenStatusCommand = command(
  "token",
  command(
    "status",
    object({
      cmd: constant("token-status" as const),
    }),
  ),
);

const tokenCommands = or(
  tokenAddCommand,
  tokenListCommand,
  tokenRemoveCommand,
  tokenStatusCommand,
);

// ---------------------------------------------------------------------------
// Teams commands
// ---------------------------------------------------------------------------

const teamsCreateCommand = command(
  "teams",
  command(
    "create",
    object({
      cmd: constant("teams-create" as const),
      domain: option("--domain", string({ metavar: "DOMAIN" })),
      name: option("--name", string({ metavar: "NAME" })),
      description: optional(option("--description", string({ metavar: "DESCRIPTION" }))),
      discoverability: optional(option("--discoverability", discoverabilityValueParser)),
    }),
  ),
);

const teamsListCommand = command(
  "teams",
  command(
    "list",
    object({
      cmd: constant("teams-list" as const),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    }),
  ),
);

const teamsAdminsListCommand = command(
  "teams",
  command(
    "admins",
    command(
      "list",
      object({
        cmd: constant("teams-admins-list" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      }),
    ),
  ),
);

const teamsOwnersListCommand = command(
  "teams",
  command(
    "owners",
    command(
      "list",
      object({
        cmd: constant("teams-owners-list" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      }),
    ),
  ),
);

const teamsSettingsInfoCommand = command(
  "teams",
  command(
    "settings",
    command(
      "info",
      object({
        cmd: constant("teams-settings-info" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      }),
    ),
  ),
);

const teamsSettingsSetNameCommand = command(
  "teams",
  command(
    "settings",
    command(
      "set-name",
      object({
        cmd: constant("teams-settings-set-name" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        name: option("--name", string({ metavar: "NAME" })),
      }),
    ),
  ),
);

const teamsSettingsSetIconCommand = command(
  "teams",
  command(
    "settings",
    command(
      "set-icon",
      object({
        cmd: constant("teams-settings-set-icon" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        imageUrl: option("--image-url", string({ metavar: "IMAGE_URL" })),
      }),
    ),
  ),
);

const teamsSettingsSetDescriptionCommand = command(
  "teams",
  command(
    "settings",
    command(
      "set-description",
      object({
        cmd: constant("teams-settings-set-description" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        description: option("--description", string({ metavar: "DESCRIPTION" })),
      }),
    ),
  ),
);

const teamsSettingsSetDiscoverabilityCommand = command(
  "teams",
  command(
    "settings",
    command(
      "set-discoverability",
      object({
        cmd: constant("teams-settings-set-discoverability" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        discoverability: option("--discoverability", discoverabilityValueParser),
      }),
    ),
  ),
);

const teamsCommands = or(
  teamsCreateCommand,
  teamsListCommand,
  teamsAdminsListCommand,
  teamsOwnersListCommand,
  teamsSettingsInfoCommand,
  teamsSettingsSetNameCommand,
  teamsSettingsSetIconCommand,
  teamsSettingsSetDescriptionCommand,
  teamsSettingsSetDiscoverabilityCommand,
);

// ---------------------------------------------------------------------------
// Users commands
// ---------------------------------------------------------------------------

const usersListCommand = command(
  "users",
  command(
    "list",
    object({
      cmd: constant("users-list" as const),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      isActive: optional(option("--is-active", boolValueParser)),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    }),
  ),
);

const usersInviteCommand = command(
  "users",
  command(
    "invite",
    object({
      cmd: constant("users-invite" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      email: option("--email", string({ metavar: "EMAIL" })),
      channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
      customMessage: optional(option("--custom-message", string({ metavar: "MESSAGE" }))),
      realName: optional(option("--real-name", string({ metavar: "NAME" }))),
      isRestricted: optional(option("--is-restricted", boolValueParser)),
      isUltraRestricted: optional(option("--is-ultra-restricted", boolValueParser)),
    }),
  ),
);

const usersAssignCommand = command(
  "users",
  command(
    "assign",
    object({
      cmd: constant("users-assign" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
      channelIds: optional(option("--channel-ids", string({ metavar: "CHANNEL_IDS" }))),
      isRestricted: optional(option("--is-restricted", boolValueParser)),
      isUltraRestricted: optional(option("--is-ultra-restricted", boolValueParser)),
    }),
  ),
);

const usersRemoveCommand = command(
  "users",
  command(
    "remove",
    object({
      cmd: constant("users-remove" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    }),
  ),
);

const usersSetAdminCommand = command(
  "users",
  command(
    "set-admin",
    object({
      cmd: constant("users-set-admin" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    }),
  ),
);

const usersSetOwnerCommand = command(
  "users",
  command(
    "set-owner",
    object({
      cmd: constant("users-set-owner" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    }),
  ),
);

const usersSetRegularCommand = command(
  "users",
  command(
    "set-regular",
    object({
      cmd: constant("users-set-regular" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
    }),
  ),
);

const usersSessionResetCommand = command(
  "users",
  command(
    "session",
    command(
      "reset",
      object({
        cmd: constant("users-session-reset" as const),
        userId: option("--user-id", string({ metavar: "USER_ID" })),
        mobileOnly: optional(option("--mobile-only", boolValueParser)),
        webOnly: optional(option("--web-only", boolValueParser)),
      }),
    ),
  ),
);

const usersCommands = or(
  usersListCommand,
  usersInviteCommand,
  usersAssignCommand,
  usersRemoveCommand,
  usersSetAdminCommand,
  usersSetOwnerCommand,
  usersSetRegularCommand,
  usersSessionResetCommand,
);

// ---------------------------------------------------------------------------
// Root parser
// ---------------------------------------------------------------------------

const rootParser = or(tokenCommands, teamsCommands, usersCommands);

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const config = await run(rootParser, {
  programName: "sladm",
  help: "both",
  version: { value: "0.1.0", mode: "both" },
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
    const rows = teams as Record<string, unknown>[];
    console.log(formatOutput(rows, ["id", "name", "domain"], outputFormat));
    break;
  }
  case "teams-admins-list": {
    const client = await createSlackClient(store, profileFlag);
    const adminIds = await executeTeamsAdminsList(client, { teamId: config.teamId });
    const rows = (adminIds as string[]).map((id) => ({ id }));
    console.log(formatOutput(rows, ["id"], outputFormat));
    break;
  }
  case "teams-owners-list": {
    const client = await createSlackClient(store, profileFlag);
    const ownerIds = await executeTeamsOwnersList(client, { teamId: config.teamId });
    const rows = (ownerIds as string[]).map((id) => ({ id }));
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
    const rows = users as Record<string, unknown>[];
    console.log(formatOutput(rows, ["id", "name", "email"], outputFormat));
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
  default: {
    const _exhaustive: never = config;
    throw new Error(`Unknown command`);
  }
}
