# Admin APIs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 24 CLI commands wrapping `admin.apps`, `admin.inviteRequests`, `admin.workflows`, and `admin.functions` SDK methods.

**Architecture:** Thin SDK wrappers following the existing conversations pattern. Each command is one file with one export. Discriminated unions use `Record<string, unknown>`. Comma-separated CLI strings are split in index.ts switch cases.

**Tech Stack:** Bun, TypeScript, @optique/core, @optique/run, @slack/web-api, bun:test

**Spec:** `docs/superpowers/specs/2026-04-07-admin-apis-design.md`

---

### Task 1: Apps — approve, restrict, clear-resolution, uninstall

**Files:**
- Create: `src/commands/apps/approve.ts`
- Create: `src/commands/apps/restrict.ts`
- Create: `src/commands/apps/clear-resolution.ts`
- Create: `src/commands/apps/uninstall.ts`
- Create: `tests/commands/apps/approve.test.ts`
- Create: `tests/commands/apps/restrict.test.ts`
- Create: `tests/commands/apps/clear-resolution.test.ts`
- Create: `tests/commands/apps/uninstall.test.ts`

- [ ] **Step 1: Create src/commands/apps/approve.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsApproveOptions {
  appId?: string;
  requestId?: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsApprove(
  client: WebClient,
  opts: AppsApproveOptions,
): Promise<void> {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.requestId !== undefined) params.request_id = opts.requestId;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.admin.apps.approve(params);
}
```

- [ ] **Step 2: Create src/commands/apps/restrict.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsRestrictOptions {
  appId?: string;
  requestId?: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsRestrict(
  client: WebClient,
  opts: AppsRestrictOptions,
): Promise<void> {
  const params: Record<string, unknown> = {};
  if (opts.appId !== undefined) params.app_id = opts.appId;
  if (opts.requestId !== undefined) params.request_id = opts.requestId;
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.admin.apps.restrict(params);
}
```

- [ ] **Step 3: Create src/commands/apps/clear-resolution.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsClearResolutionOptions {
  appId: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsClearResolution(
  client: WebClient,
  opts: AppsClearResolutionOptions,
): Promise<void> {
  const params: Record<string, unknown> = { app_id: opts.appId };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.admin.apps.clearResolution(params);
}
```

- [ ] **Step 4: Create src/commands/apps/uninstall.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsUninstallOptions {
  appId: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsUninstall(
  client: WebClient,
  opts: AppsUninstallOptions,
): Promise<void> {
  const params: Record<string, unknown> = { app_id: opts.appId };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.admin.apps.uninstall(params);
}
```

- [ ] **Step 5: Create tests/commands/apps/approve.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsApprove } from "../../../src/commands/apps/approve";

describe("apps approve", () => {
  test("calls admin.apps.approve with app_id and team_id", async () => {
    const mockApprove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { approve: mockApprove } } } as any;

    await executeAppsApprove(client, { appId: "A123", teamId: "T456" });

    expect(mockApprove).toHaveBeenCalledWith({
      app_id: "A123",
      team_id: "T456",
    });
  });

  test("calls with request_id and enterprise_id", async () => {
    const mockApprove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { approve: mockApprove } } } as any;

    await executeAppsApprove(client, { requestId: "R789", enterpriseId: "E012" });

    expect(mockApprove).toHaveBeenCalledWith({
      request_id: "R789",
      enterprise_id: "E012",
    });
  });
});
```

- [ ] **Step 6: Create tests/commands/apps/restrict.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsRestrict } from "../../../src/commands/apps/restrict";

describe("apps restrict", () => {
  test("calls admin.apps.restrict with correct params", async () => {
    const mockRestrict = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { restrict: mockRestrict } } } as any;

    await executeAppsRestrict(client, { appId: "A123", teamId: "T456" });

    expect(mockRestrict).toHaveBeenCalledWith({
      app_id: "A123",
      team_id: "T456",
    });
  });
});
```

- [ ] **Step 7: Create tests/commands/apps/clear-resolution.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsClearResolution } from "../../../src/commands/apps/clear-resolution";

describe("apps clear-resolution", () => {
  test("calls admin.apps.clearResolution with correct params", async () => {
    const mockClearResolution = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { clearResolution: mockClearResolution } } } as any;

    await executeAppsClearResolution(client, { appId: "A123", teamId: "T456" });

    expect(mockClearResolution).toHaveBeenCalledWith({
      app_id: "A123",
      team_id: "T456",
    });
  });
});
```

- [ ] **Step 8: Create tests/commands/apps/uninstall.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsUninstall } from "../../../src/commands/apps/uninstall";

describe("apps uninstall", () => {
  test("calls admin.apps.uninstall with correct params", async () => {
    const mockUninstall = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { uninstall: mockUninstall } } } as any;

    await executeAppsUninstall(client, { appId: "A123", enterpriseId: "E789" });

    expect(mockUninstall).toHaveBeenCalledWith({
      app_id: "A123",
      enterprise_id: "E789",
    });
  });
});
```

- [ ] **Step 9: Run tests**

Run: `bun test tests/commands/apps/approve.test.ts tests/commands/apps/restrict.test.ts tests/commands/apps/clear-resolution.test.ts tests/commands/apps/uninstall.test.ts`
Expected: All 5 tests pass.

- [ ] **Step 10: Commit**

```bash
git add src/commands/apps/approve.ts src/commands/apps/restrict.ts src/commands/apps/clear-resolution.ts src/commands/apps/uninstall.ts tests/commands/apps/approve.test.ts tests/commands/apps/restrict.test.ts tests/commands/apps/clear-resolution.test.ts tests/commands/apps/uninstall.test.ts
git commit -m "feat: add apps approve, restrict, clear-resolution, uninstall commands"
```

---

### Task 2: Apps — activities/list, approved/list, requests/cancel, requests/list, restricted/list

**Files:**
- Create: `src/commands/apps/activities/list.ts`
- Create: `src/commands/apps/approved/list.ts`
- Create: `src/commands/apps/requests/cancel.ts`
- Create: `src/commands/apps/requests/list.ts`
- Create: `src/commands/apps/restricted/list.ts`
- Create: `tests/commands/apps/activities/list.test.ts`
- Create: `tests/commands/apps/approved/list.test.ts`
- Create: `tests/commands/apps/requests/cancel.test.ts`
- Create: `tests/commands/apps/requests/list.test.ts`
- Create: `tests/commands/apps/restricted/list.test.ts`

- [ ] **Step 1: Create src/commands/apps/activities/list.ts**

```typescript
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
```

- [ ] **Step 2: Create src/commands/apps/approved/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsApprovedListOptions {
  teamId?: string;
  enterpriseId?: string;
  certified?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeAppsApprovedList(
  client: WebClient,
  opts: AppsApprovedListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  if (opts.certified !== undefined) params.certified = opts.certified;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.apps.approved.list(params);
  return response.approved_apps ?? [];
}
```

- [ ] **Step 3: Create src/commands/apps/requests/cancel.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsRequestsCancelOptions {
  requestId: string;
  teamId?: string;
  enterpriseId?: string;
}

export async function executeAppsRequestsCancel(
  client: WebClient,
  opts: AppsRequestsCancelOptions,
): Promise<void> {
  const params: Record<string, unknown> = { request_id: opts.requestId };
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  await client.admin.apps.requests.cancel(params);
}
```

- [ ] **Step 4: Create src/commands/apps/requests/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsRequestsListOptions {
  teamId?: string;
  enterpriseId?: string;
  certified?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeAppsRequestsList(
  client: WebClient,
  opts: AppsRequestsListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  if (opts.certified !== undefined) params.certified = opts.certified;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.apps.requests.list(params);
  return response.app_requests ?? [];
}
```

- [ ] **Step 5: Create src/commands/apps/restricted/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsRestrictedListOptions {
  teamId?: string;
  enterpriseId?: string;
  certified?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeAppsRestrictedList(
  client: WebClient,
  opts: AppsRestrictedListOptions,
) {
  const params: Record<string, unknown> = {};
  if (opts.teamId !== undefined) params.team_id = opts.teamId;
  if (opts.enterpriseId !== undefined) params.enterprise_id = opts.enterpriseId;
  if (opts.certified !== undefined) params.certified = opts.certified;
  if (opts.cursor !== undefined) params.cursor = opts.cursor;
  if (opts.limit !== undefined) params.limit = opts.limit;

  const response = await client.admin.apps.restricted.list(params);
  return response.restricted_apps ?? [];
}
```

- [ ] **Step 6: Create tests/commands/apps/activities/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsActivitiesList } from "../../../../src/commands/apps/activities/list";

describe("apps activities list", () => {
  test("calls admin.apps.activities.list with params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, activities: [{ app_id: "A1", trace_id: "t1" }] }),
    );
    const client = { admin: { apps: { activities: { list: mockList } } } } as any;

    const result = await executeAppsActivitiesList(client, {
      appId: "A1",
      minLogLevel: "warn",
      limit: 10,
    });

    expect(mockList).toHaveBeenCalledWith({
      app_id: "A1",
      min_log_level: "warn",
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });

  test("calls with no params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, activities: [] }),
    );
    const client = { admin: { apps: { activities: { list: mockList } } } } as any;

    const result = await executeAppsActivitiesList(client, {});

    expect(mockList).toHaveBeenCalledWith({});
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 7: Create tests/commands/apps/approved/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsApprovedList } from "../../../../src/commands/apps/approved/list";

describe("apps approved list", () => {
  test("calls admin.apps.approved.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, approved_apps: [{ app: { id: "A1" } }] }),
    );
    const client = { admin: { apps: { approved: { list: mockList } } } } as any;

    const result = await executeAppsApprovedList(client, { teamId: "T1", limit: 5 });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1", limit: 5 });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 8: Create tests/commands/apps/requests/cancel.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsRequestsCancel } from "../../../../src/commands/apps/requests/cancel";

describe("apps requests cancel", () => {
  test("calls admin.apps.requests.cancel with correct params", async () => {
    const mockCancel = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { requests: { cancel: mockCancel } } } } as any;

    await executeAppsRequestsCancel(client, { requestId: "R1", teamId: "T1" });

    expect(mockCancel).toHaveBeenCalledWith({ request_id: "R1", team_id: "T1" });
  });
});
```

- [ ] **Step 9: Create tests/commands/apps/requests/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsRequestsList } from "../../../../src/commands/apps/requests/list";

describe("apps requests list", () => {
  test("calls admin.apps.requests.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, app_requests: [{ id: "R1" }] }),
    );
    const client = { admin: { apps: { requests: { list: mockList } } } } as any;

    const result = await executeAppsRequestsList(client, { teamId: "T1" });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1" });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 10: Create tests/commands/apps/restricted/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsRestrictedList } from "../../../../src/commands/apps/restricted/list";

describe("apps restricted list", () => {
  test("calls admin.apps.restricted.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, restricted_apps: [{ app: { id: "A1" } }] }),
    );
    const client = { admin: { apps: { restricted: { list: mockList } } } } as any;

    const result = await executeAppsRestrictedList(client, { enterpriseId: "E1" });

    expect(mockList).toHaveBeenCalledWith({ enterprise_id: "E1" });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 11: Run tests**

Run: `bun test tests/commands/apps/activities/ tests/commands/apps/approved/ tests/commands/apps/requests/ tests/commands/apps/restricted/`
Expected: All 6 tests pass.

- [ ] **Step 12: Commit**

```bash
git add src/commands/apps/activities/ src/commands/apps/approved/ src/commands/apps/requests/ src/commands/apps/restricted/ tests/commands/apps/activities/ tests/commands/apps/approved/ tests/commands/apps/requests/ tests/commands/apps/restricted/
git commit -m "feat: add apps activities, approved, requests, restricted list commands"
```

---

### Task 3: Apps — config/lookup, config/set

**Files:**
- Create: `src/commands/apps/config/lookup.ts`
- Create: `src/commands/apps/config/set.ts`
- Create: `tests/commands/apps/config/lookup.test.ts`
- Create: `tests/commands/apps/config/set.test.ts`

- [ ] **Step 1: Create src/commands/apps/config/lookup.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeAppsConfigLookup(
  client: WebClient,
  args: { appIds: string[] },
) {
  const response = await client.admin.apps.config.lookup({ app_ids: args.appIds });
  return response.configs ?? [];
}
```

- [ ] **Step 2: Create src/commands/apps/config/set.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface AppsConfigSetOptions {
  appId: string;
  domainRestrictions?: { urls?: string[]; emails?: string[] };
  workflowAuthStrategy?: string;
}

export async function executeAppsConfigSet(
  client: WebClient,
  opts: AppsConfigSetOptions,
): Promise<void> {
  const params: Record<string, unknown> = { app_id: opts.appId };
  if (opts.domainRestrictions !== undefined) params.domain_restrictions = opts.domainRestrictions;
  if (opts.workflowAuthStrategy !== undefined) params.workflow_auth_strategy = opts.workflowAuthStrategy;
  await client.admin.apps.config.set(params);
}
```

- [ ] **Step 3: Create tests/commands/apps/config/lookup.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsConfigLookup } from "../../../../src/commands/apps/config/lookup";

describe("apps config lookup", () => {
  test("calls admin.apps.config.lookup with correct params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, configs: [{ app_id: "A1", domain_restrictions: {} }] }),
    );
    const client = { admin: { apps: { config: { lookup: mockLookup } } } } as any;

    const result = await executeAppsConfigLookup(client, { appIds: ["A1", "A2"] });

    expect(mockLookup).toHaveBeenCalledWith({ app_ids: ["A1", "A2"] });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 4: Create tests/commands/apps/config/set.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeAppsConfigSet } from "../../../../src/commands/apps/config/set";

describe("apps config set", () => {
  test("calls admin.apps.config.set with all params", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { config: { set: mockSet } } } } as any;

    await executeAppsConfigSet(client, {
      appId: "A1",
      domainRestrictions: { urls: ["https://example.com"] },
      workflowAuthStrategy: "end_user_only",
    });

    expect(mockSet).toHaveBeenCalledWith({
      app_id: "A1",
      domain_restrictions: { urls: ["https://example.com"] },
      workflow_auth_strategy: "end_user_only",
    });
  });

  test("calls with only app_id", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { apps: { config: { set: mockSet } } } } as any;

    await executeAppsConfigSet(client, { appId: "A1" });

    expect(mockSet).toHaveBeenCalledWith({ app_id: "A1" });
  });
});
```

- [ ] **Step 5: Run tests**

Run: `bun test tests/commands/apps/config/`
Expected: All 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/commands/apps/config/ tests/commands/apps/config/
git commit -m "feat: add apps config lookup and set commands"
```

---

### Task 4: Invite Requests — all 5 commands

**Files:**
- Create: `src/commands/invite-requests/approve.ts`
- Create: `src/commands/invite-requests/deny.ts`
- Create: `src/commands/invite-requests/list.ts`
- Create: `src/commands/invite-requests/approved/list.ts`
- Create: `src/commands/invite-requests/denied/list.ts`
- Create: `tests/commands/invite-requests/approve.test.ts`
- Create: `tests/commands/invite-requests/deny.test.ts`
- Create: `tests/commands/invite-requests/list.test.ts`
- Create: `tests/commands/invite-requests/approved/list.test.ts`
- Create: `tests/commands/invite-requests/denied/list.test.ts`

- [ ] **Step 1: Create src/commands/invite-requests/approve.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeInviteRequestsApprove(
  client: WebClient,
  args: { inviteRequestId: string; teamId: string },
): Promise<void> {
  await client.admin.inviteRequests.approve({
    invite_request_id: args.inviteRequestId,
    team_id: args.teamId,
  });
}
```

- [ ] **Step 2: Create src/commands/invite-requests/deny.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeInviteRequestsDeny(
  client: WebClient,
  args: { inviteRequestId: string; teamId: string },
): Promise<void> {
  await client.admin.inviteRequests.deny({
    invite_request_id: args.inviteRequestId,
    team_id: args.teamId,
  });
}
```

- [ ] **Step 3: Create src/commands/invite-requests/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface InviteRequestsListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeInviteRequestsList(
  client: WebClient,
  opts: InviteRequestsListOptions,
) {
  const response = await client.admin.inviteRequests.list({
    team_id: opts.teamId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.invite_requests ?? [];
}
```

- [ ] **Step 4: Create src/commands/invite-requests/approved/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface InviteRequestsApprovedListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeInviteRequestsApprovedList(
  client: WebClient,
  opts: InviteRequestsApprovedListOptions,
) {
  const response = await client.admin.inviteRequests.approved.list({
    team_id: opts.teamId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.approved_requests ?? [];
}
```

- [ ] **Step 5: Create src/commands/invite-requests/denied/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface InviteRequestsDeniedListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeInviteRequestsDeniedList(
  client: WebClient,
  opts: InviteRequestsDeniedListOptions,
) {
  const response = await client.admin.inviteRequests.denied.list({
    team_id: opts.teamId,
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.denied_requests ?? [];
}
```

- [ ] **Step 6: Create tests/commands/invite-requests/approve.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsApprove } from "../../../src/commands/invite-requests/approve";

describe("invite-requests approve", () => {
  test("calls admin.inviteRequests.approve with correct params", async () => {
    const mockApprove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { inviteRequests: { approve: mockApprove } } } as any;

    await executeInviteRequestsApprove(client, { inviteRequestId: "IR1", teamId: "T1" });

    expect(mockApprove).toHaveBeenCalledWith({
      invite_request_id: "IR1",
      team_id: "T1",
    });
  });
});
```

- [ ] **Step 7: Create tests/commands/invite-requests/deny.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsDeny } from "../../../src/commands/invite-requests/deny";

describe("invite-requests deny", () => {
  test("calls admin.inviteRequests.deny with correct params", async () => {
    const mockDeny = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { inviteRequests: { deny: mockDeny } } } as any;

    await executeInviteRequestsDeny(client, { inviteRequestId: "IR1", teamId: "T1" });

    expect(mockDeny).toHaveBeenCalledWith({
      invite_request_id: "IR1",
      team_id: "T1",
    });
  });
});
```

- [ ] **Step 8: Create tests/commands/invite-requests/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsList } from "../../../src/commands/invite-requests/list";

describe("invite-requests list", () => {
  test("calls admin.inviteRequests.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, invite_requests: [{ id: "IR1" }] }),
    );
    const client = { admin: { inviteRequests: { list: mockList } } } as any;

    const result = await executeInviteRequestsList(client, { teamId: "T1", limit: 10 });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1", limit: 10 });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 9: Create tests/commands/invite-requests/approved/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsApprovedList } from "../../../../src/commands/invite-requests/approved/list";

describe("invite-requests approved list", () => {
  test("calls admin.inviteRequests.approved.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, approved_requests: [{ id: "IR1" }] }),
    );
    const client = { admin: { inviteRequests: { approved: { list: mockList } } } } as any;

    const result = await executeInviteRequestsApprovedList(client, { teamId: "T1" });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1" });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 10: Create tests/commands/invite-requests/denied/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeInviteRequestsDeniedList } from "../../../../src/commands/invite-requests/denied/list";

describe("invite-requests denied list", () => {
  test("calls admin.inviteRequests.denied.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, denied_requests: [{ id: "IR1" }] }),
    );
    const client = { admin: { inviteRequests: { denied: { list: mockList } } } } as any;

    const result = await executeInviteRequestsDeniedList(client, { teamId: "T1" });

    expect(mockList).toHaveBeenCalledWith({ team_id: "T1" });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 11: Run tests**

Run: `bun test tests/commands/invite-requests/`
Expected: All 5 tests pass.

- [ ] **Step 12: Commit**

```bash
git add src/commands/invite-requests/ tests/commands/invite-requests/
git commit -m "feat: add invite-requests approve, deny, list, approved/list, denied/list commands"
```

---

### Task 5: Workflows — search, unpublish

**Files:**
- Create: `src/commands/workflows/search.ts`
- Create: `src/commands/workflows/unpublish.ts`
- Create: `tests/commands/workflows/search.test.ts`
- Create: `tests/commands/workflows/unpublish.test.ts`

- [ ] **Step 1: Create src/commands/workflows/search.ts**

```typescript
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
```

- [ ] **Step 2: Create src/commands/workflows/unpublish.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeWorkflowsUnpublish(
  client: WebClient,
  args: { workflowIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.workflows.unpublish({ workflow_ids: args.workflowIds });
}
```

- [ ] **Step 3: Create tests/commands/workflows/search.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsSearch } from "../../../src/commands/workflows/search";

describe("workflows search", () => {
  test("calls admin.workflows.search with params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, workflows: [{ id: "W1", title: "My Workflow" }] }),
    );
    const client = { admin: { workflows: { search: mockSearch } } } as any;

    const result = await executeWorkflowsSearch(client, {
      query: "test",
      source: "workflow_builder",
      limit: 5,
    });

    expect(mockSearch).toHaveBeenCalledWith({
      query: "test",
      source: "workflow_builder",
      limit: 5,
    });
    expect(result).toHaveLength(1);
  });

  test("calls with no params", async () => {
    const mockSearch = mock(() =>
      Promise.resolve({ ok: true, workflows: [] }),
    );
    const client = { admin: { workflows: { search: mockSearch } } } as any;

    const result = await executeWorkflowsSearch(client, {});

    expect(mockSearch).toHaveBeenCalledWith({});
    expect(result).toHaveLength(0);
  });
});
```

- [ ] **Step 4: Create tests/commands/workflows/unpublish.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsUnpublish } from "../../../src/commands/workflows/unpublish";

describe("workflows unpublish", () => {
  test("calls admin.workflows.unpublish with correct params", async () => {
    const mockUnpublish = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { workflows: { unpublish: mockUnpublish } } } as any;

    await executeWorkflowsUnpublish(client, { workflowIds: ["W1", "W2"] });

    expect(mockUnpublish).toHaveBeenCalledWith({ workflow_ids: ["W1", "W2"] });
  });
});
```

- [ ] **Step 5: Run tests**

Run: `bun test tests/commands/workflows/search.test.ts tests/commands/workflows/unpublish.test.ts`
Expected: All 3 tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/commands/workflows/search.ts src/commands/workflows/unpublish.ts tests/commands/workflows/search.test.ts tests/commands/workflows/unpublish.test.ts
git commit -m "feat: add workflows search and unpublish commands"
```

---

### Task 6: Workflows — permissions/lookup, collaborators/add, collaborators/remove

**Files:**
- Create: `src/commands/workflows/permissions/lookup.ts`
- Create: `src/commands/workflows/collaborators/add.ts`
- Create: `src/commands/workflows/collaborators/remove.ts`
- Create: `tests/commands/workflows/permissions/lookup.test.ts`
- Create: `tests/commands/workflows/collaborators/add.test.ts`
- Create: `tests/commands/workflows/collaborators/remove.test.ts`

- [ ] **Step 1: Create src/commands/workflows/permissions/lookup.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface WorkflowsPermissionsLookupOptions {
  workflowIds: [string, ...string[]];
  maxWorkflowTriggers?: number;
}

export async function executeWorkflowsPermissionsLookup(
  client: WebClient,
  opts: WorkflowsPermissionsLookupOptions,
) {
  const response = await client.admin.workflows.permissions.lookup({
    workflow_ids: opts.workflowIds,
    ...(opts.maxWorkflowTriggers !== undefined ? { max_workflow_triggers: opts.maxWorkflowTriggers } : {}),
  });
  return response.permissions ?? [];
}
```

- [ ] **Step 2: Create src/commands/workflows/collaborators/add.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeWorkflowsCollaboratorsAdd(
  client: WebClient,
  args: { collaboratorIds: [string, ...string[]]; workflowIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.workflows.collaborators.add({
    collaborator_ids: args.collaboratorIds,
    workflow_ids: args.workflowIds,
  });
}
```

- [ ] **Step 3: Create src/commands/workflows/collaborators/remove.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeWorkflowsCollaboratorsRemove(
  client: WebClient,
  args: { collaboratorIds: [string, ...string[]]; workflowIds: [string, ...string[]] },
): Promise<void> {
  await client.admin.workflows.collaborators.remove({
    collaborator_ids: args.collaboratorIds,
    workflow_ids: args.workflowIds,
  });
}
```

- [ ] **Step 4: Create tests/commands/workflows/permissions/lookup.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsPermissionsLookup } from "../../../../src/commands/workflows/permissions/lookup";

describe("workflows permissions lookup", () => {
  test("calls admin.workflows.permissions.lookup with correct params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, permissions: [{ workflow_id: "W1" }] }),
    );
    const client = { admin: { workflows: { permissions: { lookup: mockLookup } } } } as any;

    const result = await executeWorkflowsPermissionsLookup(client, {
      workflowIds: ["W1"],
      maxWorkflowTriggers: 5,
    });

    expect(mockLookup).toHaveBeenCalledWith({
      workflow_ids: ["W1"],
      max_workflow_triggers: 5,
    });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 5: Create tests/commands/workflows/collaborators/add.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsCollaboratorsAdd } from "../../../../src/commands/workflows/collaborators/add";

describe("workflows collaborators add", () => {
  test("calls admin.workflows.collaborators.add with correct params", async () => {
    const mockAdd = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { workflows: { collaborators: { add: mockAdd } } } } as any;

    await executeWorkflowsCollaboratorsAdd(client, {
      collaboratorIds: ["U1", "U2"],
      workflowIds: ["W1"],
    });

    expect(mockAdd).toHaveBeenCalledWith({
      collaborator_ids: ["U1", "U2"],
      workflow_ids: ["W1"],
    });
  });
});
```

- [ ] **Step 6: Create tests/commands/workflows/collaborators/remove.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeWorkflowsCollaboratorsRemove } from "../../../../src/commands/workflows/collaborators/remove";

describe("workflows collaborators remove", () => {
  test("calls admin.workflows.collaborators.remove with correct params", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { workflows: { collaborators: { remove: mockRemove } } } } as any;

    await executeWorkflowsCollaboratorsRemove(client, {
      collaboratorIds: ["U1"],
      workflowIds: ["W1", "W2"],
    });

    expect(mockRemove).toHaveBeenCalledWith({
      collaborator_ids: ["U1"],
      workflow_ids: ["W1", "W2"],
    });
  });
});
```

- [ ] **Step 7: Run tests**

Run: `bun test tests/commands/workflows/permissions/ tests/commands/workflows/collaborators/`
Expected: All 3 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/commands/workflows/permissions/ src/commands/workflows/collaborators/ tests/commands/workflows/permissions/ tests/commands/workflows/collaborators/
git commit -m "feat: add workflows permissions lookup and collaborators add/remove commands"
```

---

### Task 7: Functions — list, permissions/lookup, permissions/set

**Files:**
- Create: `src/commands/functions/list.ts`
- Create: `src/commands/functions/permissions/lookup.ts`
- Create: `src/commands/functions/permissions/set.ts`
- Create: `tests/commands/functions/list.test.ts`
- Create: `tests/commands/functions/permissions/lookup.test.ts`
- Create: `tests/commands/functions/permissions/set.test.ts`

- [ ] **Step 1: Create src/commands/functions/list.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface FunctionsListOptions {
  appIds: string[];
  teamId?: string;
  cursor?: string;
  limit?: number;
}

export async function executeFunctionsList(
  client: WebClient,
  opts: FunctionsListOptions,
) {
  const response = await client.admin.functions.list({
    app_ids: opts.appIds,
    ...(opts.teamId !== undefined ? { team_id: opts.teamId } : {}),
    ...(opts.cursor !== undefined ? { cursor: opts.cursor } : {}),
    ...(opts.limit !== undefined ? { limit: opts.limit } : {}),
  });
  return response.functions ?? [];
}
```

- [ ] **Step 2: Create src/commands/functions/permissions/lookup.ts**

```typescript
import type { WebClient } from "@slack/web-api";

export async function executeFunctionsPermissionsLookup(
  client: WebClient,
  args: { functionIds: [string, ...string[]] },
) {
  const response = await client.admin.functions.permissions.lookup({
    function_ids: args.functionIds,
  });
  return response.permissions ?? {};
}
```

- [ ] **Step 3: Create src/commands/functions/permissions/set.ts**

```typescript
import type { WebClient } from "@slack/web-api";

interface FunctionsPermissionsSetOptions {
  functionId: string;
  visibility: string;
  userIds?: [string, ...string[]];
}

export async function executeFunctionsPermissionsSet(
  client: WebClient,
  opts: FunctionsPermissionsSetOptions,
): Promise<void> {
  const params: Record<string, unknown> = {
    function_id: opts.functionId,
    visibility: opts.visibility,
  };
  if (opts.userIds !== undefined) params.user_ids = opts.userIds;
  await client.admin.functions.permissions.set(params);
}
```

- [ ] **Step 4: Create tests/commands/functions/list.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsList } from "../../../src/commands/functions/list";

describe("functions list", () => {
  test("calls admin.functions.list with correct params", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, functions: [{ id: "Fn1", title: "My Function" }] }),
    );
    const client = { admin: { functions: { list: mockList } } } as any;

    const result = await executeFunctionsList(client, {
      appIds: ["A1"],
      teamId: "T1",
      limit: 10,
    });

    expect(mockList).toHaveBeenCalledWith({
      app_ids: ["A1"],
      team_id: "T1",
      limit: 10,
    });
    expect(result).toHaveLength(1);
  });
});
```

- [ ] **Step 5: Create tests/commands/functions/permissions/lookup.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsPermissionsLookup } from "../../../../src/commands/functions/permissions/lookup";

describe("functions permissions lookup", () => {
  test("calls admin.functions.permissions.lookup with correct params", async () => {
    const mockLookup = mock(() =>
      Promise.resolve({ ok: true, permissions: { Fn1: { type: "everyone" } } }),
    );
    const client = { admin: { functions: { permissions: { lookup: mockLookup } } } } as any;

    const result = await executeFunctionsPermissionsLookup(client, { functionIds: ["Fn1"] });

    expect(mockLookup).toHaveBeenCalledWith({ function_ids: ["Fn1"] });
    expect(result).toEqual({ Fn1: { type: "everyone" } });
  });
});
```

- [ ] **Step 6: Create tests/commands/functions/permissions/set.test.ts**

```typescript
import { describe, expect, test, mock } from "bun:test";
import { executeFunctionsPermissionsSet } from "../../../../src/commands/functions/permissions/set";

describe("functions permissions set", () => {
  test("calls admin.functions.permissions.set with all params", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { functions: { permissions: { set: mockSet } } } } as any;

    await executeFunctionsPermissionsSet(client, {
      functionId: "Fn1",
      visibility: "named_entities",
      userIds: ["U1", "U2"],
    });

    expect(mockSet).toHaveBeenCalledWith({
      function_id: "Fn1",
      visibility: "named_entities",
      user_ids: ["U1", "U2"],
    });
  });

  test("calls without user_ids", async () => {
    const mockSet = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { functions: { permissions: { set: mockSet } } } } as any;

    await executeFunctionsPermissionsSet(client, {
      functionId: "Fn1",
      visibility: "everyone",
    });

    expect(mockSet).toHaveBeenCalledWith({
      function_id: "Fn1",
      visibility: "everyone",
    });
  });
});
```

- [ ] **Step 7: Run tests**

Run: `bun test tests/commands/functions/`
Expected: All 4 tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/commands/functions/ tests/commands/functions/
git commit -m "feat: add functions list, permissions lookup/set commands"
```

---

### Task 8: index.ts — imports and parser definitions for all 4 groups

**Files:**
- Modify: `src/index.ts`

Reference the existing patterns in `src/index.ts`:
- Imports: lines 1-56
- Parser definitions: lines 146-458 (tokenCommands, teamsCommands, usersCommands, conversationsCommands)

- [ ] **Step 1: Add imports after line 55 (after ekm import)**

Add the following imports after the existing conversation imports:

```typescript
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
```

- [ ] **Step 2: Add apps parser definitions**

Add after the `conversationsCommands` definition (after line 452) and before the Root parser section:

```typescript
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
```

- [ ] **Step 3: Add invite-requests parser definitions**

```typescript
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
```

- [ ] **Step 4: Add workflows parser definitions**

```typescript
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
```

- [ ] **Step 5: Add functions parser definitions**

```typescript
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
```

- [ ] **Step 6: Update rootParser**

Replace the current rootParser line:

```typescript
const rootParser = or(tokenCommands, teamsCommands, usersCommands, conversationsCommands);
```

With:

```typescript
const rootParser = or(
  or(tokenCommands, teamsCommands, usersCommands),
  or(conversationsCommands, appsCommands),
  or(inviteRequestsCommands, workflowsCommands, functionsCommands),
);
```

- [ ] **Step 7: Commit**

```bash
git add src/index.ts
git commit -m "feat: add parser definitions for apps, invite-requests, workflows, functions"
```

---

### Task 9: index.ts — switch cases for all 24 commands

**Files:**
- Modify: `src/index.ts`

Add cases before the `default` case (before line 895). Use the existing pattern: create client → call execute → format output.

- [ ] **Step 1: Add apps switch cases**

Add before the `default:` case:

```typescript
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
```

- [ ] **Step 2: Add invite-requests switch cases**

```typescript
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
```

- [ ] **Step 3: Add workflows switch cases**

```typescript
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
```

- [ ] **Step 4: Add functions switch cases**

```typescript
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
```

- [ ] **Step 5: Commit**

```bash
git add src/index.ts
git commit -m "feat: add switch cases for all 24 new admin API commands"
```

---

### Task 10: Full test suite run and type check

**Files:** None (verification only)

- [ ] **Step 1: Run type check**

Run: `bun run lint`
Expected: No errors.

- [ ] **Step 2: Run full test suite**

Run: `bun test`
Expected: All tests pass (existing + 24 new command tests).

- [ ] **Step 3: Fix any issues found**

If type errors occur, they will likely be:
- SDK method argument type mismatches — use `Record<string, unknown>` pattern
- Non-empty array type `[string, ...string[]]` needed where `string[]` was used

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve type errors and test failures for admin API commands"
```

---

### Task 11: Verify CLI integration

**Files:** None (manual verification)

- [ ] **Step 1: Verify help output**

Run: `sladm apps --help`
Expected: Shows subcommands: approve, restrict, clear-resolution, uninstall, activities, approved, requests, restricted, config

Run: `sladm invite-requests --help`
Expected: Shows subcommands: approve, deny, list, approved, denied

Run: `sladm workflows --help`
Expected: Shows subcommands: search, unpublish, permissions, collaborators

Run: `sladm functions --help`
Expected: Shows subcommands: list, permissions

- [ ] **Step 2: Run all tests one final time**

Run: `bun test`
Expected: All tests pass.
