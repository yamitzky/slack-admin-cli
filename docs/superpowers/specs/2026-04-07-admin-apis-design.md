# Admin APIs Design Spec

Date: 2026-04-07

## Overview

`@slack/web-api` SDK に存在する4つの admin API グループ（24メソッド）を sladm CLI に追加する。

- apps (11コマンド) — `admin.apps.*`
- invite-requests (5コマンド) — `admin.inviteRequests.*`
- workflows (5コマンド) — `admin.workflows.*`
- functions (3コマンド) — `admin.functions.*`

SDK に存在しない API（Legal Holds, Oversight, Audit Logs, SCIM）は対象外。

## Approach

既存の conversations コマンドと完全に同じパターンで実装する。

- 各コマンドは SDK メソッドの薄いラッパー（execute 関数1つ）
- discriminated union（`AppOrRequestID`, `TeamOrEnterpriseID`）は `Record<string, unknown>` パターンで処理し、バリデーションは SDK/API 側に委任
- 安全弁は不要（全て素直な CRUD 操作）
- `as` キャスト禁止（既存ルール）

## File Structure

```
src/commands/apps/
├── approve.ts
├── restrict.ts
├── clear-resolution.ts
├── uninstall.ts
├── activities/
│   └── list.ts
├── approved/
│   └── list.ts
├── requests/
│   ├── cancel.ts
│   └── list.ts
├── restricted/
│   └── list.ts
└── config/
    ├── lookup.ts
    └── set.ts

src/commands/invite-requests/
├── approve.ts
├── deny.ts
├── list.ts
├── approved/
│   └── list.ts
└── denied/
    └── list.ts

src/commands/workflows/
├── search.ts
├── unpublish.ts
├── permissions/
│   └── lookup.ts
└── collaborators/
    ├── add.ts
    └── remove.ts

src/commands/functions/
├── list.ts
└── permissions/
    ├── lookup.ts
    └── set.ts
```

Tests mirror the same structure under `tests/commands/`.

## Command Reference

### apps (11 commands)

#### apps approve
- SDK: `admin.apps.approve`
- Params: `--app-id` (opt), `--request-id` (opt), `--team-id` (opt), `--enterprise-id` (opt)
- Pattern: `Record<string, unknown>` (discriminated union: AppOrRequestID + TeamOrEnterpriseID)

#### apps restrict
- SDK: `admin.apps.restrict`
- Params: same as `apps approve`
- Pattern: `Record<string, unknown>`

#### apps clear-resolution
- SDK: `admin.apps.clearResolution`
- Params: `--app-id` (required), `--team-id` (opt), `--enterprise-id` (opt)
- Pattern: `Record<string, unknown>` (discriminated union: TeamOrEnterpriseID)

#### apps uninstall
- SDK: `admin.apps.uninstall`
- Params: same as `apps clear-resolution`
- Pattern: `Record<string, unknown>`

#### apps activities list
- SDK: `admin.apps.activities.list`
- Params: `--app-id`, `--team-id`, `--component-id`, `--component-type` (events_api|workflows|functions|tables), `--log-event-type`, `--max-date-created` (number), `--min-date-created` (number), `--min-log-level` (trace|debug|info|warn|error|fatal), `--sort-direction` (asc|desc), `--source` (slack|developer), `--trace-id`, `--cursor`, `--limit` (number)
- All optional

#### apps approved list
- SDK: `admin.apps.approved.list`
- Params: `--team-id`, `--enterprise-id`, `--certified` (boolean), `--cursor`, `--limit` (number)
- All optional

#### apps requests cancel
- SDK: `admin.apps.requests.cancel`
- Params: `--request-id` (required), `--team-id` (opt), `--enterprise-id` (opt)
- Pattern: `Record<string, unknown>` (discriminated union: TeamOrEnterpriseID)

#### apps requests list
- SDK: `admin.apps.requests.list`
- Params: `--team-id` (opt), `--enterprise-id` (opt), `--certified` (boolean), `--cursor`, `--limit` (number)
- Pattern: `Record<string, unknown>` (discriminated union: TeamOrEnterpriseID)

#### apps restricted list
- SDK: `admin.apps.restricted.list`
- Params: same as `apps requests list`
- Pattern: `Record<string, unknown>`

#### apps config lookup
- SDK: `admin.apps.config.lookup`
- Params: `--app-ids` (required, comma-separated → string[])

#### apps config set
- SDK: `admin.apps.config.set`
- Params: `--app-id` (required), `--domain-restrictions` (JSON string → parsed object), `--workflow-auth-strategy` (builder_choice|end_user_only)

### invite-requests (5 commands)

#### invite-requests approve
- SDK: `admin.inviteRequests.approve`
- Params: `--invite-request-id` (required), `--team-id` (required)

#### invite-requests deny
- SDK: `admin.inviteRequests.deny`
- Params: same as `invite-requests approve`

#### invite-requests list
- SDK: `admin.inviteRequests.list`
- Params: `--team-id` (required), `--cursor`, `--limit` (number)

#### invite-requests approved list
- SDK: `admin.inviteRequests.approved.list`
- Params: same as `invite-requests list`

#### invite-requests denied list
- SDK: `admin.inviteRequests.denied.list`
- Params: same as `invite-requests list`

### workflows (5 commands)

#### workflows search
- SDK: `admin.workflows.search`
- Params: `--app-id`, `--collaborator-ids` (comma-separated → [string, ...string[]]), `--no-collaborators` (boolean), `--num-trigger-ids` (number), `--query`, `--sort` (premium_runs), `--source` (code|workflow_builder), `--sort-dir` (asc|desc), `--cursor`, `--limit` (number)
- All optional

#### workflows unpublish
- SDK: `admin.workflows.unpublish`
- Params: `--workflow-ids` (required, comma-separated → [string, ...string[]])

#### workflows permissions lookup
- SDK: `admin.workflows.permissions.lookup`
- Params: `--workflow-ids` (required, comma-separated → [string, ...string[]]), `--max-workflow-triggers` (number)

#### workflows collaborators add
- SDK: `admin.workflows.collaborators.add`
- Params: `--collaborator-ids` (required, comma-separated → [string, ...string[]]), `--workflow-ids` (required, comma-separated → [string, ...string[]])

#### workflows collaborators remove
- SDK: `admin.workflows.collaborators.remove`
- Params: same as `workflows collaborators add`

### functions (3 commands)

#### functions list
- SDK: `admin.functions.list`
- Params: `--app-ids` (required, comma-separated → string[]), `--team-id`, `--cursor`, `--limit` (number)

#### functions permissions lookup
- SDK: `admin.functions.permissions.lookup`
- Params: `--function-ids` (required, comma-separated → [string, ...string[]])

#### functions permissions set
- SDK: `admin.functions.permissions.set`
- Params: `--function-id` (required), `--visibility` (required, everyone|app_collaborators|named_entities|no_one), `--user-ids` (comma-separated → [string, ...string[]])

## index.ts Integration

### Parser structure

Subgroups use nested `command()` calls (same as conversations restrict-access/ekm pattern):

```typescript
const appsCommands = or(
  command("apps", or(approve, restrict, clearResolution, uninstall)),
  appsActivitiesCommands,
  appsApprovedCommands,
  appsRequestsCommands,
  appsRestrictedCommands,
  appsConfigCommands,
);
```

### Root parser

Nested `or()` to handle arity limits:

```typescript
const rootParser = or(
  or(tokenCommands, teamsCommands, usersCommands),
  or(conversationsCommands, appsCommands),
  or(inviteRequestsCommands, workflowsCommands, functionsCommands),
);
```

### Switch cases

24 new cases following existing pattern: create client → call execute function → format output.

## Required Scopes

- `admin.apps:read` — apps approved/restricted/requests list, activities list, config lookup
- `admin.apps:write` — apps approve/restrict/clear-resolution/uninstall, requests cancel, config set
- `admin.invites:read` — invite-requests list/approved/denied
- `admin.invites:write` — invite-requests approve/deny
- `admin.workflows:read` — workflows search, permissions lookup
- `admin.workflows:write` — workflows unpublish, collaborators add/remove

## Testing

Standard mock pattern for all 24 commands:

```typescript
const mockClient = {
  admin: {
    apps: {
      approve: mock(() => Promise.resolve({ ok: true })),
    },
  },
} as any;

test("calls admin.apps.approve with correct params", async () => {
  await executeAppsApprove(mockClient, { appId: "A123", teamId: "T456" });
  expect(mockClient.admin.apps.approve).toHaveBeenCalledWith({
    app_id: "A123",
    team_id: "T456",
  });
});
```

No special safety mechanisms needed. All commands are straightforward SDK wrappers.
