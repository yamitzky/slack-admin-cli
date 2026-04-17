# Admin API Coverage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SDK 対応済みかつ未実装の admin.* メソッド 28 個を `sladm` に追加し、README/SKILL ドキュメントと PR を整える。

**Architecture:** 既存の `src/commands/<group>/[<sub>/]<action>.ts` 構造に従い、各コマンドは `execute*(client, opts)` を export。CLI ルーティングは `src/index.ts` の `@optique/core` パーサー定義と末尾の switch 文に追記。テストは `tests/commands/<同パス>` にユニットテスト併設。

**Tech Stack:** Bun, TypeScript, `@slack/web-api`, `@optique/core`, `bun:test`

**仕様書:** `docs/superpowers/specs/2026-04-17-admin-api-coverage-design.md`

---

## グローバル規約

- `Options` インターフェースは camelCase。
- API 呼び出しは型付きメソッド（例: `client.admin.barriers.list(...)`）を優先。SDK 型ユニオンで TS エラーになる場合のみ `client.apiCall("admin.x.y", params)` にフォールバック。
- `as` キャスト禁止（`as any` はテストの mock client のみ可、既存パターン踏襲）。
- 任意パラメータは undefined 時に渡さない（`Record<string, unknown>` を構築 → 条件追加）。
- list 系は `Promise<T[]>` を返し、index.ts 側で `formatOutput()` 整形。
- 各タスク完了時に `bun run lint` と `bun test <該当ファイル>` を実行し、グリーンになってからコミット。

---

## Task 1: auth-policy グループ

**Files:**
- Create: `src/commands/auth-policy/assign-entities.ts`
- Create: `src/commands/auth-policy/get-entities.ts`
- Create: `src/commands/auth-policy/remove-entities.ts`
- Create: `tests/commands/auth-policy/assign-entities.test.ts`
- Create: `tests/commands/auth-policy/get-entities.test.ts`
- Create: `tests/commands/auth-policy/remove-entities.test.ts`
- Modify: `src/index.ts`（import 追加 + パーサー定義 + switch ケース 3 件）

### Step 1.1: テストを 3 本書く

- [ ] `tests/commands/auth-policy/assign-entities.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAuthPolicyAssignEntities } from "../../../src/commands/auth-policy/assign-entities";

describe("auth-policy assign-entities", () => {
  test("calls admin.auth.policy.assignEntities with snake_case params", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;

    await executeAuthPolicyAssignEntities(client, {
      entityIds: ["T001", "T002"],
      entityType: "USER",
      policyName: "email_password",
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.assignEntities", {
      entity_ids: ["T001", "T002"],
      entity_type: "USER",
      policy_name: "email_password",
    });
  });
});
```

- [ ] `tests/commands/auth-policy/get-entities.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAuthPolicyGetEntities } from "../../../src/commands/auth-policy/get-entities";

describe("auth-policy get-entities", () => {
  test("returns entities array", async () => {
    const mockApiCall = mock(() =>
      Promise.resolve({ ok: true, entities: [{ entity_id: "T001" }] }),
    );
    const client = { apiCall: mockApiCall } as any;

    const result = await executeAuthPolicyGetEntities(client, {
      policyName: "email_password",
      entityType: "USER",
      cursor: "abc",
      limit: 10,
    });

    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.getEntities", {
      policy_name: "email_password",
      entity_type: "USER",
      cursor: "abc",
      limit: 10,
    });
    expect(result).toEqual([{ entity_id: "T001" }]);
  });

  test("omits optional params when not provided", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true, entities: [] }));
    const client = { apiCall: mockApiCall } as any;
    await executeAuthPolicyGetEntities(client, { policyName: "email_password" });
    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.getEntities", {
      policy_name: "email_password",
    });
  });
});
```

- [ ] `tests/commands/auth-policy/remove-entities.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAuthPolicyRemoveEntities } from "../../../src/commands/auth-policy/remove-entities";

describe("auth-policy remove-entities", () => {
  test("calls admin.auth.policy.removeEntities", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true }));
    const client = { apiCall: mockApiCall } as any;
    await executeAuthPolicyRemoveEntities(client, {
      entityIds: ["T001"],
      entityType: "USER",
      policyName: "email_password",
    });
    expect(mockApiCall).toHaveBeenCalledWith("admin.auth.policy.removeEntities", {
      entity_ids: ["T001"],
      entity_type: "USER",
      policy_name: "email_password",
    });
  });
});
```

- [ ] **Step 1.2: テストが失敗することを確認**

Run: `bun test tests/commands/auth-policy/`
Expected: モジュール未解決でエラー

### Step 1.3: 実装

- [ ] `src/commands/auth-policy/assign-entities.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface AuthPolicyAssignEntitiesOptions {
  entityIds: string[];
  entityType: "USER";
  policyName: "email_password";
}

export async function executeAuthPolicyAssignEntities(
  client: WebClient,
  opts: AuthPolicyAssignEntitiesOptions,
): Promise<void> {
  await client.apiCall("admin.auth.policy.assignEntities", {
    entity_ids: opts.entityIds,
    entity_type: opts.entityType,
    policy_name: opts.policyName,
  });
}
```

- [ ] `src/commands/auth-policy/get-entities.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface AuthPolicyGetEntitiesOptions {
  policyName: "email_password";
  entityType?: "USER";
  cursor?: string;
  limit?: number;
}

export async function executeAuthPolicyGetEntities(
  client: WebClient,
  opts: AuthPolicyGetEntitiesOptions,
) {
  const params: Record<string, unknown> = { policy_name: opts.policyName };
  if (opts.entityType !== undefined) params.entity_type = opts.entityType;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.apiCall("admin.auth.policy.getEntities", params);
  const entities = (response as { entities?: unknown[] }).entities;
  return entities ?? [];
}
```

- [ ] `src/commands/auth-policy/remove-entities.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface AuthPolicyRemoveEntitiesOptions {
  entityIds: string[];
  entityType: "USER";
  policyName: "email_password";
}

export async function executeAuthPolicyRemoveEntities(
  client: WebClient,
  opts: AuthPolicyRemoveEntitiesOptions,
): Promise<void> {
  await client.apiCall("admin.auth.policy.removeEntities", {
    entity_ids: opts.entityIds,
    entity_type: opts.entityType,
    policy_name: opts.policyName,
  });
}
```

### Step 1.4: index.ts に組み込み

- [ ] import 追加（既存 import ブロックの末尾、SCIM の前）

```typescript
import { executeAuthPolicyAssignEntities } from "./commands/auth-policy/assign-entities";
import { executeAuthPolicyGetEntities } from "./commands/auth-policy/get-entities";
import { executeAuthPolicyRemoveEntities } from "./commands/auth-policy/remove-entities";
```

- [ ] パーサー定義を `// SCIM Users commands` セクションの直前に追加

```typescript
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
```

- [ ] `rootParser` に `authPolicyCommands` を追加（既存の `or(...)` ブロックに）

```typescript
const rootParser = or(
  or(tokenCommands, teamsCommands, usersCommands),
  or(conversationsCommands, appsCommands),
  or(inviteRequestsCommands, workflowsCommands, functionsCommands),
  or(scimUsersCommands, scimGroupsCommands),
  or(authPolicyCommands /* 後続タスクで他グループも追加 */),
);
```

- [ ] switch 文末尾に 3 ケース追加（SCIM ケースの後）

```typescript
case "auth-policy-assign-entities": {
  const client = await createSlackClient(store, profileFlag);
  const entityIds = config.entityIds.split(",");
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
  const rows = (entities as Array<{ entity_id?: string; entity_type?: string }>).map((e) => ({
    entity_id: e.entity_id ?? "",
    entity_type: e.entity_type ?? "",
  }));
  console.log(formatOutput(rows, ["entity_id", "entity_type"], outputFormat));
  break;
}
case "auth-policy-remove-entities": {
  const client = await createSlackClient(store, profileFlag);
  const entityIds = config.entityIds.split(",");
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
```

### Step 1.5: 検証 + コミット

- [ ] `bun run lint` グリーン
- [ ] `bun test tests/commands/auth-policy/` 全 PASS
- [ ] コミット

```bash
git add src/commands/auth-policy tests/commands/auth-policy src/index.ts
git commit -m "feat: add auth-policy admin commands"
```

---

## Task 2: barriers グループ

**Files:**
- Create: `src/commands/barriers/{create,delete,list,update}.ts`
- Create: `tests/commands/barriers/{create,delete,list,update}.test.ts`
- Modify: `src/index.ts`

### Step 2.1: 実装ファイル

- [ ] `src/commands/barriers/create.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface BarriersCreateOptions {
  primaryUsergroupId: string;
  barrieredFromUsergroupIds: string[];
}

export async function executeBarriersCreate(
  client: WebClient,
  opts: BarriersCreateOptions,
) {
  return await client.admin.barriers.create({
    primary_usergroup_id: opts.primaryUsergroupId,
    barriered_from_usergroup_ids: opts.barrieredFromUsergroupIds,
    restricted_subjects: ["im", "mpim", "call"],
  });
}
```

- [ ] `src/commands/barriers/delete.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface BarriersDeleteOptions { barrierId: string }

export async function executeBarriersDelete(
  client: WebClient,
  opts: BarriersDeleteOptions,
): Promise<void> {
  await client.admin.barriers.delete({ barrier_id: opts.barrierId });
}
```

- [ ] `src/commands/barriers/list.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface BarriersListOptions {
  cursor?: string;
  limit?: number;
}

export async function executeBarriersList(
  client: WebClient,
  opts: BarriersListOptions,
) {
  const response = await client.admin.barriers.list({
    cursor: opts.cursor,
    limit: opts.limit,
  });
  return response.barriers ?? [];
}
```

- [ ] `src/commands/barriers/update.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface BarriersUpdateOptions {
  barrierId: string;
  primaryUsergroupId: string;
  barrieredFromUsergroupIds: string[];
}

export async function executeBarriersUpdate(
  client: WebClient,
  opts: BarriersUpdateOptions,
) {
  return await client.admin.barriers.update({
    barrier_id: opts.barrierId,
    primary_usergroup_id: opts.primaryUsergroupId,
    barriered_from_usergroup_ids: opts.barrieredFromUsergroupIds,
    restricted_subjects: ["im", "mpim", "call"],
  });
}
```

### Step 2.2: テストファイル

- [ ] 4 ファイル。`create` をテンプレに残り 3 つも同パターン。

```typescript
// tests/commands/barriers/create.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeBarriersCreate } from "../../../src/commands/barriers/create";

describe("barriers create", () => {
  test("creates a barrier with restricted_subjects defaulted", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, barrier: { id: "B001" } }));
    const client = { admin: { barriers: { create: mockCreate } } } as any;
    await executeBarriersCreate(client, {
      primaryUsergroupId: "S001",
      barrieredFromUsergroupIds: ["S002", "S003"],
    });
    expect(mockCreate).toHaveBeenCalledWith({
      primary_usergroup_id: "S001",
      barriered_from_usergroup_ids: ["S002", "S003"],
      restricted_subjects: ["im", "mpim", "call"],
    });
  });
});
```

```typescript
// tests/commands/barriers/delete.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeBarriersDelete } from "../../../src/commands/barriers/delete";

describe("barriers delete", () => {
  test("deletes by id", async () => {
    const mockDelete = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { barriers: { delete: mockDelete } } } as any;
    await executeBarriersDelete(client, { barrierId: "B001" });
    expect(mockDelete).toHaveBeenCalledWith({ barrier_id: "B001" });
  });
});
```

```typescript
// tests/commands/barriers/list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeBarriersList } from "../../../src/commands/barriers/list";

describe("barriers list", () => {
  test("returns barriers array", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, barriers: [{ id: "B001" }] }),
    );
    const client = { admin: { barriers: { list: mockList } } } as any;
    const result = await executeBarriersList(client, { cursor: "c", limit: 5 });
    expect(mockList).toHaveBeenCalledWith({ cursor: "c", limit: 5 });
    expect(result).toEqual([{ id: "B001" }]);
  });
});
```

```typescript
// tests/commands/barriers/update.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeBarriersUpdate } from "../../../src/commands/barriers/update";

describe("barriers update", () => {
  test("updates a barrier", async () => {
    const mockUpdate = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { barriers: { update: mockUpdate } } } as any;
    await executeBarriersUpdate(client, {
      barrierId: "B001",
      primaryUsergroupId: "S001",
      barrieredFromUsergroupIds: ["S002"],
    });
    expect(mockUpdate).toHaveBeenCalledWith({
      barrier_id: "B001",
      primary_usergroup_id: "S001",
      barriered_from_usergroup_ids: ["S002"],
      restricted_subjects: ["im", "mpim", "call"],
    });
  });
});
```

### Step 2.3: index.ts 統合

- [ ] import を 4 件追加：

```typescript
import { executeBarriersCreate } from "./commands/barriers/create";
import { executeBarriersDelete } from "./commands/barriers/delete";
import { executeBarriersList } from "./commands/barriers/list";
import { executeBarriersUpdate } from "./commands/barriers/update";
```

- [ ] パーサーを `// Auth Policy commands` セクションの後に追加：

```typescript
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
```

- [ ] `rootParser` の追加グループに `barriersCommands` を加える。
- [ ] switch ケース 4 件追加：

```typescript
case "barriers-create": {
  const client = await createSlackClient(store, profileFlag);
  const result = await executeBarriersCreate(client, {
    primaryUsergroupId: config.primaryUsergroupId,
    barrieredFromUsergroupIds: config.barrieredFromUsergroupIds.split(","),
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
  const rows = (barriers as Array<{ id?: string; primary_usergroup?: { id?: string } }>).map((b) => ({
    id: b.id ?? "",
    primary_usergroup_id: b.primary_usergroup?.id ?? "",
  }));
  console.log(formatOutput(rows, ["id", "primary_usergroup_id"], outputFormat));
  break;
}
case "barriers-update": {
  const client = await createSlackClient(store, profileFlag);
  const result = await executeBarriersUpdate(client, {
    barrierId: config.barrierId,
    primaryUsergroupId: config.primaryUsergroupId,
    barrieredFromUsergroupIds: config.barrieredFromUsergroupIds.split(","),
  });
  console.log(JSON.stringify(result, null, 2));
  break;
}
```

### Step 2.4: 検証 + コミット

- [ ] `bun run lint` グリーン
- [ ] `bun test tests/commands/barriers/` PASS
- [ ] `git add src/commands/barriers tests/commands/barriers src/index.ts && git commit -m "feat: add barriers admin commands"`

---

## Task 3: emoji グループ

**Files:**
- Create: `src/commands/emoji/{add,add-alias,list,remove,rename}.ts`
- Create: `tests/commands/emoji/{add,add-alias,list,remove,rename}.test.ts`
- Modify: `src/index.ts`

### Step 3.1: 実装

- [ ] `src/commands/emoji/add.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface EmojiAddOptions { name: string; url: string }

export async function executeEmojiAdd(
  client: WebClient,
  opts: EmojiAddOptions,
): Promise<void> {
  await client.admin.emoji.add({ name: opts.name, url: opts.url });
}
```

- [ ] `src/commands/emoji/add-alias.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface EmojiAddAliasOptions { name: string; aliasFor: string }

export async function executeEmojiAddAlias(
  client: WebClient,
  opts: EmojiAddAliasOptions,
): Promise<void> {
  await client.admin.emoji.addAlias({ name: opts.name, alias_for: opts.aliasFor });
}
```

- [ ] `src/commands/emoji/list.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface EmojiListOptions { cursor?: string; limit?: number }

export async function executeEmojiList(
  client: WebClient,
  opts: EmojiListOptions,
) {
  const response = await client.admin.emoji.list({
    cursor: opts.cursor,
    limit: opts.limit,
  });
  const emoji = (response as { emoji?: Record<string, string> }).emoji ?? {};
  return Object.entries(emoji).map(([name, url]) => ({ name, url }));
}
```

- [ ] `src/commands/emoji/remove.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface EmojiRemoveOptions { name: string }

export async function executeEmojiRemove(
  client: WebClient,
  opts: EmojiRemoveOptions,
): Promise<void> {
  await client.admin.emoji.remove({ name: opts.name });
}
```

- [ ] `src/commands/emoji/rename.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface EmojiRenameOptions { name: string; newName: string }

export async function executeEmojiRename(
  client: WebClient,
  opts: EmojiRenameOptions,
): Promise<void> {
  await client.admin.emoji.rename({ name: opts.name, new_name: opts.newName });
}
```

### Step 3.2: テスト（5 ファイル、同パターン）

- [ ] 各テストは Task 2 と同じく `mock()` で `client = { admin: { emoji: { <method>: mockFn } } } as any` を作り、引数を `toHaveBeenCalledWith` で検証。代表例：

```typescript
// tests/commands/emoji/list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeEmojiList } from "../../../src/commands/emoji/list";

describe("emoji list", () => {
  test("converts emoji map into rows", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, emoji: { tada: "https://x", smile: "https://y" } }),
    );
    const client = { admin: { emoji: { list: mockList } } } as any;
    const result = await executeEmojiList(client, {});
    expect(mockList).toHaveBeenCalledWith({ cursor: undefined, limit: undefined });
    expect(result).toEqual([
      { name: "tada", url: "https://x" },
      { name: "smile", url: "https://y" },
    ]);
  });
});
```

他 4 ファイル（`add`, `add-alias`, `remove`, `rename`）は引数検証のみ。例：

```typescript
// tests/commands/emoji/add-alias.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeEmojiAddAlias } from "../../../src/commands/emoji/add-alias";

describe("emoji add-alias", () => {
  test("calls admin.emoji.addAlias", async () => {
    const mockAddAlias = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { emoji: { addAlias: mockAddAlias } } } as any;
    await executeEmojiAddAlias(client, { name: "party_tada", aliasFor: "tada" });
    expect(mockAddAlias).toHaveBeenCalledWith({ name: "party_tada", alias_for: "tada" });
  });
});
```

### Step 3.3: index.ts

- [ ] import 5 件、パーサー定義、switch ケース 5 件追加：

```typescript
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
```

switch ケース：

```typescript
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
```

- [ ] `rootParser` に `emojiCommands` を加える。

### Step 3.4: 検証 + コミット

- [ ] `bun run lint` && `bun test tests/commands/emoji/`
- [ ] `git add src/commands/emoji tests/commands/emoji src/index.ts && git commit -m "feat: add emoji admin commands"`

---

## Task 4: roles グループ

**Files:**
- Create: `src/commands/roles/{add-assignments,list-assignments,remove-assignments}.ts`
- Create: `tests/commands/roles/{add-assignments,list-assignments,remove-assignments}.test.ts`
- Modify: `src/index.ts`

### Step 4.1: 実装

- [ ] `src/commands/roles/add-assignments.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface RolesAddAssignmentsOptions {
  roleId: string;
  entityIds: [string, ...string[]];
  userIds: [string, ...string[]];
}

export async function executeRolesAddAssignments(
  client: WebClient,
  opts: RolesAddAssignmentsOptions,
): Promise<void> {
  await client.admin.roles.addAssignments({
    role_id: opts.roleId,
    entity_ids: opts.entityIds,
    user_ids: opts.userIds,
  });
}
```

- [ ] `src/commands/roles/list-assignments.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface RolesListAssignmentsOptions {
  entityIds?: string[];
  roleIds?: string[];
  cursor?: string;
  limit?: number;
  sortDir?: "asc" | "desc";
}

export async function executeRolesListAssignments(
  client: WebClient,
  opts: RolesListAssignmentsOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.entityIds !== undefined) params.entity_ids = opts.entityIds;
  if (opts.roleIds !== undefined) params.role_ids = opts.roleIds;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  if (opts.sortDir !== undefined) params.sort_dir = opts.sortDir;
  const response = await client.apiCall("admin.roles.listAssignments", params);
  return (response as { role_assignments?: unknown[] }).role_assignments ?? [];
}
```

- [ ] `src/commands/roles/remove-assignments.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface RolesRemoveAssignmentsOptions {
  roleId: string;
  entityIds: [string, ...string[]];
  userIds: [string, ...string[]];
}

export async function executeRolesRemoveAssignments(
  client: WebClient,
  opts: RolesRemoveAssignmentsOptions,
): Promise<void> {
  await client.admin.roles.removeAssignments({
    role_id: opts.roleId,
    entity_ids: opts.entityIds,
    user_ids: opts.userIds,
  });
}
```

### Step 4.2: テスト 3 ファイル

```typescript
// tests/commands/roles/add-assignments.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeRolesAddAssignments } from "../../../src/commands/roles/add-assignments";

describe("roles add-assignments", () => {
  test("calls admin.roles.addAssignments", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { roles: { addAssignments: mockFn } } } as any;
    await executeRolesAddAssignments(client, {
      roleId: "Rl0123",
      entityIds: ["T001"],
      userIds: ["U001", "U002"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      role_id: "Rl0123",
      entity_ids: ["T001"],
      user_ids: ["U001", "U002"],
    });
  });
});
```

```typescript
// tests/commands/roles/list-assignments.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeRolesListAssignments } from "../../../src/commands/roles/list-assignments";

describe("roles list-assignments", () => {
  test("returns role_assignments", async () => {
    const mockApiCall = mock(() =>
      Promise.resolve({ ok: true, role_assignments: [{ role_id: "Rl0", user_id: "U1" }] }),
    );
    const client = { apiCall: mockApiCall } as any;
    const result = await executeRolesListAssignments(client, {
      roleIds: ["Rl0"],
      cursor: "c",
      limit: 5,
      sortDir: "asc",
    });
    expect(mockApiCall).toHaveBeenCalledWith("admin.roles.listAssignments", {
      role_ids: ["Rl0"],
      cursor: "c",
      limit: 5,
      sort_dir: "asc",
    });
    expect(result).toEqual([{ role_id: "Rl0", user_id: "U1" }]);
  });
});
```

```typescript
// tests/commands/roles/remove-assignments.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeRolesRemoveAssignments } from "../../../src/commands/roles/remove-assignments";

describe("roles remove-assignments", () => {
  test("calls admin.roles.removeAssignments", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { roles: { removeAssignments: mockFn } } } as any;
    await executeRolesRemoveAssignments(client, {
      roleId: "Rl0",
      entityIds: ["T001"],
      userIds: ["U001"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      role_id: "Rl0",
      entity_ids: ["T001"],
      user_ids: ["U001"],
    });
  });
});
```

### Step 4.3: index.ts

- [ ] パーサー：

```typescript
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
```

- [ ] switch ケース：

```typescript
case "roles-add-assignments": {
  const client = await createSlackClient(store, profileFlag);
  const entityParts = config.entityIds.split(",");
  const userParts = config.userIds.split(",");
  const eFirst = entityParts[0]; const uFirst = userParts[0];
  if (eFirst === undefined) throw new Error("--entity-ids must not be empty");
  if (uFirst === undefined) throw new Error("--user-ids must not be empty");
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
  const rows = (assignments as Array<{ role_id?: string; entity_id?: string; user_id?: string }>).map((a) => ({
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
  const eFirst = entityParts[0]; const uFirst = userParts[0];
  if (eFirst === undefined) throw new Error("--entity-ids must not be empty");
  if (uFirst === undefined) throw new Error("--user-ids must not be empty");
  await executeRolesRemoveAssignments(client, {
    roleId: config.roleId,
    entityIds: [eFirst, ...entityParts.slice(1)],
    userIds: [uFirst, ...userParts.slice(1)],
  });
  console.log(`Role '${config.roleId}' removed.`);
  break;
}
```

- [ ] `rootParser` に追加。

### Step 4.4: 検証 + コミット

- [ ] `bun run lint` && `bun test tests/commands/roles/`
- [ ] `git commit -m "feat: add roles admin commands"`

---

## Task 5: usergroups グループ

**Files:**
- Create: `src/commands/usergroups/{add-channels,add-teams,list-channels,remove-channels}.ts`
- Create: `tests/commands/usergroups/{add-channels,add-teams,list-channels,remove-channels}.test.ts`
- Modify: `src/index.ts`

### Step 5.1: 実装

- [ ] `src/commands/usergroups/add-channels.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsAddChannelsOptions {
  usergroupId: string;
  channelIds: string[];
  teamId?: string;
}

export async function executeUsergroupsAddChannels(
  client: WebClient,
  opts: UsergroupsAddChannelsOptions,
): Promise<void> {
  await client.admin.usergroups.addChannels({
    usergroup_id: opts.usergroupId,
    channel_ids: opts.channelIds,
    team_id: opts.teamId,
  });
}
```

- [ ] `src/commands/usergroups/add-teams.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsAddTeamsOptions {
  usergroupId: string;
  teamIds: string[];
  autoProvision?: boolean;
}

export async function executeUsergroupsAddTeams(
  client: WebClient,
  opts: UsergroupsAddTeamsOptions,
): Promise<void> {
  await client.admin.usergroups.addTeams({
    usergroup_id: opts.usergroupId,
    team_ids: opts.teamIds,
    auto_provision: opts.autoProvision,
  });
}
```

- [ ] `src/commands/usergroups/list-channels.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsListChannelsOptions {
  usergroupId: string;
  teamId?: string;
  includeNumMembers?: boolean;
}

export async function executeUsergroupsListChannels(
  client: WebClient,
  opts: UsergroupsListChannelsOptions,
) {
  const response = await client.admin.usergroups.listChannels({
    usergroup_id: opts.usergroupId,
    team_id: opts.teamId,
    include_num_members: opts.includeNumMembers,
  });
  return response.channels ?? [];
}
```

- [ ] `src/commands/usergroups/remove-channels.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsRemoveChannelsOptions {
  usergroupId: string;
  channelIds: string[];
}

export async function executeUsergroupsRemoveChannels(
  client: WebClient,
  opts: UsergroupsRemoveChannelsOptions,
): Promise<void> {
  await client.admin.usergroups.removeChannels({
    usergroup_id: opts.usergroupId,
    channel_ids: opts.channelIds,
  });
}
```

### Step 5.2: テスト 4 ファイル（同パターン、`mock` + `toHaveBeenCalledWith`）

代表例:
```typescript
// tests/commands/usergroups/list-channels.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsListChannels } from "../../../src/commands/usergroups/list-channels";

describe("usergroups list-channels", () => {
  test("returns channels array", async () => {
    const mockFn = mock(() =>
      Promise.resolve({ ok: true, channels: [{ id: "C001" }] }),
    );
    const client = { admin: { usergroups: { listChannels: mockFn } } } as any;
    const result = await executeUsergroupsListChannels(client, {
      usergroupId: "S001",
      teamId: "T001",
      includeNumMembers: true,
    });
    expect(mockFn).toHaveBeenCalledWith({
      usergroup_id: "S001",
      team_id: "T001",
      include_num_members: true,
    });
    expect(result).toEqual([{ id: "C001" }]);
  });
});
```

他 3 ファイルも同形式（add-channels / add-teams / remove-channels）。

### Step 5.3: index.ts

- [ ] パーサー：

```typescript
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
```

- [ ] switch ケース：

```typescript
case "usergroups-add-channels": {
  const client = await createSlackClient(store, profileFlag);
  await executeUsergroupsAddChannels(client, {
    usergroupId: config.usergroupId,
    channelIds: config.channelIds.split(","),
    teamId: config.teamId,
  });
  console.log(`Channels added to usergroup '${config.usergroupId}'.`);
  break;
}
case "usergroups-add-teams": {
  const client = await createSlackClient(store, profileFlag);
  await executeUsergroupsAddTeams(client, {
    usergroupId: config.usergroupId,
    teamIds: config.teamIds.split(","),
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
  const rows = (channels as Array<{ id?: string; name?: string; num_members?: number }>).map((c) => ({
    id: c.id ?? "",
    name: c.name ?? "",
    num_members: c.num_members ?? "",
  }));
  console.log(formatOutput(rows, ["id", "name", "num_members"], outputFormat));
  break;
}
case "usergroups-remove-channels": {
  const client = await createSlackClient(store, profileFlag);
  await executeUsergroupsRemoveChannels(client, {
    usergroupId: config.usergroupId,
    channelIds: config.channelIds.split(","),
  });
  console.log(`Channels removed from usergroup '${config.usergroupId}'.`);
  break;
}
```

- [ ] `rootParser` 追加。

### Step 5.4: 検証 + コミット

- [ ] `bun run lint` && `bun test tests/commands/usergroups/`
- [ ] `git commit -m "feat: add usergroups admin commands"`

---

## Task 6: teams settings set-default-channels

**Files:**
- Create: `src/commands/teams/settings/set-default-channels.ts`
- Create: `tests/commands/teams/settings/set-default-channels.test.ts`
- Modify: `src/index.ts`（teamsSettingsCommands に追加 + switch）

### Step 6.1: 実装

- [ ] `src/commands/teams/settings/set-default-channels.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SetDefaultChannelsOptions {
  teamId: string;
  channelIds: string[];
}

export async function executeSetDefaultChannels(
  client: WebClient,
  opts: SetDefaultChannelsOptions,
): Promise<void> {
  await client.admin.teams.settings.setDefaultChannels({
    team_id: opts.teamId,
    channel_ids: opts.channelIds,
  });
}
```

### Step 6.2: テスト

- [ ] `tests/commands/teams/settings/set-default-channels.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeSetDefaultChannels } from "../../../../src/commands/teams/settings/set-default-channels";

describe("teams settings set-default-channels", () => {
  test("calls admin.teams.settings.setDefaultChannels", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { teams: { settings: { setDefaultChannels: mockFn } } } } as any;
    await executeSetDefaultChannels(client, {
      teamId: "T001",
      channelIds: ["C001", "C002"],
    });
    expect(mockFn).toHaveBeenCalledWith({
      team_id: "T001",
      channel_ids: ["C001", "C002"],
    });
  });
});
```

### Step 6.3: index.ts

- [ ] import 追加：

```typescript
import { executeSetDefaultChannels } from "./commands/teams/settings/set-default-channels";
```

- [ ] `teamsSettingsCommands` の `or(...)` 内に追加：

```typescript
command("set-default-channels", object({
  cmd: constant("teams-settings-set-default-channels" as const),
  teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
  channelIds: option("--channel-ids", string({ metavar: "CHANNEL_IDS" })),
})),
```

- [ ] switch ケース：

```typescript
case "teams-settings-set-default-channels": {
  const client = await createSlackClient(store, profileFlag);
  await executeSetDefaultChannels(client, {
    teamId: config.teamId,
    channelIds: config.channelIds.split(","),
  });
  console.log("Team default channels updated.");
  break;
}
```

### Step 6.4: 検証 + コミット

- [ ] `bun run lint` && `bun test tests/commands/teams/settings/set-default-channels.test.ts`
- [ ] `git commit -m "feat: add teams settings set-default-channels"`

---

## Task 7: users set-expiration + users unsupported-versions export

**Files:**
- Create: `src/commands/users/set-expiration.ts`
- Create: `src/commands/users/unsupported-versions/export.ts`
- Create: `tests/commands/users/set-expiration.test.ts`
- Create: `tests/commands/users/unsupported-versions/export.test.ts`
- Modify: `src/index.ts`

### Step 7.1: 実装

- [ ] `src/commands/users/set-expiration.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersSetExpirationOptions {
  userId: string;
  expirationTs: number;
  teamId?: string;
}

export async function executeUsersSetExpiration(
  client: WebClient,
  opts: UsersSetExpirationOptions,
): Promise<void> {
  await client.admin.users.setExpiration({
    user_id: opts.userId,
    expiration_ts: opts.expirationTs,
    team_id: opts.teamId,
  });
}
```

- [ ] `src/commands/users/unsupported-versions/export.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersUnsupportedVersionsExportOptions {
  dateEndOfSupport?: number;
  dateSessionsStarted?: number;
}

export async function executeUsersUnsupportedVersionsExport(
  client: WebClient,
  opts: UsersUnsupportedVersionsExportOptions,
): Promise<void> {
  await client.admin.users.unsupportedVersions.export({
    date_end_of_support: opts.dateEndOfSupport,
    date_sessions_started: opts.dateSessionsStarted,
  });
}
```

### Step 7.2: テスト

- [ ] `tests/commands/users/set-expiration.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetExpiration } from "../../../src/commands/users/set-expiration";

describe("users set-expiration", () => {
  test("calls admin.users.setExpiration", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setExpiration: mockFn } } } as any;
    await executeUsersSetExpiration(client, {
      userId: "U001",
      expirationTs: 1700000000,
      teamId: "T001",
    });
    expect(mockFn).toHaveBeenCalledWith({
      user_id: "U001",
      expiration_ts: 1700000000,
      team_id: "T001",
    });
  });
});
```

- [ ] `tests/commands/users/unsupported-versions/export.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersUnsupportedVersionsExport } from "../../../../src/commands/users/unsupported-versions/export";

describe("users unsupported-versions export", () => {
  test("calls admin.users.unsupportedVersions.export", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { users: { unsupportedVersions: { export: mockFn } } },
    } as any;
    await executeUsersUnsupportedVersionsExport(client, {
      dateEndOfSupport: 1700000000,
      dateSessionsStarted: 1690000000,
    });
    expect(mockFn).toHaveBeenCalledWith({
      date_end_of_support: 1700000000,
      date_sessions_started: 1690000000,
    });
  });
});
```

### Step 7.3: index.ts

- [ ] import 追加：

```typescript
import { executeUsersSetExpiration } from "./commands/users/set-expiration";
import { executeUsersUnsupportedVersionsExport } from "./commands/users/unsupported-versions/export";
```

- [ ] `usersCommands` の `or(...)` 内に追加：

```typescript
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
```

- [ ] switch ケース：

```typescript
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
```

### Step 7.4: 検証 + コミット

- [ ] `bun run lint` && `bun test tests/commands/users/set-expiration.test.ts tests/commands/users/unsupported-versions/`
- [ ] `git commit -m "feat: add users set-expiration and unsupported-versions export"`

---

## Task 8: users session.* (6 commands)

**Files:**
- Create: `src/commands/users/session/{clear-settings,get-settings,invalidate,list,reset-bulk,set-settings}.ts`
- Create: `tests/commands/users/session/{clear-settings,get-settings,invalidate,list,reset-bulk,set-settings}.test.ts`
- Modify: `src/index.ts`（既存 `users session` サブコマンド `reset` の隣に追加）

### Step 8.1: 実装

- [ ] `src/commands/users/session/clear-settings.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SessionClearSettingsOptions { userIds: [string, ...string[]] }

export async function executeUsersSessionClearSettings(
  client: WebClient,
  opts: SessionClearSettingsOptions,
): Promise<void> {
  await client.admin.users.session.clearSettings({ user_ids: opts.userIds });
}
```

- [ ] `src/commands/users/session/get-settings.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SessionGetSettingsOptions { userIds: [string, ...string[]] }

export async function executeUsersSessionGetSettings(
  client: WebClient,
  opts: SessionGetSettingsOptions,
) {
  const response = await client.admin.users.session.getSettings({ user_ids: opts.userIds });
  return response.session_settings ?? [];
}
```

- [ ] `src/commands/users/session/invalidate.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SessionInvalidateOptions {
  teamId: string;
  sessionId: string;
}

export async function executeUsersSessionInvalidate(
  client: WebClient,
  opts: SessionInvalidateOptions,
): Promise<void> {
  await client.admin.users.session.invalidate({
    team_id: opts.teamId,
    session_id: opts.sessionId,
  });
}
```

- [ ] `src/commands/users/session/list.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SessionListOptions {
  teamId?: string;
  userId?: string;
  cursor?: string;
  limit?: number;
}

export async function executeUsersSessionList(
  client: WebClient,
  opts: SessionListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined && opts.userId !== undefined) {
    params.team_id = opts.teamId;
    params.user_id = opts.userId;
  } else if (opts.teamId !== undefined || opts.userId !== undefined) {
    throw new Error("--team-id and --user-id must be provided together (or neither)");
  }
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.apiCall("admin.users.session.list", params);
  return (response as { active_sessions?: unknown[] }).active_sessions ?? [];
}
```

- [ ] `src/commands/users/session/reset-bulk.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SessionResetBulkOptions {
  userIds: [string, ...string[]];
  mobileOnly?: boolean;
  webOnly?: boolean;
}

export async function executeUsersSessionResetBulk(
  client: WebClient,
  opts: SessionResetBulkOptions,
): Promise<void> {
  await client.admin.users.session.resetBulk({
    user_ids: opts.userIds,
    mobile_only: opts.mobileOnly,
    web_only: opts.webOnly,
  });
}
```

- [ ] `src/commands/users/session/set-settings.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface SessionSetSettingsOptions {
  userIds: [string, ...string[]];
  desktopAppBrowserQuit?: boolean;
  duration?: number;
}

export async function executeUsersSessionSetSettings(
  client: WebClient,
  opts: SessionSetSettingsOptions,
): Promise<void> {
  await client.admin.users.session.setSettings({
    user_ids: opts.userIds,
    desktop_app_browser_quit: opts.desktopAppBrowserQuit,
    duration: opts.duration,
  });
}
```

### Step 8.2: テスト 6 ファイル

代表例：

```typescript
// tests/commands/users/session/list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionList } from "../../../../src/commands/users/session/list";

describe("users session list", () => {
  test("returns active_sessions array with team+user", async () => {
    const mockApiCall = mock(() =>
      Promise.resolve({ ok: true, active_sessions: [{ session_id: "S1" }] }),
    );
    const client = { apiCall: mockApiCall } as any;
    const result = await executeUsersSessionList(client, {
      teamId: "T001",
      userId: "U001",
      cursor: "c",
      limit: 5,
    });
    expect(mockApiCall).toHaveBeenCalledWith("admin.users.session.list", {
      team_id: "T001",
      user_id: "U001",
      cursor: "c",
      limit: 5,
    });
    expect(result).toEqual([{ session_id: "S1" }]);
  });

  test("works with neither team nor user", async () => {
    const mockApiCall = mock(() => Promise.resolve({ ok: true, active_sessions: [] }));
    const client = { apiCall: mockApiCall } as any;
    await executeUsersSessionList(client, {});
    expect(mockApiCall).toHaveBeenCalledWith("admin.users.session.list", {});
  });

  test("rejects partial team/user", async () => {
    const client = { apiCall: mock(() => Promise.resolve({ ok: true })) } as any;
    await expect(executeUsersSessionList(client, { teamId: "T001" })).rejects.toThrow();
  });
});
```

他 5 ファイルは引数検証のみ（同パターン）。例：

```typescript
// tests/commands/users/session/clear-settings.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSessionClearSettings } from "../../../../src/commands/users/session/clear-settings";

describe("users session clear-settings", () => {
  test("calls admin.users.session.clearSettings", async () => {
    const mockFn = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { session: { clearSettings: mockFn } } } } as any;
    await executeUsersSessionClearSettings(client, { userIds: ["U001", "U002"] });
    expect(mockFn).toHaveBeenCalledWith({ user_ids: ["U001", "U002"] });
  });
});
```

### Step 8.3: index.ts

- [ ] import 追加（6 件）：

```typescript
import { executeUsersSessionClearSettings } from "./commands/users/session/clear-settings";
import { executeUsersSessionGetSettings } from "./commands/users/session/get-settings";
import { executeUsersSessionInvalidate } from "./commands/users/session/invalidate";
import { executeUsersSessionList } from "./commands/users/session/list";
import { executeUsersSessionResetBulk } from "./commands/users/session/reset-bulk";
import { executeUsersSessionSetSettings } from "./commands/users/session/set-settings";
```

- [ ] 既存の `usersCommands` 内、`command("session", command("reset", ...))` を `or` 化して 7 サブコマンドにする。**注意**：現状 `command("session", command("reset", ...))` の形なので、これを `command("session", or(command("reset", ...), ...))` へ変更する。

```typescript
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
```

- [ ] switch ケース 6 件：

```typescript
case "users-session-clear-settings": {
  const client = await createSlackClient(store, profileFlag);
  const parts = config.userIds.split(",");
  const first = parts[0]; if (first === undefined) throw new Error("--user-ids must not be empty");
  await executeUsersSessionClearSettings(client, { userIds: [first, ...parts.slice(1)] });
  console.log("Session settings cleared.");
  break;
}
case "users-session-get-settings": {
  const client = await createSlackClient(store, profileFlag);
  const parts = config.userIds.split(",");
  const first = parts[0]; if (first === undefined) throw new Error("--user-ids must not be empty");
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
  const rows = (sessions as Array<{ session_id?: string; user_id?: string; team_id?: string }>).map((s) => ({
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
  const first = parts[0]; if (first === undefined) throw new Error("--user-ids must not be empty");
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
  const first = parts[0]; if (first === undefined) throw new Error("--user-ids must not be empty");
  await executeUsersSessionSetSettings(client, {
    userIds: [first, ...parts.slice(1)],
    desktopAppBrowserQuit: config.desktopAppBrowserQuit,
    duration: config.duration,
  });
  console.log("Session settings updated.");
  break;
}
```

### Step 8.4: 検証 + コミット

- [ ] `bun run lint` && `bun test tests/commands/users/session/`
- [ ] `git commit -m "feat: add users session admin commands"`

---

## Task 9: README 更新

**Files:**
- Modify: `README.md`

### Step 9.1: 既存のコマンド一覧表を確認し、追加

- [ ] `README.md` の Commands セクションを `Read` で確認。
- [ ] 各既存グループ表に新コマンド行を追加：
  - `auth-policy assign-entities | get-entities | remove-entities`
  - `barriers create | delete | list | update`
  - `emoji add | add-alias | list | remove | rename`
  - `roles add-assignments | list-assignments | remove-assignments`
  - `usergroups add-channels | add-teams | list-channels | remove-channels`
  - `teams settings set-default-channels`
  - `users set-expiration`
  - `users unsupported-versions export`
  - `users session clear-settings | get-settings | invalidate | list | reset-bulk | set-settings`
- [ ] コマンド総数の記述（"79 commands" 等）を **107 commands**（79 + 28）に更新。
- [ ] `git commit -m "docs: update README with new admin commands"`

---

## Task 10: SKILL.md 更新

**Files:**
- Modify: `skills/slack-admin-cli-skill/SKILL.md`

### Step 10.1: 新グループ・新サブコマンドを追記

- [ ] `Read` で既存スタイルを確認。
- [ ] 新コマンド一覧を該当セクション（コマンドリファレンス、使用例）に追加。
- [ ] `git commit -m "docs: update skill with new admin commands"`

---

## Task 11: 統合検証

- [ ] `bun run lint` 全体グリーン
- [ ] `bun test` 全体グリーン
- [ ] `bun run dev -- --help` で全 28 サブコマンドがヘルプに表示されることを目視確認
- [ ] `bun run dev -- auth-policy --help` 等、新グループの help 出力を 1 つずつ確認

---

## Task 12: PR 作成

- [ ] `git push -u origin feat/admin-api-coverage`
- [ ] `gh pr create` で PR 作成：

```bash
gh pr create --title "feat: cover remaining SDK-supported admin.* methods" --body "$(cat <<'EOF'
## Summary
- SDK 対応済みかつ未実装の admin.* メソッド 28 個を追加
- 新グループ: auth-policy / barriers / emoji / roles / usergroups
- 既存グループ拡張: teams settings set-default-channels, users set-expiration / unsupported-versions export / session.*
- README と Skill ドキュメントを更新

仕様書: `docs/superpowers/specs/2026-04-17-admin-api-coverage-design.md`
実装計画: `docs/superpowers/plans/2026-04-17-admin-api-coverage.md`

## Test plan
- [x] `bun run lint` グリーン
- [x] `bun test` 全 PASS
- [x] `bun run dev -- --help` で全新コマンド表示確認
- [ ] 実 Slack ワークスペースでスモークテスト（reviewer 任意）

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] PR URL を出力。

---

## スコープ外（実装しない）

SDK 非対応のため対応しない：

- `admin.analytics.*`、`admin.audit.anomaly.allow.*`
- `admin.conversations.{bulkSetExcludeFromSlackAi, createForObjects, linkObjects, unlinkObjects}`
- `admin.users.getExpiration`
- `admin.workflows.triggers.types.permissions.*`
