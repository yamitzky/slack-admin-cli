# Non-admin Management APIs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 非 admin 系の管理 API を 23 コマンド分 `sladm` に追加し、README/Skill ドキュメントと PR を整える。

**Architecture:** 既存の `src/commands/<group>/[<sub>/]<action>.ts` 構造に従い、各コマンドは `execute*(client, opts)` を export。CLI ルーティングは `src/index.ts` の `@optique/core` パーサー定義と末尾の switch 文に追記。テストは `tests/commands/<同パス>` にユニットテスト併設。

**Tech Stack:** Bun, TypeScript, `@slack/web-api`, `@optique/core`, `bun:test`

**仕様書:** `docs/superpowers/specs/2026-04-18-non-admin-management-apis-design.md`

---

## グローバル規約

- `Options` インターフェースは camelCase。
- API 呼び出しは型付きメソッド（例: `client.users.info(...)`）を優先。SDK 型ユニオンで TS エラーになる場合のみ `client.apiCall("users.x.y", params)` にフォールバック。
- `as` キャスト禁止（`as any` はテストの mock client のみ可、既存パターン踏襲）。
- 任意パラメータは undefined 時に渡さない（`Record<string, unknown>` を構築 → 条件追加）。
- list 系（データ返却）は `Promise<T[]>` を返し、`index.ts` 側で `formatOutput()` 整形。単発オブジェクト返却（info, getPresence 等）は `Promise<T>` を返し、`console.log(JSON.stringify(result, null, 2))` で出力（既存 `teams/settings/info` と同パターン）。
- 各タスク完了時に `bun run lint` と `bun test tests/commands/<group>` を実行し、グリーンになってからコミット。
- コミットメッセージは既存スタイル踏襲（`feat: add <group> <command> command`）。

---

## Task 1: users グループ拡張（非 admin）

**Files:**
- Create: `src/commands/users/info.ts`
- Create: `src/commands/users/lookup-by-email.ts`
- Create: `src/commands/users/get-presence.ts`
- Create: `src/commands/users/set-presence.ts`
- Create: `src/commands/users/conversations.ts`
- Create: `src/commands/users/identity.ts`
- Create: `src/commands/users/profile/get.ts`
- Create: `src/commands/users/profile/set.ts`
- Create: 対応するテストファイル（8 本）を `tests/commands/users/` および `tests/commands/users/profile/` に
- Modify: `src/index.ts`（import 8 行 + パーサー定義追加 + switch ケース 8 件）

### Step 1.1: users.info

- [ ] `tests/commands/users/info.test.ts` を作成

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersInfo } from "../../../src/commands/users/info";

describe("users info", () => {
  test("returns user object", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, user: { id: "U001", name: "alice" } }));
    const client = { users: { info: mockInfo } } as any;
    const result = await executeUsersInfo(client, { user: "U001" });
    expect(result?.id).toBe("U001");
    expect(mockInfo).toHaveBeenCalledWith({ user: "U001" });
  });

  test("passes include_locale", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, user: { id: "U001" } }));
    const client = { users: { info: mockInfo } } as any;
    await executeUsersInfo(client, { user: "U001", includeLocale: true });
    expect(mockInfo).toHaveBeenCalledWith({ user: "U001", include_locale: true });
  });
});
```

- [ ] `src/commands/users/info.ts` を作成

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersInfoOptions {
  user: string;
  includeLocale?: boolean;
}

export async function executeUsersInfo(client: WebClient, opts: UsersInfoOptions) {
  const params: { user: string; include_locale?: boolean } = { user: opts.user };
  if (opts.includeLocale !== undefined) params.include_locale = opts.includeLocale;
  const response = await client.users.info(params);
  return response.user;
}
```

- [ ] `bun test tests/commands/users/info.test.ts` → PASS 確認

### Step 1.2: users.lookupByEmail

- [ ] `tests/commands/users/lookup-by-email.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersLookupByEmail } from "../../../src/commands/users/lookup-by-email";

describe("users lookup-by-email", () => {
  test("returns user for given email", async () => {
    const mockLookup = mock(() => Promise.resolve({ ok: true, user: { id: "U001", profile: { email: "a@ex.com" } } }));
    const client = { users: { lookupByEmail: mockLookup } } as any;
    const result = await executeUsersLookupByEmail(client, { email: "a@ex.com" });
    expect(result?.id).toBe("U001");
    expect(mockLookup).toHaveBeenCalledWith({ email: "a@ex.com" });
  });
});
```

- [ ] `src/commands/users/lookup-by-email.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersLookupByEmailOptions {
  email: string;
}

export async function executeUsersLookupByEmail(client: WebClient, opts: UsersLookupByEmailOptions) {
  const response = await client.users.lookupByEmail({ email: opts.email });
  return response.user;
}
```

- [ ] `bun test tests/commands/users/lookup-by-email.test.ts` → PASS

### Step 1.3: users.getPresence

- [ ] `tests/commands/users/get-presence.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersGetPresence } from "../../../src/commands/users/get-presence";

describe("users get-presence", () => {
  test("returns presence info", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true, presence: "active", online: true }));
    const client = { users: { getPresence: mockGet } } as any;
    const result = await executeUsersGetPresence(client, { user: "U001" });
    expect(result.presence).toBe("active");
    expect(mockGet).toHaveBeenCalledWith({ user: "U001" });
  });
});
```

- [ ] `src/commands/users/get-presence.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersGetPresenceOptions {
  user: string;
}

export async function executeUsersGetPresence(client: WebClient, opts: UsersGetPresenceOptions) {
  const response = await client.users.getPresence({ user: opts.user });
  return response;
}
```

- [ ] `bun test tests/commands/users/get-presence.test.ts` → PASS

### Step 1.4: users.setPresence

- [ ] `tests/commands/users/set-presence.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetPresence } from "../../../src/commands/users/set-presence";

describe("users set-presence", () => {
  test("calls setPresence with auto|away", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { users: { setPresence: mockSet } } as any;
    await executeUsersSetPresence(client, { presence: "away" });
    expect(mockSet).toHaveBeenCalledWith({ presence: "away" });
  });
});
```

- [ ] `src/commands/users/set-presence.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersSetPresenceOptions {
  presence: "auto" | "away";
}

export async function executeUsersSetPresence(client: WebClient, opts: UsersSetPresenceOptions) {
  await client.users.setPresence({ presence: opts.presence });
}
```

- [ ] `bun test tests/commands/users/set-presence.test.ts` → PASS

### Step 1.5: users.conversations

- [ ] `tests/commands/users/conversations.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersConversations } from "../../../src/commands/users/conversations";

describe("users conversations", () => {
  test("returns channels array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, channels: [{ id: "C001" }] }));
    const client = { users: { conversations: mockCall } } as any;
    const result = await executeUsersConversations(client, { user: "U001" });
    expect(result).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({ user: "U001" });
  });

  test("passes optional filters", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, channels: [] }));
    const client = { users: { conversations: mockCall } } as any;
    await executeUsersConversations(client, {
      user: "U001", cursor: "c1", limit: 50, types: "public_channel,private_channel", excludeArchived: true,
    });
    expect(mockCall).toHaveBeenCalledWith({
      user: "U001", cursor: "c1", limit: 50, types: "public_channel,private_channel", exclude_archived: true,
    });
  });
});
```

- [ ] `src/commands/users/conversations.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersConversationsOptions {
  user?: string;
  cursor?: string;
  limit?: number;
  types?: string;
  excludeArchived?: boolean;
}

export async function executeUsersConversations(client: WebClient, opts: UsersConversationsOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  if (opts.types !== undefined) params.types = opts.types;
  if (opts.excludeArchived !== undefined) params.exclude_archived = opts.excludeArchived;
  const response = await client.users.conversations(params);
  return response.channels ?? [];
}
```

- [ ] `bun test tests/commands/users/conversations.test.ts` → PASS

### Step 1.6: users.identity

- [ ] `tests/commands/users/identity.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersIdentity } from "../../../src/commands/users/identity";

describe("users identity", () => {
  test("returns identity response", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, user: { id: "U001" }, team: { id: "T001" } }));
    const client = { users: { identity: mockCall } } as any;
    const result = await executeUsersIdentity(client, {});
    expect(result.user?.id).toBe("U001");
    expect(mockCall).toHaveBeenCalledWith({});
  });
});
```

- [ ] `src/commands/users/identity.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersIdentityOptions {}

export async function executeUsersIdentity(client: WebClient, _opts: UsersIdentityOptions) {
  const response = await client.users.identity({});
  return response;
}
```

- [ ] `bun test tests/commands/users/identity.test.ts` → PASS

### Step 1.7: users.profile.get

- [ ] `tests/commands/users/profile/get.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersProfileGet } from "../../../../src/commands/users/profile/get";

describe("users profile get", () => {
  test("returns profile", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true, profile: { real_name: "Alice" } }));
    const client = { users: { profile: { get: mockGet } } } as any;
    const result = await executeUsersProfileGet(client, { user: "U001" });
    expect(result?.real_name).toBe("Alice");
    expect(mockGet).toHaveBeenCalledWith({ user: "U001" });
  });

  test("passes include_labels", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { users: { profile: { get: mockGet } } } as any;
    await executeUsersProfileGet(client, { includeLabels: true });
    expect(mockGet).toHaveBeenCalledWith({ include_labels: true });
  });
});
```

- [ ] `src/commands/users/profile/get.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersProfileGetOptions {
  user?: string;
  includeLabels?: boolean;
}

export async function executeUsersProfileGet(client: WebClient, opts: UsersProfileGetOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.includeLabels !== undefined) params.include_labels = opts.includeLabels;
  const response = await client.users.profile.get(params);
  return response.profile;
}
```

- [ ] `bun test tests/commands/users/profile/get.test.ts` → PASS

### Step 1.8: users.profile.set

`name`+`value` で単一フィールド更新か、`profile` で一括 JSON 更新の 2 形式。CLI は `--name/--value` か `--profile '<json>'` のどちらかを受ける。

- [ ] `tests/commands/users/profile/set.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsersProfileSet } from "../../../../src/commands/users/profile/set";

describe("users profile set", () => {
  test("sets single field by name/value", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { users: { profile: { set: mockSet } } } as any;
    await executeUsersProfileSet(client, { user: "U001", name: "title", value: "Engineer" });
    expect(mockSet).toHaveBeenCalledWith({ user: "U001", name: "title", value: "Engineer" });
  });

  test("sets multiple fields via profile JSON", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { users: { profile: { set: mockSet } } } as any;
    await executeUsersProfileSet(client, { user: "U001", profile: { real_name: "Alice" } });
    expect(mockSet).toHaveBeenCalledWith({ user: "U001", profile: { real_name: "Alice" } });
  });
});
```

- [ ] `src/commands/users/profile/set.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsersProfileSetOptions {
  user?: string;
  name?: string;
  value?: string;
  profile?: Record<string, unknown>;
}

export async function executeUsersProfileSet(client: WebClient, opts: UsersProfileSetOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.name !== undefined) params.name = opts.name;
  if (opts.value !== undefined) params.value = opts.value;
  if (opts.profile !== undefined) params.profile = opts.profile;
  await client.users.profile.set(params);
}
```

- [ ] `bun test tests/commands/users/profile/set.test.ts` → PASS

### Step 1.9: `src/index.ts` 配線（users）

- [ ] import 追加（既存の users 系 import の下）

```typescript
import { executeUsersInfo } from "./commands/users/info";
import { executeUsersLookupByEmail } from "./commands/users/lookup-by-email";
import { executeUsersGetPresence } from "./commands/users/get-presence";
import { executeUsersSetPresence } from "./commands/users/set-presence";
import { executeUsersConversations } from "./commands/users/conversations";
import { executeUsersIdentity } from "./commands/users/identity";
import { executeUsersProfileGet } from "./commands/users/profile/get";
import { executeUsersProfileSet } from "./commands/users/profile/set";
```

- [ ] `usersCommands` の `or(...)` 末尾に以下 8 件を追加（`unsupported-versions` の直後）

```typescript
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
```

- [ ] `presenceValueParser` を既存 ValueParser 群（ファイル上部）に追加

```typescript
const presenceValueParser: ValueParser<"auto" | "away"> = {
  metavar: "PRESENCE",
  parse: (value: string): ValueParserResult<"auto" | "away"> => {
    if (value === "auto" || value === "away") return { success: true, value };
    return { success: false, error: ["Must be 'auto' or 'away'."] };
  },
  format: (value) => value,
};
```

- [ ] switch 文末尾に 8 ケース追加

```typescript
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
      profileJson = JSON.parse(config.profile) as Record<string, unknown>;
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
```

### Step 1.10: 検証とコミット

- [ ] `bun run lint` を実行し、エラーなし
- [ ] `bun test tests/commands/users` を実行し、全 PASS
- [ ] 実際にヘルプを確認: `bun run dev -- users --help`
- [ ] コミット

```bash
git add src/commands/users tests/commands/users src/index.ts
git commit -m "feat: add non-admin users commands (info, lookup-by-email, presence, conversations, identity, profile)"
```

---

## Task 2: conversations グループ拡張（非 admin）

**Files:**
- Create: `src/commands/conversations/list.ts`
- Create: `src/commands/conversations/info.ts`
- Create: `src/commands/conversations/members.ts`
- Create: 対応テスト 3 本
- Modify: `src/index.ts`（import 3 行 + パーサー定義 + switch ケース 3 件）

### Step 2.1: conversations.list

- [ ] `tests/commands/conversations/list.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsList } from "../../../src/commands/conversations/list";

describe("conversations list", () => {
  test("returns channels array", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [{ id: "C001", name: "general" }] }));
    const client = { conversations: { list: mockList } } as any;
    const result = await executeConversationsList(client, {});
    expect(result).toHaveLength(1);
    expect(mockList).toHaveBeenCalledWith({});
  });

  test("passes optional filters", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [] }));
    const client = { conversations: { list: mockList } } as any;
    await executeConversationsList(client, {
      cursor: "c1", limit: 100, types: "public_channel", excludeArchived: true, teamId: "T001",
    });
    expect(mockList).toHaveBeenCalledWith({
      cursor: "c1", limit: 100, types: "public_channel", exclude_archived: true, team_id: "T001",
    });
  });
});
```

- [ ] `src/commands/conversations/list.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface ConversationsListOptions {
  cursor?: string;
  limit?: number;
  types?: string;
  excludeArchived?: boolean;
  teamId?: string;
}

export async function executeConversationsList(client: WebClient, opts: ConversationsListOptions) {
  const params: Record<string, unknown> = {};
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  if (opts.types !== undefined) params.types = opts.types;
  if (opts.excludeArchived !== undefined) params.exclude_archived = opts.excludeArchived;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.conversations.list(params);
  return response.channels ?? [];
}
```

- [ ] `bun test tests/commands/conversations/list.test.ts` → PASS

### Step 2.2: conversations.info

- [ ] `tests/commands/conversations/info.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsInfo } from "../../../src/commands/conversations/info";

describe("conversations info", () => {
  test("returns channel object", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, channel: { id: "C001", name: "general" } }));
    const client = { conversations: { info: mockInfo } } as any;
    const result = await executeConversationsInfo(client, { channel: "C001" });
    expect(result?.id).toBe("C001");
    expect(mockInfo).toHaveBeenCalledWith({ channel: "C001" });
  });

  test("passes include flags", async () => {
    const mockInfo = mock(() => Promise.resolve({ ok: true, channel: {} }));
    const client = { conversations: { info: mockInfo } } as any;
    await executeConversationsInfo(client, { channel: "C001", includeLocale: true, includeNumMembers: true });
    expect(mockInfo).toHaveBeenCalledWith({ channel: "C001", include_locale: true, include_num_members: true });
  });
});
```

- [ ] `src/commands/conversations/info.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface ConversationsInfoOptions {
  channel: string;
  includeLocale?: boolean;
  includeNumMembers?: boolean;
}

export async function executeConversationsInfo(client: WebClient, opts: ConversationsInfoOptions) {
  const params: { channel: string; include_locale?: boolean; include_num_members?: boolean } = { channel: opts.channel };
  if (opts.includeLocale !== undefined) params.include_locale = opts.includeLocale;
  if (opts.includeNumMembers !== undefined) params.include_num_members = opts.includeNumMembers;
  const response = await client.conversations.info(params);
  return response.channel;
}
```

- [ ] `bun test tests/commands/conversations/info.test.ts` → PASS

### Step 2.3: conversations.members

- [ ] `tests/commands/conversations/members.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsMembers } from "../../../src/commands/conversations/members";

describe("conversations members", () => {
  test("returns members array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, members: ["U001", "U002"] }));
    const client = { conversations: { members: mockCall } } as any;
    const result = await executeConversationsMembers(client, { channel: "C001" });
    expect(result).toEqual(["U001", "U002"]);
    expect(mockCall).toHaveBeenCalledWith({ channel: "C001" });
  });

  test("passes cursor and limit", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, members: [] }));
    const client = { conversations: { members: mockCall } } as any;
    await executeConversationsMembers(client, { channel: "C001", cursor: "c1", limit: 50 });
    expect(mockCall).toHaveBeenCalledWith({ channel: "C001", cursor: "c1", limit: 50 });
  });
});
```

- [ ] `src/commands/conversations/members.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface ConversationsMembersOptions {
  channel: string;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsMembers(client: WebClient, opts: ConversationsMembersOptions) {
  const params: { channel: string; cursor?: string; limit?: number } = { channel: opts.channel };
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.conversations.members(params);
  return response.members ?? [];
}
```

- [ ] `bun test tests/commands/conversations/members.test.ts` → PASS

### Step 2.4: `src/index.ts` 配線（conversations）

- [ ] import 追加

```typescript
import { executeConversationsList } from "./commands/conversations/list";
import { executeConversationsInfo } from "./commands/conversations/info";
import { executeConversationsMembers } from "./commands/conversations/members";
```

- [ ] `conversationsCommands` の内側 `or(...)` 末尾に以下 3 件を追加

```typescript
    command("list", object({
      cmd: constant("conversations-list" as const),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
      types: optional(option("--types", string({ metavar: "TYPES" }))),
      excludeArchived: optional(option("--exclude-archived", boolValueParser)),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("info", object({
      cmd: constant("conversations-info" as const),
      channel: option("--channel", string({ metavar: "CHANNEL_ID" })),
      includeLocale: optional(option("--include-locale", boolValueParser)),
      includeNumMembers: optional(option("--include-num-members", boolValueParser)),
    })),
    command("members", object({
      cmd: constant("conversations-members" as const),
      channel: option("--channel", string({ metavar: "CHANNEL_ID" })),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
```

- [ ] switch 文に 3 ケース追加

```typescript
  case "conversations-list": {
    const client = await createSlackClient(store, profileFlag);
    const channels = await executeConversationsList(client, {
      cursor: config.cursor, limit: config.limit, types: config.types,
      excludeArchived: config.excludeArchived, teamId: config.teamId,
    });
    const rows = channels.map((c: { id?: string; name?: string; is_private?: boolean; is_archived?: boolean }) => ({
      id: c.id ?? "", name: c.name ?? "", is_private: c.is_private ?? false, is_archived: c.is_archived ?? false,
    }));
    console.log(formatOutput(rows, ["id", "name", "is_private", "is_archived"], outputFormat));
    break;
  }
  case "conversations-info": {
    const client = await createSlackClient(store, profileFlag);
    const channel = await executeConversationsInfo(client, {
      channel: config.channel,
      includeLocale: config.includeLocale,
      includeNumMembers: config.includeNumMembers,
    });
    console.log(JSON.stringify(channel, null, 2));
    break;
  }
  case "conversations-members": {
    const client = await createSlackClient(store, profileFlag);
    const members = await executeConversationsMembers(client, {
      channel: config.channel, cursor: config.cursor, limit: config.limit,
    });
    console.log(JSON.stringify(members, null, 2));
    break;
  }
```

### Step 2.5: 検証とコミット

- [ ] `bun run lint` → エラーなし
- [ ] `bun test tests/commands/conversations` → 全 PASS
- [ ] `bun run dev -- conversations --help`
- [ ] コミット

```bash
git add src/commands/conversations tests/commands/conversations src/index.ts
git commit -m "feat: add non-admin conversations commands (list, info, members)"
```

---

## Task 3: usergroups グループ拡張（非 admin）

**Files:**
- Create: `src/commands/usergroups/list.ts`
- Create: `src/commands/usergroups/create.ts`
- Create: `src/commands/usergroups/update.ts`
- Create: `src/commands/usergroups/enable.ts`
- Create: `src/commands/usergroups/disable.ts`
- Create: `src/commands/usergroups/users/list.ts`
- Create: `src/commands/usergroups/users/update.ts`
- Create: 対応テスト 7 本
- Modify: `src/index.ts`（import 7 行 + パーサー定義 + switch ケース 7 件）

### Step 3.1: usergroups.list

- [ ] `tests/commands/usergroups/list.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsList } from "../../../src/commands/usergroups/list";

describe("usergroups list", () => {
  test("returns usergroups array", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, usergroups: [{ id: "S001", name: "devs" }] }));
    const client = { usergroups: { list: mockList } } as any;
    const result = await executeUsergroupsList(client, {});
    expect(result).toHaveLength(1);
    expect(mockList).toHaveBeenCalledWith({});
  });

  test("passes optional filters", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, usergroups: [] }));
    const client = { usergroups: { list: mockList } } as any;
    await executeUsergroupsList(client, { includeCount: true, includeDisabled: true, includeUsers: true, teamId: "T001" });
    expect(mockList).toHaveBeenCalledWith({
      include_count: true, include_disabled: true, include_users: true, team_id: "T001",
    });
  });
});
```

- [ ] `src/commands/usergroups/list.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsListOptions {
  includeCount?: boolean;
  includeDisabled?: boolean;
  includeUsers?: boolean;
  teamId?: string;
}

export async function executeUsergroupsList(client: WebClient, opts: UsergroupsListOptions) {
  const params: Record<string, unknown> = {};
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.includeDisabled !== undefined) params.include_disabled = opts.includeDisabled;
  if (opts.includeUsers !== undefined) params.include_users = opts.includeUsers;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.list(params);
  return response.usergroups ?? [];
}
```

- [ ] `bun test tests/commands/usergroups/list.test.ts` → PASS

### Step 3.2: usergroups.create

- [ ] `tests/commands/usergroups/create.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsCreate } from "../../../src/commands/usergroups/create";

describe("usergroups create", () => {
  test("creates with all options", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { create: mockCreate } } as any;
    const result = await executeUsergroupsCreate(client, {
      name: "devs", handle: "devs", description: "devteam",
      channels: "C001,C002", includeCount: true, teamId: "T001",
    });
    expect(result?.id).toBe("S001");
    expect(mockCreate).toHaveBeenCalledWith({
      name: "devs", handle: "devs", description: "devteam",
      channels: "C001,C002", include_count: true, team_id: "T001",
    });
  });
});
```

- [ ] `src/commands/usergroups/create.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsCreateOptions {
  name: string;
  handle?: string;
  description?: string;
  channels?: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsCreate(client: WebClient, opts: UsergroupsCreateOptions) {
  const params: {
    name: string;
    handle?: string;
    description?: string;
    channels?: string;
    include_count?: boolean;
    team_id?: string;
  } = { name: opts.name };
  if (opts.handle !== undefined) params.handle = opts.handle;
  if (opts.description !== undefined) params.description = opts.description;
  if (opts.channels !== undefined) params.channels = opts.channels;
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.create(params);
  return response.usergroup;
}
```

- [ ] `bun test tests/commands/usergroups/create.test.ts` → PASS

### Step 3.3: usergroups.update

- [ ] `tests/commands/usergroups/update.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsUpdate } from "../../../src/commands/usergroups/update";

describe("usergroups update", () => {
  test("updates fields", async () => {
    const mockUpdate = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { update: mockUpdate } } as any;
    await executeUsergroupsUpdate(client, { usergroup: "S001", name: "renamed", channels: "C003" });
    expect(mockUpdate).toHaveBeenCalledWith({ usergroup: "S001", name: "renamed", channels: "C003" });
  });
});
```

- [ ] `src/commands/usergroups/update.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsUpdateOptions {
  usergroup: string;
  name?: string;
  handle?: string;
  description?: string;
  channels?: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsUpdate(client: WebClient, opts: UsergroupsUpdateOptions) {
  const params: {
    usergroup: string;
    name?: string;
    handle?: string;
    description?: string;
    channels?: string;
    include_count?: boolean;
    team_id?: string;
  } = { usergroup: opts.usergroup };
  if (opts.name !== undefined) params.name = opts.name;
  if (opts.handle !== undefined) params.handle = opts.handle;
  if (opts.description !== undefined) params.description = opts.description;
  if (opts.channels !== undefined) params.channels = opts.channels;
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.update(params);
  return response.usergroup;
}
```

- [ ] `bun test tests/commands/usergroups/update.test.ts` → PASS

### Step 3.4: usergroups.enable

- [ ] `tests/commands/usergroups/enable.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsEnable } from "../../../src/commands/usergroups/enable";

describe("usergroups enable", () => {
  test("enables usergroup", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { enable: mockCall } } as any;
    await executeUsergroupsEnable(client, { usergroup: "S001", includeCount: true, teamId: "T001" });
    expect(mockCall).toHaveBeenCalledWith({ usergroup: "S001", include_count: true, team_id: "T001" });
  });
});
```

- [ ] `src/commands/usergroups/enable.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsEnableOptions {
  usergroup: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsEnable(client: WebClient, opts: UsergroupsEnableOptions) {
  const params: { usergroup: string; include_count?: boolean; team_id?: string } = { usergroup: opts.usergroup };
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  await client.usergroups.enable(params);
}
```

- [ ] `bun test tests/commands/usergroups/enable.test.ts` → PASS

### Step 3.5: usergroups.disable

- [ ] `tests/commands/usergroups/disable.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsDisable } from "../../../src/commands/usergroups/disable";

describe("usergroups disable", () => {
  test("disables usergroup", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { disable: mockCall } } as any;
    await executeUsergroupsDisable(client, { usergroup: "S001" });
    expect(mockCall).toHaveBeenCalledWith({ usergroup: "S001" });
  });
});
```

- [ ] `src/commands/usergroups/disable.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsDisableOptions {
  usergroup: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsDisable(client: WebClient, opts: UsergroupsDisableOptions) {
  const params: { usergroup: string; include_count?: boolean; team_id?: string } = { usergroup: opts.usergroup };
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  await client.usergroups.disable(params);
}
```

- [ ] `bun test tests/commands/usergroups/disable.test.ts` → PASS

### Step 3.6: usergroups.users.list

- [ ] `tests/commands/usergroups/users/list.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsUsersList } from "../../../../src/commands/usergroups/users/list";

describe("usergroups users list", () => {
  test("returns users array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, users: ["U001", "U002"] }));
    const client = { usergroups: { users: { list: mockCall } } } as any;
    const result = await executeUsergroupsUsersList(client, { usergroup: "S001" });
    expect(result).toEqual(["U001", "U002"]);
    expect(mockCall).toHaveBeenCalledWith({ usergroup: "S001" });
  });
});
```

- [ ] `src/commands/usergroups/users/list.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsUsersListOptions {
  usergroup: string;
  includeDisabled?: boolean;
  teamId?: string;
}

export async function executeUsergroupsUsersList(client: WebClient, opts: UsergroupsUsersListOptions) {
  const params: { usergroup: string; include_disabled?: boolean; team_id?: string } = { usergroup: opts.usergroup };
  if (opts.includeDisabled !== undefined) params.include_disabled = opts.includeDisabled;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.usergroups.users.list(params);
  return response.users ?? [];
}
```

- [ ] `bun test tests/commands/usergroups/users/list.test.ts` → PASS

### Step 3.7: usergroups.users.update

- [ ] `tests/commands/usergroups/users/update.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeUsergroupsUsersUpdate } from "../../../../src/commands/usergroups/users/update";

describe("usergroups users update", () => {
  test("updates user list", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, usergroup: { id: "S001" } }));
    const client = { usergroups: { users: { update: mockCall } } } as any;
    await executeUsergroupsUsersUpdate(client, { usergroup: "S001", users: "U001,U002", includeCount: true, teamId: "T001" });
    expect(mockCall).toHaveBeenCalledWith({
      usergroup: "S001", users: "U001,U002", include_count: true, team_id: "T001",
    });
  });
});
```

- [ ] `src/commands/usergroups/users/update.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface UsergroupsUsersUpdateOptions {
  usergroup: string;
  users: string;
  includeCount?: boolean;
  teamId?: string;
}

export async function executeUsergroupsUsersUpdate(client: WebClient, opts: UsergroupsUsersUpdateOptions) {
  const params: { usergroup: string; users: string; include_count?: boolean; team_id?: string } = {
    usergroup: opts.usergroup,
    users: opts.users,
  };
  if (opts.includeCount !== undefined) params.include_count = opts.includeCount;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  await client.usergroups.users.update(params);
}
```

- [ ] `bun test tests/commands/usergroups/users/update.test.ts` → PASS

### Step 3.8: `src/index.ts` 配線（usergroups）

- [ ] import 追加

```typescript
import { executeUsergroupsList } from "./commands/usergroups/list";
import { executeUsergroupsCreate } from "./commands/usergroups/create";
import { executeUsergroupsUpdate } from "./commands/usergroups/update";
import { executeUsergroupsEnable } from "./commands/usergroups/enable";
import { executeUsergroupsDisable } from "./commands/usergroups/disable";
import { executeUsergroupsUsersList } from "./commands/usergroups/users/list";
import { executeUsergroupsUsersUpdate } from "./commands/usergroups/users/update";
```

- [ ] `usergroupsCommands` の `or(...)` 末尾に 5 件、さらに `command("users", or(...))` でサブグループ 2 件を追加

```typescript
    command("list", object({
      cmd: constant("usergroups-list" as const),
      includeCount: optional(option("--include-count", boolValueParser)),
      includeDisabled: optional(option("--include-disabled", boolValueParser)),
      includeUsers: optional(option("--include-users", boolValueParser)),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("create", object({
      cmd: constant("usergroups-create" as const),
      name: option("--name", string({ metavar: "NAME" })),
      handle: optional(option("--handle", string({ metavar: "HANDLE" }))),
      description: optional(option("--description", string({ metavar: "DESC" }))),
      channels: optional(option("--channels", string({ metavar: "CHANNEL_IDS" }))),
      includeCount: optional(option("--include-count", boolValueParser)),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("update", object({
      cmd: constant("usergroups-update" as const),
      usergroup: option("--usergroup", string({ metavar: "USERGROUP_ID" })),
      name: optional(option("--name", string({ metavar: "NAME" }))),
      handle: optional(option("--handle", string({ metavar: "HANDLE" }))),
      description: optional(option("--description", string({ metavar: "DESC" }))),
      channels: optional(option("--channels", string({ metavar: "CHANNEL_IDS" }))),
      includeCount: optional(option("--include-count", boolValueParser)),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("enable", object({
      cmd: constant("usergroups-enable" as const),
      usergroup: option("--usergroup", string({ metavar: "USERGROUP_ID" })),
      includeCount: optional(option("--include-count", boolValueParser)),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("disable", object({
      cmd: constant("usergroups-disable" as const),
      usergroup: option("--usergroup", string({ metavar: "USERGROUP_ID" })),
      includeCount: optional(option("--include-count", boolValueParser)),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("users", or(
      command("list", object({
        cmd: constant("usergroups-users-list" as const),
        usergroup: option("--usergroup", string({ metavar: "USERGROUP_ID" })),
        includeDisabled: optional(option("--include-disabled", boolValueParser)),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      })),
      command("update", object({
        cmd: constant("usergroups-users-update" as const),
        usergroup: option("--usergroup", string({ metavar: "USERGROUP_ID" })),
        users: option("--users", string({ metavar: "USER_IDS" })),
        includeCount: optional(option("--include-count", boolValueParser)),
        teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      })),
    )),
```

- [ ] switch 文に 7 ケース追加

```typescript
  case "usergroups-list": {
    const client = await createSlackClient(store, profileFlag);
    const groups = await executeUsergroupsList(client, {
      includeCount: config.includeCount, includeDisabled: config.includeDisabled,
      includeUsers: config.includeUsers, teamId: config.teamId,
    });
    const rows = groups.map((g: { id?: string; name?: string; handle?: string; date_delete?: number }) => ({
      id: g.id ?? "", name: g.name ?? "", handle: g.handle ?? "",
      enabled: (g.date_delete ?? 0) === 0,
    }));
    console.log(formatOutput(rows, ["id", "name", "handle", "enabled"], outputFormat));
    break;
  }
  case "usergroups-create": {
    const client = await createSlackClient(store, profileFlag);
    const group = await executeUsergroupsCreate(client, {
      name: config.name, handle: config.handle, description: config.description,
      channels: config.channels, includeCount: config.includeCount, teamId: config.teamId,
    });
    console.log(JSON.stringify(group, null, 2));
    break;
  }
  case "usergroups-update": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsergroupsUpdate(client, {
      usergroup: config.usergroup, name: config.name, handle: config.handle,
      description: config.description, channels: config.channels,
      includeCount: config.includeCount, teamId: config.teamId,
    });
    console.log(`Usergroup '${config.usergroup}' updated.`);
    break;
  }
  case "usergroups-enable": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsergroupsEnable(client, {
      usergroup: config.usergroup, includeCount: config.includeCount, teamId: config.teamId,
    });
    console.log(`Usergroup '${config.usergroup}' enabled.`);
    break;
  }
  case "usergroups-disable": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsergroupsDisable(client, {
      usergroup: config.usergroup, includeCount: config.includeCount, teamId: config.teamId,
    });
    console.log(`Usergroup '${config.usergroup}' disabled.`);
    break;
  }
  case "usergroups-users-list": {
    const client = await createSlackClient(store, profileFlag);
    const users = await executeUsergroupsUsersList(client, {
      usergroup: config.usergroup, includeDisabled: config.includeDisabled, teamId: config.teamId,
    });
    console.log(JSON.stringify(users, null, 2));
    break;
  }
  case "usergroups-users-update": {
    const client = await createSlackClient(store, profileFlag);
    await executeUsergroupsUsersUpdate(client, {
      usergroup: config.usergroup, users: config.users,
      includeCount: config.includeCount, teamId: config.teamId,
    });
    console.log(`Usergroup '${config.usergroup}' users updated.`);
    break;
  }
```

### Step 3.9: 検証とコミット

- [ ] `bun run lint` → エラーなし
- [ ] `bun test tests/commands/usergroups` → 全 PASS
- [ ] `bun run dev -- usergroups --help`
- [ ] コミット

```bash
git add src/commands/usergroups tests/commands/usergroups src/index.ts
git commit -m "feat: add non-admin usergroups commands (list, create, update, enable, disable, users)"
```

---

## Task 4: teams グループ拡張（非 admin = team.*）

**Files:**
- Create: `src/commands/teams/info.ts`
- Create: `src/commands/teams/billable-info.ts`
- Create: `src/commands/teams/access-logs.ts`
- Create: `src/commands/teams/integration-logs.ts`
- Create: `src/commands/teams/profile/get.ts`
- Create: 対応テスト 5 本
- Modify: `src/index.ts`（import 5 行 + パーサー定義 + switch ケース 5 件）

### Step 4.1: team.info

- [ ] `tests/commands/teams/info.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsInfo } from "../../../src/commands/teams/info";

describe("teams info", () => {
  test("returns team object", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, team: { id: "T001", name: "example" } }));
    const client = { team: { info: mockCall } } as any;
    const result = await executeTeamsInfo(client, {});
    expect(result?.id).toBe("T001");
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes team and domain", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, team: {} }));
    const client = { team: { info: mockCall } } as any;
    await executeTeamsInfo(client, { team: "T001", domain: "example" });
    expect(mockCall).toHaveBeenCalledWith({ team: "T001", domain: "example" });
  });
});
```

- [ ] `src/commands/teams/info.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface TeamsInfoOptions {
  team?: string;
  domain?: string;
}

export async function executeTeamsInfo(client: WebClient, opts: TeamsInfoOptions) {
  const params: Record<string, unknown> = {};
  if (opts.team !== undefined) params.team = opts.team;
  if (opts.domain !== undefined) params.domain = opts.domain;
  const response = await client.team.info(params);
  return response.team;
}
```

- [ ] `bun test tests/commands/teams/info.test.ts` → PASS

### Step 4.2: team.profile.get

- [ ] `tests/commands/teams/profile/get.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsProfileGet } from "../../../../src/commands/teams/profile/get";

describe("teams profile get", () => {
  test("returns profile object", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, profile: { fields: [{ id: "Xf001" }] } }));
    const client = { team: { profile: { get: mockCall } } } as any;
    const result = await executeTeamsProfileGet(client, {});
    expect(result?.fields).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes visibility", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, profile: {} }));
    const client = { team: { profile: { get: mockCall } } } as any;
    await executeTeamsProfileGet(client, { visibility: "all" });
    expect(mockCall).toHaveBeenCalledWith({ visibility: "all" });
  });
});
```

- [ ] `src/commands/teams/profile/get.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface TeamsProfileGetOptions {
  visibility?: string;
}

export async function executeTeamsProfileGet(client: WebClient, opts: TeamsProfileGetOptions) {
  const params: Record<string, unknown> = {};
  if (opts.visibility !== undefined) params.visibility = opts.visibility;
  const response = await client.team.profile.get(params);
  return response.profile;
}
```

- [ ] `bun test tests/commands/teams/profile/get.test.ts` → PASS

### Step 4.3: team.billableInfo

- [ ] `tests/commands/teams/billable-info.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsBillableInfo } from "../../../src/commands/teams/billable-info";

describe("teams billable-info", () => {
  test("returns billable_info map", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, billable_info: { U001: { billing_active: true } } }));
    const client = { team: { billableInfo: mockCall } } as any;
    const result = await executeTeamsBillableInfo(client, {});
    expect(result.U001?.billing_active).toBe(true);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes user and team_id", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, billable_info: {} }));
    const client = { team: { billableInfo: mockCall } } as any;
    await executeTeamsBillableInfo(client, { user: "U001", teamId: "T001", cursor: "c1", limit: 50 });
    expect(mockCall).toHaveBeenCalledWith({ user: "U001", team_id: "T001", cursor: "c1", limit: 50 });
  });
});
```

- [ ] `src/commands/teams/billable-info.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface TeamsBillableInfoOptions {
  user?: string;
  teamId?: string;
  cursor?: string;
  limit?: number;
}

export async function executeTeamsBillableInfo(client: WebClient, opts: TeamsBillableInfoOptions) {
  const params: Record<string, unknown> = {};
  if (opts.user !== undefined) params.user = opts.user;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;
  const response = await client.team.billableInfo(params);
  return response.billable_info ?? {};
}
```

- [ ] `bun test tests/commands/teams/billable-info.test.ts` → PASS

### Step 4.4: team.accessLogs

- [ ] `tests/commands/teams/access-logs.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsAccessLogs } from "../../../src/commands/teams/access-logs";

describe("teams access-logs", () => {
  test("returns logins array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logins: [{ user_id: "U001", ip: "1.2.3.4" }] }));
    const client = { team: { accessLogs: mockCall } } as any;
    const result = await executeTeamsAccessLogs(client, {});
    expect(result).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes before/count/page/team_id", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logins: [] }));
    const client = { team: { accessLogs: mockCall } } as any;
    await executeTeamsAccessLogs(client, { before: 1234567890, count: 100, page: 2, teamId: "T001" });
    expect(mockCall).toHaveBeenCalledWith({ before: 1234567890, count: 100, page: 2, team_id: "T001" });
  });
});
```

- [ ] `src/commands/teams/access-logs.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface TeamsAccessLogsOptions {
  before?: number;
  count?: number;
  page?: number;
  teamId?: string;
}

export async function executeTeamsAccessLogs(client: WebClient, opts: TeamsAccessLogsOptions) {
  const params: Record<string, unknown> = {};
  if (opts.before !== undefined) params.before = opts.before;
  if (opts.count !== undefined) params.count = opts.count;
  if (opts.page !== undefined) params.page = opts.page;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  const response = await client.team.accessLogs(params);
  return response.logins ?? [];
}
```

- [ ] `bun test tests/commands/teams/access-logs.test.ts` → PASS

### Step 4.5: team.integrationLogs

- [ ] `tests/commands/teams/integration-logs.test.ts`

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsIntegrationLogs } from "../../../src/commands/teams/integration-logs";

describe("teams integration-logs", () => {
  test("returns logs array", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logs: [{ change_type: "added" }] }));
    const client = { team: { integrationLogs: mockCall } } as any;
    const result = await executeTeamsIntegrationLogs(client, {});
    expect(result).toHaveLength(1);
    expect(mockCall).toHaveBeenCalledWith({});
  });

  test("passes optional filters", async () => {
    const mockCall = mock(() => Promise.resolve({ ok: true, logs: [] }));
    const client = { team: { integrationLogs: mockCall } } as any;
    await executeTeamsIntegrationLogs(client, {
      appId: "A001", changeType: "added", count: 50, page: 1,
      serviceId: "SVC001", teamId: "T001", user: "U001",
    });
    expect(mockCall).toHaveBeenCalledWith({
      app_id: "A001", change_type: "added", count: 50, page: 1,
      service_id: "SVC001", team_id: "T001", user: "U001",
    });
  });
});
```

- [ ] `src/commands/teams/integration-logs.ts`

```typescript
import type { WebClient } from "@slack/web-api";

interface TeamsIntegrationLogsOptions {
  appId?: string;
  changeType?: string;
  count?: number;
  page?: number;
  serviceId?: string;
  teamId?: string;
  user?: string;
}

export async function executeTeamsIntegrationLogs(client: WebClient, opts: TeamsIntegrationLogsOptions) {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.changeType !== undefined) params.change_type = opts.changeType;
  if (opts.count !== undefined) params.count = opts.count;
  if (opts.page !== undefined) params.page = opts.page;
  if (opts.serviceId !== undefined) params.service_id = opts.serviceId;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.user !== undefined) params.user = opts.user;
  const response = await client.team.integrationLogs(params);
  return response.logs ?? [];
}
```

- [ ] `bun test tests/commands/teams/integration-logs.test.ts` → PASS

### Step 4.6: `src/index.ts` 配線（teams）

- [ ] import 追加

```typescript
import { executeTeamsInfo } from "./commands/teams/info";
import { executeTeamsBillableInfo } from "./commands/teams/billable-info";
import { executeTeamsAccessLogs } from "./commands/teams/access-logs";
import { executeTeamsIntegrationLogs } from "./commands/teams/integration-logs";
import { executeTeamsProfileGet } from "./commands/teams/profile/get";
```

- [ ] `teamsCommands` の `or(...)` 末尾に 5 件追加（`teamsSettingsCommands` の直前）

```typescript
    command("info", object({
      cmd: constant("teams-info" as const),
      team: optional(option("--team", string({ metavar: "TEAM_ID" }))),
      domain: optional(option("--domain", string({ metavar: "DOMAIN" }))),
    })),
    command("billable-info", object({
      cmd: constant("teams-billable-info" as const),
      user: optional(option("--user", string({ metavar: "USER_ID" }))),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      cursor: optional(option("--cursor", string({ metavar: "CURSOR" }))),
      limit: optional(option("--limit", integer({ metavar: "LIMIT" }))),
    })),
    command("access-logs", object({
      cmd: constant("teams-access-logs" as const),
      before: optional(option("--before", integer({ metavar: "TIMESTAMP" }))),
      count: optional(option("--count", integer({ metavar: "COUNT" }))),
      page: optional(option("--page", integer({ metavar: "PAGE" }))),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
    })),
    command("integration-logs", object({
      cmd: constant("teams-integration-logs" as const),
      appId: optional(option("--app-id", string({ metavar: "APP_ID" }))),
      changeType: optional(option("--change-type", string({ metavar: "TYPE" }))),
      count: optional(option("--count", integer({ metavar: "COUNT" }))),
      page: optional(option("--page", integer({ metavar: "PAGE" }))),
      serviceId: optional(option("--service-id", string({ metavar: "SERVICE_ID" }))),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      user: optional(option("--user", string({ metavar: "USER_ID" }))),
    })),
    command("profile", command("get", object({
      cmd: constant("teams-profile-get" as const),
      visibility: optional(option("--visibility", string({ metavar: "VISIBILITY" }))),
    }))),
```

- [ ] switch 文に 5 ケース追加

```typescript
  case "teams-info": {
    const client = await createSlackClient(store, profileFlag);
    const team = await executeTeamsInfo(client, { team: config.team, domain: config.domain });
    console.log(JSON.stringify(team, null, 2));
    break;
  }
  case "teams-profile-get": {
    const client = await createSlackClient(store, profileFlag);
    const profile = await executeTeamsProfileGet(client, { visibility: config.visibility });
    console.log(JSON.stringify(profile, null, 2));
    break;
  }
  case "teams-billable-info": {
    const client = await createSlackClient(store, profileFlag);
    const info = await executeTeamsBillableInfo(client, {
      user: config.user, teamId: config.teamId, cursor: config.cursor, limit: config.limit,
    });
    console.log(JSON.stringify(info, null, 2));
    break;
  }
  case "teams-access-logs": {
    const client = await createSlackClient(store, profileFlag);
    const logs = await executeTeamsAccessLogs(client, {
      before: config.before, count: config.count, page: config.page, teamId: config.teamId,
    });
    const rows = logs.map((l: { user_id?: string; username?: string; ip?: string; date_first?: number; date_last?: number; count?: number }) => ({
      user_id: l.user_id ?? "", username: l.username ?? "", ip: l.ip ?? "",
      date_first: l.date_first ?? 0, date_last: l.date_last ?? 0, count: l.count ?? 0,
    }));
    console.log(formatOutput(rows, ["user_id", "username", "ip", "date_first", "date_last", "count"], outputFormat));
    break;
  }
  case "teams-integration-logs": {
    const client = await createSlackClient(store, profileFlag);
    const logs = await executeTeamsIntegrationLogs(client, {
      appId: config.appId, changeType: config.changeType, count: config.count,
      page: config.page, serviceId: config.serviceId, teamId: config.teamId, user: config.user,
    });
    console.log(JSON.stringify(logs, null, 2));
    break;
  }
```

### Step 4.7: 検証とコミット

- [ ] `bun run lint` → エラーなし
- [ ] `bun test tests/commands/teams` → 全 PASS
- [ ] `bun run dev -- teams --help`
- [ ] コミット

```bash
git add src/commands/teams tests/commands/teams src/index.ts
git commit -m "feat: add team.* commands (info, profile, billable-info, access-logs, integration-logs)"
```

---

## Task 5: ドキュメント更新

**Files:**
- Modify: `README.md`（コマンド表 / 必要スコープ節）
- Modify: `skills/slack-admin-cli-skill/SKILL.md`（カバー範囲）

### Step 5.1: README コマンド表に 23 コマンド追記

- [ ] `README.md` を開き、既存の「コマンド一覧」または「Commands」セクションに以下を追記

```markdown
### users（非 admin）

- `sladm users info --user <id>` — `users.info`
- `sladm users lookup-by-email --email <email>` — `users.lookupByEmail`
- `sladm users get-presence --user <id>` — `users.getPresence`
- `sladm users set-presence --presence <auto|away>` — `users.setPresence`
- `sladm users conversations [--user <id>]` — `users.conversations`
- `sladm users identity` — `users.identity`
- `sladm users profile get [--user <id>]` — `users.profile.get`
- `sladm users profile set --user <id> [--name ... --value ... | --profile '<json>']` — `users.profile.set`

### conversations（非 admin）

- `sladm conversations list` — `conversations.list`
- `sladm conversations info --channel <id>` — `conversations.info`
- `sladm conversations members --channel <id>` — `conversations.members`

### usergroups（非 admin）

- `sladm usergroups list` — `usergroups.list`
- `sladm usergroups create --name <name>` — `usergroups.create`
- `sladm usergroups update --usergroup <id>` — `usergroups.update`
- `sladm usergroups enable --usergroup <id>` — `usergroups.enable`
- `sladm usergroups disable --usergroup <id>` — `usergroups.disable`
- `sladm usergroups users list --usergroup <id>` — `usergroups.users.list`
- `sladm usergroups users update --usergroup <id> --users <ids>` — `usergroups.users.update`

### teams（非 admin = team.*）

- `sladm teams info` — `team.info`
- `sladm teams profile get` — `team.profile.get`
- `sladm teams billable-info` — `team.billableInfo`
- `sladm teams access-logs` — `team.accessLogs`
- `sladm teams integration-logs` — `team.integrationLogs`
```

### Step 5.2: README 必要スコープ節

- [ ] 既存「必要スコープ」セクションに以下を追記

```markdown
### 非 admin API 用スコープ

- ユーザー: `users:read`, `users:read.email`, `users.profile:read`, `users.profile:write`
- チャンネル: `channels:read`, `groups:read`, `mpim:read`, `im:read`
- ユーザーグループ: `usergroups:read`, `usergroups:write`
- チーム: `team:read`
- `team.accessLogs` / `team.billableInfo` は user token に `admin` 権限が必要
```

### Step 5.3: Skill 定義更新

- [ ] `skills/slack-admin-cli-skill/SKILL.md` を開き、カバー範囲に「非 admin 管理 API（users.info, users.profile, conversations.list/info/members, usergroups CRUD, team.info/profile/billableInfo/accessLogs/integrationLogs）」を追記

### Step 5.4: コミット

- [ ] `git add README.md skills/slack-admin-cli-skill/SKILL.md`
- [ ] `git commit -m "docs: document non-admin management APIs"`

---

## Task 6: 全体検証と PR 準備

### Step 6.1: フル検証

- [ ] `bun run lint` → エラーなし
- [ ] `bun test` → 全 PASS（既存 + 新規 23 コマンド）
- [ ] 任意の実環境で `sladm users info --user <実ID>` 等を手動実行し、API 呼び出しが通ることを確認（スコープ不足時のエラーメッセージも確認）

### Step 6.2: PR 作成

- [ ] ブランチを push
- [ ] PR タイトル: `feat: add non-admin management APIs (users, conversations, usergroups, team)`
- [ ] PR 本文: 追加コマンド 23 件のリストと、対応する Slack API メソッドを記載。仕様書 `docs/superpowers/specs/2026-04-18-non-admin-management-apis-design.md` へのリンクを含める。
- [ ] 破壊的変更なし / minor バージョンアップ（v0.5.0）予定である旨を明記

---

## 完了基準

- [ ] 23 コマンド全てが実装され、ユニットテストが PASS
- [ ] `bun run lint` がエラーなし
- [ ] README とスキルドキュメントが更新されている
- [ ] PR が作成され、レビュー可能な状態
