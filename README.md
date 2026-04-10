# sladm — Slack Admin CLI for humans and AI agents

CLI & Agent Skill for managing Slack Enterprise Grid / Business+ workspaces via `admin.*` APIs.

[日本語版 README](README_ja.md)

## Features

- **79 admin commands** covering 10 API groups: teams, users, conversations, apps, invite-requests, workflows, functions, scim-users, scim-groups, and token management
- **Agent Skill** — ships with a Claude Code / Codex skill so AI agents can drive Slack admin tasks using the CLI as a tool
- **Bulk operations** — archive, delete, or move hundreds of channels at once with `conversations bulk-*`
- **Output formats** — table (human), JSON (programmatic), TSV (pipe-friendly)
- **Multi-org support** — switch between orgs with `--profile`, tokens stored in OS keychain

> **Note:** This CLI is in alpha. Use at your own risk. Only a subset of features have been verified.

## Installation

Requires [Bun](https://bun.sh) runtime:

```bash
npm install -g sladm-cli
# or
bun install -g sladm-cli
```

Or run directly without installing:

```bash
npx sladm-cli --help
# or
bunx sladm-cli --help
```

### Pre-built Binaries

Standalone binaries (no runtime required) are available on the [Releases](https://github.com/yamitzky/slack-admin-cli/releases) page:

| Platform | File |
|----------|------|
| macOS (Apple Silicon) | `sladm-darwin-arm64` |
| macOS (Intel) | `sladm-darwin-x64` |
| Linux (x64) | `sladm-linux-x64` |
| Linux (arm64) | `sladm-linux-arm64` |
| Windows (x64) | `sladm-windows-x64.exe` |

```bash
# Example: download and install on macOS (Apple Silicon)
curl -L https://github.com/yamitzky/slack-admin-cli/releases/latest/download/sladm-darwin-arm64 -o sladm
chmod +x sladm
sudo mv sladm /usr/local/bin/
```

## Agent Skill

To use this CLI as an agent skill in Claude Code, Cursor, OpenCode, etc.:

```bash
npx skills add yamitzky/slack-admin-cli
```

When the skill is active, agents automatically use `sladm` commands for Slack admin operations, with per-command-group recipes providing API reference context.

## Quick Start

### 1. Create a Slack App

Create an app at [Slack API](https://api.slack.com/apps) and grant the required `admin.*` scopes (see [Required Scopes](#required-scopes)).

### 2. Register Token

```bash
sladm token add default xoxp-your-token-here
```

### 3. Verify

```bash
sladm token status
sladm teams list
```

## Usage Examples

### Invite a user

```bash
# Invite as a full member
sladm users invite --team-id T024XCDSF --email new-member@example.com \
  --channel-ids C01ABCD2EFG

# Invite as a single-channel guest
sladm users invite --team-id T024XCDSF --email guest@partner.com \
  --channel-ids C01ABCD2EFG --is-ultra-restricted true
```

### Deactivate a user

```bash
# Find the user
sladm scim-users list --filter 'email eq "leaving@example.com"'

# Deactivate their account (org-wide, via SCIM API)
sladm scim-users deactivate --id U02T7QBTFGA
```

## Authentication

### Profile Management

```bash
sladm token add production xoxp-prod-token    # Add profile
sladm token add staging xoxp-staging-token     # Add another
sladm token list                               # List profiles
sladm token remove staging                     # Remove profile
```

Tokens are stored in the OS keychain (macOS Keychain / Linux Secret Service). Falls back to `~/.config/sladm/.token-<name>` if keychain is unavailable.

### Switching Profiles

```bash
sladm --profile production teams list          # Via flag
SLADM_PROFILE=staging sladm teams list         # Via env var
```

Priority: `--profile` flag > `SLADM_PROFILE` env var > default profile

If you only have one profile, `--profile` is not needed.

## Output

All data-returning commands support three output formats:

```bash
sladm teams list                 # Table (default)
sladm teams list --json          # JSON
sladm teams list --plain         # TSV (for scripting)
```

## Commands

### Token

| Command | Description |
|---------|-------------|
| `token add <NAME> <TOKEN>` | Add profile |
| `token list` | List profiles |
| `token remove <NAME>` | Remove profile |
| `token status` | Check token status |

### Teams

| Command | Description |
|---------|-------------|
| `teams create` | Create team |
| `teams list` | List teams |
| `teams admins list` | List admins |
| `teams owners list` | List owners |
| `teams settings info` | Get team settings |
| `teams settings set-name` | Set team name |
| `teams settings set-icon` | Set team icon |
| `teams settings set-description` | Set description |
| `teams settings set-discoverability` | Set discoverability |

### Users

| Command | Description |
|---------|-------------|
| `users list` | List users |
| `users invite` | Invite user |
| `users assign` | Assign to team |
| `users remove` | Remove from team |
| `users set-admin` | Promote to admin |
| `users set-owner` | Promote to owner |
| `users set-regular` | Demote to regular user |
| `users session reset` | Reset session |

### Conversations

| Command | Description |
|---------|-------------|
| `conversations create` | Create channel |
| `conversations delete` | Delete channel |
| `conversations archive` | Archive channel |
| `conversations unarchive` | Unarchive channel |
| `conversations rename` | Rename channel |
| `conversations search` | Search channels |
| `conversations invite` | Invite user to channel |
| `conversations convert-to-private` | Convert to private |
| `conversations convert-to-public` | Convert to public |
| `conversations get-prefs` | Get channel preferences |
| `conversations set-prefs` | Set channel preferences |
| `conversations get-custom-retention` | Get retention policy |
| `conversations set-custom-retention` | Set retention policy |
| `conversations remove-custom-retention` | Remove retention policy |
| `conversations get-teams` | List associated teams |
| `conversations set-teams` | Set team associations |
| `conversations disconnect-shared` | Disconnect shared channel |
| `conversations bulk-archive` | Bulk archive |
| `conversations bulk-delete` | Bulk delete |
| `conversations bulk-move` | Bulk move across teams |
| `conversations lookup` | Lookup by criteria |
| `conversations restrict-access add-group` | Add access group |
| `conversations restrict-access list-groups` | List access groups |
| `conversations restrict-access remove-group` | Remove access group |
| `conversations ekm list-original-connected-channel-info` | EKM channel info |

### SCIM Users

| Command | Description |
|---------|-------------|
| `scim-users list` | List users (SCIM) |
| `scim-users get` | Get user details (SCIM) |
| `scim-users create` | Create user (SCIM) |
| `scim-users update` | Update user attributes (SCIM) |
| `scim-users deactivate` | Deactivate user (SCIM) |

### SCIM Groups

| Command | Description |
|---------|-------------|
| `scim-groups list` | List groups (SCIM) |
| `scim-groups get` | Get group details (SCIM) |
| `scim-groups create` | Create group (SCIM) |
| `scim-groups update` | Update group (SCIM) |
| `scim-groups delete` | Delete group (SCIM) |

### Apps

| Command | Description |
|---------|-------------|
| `apps approve` | Approve app |
| `apps restrict` | Restrict app |
| `apps clear-resolution` | Clear approval/restriction |
| `apps uninstall` | Uninstall app |
| `apps activities list` | Activity log |
| `apps approved list` | List approved apps |
| `apps restricted list` | List restricted apps |
| `apps requests list` | List requests |
| `apps requests cancel` | Cancel request |
| `apps config lookup` | Lookup app config |
| `apps config set` | Set app config |

### Invite Requests

| Command | Description |
|---------|-------------|
| `invite-requests approve` | Approve request |
| `invite-requests deny` | Deny request |
| `invite-requests list` | List pending requests |
| `invite-requests approved list` | List approved requests |
| `invite-requests denied list` | List denied requests |

### Workflows

| Command | Description |
|---------|-------------|
| `workflows search` | Search workflows |
| `workflows unpublish` | Unpublish workflow |
| `workflows permissions lookup` | Lookup permissions |
| `workflows collaborators add` | Add collaborator |
| `workflows collaborators remove` | Remove collaborator |

### Functions

| Command | Description |
|---------|-------------|
| `functions list` | List functions |
| `functions permissions lookup` | Lookup permissions |
| `functions permissions set` | Set permissions |

## Required Scopes

| Scope | Purpose |
|-------|---------|
| `admin.teams:read` | List teams, get settings |
| `admin.teams:write` | Create teams, update settings |
| `admin.users:read` | List users |
| `admin.users:write` | Invite users, manage roles |
| `admin.conversations:read` | Search channels, get settings |
| `admin.conversations:write` | Channel operations, bulk actions |
| `admin.apps:read` | List apps, get config |
| `admin.apps:write` | Approve/restrict apps, set config |
| `admin.invites:read` | List invite requests |
| `admin.invites:write` | Approve/deny invite requests |
| `admin.workflows:read` | List workflows and functions |
| `admin.workflows:write` | Manage workflows, set permissions |
| `admin` | SCIM user and group management |

## Development

```bash
git clone https://github.com/mitsuki-ogasahara/slack-admin-cli.git
cd slack-admin-cli
bun install

bun run dev -- <command>   # Run in development
bun test                   # Run tests
bun run lint               # Type check (tsc --noEmit)
bun link                   # Link as global command
```

### Tech Stack

TypeScript / Bun / [@slack/web-api](https://www.npmjs.com/package/@slack/web-api) / [@optique/core](https://www.npmjs.com/package/@optique/core)

Architecture details: see [CLAUDE.md](./CLAUDE.md)

## Related Links

- [Slack Admin API documentation](https://api.slack.com/admins)
- [Slack API method list (`admin.*`)](https://api.slack.com/methods?filter=admin)
- [Slack App management](https://api.slack.com/apps)

## License

MIT
