# admin.conversations.* Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add all 25 `admin.conversations.*` commands to the sladm CLI, with a safety mechanism on `set-teams` to prevent accidental workspace disconnection.

**Architecture:** Each command is a thin wrapper around the `@slack/web-api` SDK method, following the exact same pattern as existing `teams` / `users` commands. The only non-trivial command is `set-teams`, which calls `getTeams` internally before `setTeams` to detect workspace disconnections. CLI definitions use optique's `command()` / `or()` / `object()` combinators with nested subcommands for `restrict-access` and `ekm`.

**Tech Stack:** Bun, TypeScript, optique (`@optique/core`, `@optique/run`), `@slack/web-api`, `bun:test`

**Existing patterns (reference):**
- Command file: `import type { WebClient }`, define interface, export async function that calls `client.admin.*`
- Test file: `import { describe, expect, test, mock }`, mock SDK method, cast client `as any`, verify `toHaveBeenCalledWith`
- index.ts: define parser with `command()` / `object()` / `constant()`, add `case` to switch, call execute function
- Optional params: use spread `...(opts.x !== undefined ? { x: opts.x } : {})` or conditional assignment
- No `as` casts in production code (tests may use `as any`)

**Important:** `index.ts` is already ~440 lines. Adding 25 commands will make it large. The plan keeps the same single-file pattern since it's consistent with the existing structure. If refactoring is desired later, that's a separate task.

---

### Task 1: Simple single-arg commands (archive, unarchive, delete, convert-to-public)

These 4 commands all take only `--channel-id` and call the SDK method. Batch them together.

**Files:**
- Create: `src/commands/conversations/archive.ts`
- Create: `src/commands/conversations/unarchive.ts`
- Create: `src/commands/conversations/delete.ts`
- Create: `src/commands/conversations/convert-to-public.ts`
- Create: `tests/commands/conversations/archive.test.ts`
- Create: `tests/commands/conversations/unarchive.test.ts`
- Create: `tests/commands/conversations/delete.test.ts`
- Create: `tests/commands/conversations/convert-to-public.test.ts`

- [ ] **Step 1: Write failing tests for all 4 commands**

```typescript
// tests/commands/conversations/archive.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsArchive } from "../../../src/commands/conversations/archive";

describe("conversations archive", () => {
  test("calls admin.conversations.archive with correct args", async () => {
    const mockArchive = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { archive: mockArchive } } } as any;

    await executeConversationsArchive(client, { channelId: "C123" });

    expect(mockArchive).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

```typescript
// tests/commands/conversations/unarchive.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsUnarchive } from "../../../src/commands/conversations/unarchive";

describe("conversations unarchive", () => {
  test("calls admin.conversations.unarchive with correct args", async () => {
    const mockUnarchive = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { unarchive: mockUnarchive } } } as any;

    await executeConversationsUnarchive(client, { channelId: "C123" });

    expect(mockUnarchive).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

```typescript
// tests/commands/conversations/delete.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsDelete } from "../../../src/commands/conversations/delete";

describe("conversations delete", () => {
  test("calls admin.conversations.delete with correct args", async () => {
    const mockDelete = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { delete: mockDelete } } } as any;

    await executeConversationsDelete(client, { channelId: "C123" });

    expect(mockDelete).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

```typescript
// tests/commands/conversations/convert-to-public.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsConvertToPublic } from "../../../src/commands/conversations/convert-to-public";

describe("conversations convert-to-public", () => {
  test("calls admin.conversations.convertToPublic with correct args", async () => {
    const mockConvert = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { convertToPublic: mockConvert } } } as any;

    await executeConversationsConvertToPublic(client, { channelId: "C123" });

    expect(mockConvert).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/archive.test.ts tests/commands/conversations/unarchive.test.ts tests/commands/conversations/delete.test.ts tests/commands/conversations/convert-to-public.test.ts`
Expected: FAIL — modules not found

- [ ] **Step 3: Implement all 4 commands**

```typescript
// src/commands/conversations/archive.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsArchive(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.archive({ channel_id: args.channelId });
}
```

```typescript
// src/commands/conversations/unarchive.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsUnarchive(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.unarchive({ channel_id: args.channelId });
}
```

```typescript
// src/commands/conversations/delete.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsDelete(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.delete({ channel_id: args.channelId });
}
```

```typescript
// src/commands/conversations/convert-to-public.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsConvertToPublic(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.convertToPublic({ channel_id: args.channelId });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/archive.test.ts tests/commands/conversations/unarchive.test.ts tests/commands/conversations/delete.test.ts tests/commands/conversations/convert-to-public.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/archive.ts src/commands/conversations/unarchive.ts src/commands/conversations/delete.ts src/commands/conversations/convert-to-public.ts tests/commands/conversations/archive.test.ts tests/commands/conversations/unarchive.test.ts tests/commands/conversations/delete.test.ts tests/commands/conversations/convert-to-public.test.ts
git commit -m "feat: add conversations archive/unarchive/delete/convert-to-public commands"
```

---

### Task 2: rename, convert-to-private, get-prefs, remove-custom-retention, get-custom-retention

These commands have simple parameter sets (1-2 required args).

**Files:**
- Create: `src/commands/conversations/rename.ts`
- Create: `src/commands/conversations/convert-to-private.ts`
- Create: `src/commands/conversations/get-prefs.ts`
- Create: `src/commands/conversations/remove-custom-retention.ts`
- Create: `src/commands/conversations/get-custom-retention.ts`
- Create: `tests/commands/conversations/rename.test.ts`
- Create: `tests/commands/conversations/convert-to-private.test.ts`
- Create: `tests/commands/conversations/get-prefs.test.ts`
- Create: `tests/commands/conversations/remove-custom-retention.test.ts`
- Create: `tests/commands/conversations/get-custom-retention.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/rename.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsRename } from "../../../src/commands/conversations/rename";

describe("conversations rename", () => {
  test("calls admin.conversations.rename with correct args", async () => {
    const mockRename = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { rename: mockRename } } } as any;

    await executeConversationsRename(client, { channelId: "C123", name: "new-name" });

    expect(mockRename).toHaveBeenCalledWith({ channel_id: "C123", name: "new-name" });
  });
});
```

```typescript
// tests/commands/conversations/convert-to-private.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsConvertToPrivate } from "../../../src/commands/conversations/convert-to-private";

describe("conversations convert-to-private", () => {
  test("calls admin.conversations.convertToPrivate with correct args", async () => {
    const mockConvert = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { convertToPrivate: mockConvert } } } as any;

    await executeConversationsConvertToPrivate(client, { channelId: "C123" });

    expect(mockConvert).toHaveBeenCalledWith({ channel_id: "C123" });
  });

  test("passes optional name for MPIM conversion", async () => {
    const mockConvert = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { convertToPrivate: mockConvert } } } as any;

    await executeConversationsConvertToPrivate(client, { channelId: "C123", name: "private-ch" });

    expect(mockConvert).toHaveBeenCalledWith({ channel_id: "C123", name: "private-ch" });
  });
});
```

```typescript
// tests/commands/conversations/get-prefs.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsGetPrefs } from "../../../src/commands/conversations/get-prefs";

describe("conversations get-prefs", () => {
  test("calls admin.conversations.getConversationPrefs with correct args", async () => {
    const mockGetPrefs = mock(() => Promise.resolve({ ok: true, prefs: { who_can_post: {} } }));
    const client = { admin: { conversations: { getConversationPrefs: mockGetPrefs } } } as any;

    const result = await executeConversationsGetPrefs(client, { channelId: "C123" });

    expect(mockGetPrefs).toHaveBeenCalledWith({ channel_id: "C123" });
    expect(result).toEqual({ who_can_post: {} });
  });
});
```

```typescript
// tests/commands/conversations/remove-custom-retention.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsRemoveCustomRetention } from "../../../src/commands/conversations/remove-custom-retention";

describe("conversations remove-custom-retention", () => {
  test("calls admin.conversations.removeCustomRetention with correct args", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { removeCustomRetention: mockRemove } } } as any;

    await executeConversationsRemoveCustomRetention(client, { channelId: "C123" });

    expect(mockRemove).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

```typescript
// tests/commands/conversations/get-custom-retention.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsGetCustomRetention } from "../../../src/commands/conversations/get-custom-retention";

describe("conversations get-custom-retention", () => {
  test("calls admin.conversations.getCustomRetention with correct args", async () => {
    const mockGet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { getCustomRetention: mockGet } } } as any;

    const result = await executeConversationsGetCustomRetention(client, { channelId: "C123" });

    expect(mockGet).toHaveBeenCalledWith({ channel_id: "C123" });
    expect(result.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/rename.test.ts tests/commands/conversations/convert-to-private.test.ts tests/commands/conversations/get-prefs.test.ts tests/commands/conversations/remove-custom-retention.test.ts tests/commands/conversations/get-custom-retention.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement all 5 commands**

```typescript
// src/commands/conversations/rename.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsRename(
  client: WebClient,
  args: { channelId: string; name: string },
): Promise<void> {
  await client.admin.conversations.rename({ channel_id: args.channelId, name: args.name });
}
```

```typescript
// src/commands/conversations/convert-to-private.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsConvertToPrivate(
  client: WebClient,
  args: { channelId: string; name?: string },
): Promise<void> {
  await client.admin.conversations.convertToPrivate({
    channel_id: args.channelId,
    ...(args.name !== undefined ? { name: args.name } : {}),
  });
}
```

```typescript
// src/commands/conversations/get-prefs.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsGetPrefs(
  client: WebClient,
  args: { channelId: string },
) {
  const response = await client.admin.conversations.getConversationPrefs({ channel_id: args.channelId });
  return response.prefs;
}
```

```typescript
// src/commands/conversations/remove-custom-retention.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsRemoveCustomRetention(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.removeCustomRetention({ channel_id: args.channelId });
}
```

```typescript
// src/commands/conversations/get-custom-retention.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsGetCustomRetention(
  client: WebClient,
  args: { channelId: string },
) {
  return await client.admin.conversations.getCustomRetention({ channel_id: args.channelId });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/rename.test.ts tests/commands/conversations/convert-to-private.test.ts tests/commands/conversations/get-prefs.test.ts tests/commands/conversations/remove-custom-retention.test.ts tests/commands/conversations/get-custom-retention.test.ts`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/rename.ts src/commands/conversations/convert-to-private.ts src/commands/conversations/get-prefs.ts src/commands/conversations/remove-custom-retention.ts src/commands/conversations/get-custom-retention.ts tests/commands/conversations/rename.test.ts tests/commands/conversations/convert-to-private.test.ts tests/commands/conversations/get-prefs.test.ts tests/commands/conversations/remove-custom-retention.test.ts tests/commands/conversations/get-custom-retention.test.ts
git commit -m "feat: add conversations rename/convert-to-private/get-prefs/retention commands"
```

---

### Task 3: set-prefs, set-custom-retention, disconnect-shared

Commands with 2+ required args or slightly more complex params.

**Files:**
- Create: `src/commands/conversations/set-prefs.ts`
- Create: `src/commands/conversations/set-custom-retention.ts`
- Create: `src/commands/conversations/disconnect-shared.ts`
- Create: `tests/commands/conversations/set-prefs.test.ts`
- Create: `tests/commands/conversations/set-custom-retention.test.ts`
- Create: `tests/commands/conversations/disconnect-shared.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/set-prefs.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSetPrefs } from "../../../src/commands/conversations/set-prefs";

describe("conversations set-prefs", () => {
  test("calls admin.conversations.setConversationPrefs with correct args", async () => {
    const mockSetPrefs = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { setConversationPrefs: mockSetPrefs } } } as any;

    const prefs = { who_can_post: { type: ["owner"] } };
    await executeConversationsSetPrefs(client, { channelId: "C123", prefs });

    expect(mockSetPrefs).toHaveBeenCalledWith({ channel_id: "C123", prefs });
  });
});
```

```typescript
// tests/commands/conversations/set-custom-retention.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSetCustomRetention } from "../../../src/commands/conversations/set-custom-retention";

describe("conversations set-custom-retention", () => {
  test("calls admin.conversations.setCustomRetention with correct args", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { setCustomRetention: mockSet } } } as any;

    await executeConversationsSetCustomRetention(client, { channelId: "C123", durationDays: 90 });

    expect(mockSet).toHaveBeenCalledWith({ channel_id: "C123", duration_days: 90 });
  });
});
```

```typescript
// tests/commands/conversations/disconnect-shared.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsDisconnectShared } from "../../../src/commands/conversations/disconnect-shared";

describe("conversations disconnect-shared", () => {
  test("calls admin.conversations.disconnectShared with correct args", async () => {
    const mockDisconnect = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { disconnectShared: mockDisconnect } } } as any;

    await executeConversationsDisconnectShared(client, { channelId: "C123", leavingTeamIds: ["T1", "T2"] });

    expect(mockDisconnect).toHaveBeenCalledWith({ channel_id: "C123", leaving_team_ids: ["T1", "T2"] });
  });

  test("calls without optional leaving_team_ids", async () => {
    const mockDisconnect = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { disconnectShared: mockDisconnect } } } as any;

    await executeConversationsDisconnectShared(client, { channelId: "C123" });

    expect(mockDisconnect).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/set-prefs.test.ts tests/commands/conversations/set-custom-retention.test.ts tests/commands/conversations/disconnect-shared.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement all 3 commands**

```typescript
// src/commands/conversations/set-prefs.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsSetPrefs(
  client: WebClient,
  args: { channelId: string; prefs: Record<string, unknown> },
): Promise<void> {
  await client.admin.conversations.setConversationPrefs({
    channel_id: args.channelId,
    prefs: args.prefs,
  });
}
```

```typescript
// src/commands/conversations/set-custom-retention.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsSetCustomRetention(
  client: WebClient,
  args: { channelId: string; durationDays: number },
): Promise<void> {
  await client.admin.conversations.setCustomRetention({
    channel_id: args.channelId,
    duration_days: args.durationDays,
  });
}
```

```typescript
// src/commands/conversations/disconnect-shared.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsDisconnectShared(
  client: WebClient,
  args: { channelId: string; leavingTeamIds?: string[] },
): Promise<void> {
  await client.admin.conversations.disconnectShared({
    channel_id: args.channelId,
    ...(args.leavingTeamIds !== undefined ? { leaving_team_ids: args.leavingTeamIds } : {}),
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/set-prefs.test.ts tests/commands/conversations/set-custom-retention.test.ts tests/commands/conversations/disconnect-shared.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/set-prefs.ts src/commands/conversations/set-custom-retention.ts src/commands/conversations/disconnect-shared.ts tests/commands/conversations/set-prefs.test.ts tests/commands/conversations/set-custom-retention.test.ts tests/commands/conversations/disconnect-shared.test.ts
git commit -m "feat: add conversations set-prefs/set-custom-retention/disconnect-shared commands"
```

---

### Task 4: invite, create

Commands with more complex required parameters (arrays, union types).

**Files:**
- Create: `src/commands/conversations/invite.ts`
- Create: `src/commands/conversations/create.ts`
- Create: `tests/commands/conversations/invite.test.ts`
- Create: `tests/commands/conversations/create.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/invite.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsInvite } from "../../../src/commands/conversations/invite";

describe("conversations invite", () => {
  test("calls admin.conversations.invite with correct args", async () => {
    const mockInvite = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { invite: mockInvite } } } as any;

    await executeConversationsInvite(client, { channelId: "C123", userIds: ["U1", "U2"] });

    expect(mockInvite).toHaveBeenCalledWith({ channel_id: "C123", user_ids: ["U1", "U2"] });
  });
});
```

```typescript
// tests/commands/conversations/create.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsCreate } from "../../../src/commands/conversations/create";

describe("conversations create", () => {
  test("creates channel in specific workspace", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, channel_id: "C999" }));
    const client = { admin: { conversations: { create: mockCreate } } } as any;

    const result = await executeConversationsCreate(client, {
      name: "new-channel",
      isPrivate: false,
      teamId: "T123",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      name: "new-channel",
      is_private: false,
      team_id: "T123",
    });
    expect(result.ok).toBe(true);
  });

  test("creates org-wide channel", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, channel_id: "C999" }));
    const client = { admin: { conversations: { create: mockCreate } } } as any;

    await executeConversationsCreate(client, {
      name: "org-channel",
      isPrivate: true,
      orgWide: true,
    });

    expect(mockCreate).toHaveBeenCalledWith({
      name: "org-channel",
      is_private: true,
      org_wide: true,
    });
  });

  test("passes optional description", async () => {
    const mockCreate = mock(() => Promise.resolve({ ok: true, channel_id: "C999" }));
    const client = { admin: { conversations: { create: mockCreate } } } as any;

    await executeConversationsCreate(client, {
      name: "ch",
      isPrivate: false,
      teamId: "T1",
      description: "A channel",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      name: "ch",
      is_private: false,
      team_id: "T1",
      description: "A channel",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/invite.test.ts tests/commands/conversations/create.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement both commands**

```typescript
// src/commands/conversations/invite.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsInvite(
  client: WebClient,
  args: { channelId: string; userIds: string[] },
): Promise<void> {
  await client.admin.conversations.invite({
    channel_id: args.channelId,
    user_ids: args.userIds,
  });
}
```

```typescript
// src/commands/conversations/create.ts
import type { WebClient } from "@slack/web-api";

interface ConversationsCreateOptions {
  name: string;
  isPrivate: boolean;
  teamId?: string;
  orgWide?: boolean;
  description?: string;
}

export async function executeConversationsCreate(
  client: WebClient,
  opts: ConversationsCreateOptions,
) {
  const params: Record<string, unknown> = {
    name: opts.name,
    is_private: opts.isPrivate,
  };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.orgWide !== undefined) params.org_wide = opts.orgWide;
  if (opts.description !== undefined) params.description = opts.description;

  return await client.admin.conversations.create(params);
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/invite.test.ts tests/commands/conversations/create.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/invite.ts src/commands/conversations/create.ts tests/commands/conversations/invite.test.ts tests/commands/conversations/create.test.ts
git commit -m "feat: add conversations invite/create commands"
```

---

### Task 5: search, lookup (complex query commands with pagination)

**Files:**
- Create: `src/commands/conversations/search.ts`
- Create: `src/commands/conversations/lookup.ts`
- Create: `tests/commands/conversations/search.test.ts`
- Create: `tests/commands/conversations/lookup.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/search.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSearch } from "../../../src/commands/conversations/search";

describe("conversations search", () => {
  test("calls admin.conversations.search with all params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, conversations: [{ id: "C1", name: "general" }] }),
    );
    const client = { admin: { conversations: { search: mockSearch } } } as any;

    const result = await executeConversationsSearch(client, {
      query: "general",
      teamIds: ["T1"],
      sort: "name",
      sortDir: "asc",
      cursor: "abc",
      limit: 10,
    });

    expect(mockSearch).toHaveBeenCalledWith({
      query: "general",
      team_ids: ["T1"],
      sort: "name",
      sort_dir: "asc",
      cursor: "abc",
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });

  test("calls with no params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, conversations: [] }),
    );
    const client = { admin: { conversations: { search: mockSearch } } } as any;

    const result = await executeConversationsSearch(client, {});

    expect(mockSearch).toHaveBeenCalledWith({});
    expect(result).toHaveLength(0);
  });
});
```

```typescript
// tests/commands/conversations/lookup.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsLookup } from "../../../src/commands/conversations/lookup";

describe("conversations lookup", () => {
  test("calls admin.conversations.lookup with correct args", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, channels: [{ id: "C1" }] }),
    );
    const client = { admin: { conversations: { lookup: mockLookup } } } as any;

    const result = await executeConversationsLookup(client, {
      teamIds: ["T1"],
      lastMessageActivityBefore: 1700000000,
      maxMemberCount: 5,
      cursor: "xyz",
      limit: 20,
    });

    expect(mockLookup).toHaveBeenCalledWith({
      team_ids: ["T1"],
      last_message_activity_before: 1700000000,
      max_member_count: 5,
      cursor: "xyz",
      limit: 20,
    });
  });

  test("calls without optional params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, channels: [] }),
    );
    const client = { admin: { conversations: { lookup: mockLookup } } } as any;

    await executeConversationsLookup(client, {
      teamIds: ["T1"],
      lastMessageActivityBefore: 1700000000,
    });

    expect(mockLookup).toHaveBeenCalledWith({
      team_ids: ["T1"],
      last_message_activity_before: 1700000000,
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/search.test.ts tests/commands/conversations/lookup.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement both commands**

```typescript
// src/commands/conversations/search.ts
import type { WebClient } from "@slack/web-api";

interface ConversationsSearchOptions {
  query?: string;
  teamIds?: string[];
  connectedTeamIds?: string[];
  searchChannelTypes?: string[];
  sort?: string;
  sortDir?: string;
  totalCountOnly?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsSearch(
  client: WebClient,
  opts: ConversationsSearchOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.query !== undefined) params.query = opts.query;
  if (opts.teamIds !== undefined) params.team_ids = opts.teamIds;
  if (opts.connectedTeamIds !== undefined) params.connected_team_ids = opts.connectedTeamIds;
  if (opts.searchChannelTypes !== undefined) params.search_channel_types = opts.searchChannelTypes;
  if (opts.sort !== undefined) params.sort = opts.sort;
  if (opts.sortDir !== undefined) params.sort_dir = opts.sortDir;
  if (opts.totalCountOnly !== undefined) params.total_count_only = opts.totalCountOnly;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.search(params);
  return response.conversations ?? [];
}
```

```typescript
// src/commands/conversations/lookup.ts
import type { WebClient } from "@slack/web-api";

interface ConversationsLookupOptions {
  teamIds: string[];
  lastMessageActivityBefore: number;
  maxMemberCount?: number;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsLookup(
  client: WebClient,
  opts: ConversationsLookupOptions,
) {
  const params: Record<string, unknown> = {
    team_ids: opts.teamIds,
    last_message_activity_before: opts.lastMessageActivityBefore,
  };
  if (opts.maxMemberCount !== undefined) params.max_member_count = opts.maxMemberCount;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.lookup(params);
  return response.channels ?? [];
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/search.test.ts tests/commands/conversations/lookup.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/search.ts src/commands/conversations/lookup.ts tests/commands/conversations/search.test.ts tests/commands/conversations/lookup.test.ts
git commit -m "feat: add conversations search/lookup commands"
```

---

### Task 6: bulk-archive, bulk-delete, bulk-move

Bulk operations taking channel ID arrays.

**Files:**
- Create: `src/commands/conversations/bulk-archive.ts`
- Create: `src/commands/conversations/bulk-delete.ts`
- Create: `src/commands/conversations/bulk-move.ts`
- Create: `tests/commands/conversations/bulk-archive.test.ts`
- Create: `tests/commands/conversations/bulk-delete.test.ts`
- Create: `tests/commands/conversations/bulk-move.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/bulk-archive.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsBulkArchive } from "../../../src/commands/conversations/bulk-archive";

describe("conversations bulk-archive", () => {
  test("calls admin.conversations.bulkArchive with correct args", async () => {
    const mockBulkArchive = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { bulkArchive: mockBulkArchive } } } as any;

    await executeConversationsBulkArchive(client, { channelIds: ["C1", "C2", "C3"] });

    expect(mockBulkArchive).toHaveBeenCalledWith({ channel_ids: ["C1", "C2", "C3"] });
  });
});
```

```typescript
// tests/commands/conversations/bulk-delete.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsBulkDelete } from "../../../src/commands/conversations/bulk-delete";

describe("conversations bulk-delete", () => {
  test("calls admin.conversations.bulkDelete with correct args", async () => {
    const mockBulkDelete = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { bulkDelete: mockBulkDelete } } } as any;

    await executeConversationsBulkDelete(client, { channelIds: ["C1", "C2"] });

    expect(mockBulkDelete).toHaveBeenCalledWith({ channel_ids: ["C1", "C2"] });
  });
});
```

```typescript
// tests/commands/conversations/bulk-move.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsBulkMove } from "../../../src/commands/conversations/bulk-move";

describe("conversations bulk-move", () => {
  test("calls admin.conversations.bulkMove with correct args", async () => {
    const mockBulkMove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { conversations: { bulkMove: mockBulkMove } } } as any;

    await executeConversationsBulkMove(client, { channelIds: ["C1", "C2"], targetTeamId: "T999" });

    expect(mockBulkMove).toHaveBeenCalledWith({ channel_ids: ["C1", "C2"], target_team_id: "T999" });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/bulk-archive.test.ts tests/commands/conversations/bulk-delete.test.ts tests/commands/conversations/bulk-move.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement all 3 commands**

```typescript
// src/commands/conversations/bulk-archive.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsBulkArchive(
  client: WebClient,
  args: { channelIds: string[] },
): Promise<void> {
  await client.admin.conversations.bulkArchive({ channel_ids: args.channelIds });
}
```

```typescript
// src/commands/conversations/bulk-delete.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsBulkDelete(
  client: WebClient,
  args: { channelIds: string[] },
): Promise<void> {
  await client.admin.conversations.bulkDelete({ channel_ids: args.channelIds });
}
```

```typescript
// src/commands/conversations/bulk-move.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsBulkMove(
  client: WebClient,
  args: { channelIds: string[]; targetTeamId: string },
): Promise<void> {
  await client.admin.conversations.bulkMove({
    channel_ids: args.channelIds,
    target_team_id: args.targetTeamId,
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/bulk-archive.test.ts tests/commands/conversations/bulk-delete.test.ts tests/commands/conversations/bulk-move.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/bulk-archive.ts src/commands/conversations/bulk-delete.ts src/commands/conversations/bulk-move.ts tests/commands/conversations/bulk-archive.test.ts tests/commands/conversations/bulk-delete.test.ts tests/commands/conversations/bulk-move.test.ts
git commit -m "feat: add conversations bulk-archive/bulk-delete/bulk-move commands"
```

---

### Task 7: get-teams, set-teams (with safety mechanism)

The key feature. `set-teams` calls `getTeams` internally to detect workspace disconnections.

**Files:**
- Create: `src/commands/conversations/get-teams.ts`
- Create: `src/commands/conversations/set-teams.ts`
- Create: `tests/commands/conversations/get-teams.test.ts`
- Create: `tests/commands/conversations/set-teams.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/get-teams.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsGetTeams } from "../../../src/commands/conversations/get-teams";

describe("conversations get-teams", () => {
  test("returns team IDs from API", async () => {
    const mockGetTeams = mock(() =>
      Promise.resolve({ ok: true, teams: ["T1", "T2", "T3"] }),
    );
    const client = { admin: { conversations: { getTeams: mockGetTeams } } } as any;

    const result = await executeConversationsGetTeams(client, { channelId: "C123" });

    expect(mockGetTeams).toHaveBeenCalledWith({ channel_id: "C123" });
    expect(result).toEqual(["T1", "T2", "T3"]);
  });

  test("passes pagination params", async () => {
    const mockGetTeams = mock(() =>
      Promise.resolve({ ok: true, teams: [] }),
    );
    const client = { admin: { conversations: { getTeams: mockGetTeams } } } as any;

    await executeConversationsGetTeams(client, { channelId: "C123", cursor: "abc", limit: 50 });

    expect(mockGetTeams).toHaveBeenCalledWith({ channel_id: "C123", cursor: "abc", limit: 50 });
  });
});
```

```typescript
// tests/commands/conversations/set-teams.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeConversationsSetTeams } from "../../../src/commands/conversations/set-teams";

describe("conversations set-teams", () => {
  test("executes when no workspaces would be disconnected", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, teams: ["T1", "T2"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      targetTeamIds: ["T1", "T2", "T3"],
      allowDisconnect: false,
    });

    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      target_team_ids: ["T1", "T2", "T3"],
    });
  });

  test("throws when workspaces would be disconnected and allowDisconnect is false", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, teams: ["T1", "T2", "T3"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await expect(
      executeConversationsSetTeams(client, {
        channelId: "C123",
        targetTeamIds: ["T1"],
        allowDisconnect: false,
      }),
    ).rejects.toThrow("T2, T3");

    expect(mockSetTeams).not.toHaveBeenCalled();
  });

  test("executes when allowDisconnect is true even with disconnections", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, teams: ["T1", "T2", "T3"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      targetTeamIds: ["T1"],
      allowDisconnect: true,
    });

    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      target_team_ids: ["T1"],
    });
  });

  test("skips disconnect check when org_channel is true", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, teams: ["T1", "T2"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      orgChannel: true,
      allowDisconnect: false,
    });

    expect(mockGetTeams).not.toHaveBeenCalled();
    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      org_channel: true,
    });
  });

  test("passes optional team_id", async () => {
    const mockGetTeams = mock(() => Promise.resolve({ ok: true, teams: ["T1"] }));
    const mockSetTeams = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { getTeams: mockGetTeams, setTeams: mockSetTeams } },
    } as any;

    await executeConversationsSetTeams(client, {
      channelId: "C123",
      targetTeamIds: ["T1", "T2"],
      teamId: "T1",
      allowDisconnect: false,
    });

    expect(mockSetTeams).toHaveBeenCalledWith({
      channel_id: "C123",
      target_team_ids: ["T1", "T2"],
      team_id: "T1",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/get-teams.test.ts tests/commands/conversations/set-teams.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement get-teams**

```typescript
// src/commands/conversations/get-teams.ts
import type { WebClient } from "@slack/web-api";

interface ConversationsGetTeamsOptions {
  channelId: string;
  cursor?: string;
  limit?: number;
}

export async function executeConversationsGetTeams(
  client: WebClient,
  opts: ConversationsGetTeamsOptions,
): Promise<string[]> {
  const params: Record<string, unknown> = { channel_id: opts.channelId };
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.getTeams(params);
  return (response.teams ?? []) as string[];
}
```

**Note:** `response.teams` is typed as `string[]` by the SDK. The `as string[]` is needed only because `response.teams` could be `undefined` and we're falling back to `[]` — the nullish coalescing already handles this but TypeScript needs the hint. If TypeScript infers correctly without the cast, remove it. Check with `bunx tsc --noEmit` — if it fails, use `const teams: string[] = response.teams ?? [];` pattern instead:

```typescript
// Alternative if the cast is needed to avoid `as`:
export async function executeConversationsGetTeams(
  client: WebClient,
  opts: ConversationsGetTeamsOptions,
): Promise<string[]> {
  const params: Record<string, unknown> = { channel_id: opts.channelId };
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.conversations.getTeams(params);
  const teams: string[] = response.teams ?? [];
  return teams;
}
```

- [ ] **Step 4: Implement set-teams with safety mechanism**

```typescript
// src/commands/conversations/set-teams.ts
import type { WebClient } from "@slack/web-api";

interface ConversationsSetTeamsOptions {
  channelId: string;
  targetTeamIds?: string[];
  teamId?: string;
  orgChannel?: boolean;
  allowDisconnect: boolean;
}

export async function executeConversationsSetTeams(
  client: WebClient,
  opts: ConversationsSetTeamsOptions,
): Promise<void> {
  // When making org-wide, skip disconnect check — all workspaces get access
  if (!opts.orgChannel && opts.targetTeamIds !== undefined) {
    const response = await client.admin.conversations.getTeams({ channel_id: opts.channelId });
    const currentTeams: string[] = response.teams ?? [];
    const targetSet = new Set(opts.targetTeamIds);
    const disconnecting = currentTeams.filter((t) => !targetSet.has(t));

    if (disconnecting.length > 0 && !opts.allowDisconnect) {
      throw new Error(
        `The following workspaces would be disconnected: ${disconnecting.join(", ")}. ` +
        `Use --allow-disconnect to confirm.`,
      );
    }
  }

  const params: Record<string, unknown> = { channel_id: opts.channelId };
  if (opts.targetTeamIds !== undefined) params.target_team_ids = opts.targetTeamIds;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.orgChannel !== undefined) params.org_channel = opts.orgChannel;

  await client.admin.conversations.setTeams(params);
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/get-teams.test.ts tests/commands/conversations/set-teams.test.ts`
Expected: PASS (7 tests)

- [ ] **Step 6: Commit**

```bash
git add src/commands/conversations/get-teams.ts src/commands/conversations/set-teams.ts tests/commands/conversations/get-teams.test.ts tests/commands/conversations/set-teams.test.ts
git commit -m "feat: add conversations get-teams/set-teams with disconnect safety check"
```

---

### Task 8: restrict-access (add-group, list-groups, remove-group)

Nested subcommand group, like `teams settings`.

**Files:**
- Create: `src/commands/conversations/restrict-access/add-group.ts`
- Create: `src/commands/conversations/restrict-access/list-groups.ts`
- Create: `src/commands/conversations/restrict-access/remove-group.ts`
- Create: `tests/commands/conversations/restrict-access/add-group.test.ts`
- Create: `tests/commands/conversations/restrict-access/list-groups.test.ts`
- Create: `tests/commands/conversations/restrict-access/remove-group.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// tests/commands/conversations/restrict-access/add-group.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeRestrictAccessAddGroup } from "../../../../src/commands/conversations/restrict-access/add-group";

describe("conversations restrict-access add-group", () => {
  test("calls with all args", async () => {
    const mockAddGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { addGroup: mockAddGroup } } },
    } as any;

    await executeRestrictAccessAddGroup(client, {
      channelId: "C123",
      groupId: "G456",
      teamId: "T789",
    });

    expect(mockAddGroup).toHaveBeenCalledWith({
      channel_id: "C123",
      group_id: "G456",
      team_id: "T789",
    });
  });

  test("calls without optional team_id", async () => {
    const mockAddGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { addGroup: mockAddGroup } } },
    } as any;

    await executeRestrictAccessAddGroup(client, {
      channelId: "C123",
      groupId: "G456",
    });

    expect(mockAddGroup).toHaveBeenCalledWith({
      channel_id: "C123",
      group_id: "G456",
    });
  });
});
```

```typescript
// tests/commands/conversations/restrict-access/list-groups.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeRestrictAccessListGroups } from "../../../../src/commands/conversations/restrict-access/list-groups";

describe("conversations restrict-access list-groups", () => {
  test("calls with correct args", async () => {
    const mockListGroups = mock(() => Promise.resolve({ ok: true, group_ids: ["G1", "G2"] }));
    const client = {
      admin: { conversations: { restrictAccess: { listGroups: mockListGroups } } },
    } as any;

    const result = await executeRestrictAccessListGroups(client, {
      channelId: "C123",
      teamId: "T789",
    });

    expect(mockListGroups).toHaveBeenCalledWith({
      channel_id: "C123",
      team_id: "T789",
    });
  });

  test("calls without optional team_id", async () => {
    const mockListGroups = mock(() => Promise.resolve({ ok: true, group_ids: [] }));
    const client = {
      admin: { conversations: { restrictAccess: { listGroups: mockListGroups } } },
    } as any;

    await executeRestrictAccessListGroups(client, { channelId: "C123" });

    expect(mockListGroups).toHaveBeenCalledWith({ channel_id: "C123" });
  });
});
```

```typescript
// tests/commands/conversations/restrict-access/remove-group.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeRestrictAccessRemoveGroup } from "../../../../src/commands/conversations/restrict-access/remove-group";

describe("conversations restrict-access remove-group", () => {
  test("calls with all args", async () => {
    const mockRemoveGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { removeGroup: mockRemoveGroup } } },
    } as any;

    await executeRestrictAccessRemoveGroup(client, {
      channelId: "C123",
      groupId: "G456",
      teamId: "T789",
    });

    expect(mockRemoveGroup).toHaveBeenCalledWith({
      channel_id: "C123",
      group_id: "G456",
      team_id: "T789",
    });
  });

  test("calls without optional team_id", async () => {
    const mockRemoveGroup = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { conversations: { restrictAccess: { removeGroup: mockRemoveGroup } } },
    } as any;

    await executeRestrictAccessRemoveGroup(client, {
      channelId: "C123",
      groupId: "G456",
    });

    expect(mockRemoveGroup).toHaveBeenCalledWith({
      channel_id: "C123",
      group_id: "G456",
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `bun test tests/commands/conversations/restrict-access/`
Expected: FAIL

- [ ] **Step 3: Implement all 3 commands**

```typescript
// src/commands/conversations/restrict-access/add-group.ts
import type { WebClient } from "@slack/web-api";

export async function executeRestrictAccessAddGroup(
  client: WebClient,
  args: { channelId: string; groupId: string; teamId?: string },
): Promise<void> {
  await client.admin.conversations.restrictAccess.addGroup({
    channel_id: args.channelId,
    group_id: args.groupId,
    ...(args.teamId !== undefined ? { team_id: args.teamId } : {}),
  });
}
```

```typescript
// src/commands/conversations/restrict-access/list-groups.ts
import type { WebClient } from "@slack/web-api";

export async function executeRestrictAccessListGroups(
  client: WebClient,
  args: { channelId: string; teamId?: string },
) {
  return await client.admin.conversations.restrictAccess.listGroups({
    channel_id: args.channelId,
    ...(args.teamId !== undefined ? { team_id: args.teamId } : {}),
  });
}
```

```typescript
// src/commands/conversations/restrict-access/remove-group.ts
import type { WebClient } from "@slack/web-api";

export async function executeRestrictAccessRemoveGroup(
  client: WebClient,
  args: { channelId: string; groupId: string; teamId?: string },
): Promise<void> {
  await client.admin.conversations.restrictAccess.removeGroup({
    channel_id: args.channelId,
    group_id: args.groupId,
    ...(args.teamId !== undefined ? { team_id: args.teamId } : {}),
  });
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `bun test tests/commands/conversations/restrict-access/`
Expected: PASS (6 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/restrict-access/ tests/commands/conversations/restrict-access/
git commit -m "feat: add conversations restrict-access add-group/list-groups/remove-group commands"
```

---

### Task 9: ekm list-original-connected-channel-info

**Files:**
- Create: `src/commands/conversations/ekm/list-original-connected-channel-info.ts`
- Create: `tests/commands/conversations/ekm/list-original-connected-channel-info.test.ts`

- [ ] **Step 1: Write failing test**

```typescript
// tests/commands/conversations/ekm/list-original-connected-channel-info.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeEkmListOriginalConnectedChannelInfo } from "../../../../src/commands/conversations/ekm/list-original-connected-channel-info";

describe("conversations ekm list-original-connected-channel-info", () => {
  test("calls with all params", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [{ id: "C1" }] }));
    const client = {
      admin: { conversations: { ekm: { listOriginalConnectedChannelInfo: mockList } } },
    } as any;

    await executeEkmListOriginalConnectedChannelInfo(client, {
      teamIds: ["T1"],
      channelIds: ["C1", "C2"],
      cursor: "abc",
      limit: 10,
    });

    expect(mockList).toHaveBeenCalledWith({
      team_ids: ["T1"],
      channel_ids: ["C1", "C2"],
      cursor: "abc",
      limit: 10,
    });
  });

  test("calls with no params", async () => {
    const mockList = mock(() => Promise.resolve({ ok: true, channels: [] }));
    const client = {
      admin: { conversations: { ekm: { listOriginalConnectedChannelInfo: mockList } } },
    } as any;

    await executeEkmListOriginalConnectedChannelInfo(client, {});

    expect(mockList).toHaveBeenCalledWith({});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun test tests/commands/conversations/ekm/`
Expected: FAIL

- [ ] **Step 3: Implement**

```typescript
// src/commands/conversations/ekm/list-original-connected-channel-info.ts
import type { WebClient } from "@slack/web-api";

interface EkmListOptions {
  teamIds?: string[];
  channelIds?: string[];
  cursor?: string;
  limit?: number;
}

export async function executeEkmListOriginalConnectedChannelInfo(
  client: WebClient,
  opts: EkmListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamIds !== undefined) params.team_ids = opts.teamIds;
  if (opts.channelIds !== undefined) params.channel_ids = opts.channelIds;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  return await client.admin.conversations.ekm.listOriginalConnectedChannelInfo(params);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun test tests/commands/conversations/ekm/`
Expected: PASS (2 tests)

- [ ] **Step 5: Commit**

```bash
git add src/commands/conversations/ekm/ tests/commands/conversations/ekm/
git commit -m "feat: add conversations ekm list-original-connected-channel-info command"
```

---

### Task 10: Wire up conversations commands in index.ts (part 1 — parser definition)

Add the `conversationsCommands` parser to `index.ts`. This is the largest change — 25 commands worth of optique definitions.

**Files:**
- Modify: `src/index.ts`

**Important:** The existing `rootParser = or(tokenCommands, teamsCommands, usersCommands)` has 3 branches. Adding `conversationsCommands` makes 4. Inside `conversationsCommands`, use nested `or()` with sub-groups to avoid excessive arity. Group by:
- Simple channel ops (archive, unarchive, delete, rename, convert-to-private, convert-to-public)
- Prefs/retention (get-prefs, set-prefs, get-custom-retention, set-custom-retention, remove-custom-retention)
- Teams/sharing (get-teams, set-teams, disconnect-shared)
- Bulk ops (bulk-archive, bulk-delete, bulk-move)
- Other (create, search, invite, lookup)
- Nested: restrict-access, ekm

- [ ] **Step 1: Add all imports at top of index.ts**

Add after the existing user command imports (after line 29):

```typescript
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
```

- [ ] **Step 2: Define conversationsCommands parser**

Add after `usersCommands` (before `rootParser`). Use the same nested `command()` / `or()` pattern:

```typescript
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
    command("remove-custom-retention", object({
      cmd: constant("conversations-remove-custom-retention" as const),
      channelId: option("--channel-id", string({ metavar: "CHANNEL_ID" })),
    })),
    conversationsRestrictAccessCommands,
    conversationsEkmCommands,
  ),
);
```

- [ ] **Step 3: Update rootParser**

Change:
```typescript
const rootParser = or(tokenCommands, teamsCommands, usersCommands);
```
To:
```typescript
const rootParser = or(tokenCommands, teamsCommands, usersCommands, conversationsCommands);
```

- [ ] **Step 4: Verify it compiles**

Run: `bunx tsc --noEmit`
Expected: No errors (switch exhaustiveness will fail — that's expected, we'll add cases in the next task)

Actually, the `default: never` exhaustiveness check will cause a compile error. That's fine — we fix it in the next task.

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: add conversations command parser definitions to index.ts"
```

---

### Task 11: Wire up conversations commands in index.ts (part 2 — switch cases)

Add all 25 `case` branches to the switch statement.

**Files:**
- Modify: `src/index.ts`

- [ ] **Step 1: Add all case branches before the `default` case**

Add before `default: {` in the switch statement. Each case follows the existing pattern: create client, call execute function, format output.

```typescript
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
    const userIds = config.userIds.split(",");
    await executeConversationsInvite(client, { channelId: config.channelId, userIds });
    console.log("Users invited to channel.");
    break;
  }
  case "conversations-lookup": {
    const client = await createSlackClient(store, profileFlag);
    const lookupTeamIds = config.teamIds.split(",");
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
    const archiveChannelIds = config.channelIds.split(",");
    await executeConversationsBulkArchive(client, { channelIds: archiveChannelIds });
    console.log("Channels archived.");
    break;
  }
  case "conversations-bulk-delete": {
    const client = await createSlackClient(store, profileFlag);
    const deleteChannelIds = config.channelIds.split(",");
    await executeConversationsBulkDelete(client, { channelIds: deleteChannelIds });
    console.log("Channels deleted.");
    break;
  }
  case "conversations-bulk-move": {
    const client = await createSlackClient(store, profileFlag);
    const moveChannelIds = config.channelIds.split(",");
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
```

- [ ] **Step 2: Verify it compiles**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run all tests to verify nothing is broken**

Run: `bun test`
Expected: All tests pass

- [ ] **Step 4: Commit**

```bash
git add src/index.ts
git commit -m "feat: wire up all 25 conversations command handlers in index.ts"
```

---

### Task 12: Full test run and final verification

Run all tests and type-check to make sure everything works together.

**Files:** None (verification only)

- [ ] **Step 1: Run full type-check**

Run: `bunx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `bun test`
Expected: All tests pass (existing 49 + new ~36 = ~85 tests)

- [ ] **Step 3: Verify CLI help**

Run: `bun run src/index.ts conversations --help`
Expected: Shows all conversation subcommands

- [ ] **Step 4: Commit (if any fixes were needed)**

Only if fixes were required in previous steps.
