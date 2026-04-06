# sladm Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Slack Admin API (admin.teams.*, admin.users.*) を操作する CLI ツール `sladm` を Bun + TypeScript で構築する。

**Architecture:** optique で CLI コマンドを定義し、@slack/web-api でSlack APIを呼び出す。認証はプロファイルベースで Bun.secrets にトークン保存。出力は JSON/テーブル/TSV の3形式対応。

**Tech Stack:** Bun, TypeScript, optique (@optique/core, @optique/run), @slack/web-api, bun:test

---

## File Structure

```
slack-admin-cli/
├── src/
│   ├── index.ts                 # エントリポイント、全コマンドを or() で結合し run()
│   ├── commands/
│   │   ├── teams/
│   │   │   ├── create.ts        # sladm teams create
│   │   │   ├── list.ts          # sladm teams list
│   │   │   ├── admins-list.ts   # sladm teams admins list
│   │   │   ├── owners-list.ts   # sladm teams owners list
│   │   │   └── settings/
│   │   │       ├── info.ts      # sladm teams settings info
│   │   │       ├── set-name.ts
│   │   │       ├── set-icon.ts
│   │   │       ├── set-description.ts
│   │   │       └── set-discoverability.ts
│   │   ├── users/
│   │   │   ├── list.ts          # sladm users list
│   │   │   ├── invite.ts        # sladm users invite
│   │   │   ├── assign.ts        # sladm users assign
│   │   │   ├── remove.ts        # sladm users remove
│   │   │   ├── set-admin.ts
│   │   │   ├── set-owner.ts
│   │   │   ├── set-regular.ts
│   │   │   └── session-reset.ts
│   │   └── token/
│   │       ├── add.ts           # sladm token add
│   │       ├── list.ts          # sladm token list
│   │       ├── remove.ts        # sladm token remove
│   │       └── status.ts        # sladm token status
│   ├── client.ts                # プロファイル→WebClient 生成
│   ├── config.ts                # プロファイル管理 (config.json + Bun.secrets)
│   └── output.ts                # JSON / テーブル / TSV フォーマッタ
├── tests/
│   ├── config.test.ts
│   ├── output.test.ts
│   ├── client.test.ts
│   ├── commands/
│   │   ├── token/
│   │   │   ├── add.test.ts
│   │   │   ├── list.test.ts
│   │   │   ├── remove.test.ts
│   │   │   └── status.test.ts
│   │   ├── teams/
│   │   │   ├── create.test.ts
│   │   │   ├── list.test.ts
│   │   │   ├── admins-list.test.ts
│   │   │   ├── owners-list.test.ts
│   │   │   └── settings/
│   │   │       ├── info.test.ts
│   │   │       ├── set-name.test.ts
│   │   │       ├── set-icon.test.ts
│   │   │       ├── set-description.test.ts
│   │   │       └── set-discoverability.test.ts
│   │   └── users/
│   │       ├── list.test.ts
│   │       ├── invite.test.ts
│   │       ├── assign.test.ts
│   │       ├── remove.test.ts
│   │       ├── set-admin.test.ts
│   │       ├── set-owner.test.ts
│   │       ├── set-regular.test.ts
│   │       └── session-reset.test.ts
├── package.json
├── tsconfig.json
└── docs/
```

---

### Task 1: プロジェクト初期化

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`

- [ ] **Step 1: package.json を作成**

```json
{
  "name": "sladm",
  "version": "0.1.0",
  "type": "module",
  "bin": {
    "sladm": "./src/index.ts"
  },
  "scripts": {
    "dev": "bun run src/index.ts",
    "test": "bun test",
    "lint": "bunx tsc --noEmit"
  },
  "dependencies": {
    "@optique/core": "latest",
    "@optique/run": "latest",
    "@slack/web-api": "latest"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "latest"
  }
}
```

- [ ] **Step 2: tsconfig.json を作成**

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src",
    "types": ["bun"]
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: 依存をインストール**

Run: `bun install`
Expected: node_modules が生成され、全依存がインストールされる

- [ ] **Step 4: TypeScript コンパイルチェック**

Run: `bunx tsc --noEmit`
Expected: エラーなし（ソースファイルがまだないので何も出ない）

- [ ] **Step 5: コミット**

```bash
git add package.json tsconfig.json bun.lock
git commit -m "chore: initialize project with bun, optique, slack web-api"
```

---

### Task 2: 出力フォーマッタ (output.ts)

**Files:**
- Create: `src/output.ts`
- Create: `tests/output.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// tests/output.test.ts
import { describe, expect, test } from "bun:test";
import { formatJson, formatTable, formatPlain } from "../src/output";

const sampleData = [
  { id: "T001", name: "workspace-1", domain: "ws1" },
  { id: "T002", name: "workspace-2", domain: "ws2" },
];

describe("formatJson", () => {
  test("outputs valid JSON", () => {
    const result = formatJson(sampleData);
    expect(JSON.parse(result)).toEqual(sampleData);
  });

  test("pretty prints with 2-space indent", () => {
    const result = formatJson(sampleData);
    expect(result).toBe(JSON.stringify(sampleData, null, 2));
  });
});

describe("formatTable", () => {
  test("renders header and rows", () => {
    const result = formatTable(sampleData, ["id", "name", "domain"]);
    const lines = result.split("\n").filter(Boolean);
    expect(lines[0]).toContain("ID");
    expect(lines[0]).toContain("NAME");
    expect(lines[0]).toContain("DOMAIN");
    expect(lines).toHaveLength(4); // header + separator + 2 rows
  });

  test("handles empty data", () => {
    const result = formatTable([], ["id", "name"]);
    expect(result).toContain("No results");
  });
});

describe("formatPlain", () => {
  test("outputs TSV", () => {
    const result = formatPlain(sampleData, ["id", "name", "domain"]);
    const lines = result.split("\n").filter(Boolean);
    expect(lines[0]).toBe("T001\tworkspace-1\tws1");
    expect(lines[1]).toBe("T002\tworkspace-2\tws2");
  });

  test("handles empty data", () => {
    const result = formatPlain([], ["id", "name"]);
    expect(result).toBe("");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `bun test tests/output.test.ts`
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: output.ts を実装**

```typescript
// src/output.ts

export function formatJson(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

export function formatTable(
  data: Record<string, unknown>[],
  columns: string[],
): string {
  if (data.length === 0) return "No results";

  const headers = columns.map((c) => c.toUpperCase());
  const rows = data.map((row) =>
    columns.map((c) => String(row[c] ?? "")),
  );

  const widths = columns.map((col, i) =>
    Math.max(headers[i].length, ...rows.map((r) => r[i].length)),
  );

  const headerLine = headers.map((h, i) => h.padEnd(widths[i])).join("  ");
  const separator = widths.map((w) => "-".repeat(w)).join("  ");
  const bodyLines = rows.map((r) =>
    r.map((cell, i) => cell.padEnd(widths[i])).join("  "),
  );

  return [headerLine, separator, ...bodyLines].join("\n");
}

export function formatPlain(
  data: Record<string, unknown>[],
  columns: string[],
): string {
  return data
    .map((row) => columns.map((c) => String(row[c] ?? "")).join("\t"))
    .join("\n");
}

export type OutputFormat = "json" | "table" | "plain";

export function formatOutput(
  data: Record<string, unknown>[],
  columns: string[],
  format: OutputFormat,
): string {
  switch (format) {
    case "json":
      return formatJson(data);
    case "plain":
      return formatPlain(data, columns);
    case "table":
      return formatTable(data, columns);
  }
}
```

- [ ] **Step 4: テストがパスすることを確認**

Run: `bun test tests/output.test.ts`
Expected: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/output.ts tests/output.test.ts
git commit -m "feat: add output formatters (JSON, table, TSV)"
```

---

### Task 3: プロファイル管理 (config.ts)

**Files:**
- Create: `src/config.ts`
- Create: `tests/config.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// tests/config.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../src/config";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("ProfileStore", () => {
  test("addProfile saves profile and sets as default if first", async () => {
    await store.addProfile("my-org", "xoxb-test-token");
    const config = await store.loadConfig();
    expect(config.profiles).toContain("my-org");
    expect(config.default).toBe("my-org");
  });

  test("addProfile does not change default if already set", async () => {
    await store.addProfile("first", "xoxb-1");
    await store.addProfile("second", "xoxb-2");
    const config = await store.loadConfig();
    expect(config.default).toBe("first");
  });

  test("removeProfile removes from list", async () => {
    await store.addProfile("my-org", "xoxb-test");
    await store.removeProfile("my-org");
    const config = await store.loadConfig();
    expect(config.profiles).not.toContain("my-org");
  });

  test("removeProfile clears default if removed", async () => {
    await store.addProfile("my-org", "xoxb-test");
    await store.removeProfile("my-org");
    const config = await store.loadConfig();
    expect(config.default).toBeUndefined();
  });

  test("listProfiles returns all profiles", async () => {
    await store.addProfile("org-a", "xoxb-a");
    await store.addProfile("org-b", "xoxb-b");
    const profiles = await store.listProfiles();
    expect(profiles).toEqual(["org-a", "org-b"]);
  });

  test("resolveProfile returns explicit profile", async () => {
    await store.addProfile("org-a", "xoxb-a");
    const name = await store.resolveProfileName("org-a");
    expect(name).toBe("org-a");
  });

  test("resolveProfile returns default when not specified", async () => {
    await store.addProfile("org-a", "xoxb-a");
    const name = await store.resolveProfileName(undefined);
    expect(name).toBe("org-a");
  });

  test("resolveProfile returns sole profile when no default", async () => {
    await store.addProfile("only-one", "xoxb-1");
    // default が設定されている場合でも、1つだけなら解決可能
    const name = await store.resolveProfileName(undefined);
    expect(name).toBe("only-one");
  });

  test("resolveProfile throws when ambiguous", async () => {
    await store.addProfile("org-a", "xoxb-a");
    await store.addProfile("org-b", "xoxb-b");
    // default を削除してテスト
    await store.setDefault(undefined);
    expect(store.resolveProfileName(undefined)).rejects.toThrow();
  });

  test("getToken retrieves stored token", async () => {
    await store.addProfile("my-org", "xoxb-secret");
    const token = await store.getToken("my-org");
    expect(token).toBe("xoxb-secret");
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `bun test tests/config.test.ts`
Expected: FAIL（モジュールが存在しない）

- [ ] **Step 3: config.ts を実装**

```typescript
// src/config.ts
import { join } from "node:path";
import { mkdir } from "node:fs/promises";

interface Config {
  profiles: string[];
  default?: string;
}

export class ProfileStore {
  private configDir: string;
  private configPath: string;
  private useKeychain: boolean;

  constructor(configDir?: string, useKeychain = true) {
    this.configDir = configDir ?? join(
      process.env.XDG_CONFIG_HOME ?? join(process.env.HOME!, ".config"),
      "sladm",
    );
    this.configPath = join(this.configDir, "config.json");
    this.useKeychain = useKeychain;
  }

  async loadConfig(): Promise<Config> {
    try {
      const file = Bun.file(this.configPath);
      return await file.json() as Config;
    } catch {
      return { profiles: [] };
    }
  }

  private async saveConfig(config: Config): Promise<void> {
    await mkdir(this.configDir, { recursive: true });
    await Bun.write(this.configPath, JSON.stringify(config, null, 2));
  }

  async addProfile(name: string, token: string): Promise<void> {
    const config = await this.loadConfig();
    if (!config.profiles.includes(name)) {
      config.profiles.push(name);
    }
    if (config.profiles.length === 1) {
      config.default = name;
    }
    await this.saveConfig(config);

    if (this.useKeychain) {
      await Bun.secrets.set({ service: "sladm", name, value: token });
    } else {
      // テスト用: ファイルベースのフォールバック
      await Bun.write(join(this.configDir, `.token-${name}`), token);
    }
  }

  async removeProfile(name: string): Promise<void> {
    const config = await this.loadConfig();
    config.profiles = config.profiles.filter((p) => p !== name);
    if (config.default === name) {
      config.default = config.profiles[0];
    }
    await this.saveConfig(config);

    if (this.useKeychain) {
      await Bun.secrets.delete({ service: "sladm", name });
    } else {
      const { unlink } = await import("node:fs/promises");
      await unlink(join(this.configDir, `.token-${name}`)).catch(() => {});
    }
  }

  async listProfiles(): Promise<string[]> {
    const config = await this.loadConfig();
    return config.profiles;
  }

  async setDefault(name: string | undefined): Promise<void> {
    const config = await this.loadConfig();
    config.default = name;
    await this.saveConfig(config);
  }

  async resolveProfileName(explicit?: string): Promise<string> {
    if (explicit) return explicit;

    const envProfile = process.env.SLADM_PROFILE;
    if (envProfile) return envProfile;

    const config = await this.loadConfig();
    if (config.default) return config.default;
    if (config.profiles.length === 1) return config.profiles[0];

    throw new Error(
      "Multiple profiles configured. Specify --profile or set a default with: sladm token add --default <name>",
    );
  }

  async getToken(name: string): Promise<string> {
    if (this.useKeychain) {
      const token = await Bun.secrets.get({ service: "sladm", name });
      if (!token) throw new Error(`Token not found for profile: ${name}`);
      return token;
    }
    // テスト用フォールバック
    const file = Bun.file(join(this.configDir, `.token-${name}`));
    return await file.text();
  }
}
```

**注意:** テスト内では `new ProfileStore(tempDir, false)` を使い、キーチェーンではなくファイルベースのフォールバックを使うようにする。Step 1 のテストの `beforeEach` を以下に修正：

```typescript
beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false); // useKeychain=false
});
```

- [ ] **Step 4: テストがパスすることを確認**

Run: `bun test tests/config.test.ts`
Expected: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/config.ts tests/config.test.ts
git commit -m "feat: add profile management with keychain storage"
```

---

### Task 4: Slack API クライアント (client.ts)

**Files:**
- Create: `src/client.ts`
- Create: `tests/client.test.ts`

- [ ] **Step 1: テストを書く**

```typescript
// tests/client.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createSlackClient } from "../src/client";
import { ProfileStore } from "../src/config";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("createSlackClient", () => {
  test("creates WebClient with resolved token", async () => {
    await store.addProfile("test-org", "xoxb-test-token-123");
    const client = await createSlackClient(store, "test-org");
    expect(client).toBeDefined();
    expect(client.token).toBe("xoxb-test-token-123");
  });

  test("throws when profile has no token", async () => {
    expect(createSlackClient(store, "nonexistent")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: テストが失敗することを確認**

Run: `bun test tests/client.test.ts`
Expected: FAIL

- [ ] **Step 3: client.ts を実装**

```typescript
// src/client.ts
import { WebClient } from "@slack/web-api";
import type { ProfileStore } from "./config";

export async function createSlackClient(
  store: ProfileStore,
  profileName?: string,
): Promise<WebClient> {
  const resolved = await store.resolveProfileName(profileName);
  const token = await store.getToken(resolved);
  return new WebClient(token);
}
```

- [ ] **Step 4: テストがパスすることを確認**

Run: `bun test tests/client.test.ts`
Expected: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/client.ts tests/client.test.ts
git commit -m "feat: add Slack WebClient factory with profile resolution"
```

---

### Task 5: token コマンド群

**Files:**
- Create: `src/commands/token/add.ts`
- Create: `src/commands/token/list.ts`
- Create: `src/commands/token/remove.ts`
- Create: `src/commands/token/status.ts`
- Create: `tests/commands/token/add.test.ts`
- Create: `tests/commands/token/list.test.ts`
- Create: `tests/commands/token/remove.test.ts`
- Create: `tests/commands/token/status.test.ts`

- [ ] **Step 1: token add のテストを書く**

```typescript
// tests/commands/token/add.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenAdd } from "../../../src/commands/token/add";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token add", () => {
  test("adds a new profile", async () => {
    await executeTokenAdd(store, "my-org", "xoxb-123");
    const profiles = await store.listProfiles();
    expect(profiles).toContain("my-org");
  });

  test("sets first profile as default", async () => {
    await executeTokenAdd(store, "my-org", "xoxb-123");
    const config = await store.loadConfig();
    expect(config.default).toBe("my-org");
  });
});
```

- [ ] **Step 2: token list のテストを書く**

```typescript
// tests/commands/token/list.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenList } from "../../../src/commands/token/list";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token list", () => {
  test("returns empty when no profiles", async () => {
    const result = await executeTokenList(store);
    expect(result).toEqual([]);
  });

  test("returns all profiles with default marker", async () => {
    await store.addProfile("org-a", "xoxb-a");
    await store.addProfile("org-b", "xoxb-b");
    const result = await executeTokenList(store);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ name: "org-a", default: true });
    expect(result[1]).toEqual({ name: "org-b", default: false });
  });
});
```

- [ ] **Step 3: token remove のテストを書く**

```typescript
// tests/commands/token/remove.test.ts
import { describe, expect, test, beforeEach, afterEach } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenRemove } from "../../../src/commands/token/remove";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token remove", () => {
  test("removes an existing profile", async () => {
    await store.addProfile("my-org", "xoxb-123");
    await executeTokenRemove(store, "my-org");
    const profiles = await store.listProfiles();
    expect(profiles).not.toContain("my-org");
  });

  test("throws when profile does not exist", async () => {
    expect(executeTokenRemove(store, "nonexistent")).rejects.toThrow();
  });
});
```

- [ ] **Step 4: token status のテストを書く**

```typescript
// tests/commands/token/status.test.ts
import { describe, expect, test, beforeEach, afterEach, mock } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ProfileStore } from "../../../src/config";
import { executeTokenStatus } from "../../../src/commands/token/status";

let tempDir: string;
let store: ProfileStore;

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), "sladm-test-"));
  store = new ProfileStore(tempDir, false);
});

afterEach(async () => {
  await rm(tempDir, { recursive: true });
});

describe("token status", () => {
  test("returns profile info with token masked", async () => {
    await store.addProfile("my-org", "xoxb-1234567890-abcdef");
    const result = await executeTokenStatus(store, "my-org");
    expect(result.name).toBe("my-org");
    expect(result.token).toMatch(/^xoxb-\.\.\..+/);
    expect(result.token).not.toBe("xoxb-1234567890-abcdef");
  });
});
```

- [ ] **Step 5: テストが全て失敗することを確認**

Run: `bun test tests/commands/token/`
Expected: 全て FAIL

- [ ] **Step 6: token コマンドを実装**

```typescript
// src/commands/token/add.ts
import type { ProfileStore } from "../../config";

export async function executeTokenAdd(
  store: ProfileStore,
  name: string,
  token: string,
): Promise<void> {
  await store.addProfile(name, token);
}
```

```typescript
// src/commands/token/list.ts
import type { ProfileStore } from "../../config";

export interface ProfileEntry {
  name: string;
  default: boolean;
}

export async function executeTokenList(
  store: ProfileStore,
): Promise<ProfileEntry[]> {
  const config = await store.loadConfig();
  return config.profiles.map((name) => ({
    name,
    default: name === config.default,
  }));
}
```

```typescript
// src/commands/token/remove.ts
import type { ProfileStore } from "../../config";

export async function executeTokenRemove(
  store: ProfileStore,
  name: string,
): Promise<void> {
  const profiles = await store.listProfiles();
  if (!profiles.includes(name)) {
    throw new Error(`Profile not found: ${name}`);
  }
  await store.removeProfile(name);
}
```

```typescript
// src/commands/token/status.ts
import type { ProfileStore } from "../../config";

export interface TokenStatus {
  name: string;
  token: string;
  isDefault: boolean;
}

function maskToken(token: string): string {
  const prefix = token.slice(0, 4);
  const suffix = token.slice(-4);
  return `${prefix}...${suffix}`;
}

export async function executeTokenStatus(
  store: ProfileStore,
  profileName: string,
): Promise<TokenStatus> {
  const config = await store.loadConfig();
  const token = await store.getToken(profileName);
  return {
    name: profileName,
    token: maskToken(token),
    isDefault: config.default === profileName,
  };
}
```

- [ ] **Step 7: テストがパスすることを確認**

Run: `bun test tests/commands/token/`
Expected: 全テスト PASS

- [ ] **Step 8: コミット**

```bash
git add src/commands/token/ tests/commands/token/
git commit -m "feat: add token management commands (add, list, remove, status)"
```

---

### Task 6: teams コマンド群

**Files:**
- Create: `src/commands/teams/create.ts`
- Create: `src/commands/teams/list.ts`
- Create: `src/commands/teams/admins-list.ts`
- Create: `src/commands/teams/owners-list.ts`
- Create: `tests/commands/teams/create.test.ts`
- Create: `tests/commands/teams/list.test.ts`
- Create: `tests/commands/teams/admins-list.test.ts`
- Create: `tests/commands/teams/owners-list.test.ts`

- [ ] **Step 1: teams create のテストを書く**

```typescript
// tests/commands/teams/create.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsCreate } from "../../../src/commands/teams/create";

describe("teams create", () => {
  test("calls admin.teams.create with correct args", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({ ok: true, team: "T123" }),
    );
    const client = {
      admin: { teams: { create: mockCreate } },
    } as any;

    const result = await executeTeamsCreate(client, {
      teamDomain: "my-workspace",
      teamName: "My Workspace",
      teamDescription: "A test workspace",
      teamDiscoverability: "closed",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      team_domain: "my-workspace",
      team_name: "My Workspace",
      team_description: "A test workspace",
      team_discoverability: "closed",
    });
    expect(result.ok).toBe(true);
  });

  test("calls without optional params", async () => {
    const mockCreate = mock(() =>
      Promise.resolve({ ok: true, team: "T123" }),
    );
    const client = {
      admin: { teams: { create: mockCreate } },
    } as any;

    await executeTeamsCreate(client, {
      teamDomain: "ws",
      teamName: "WS",
    });

    expect(mockCreate).toHaveBeenCalledWith({
      team_domain: "ws",
      team_name: "WS",
    });
  });
});
```

- [ ] **Step 2: teams list のテストを書く**

```typescript
// tests/commands/teams/list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsList } from "../../../src/commands/teams/list";

describe("teams list", () => {
  test("returns teams from API", async () => {
    const mockList = mock(() =>
      Promise.resolve({
        ok: true,
        teams: [
          { id: "T001", name: "ws-1", domain: "ws1" },
          { id: "T002", name: "ws-2", domain: "ws2" },
        ],
      }),
    );
    const client = {
      admin: { teams: { list: mockList } },
    } as any;

    const result = await executeTeamsList(client, {});
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("T001");
  });

  test("passes cursor for pagination", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, teams: [] }),
    );
    const client = {
      admin: { teams: { list: mockList } },
    } as any;

    await executeTeamsList(client, { cursor: "abc123", limit: 50 });
    expect(mockList).toHaveBeenCalledWith({
      cursor: "abc123",
      limit: 50,
    });
  });
});
```

- [ ] **Step 3: teams admins list / owners list のテストを書く**

```typescript
// tests/commands/teams/admins-list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsAdminsList } from "../../../src/commands/teams/admins-list";

describe("teams admins list", () => {
  test("calls admin.teams.admins.list with team_id", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, admin_ids: ["U001", "U002"] }),
    );
    const client = {
      admin: { teams: { admins: { list: mockList } } },
    } as any;

    const result = await executeTeamsAdminsList(client, { teamId: "T001" });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T001" });
    expect(result).toEqual(["U001", "U002"]);
  });
});
```

```typescript
// tests/commands/teams/owners-list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeTeamsOwnersList } from "../../../src/commands/teams/owners-list";

describe("teams owners list", () => {
  test("calls admin.teams.owners.list with team_id", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, owner_ids: ["U001"] }),
    );
    const client = {
      admin: { teams: { owners: { list: mockList } } },
    } as any;

    const result = await executeTeamsOwnersList(client, { teamId: "T001" });
    expect(mockList).toHaveBeenCalledWith({ team_id: "T001" });
    expect(result).toEqual(["U001"]);
  });
});
```

- [ ] **Step 4: テストが全て失敗することを確認**

Run: `bun test tests/commands/teams/`
Expected: 全て FAIL

- [ ] **Step 5: teams コマンドを実装**

```typescript
// src/commands/teams/create.ts
import type { WebClient } from "@slack/web-api";

interface TeamsCreateOptions {
  teamDomain: string;
  teamName: string;
  teamDescription?: string;
  teamDiscoverability?: "open" | "closed" | "invite_only" | "unlisted";
}

export async function executeTeamsCreate(
  client: WebClient,
  opts: TeamsCreateOptions,
) {
  const args: Record<string, string> = {
    team_domain: opts.teamDomain,
    team_name: opts.teamName,
  };
  if (opts.teamDescription) args.team_description = opts.teamDescription;
  if (opts.teamDiscoverability) args.team_discoverability = opts.teamDiscoverability;

  return await (client.admin.teams.create as Function)(args);
}
```

```typescript
// src/commands/teams/list.ts
import type { WebClient } from "@slack/web-api";

interface TeamsListOptions {
  cursor?: string;
  limit?: number;
}

export async function executeTeamsList(
  client: WebClient,
  opts: TeamsListOptions,
) {
  const args: Record<string, unknown> = {};
  if (opts.cursor) args.cursor = opts.cursor;
  if (opts.limit) args.limit = opts.limit;

  const response = await (client.admin.teams.list as Function)(args);
  return response.teams ?? [];
}
```

```typescript
// src/commands/teams/admins-list.ts
import type { WebClient } from "@slack/web-api";

interface TeamsAdminsListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeTeamsAdminsList(
  client: WebClient,
  opts: TeamsAdminsListOptions,
) {
  const args: Record<string, unknown> = { team_id: opts.teamId };
  if (opts.cursor) args.cursor = opts.cursor;
  if (opts.limit) args.limit = opts.limit;

  const response = await (client.admin.teams.admins.list as Function)(args);
  return response.admin_ids ?? [];
}
```

```typescript
// src/commands/teams/owners-list.ts
import type { WebClient } from "@slack/web-api";

interface TeamsOwnersListOptions {
  teamId: string;
  cursor?: string;
  limit?: number;
}

export async function executeTeamsOwnersList(
  client: WebClient,
  opts: TeamsOwnersListOptions,
) {
  const args: Record<string, unknown> = { team_id: opts.teamId };
  if (opts.cursor) args.cursor = opts.cursor;
  if (opts.limit) args.limit = opts.limit;

  const response = await (client.admin.teams.owners.list as Function)(args);
  return response.owner_ids ?? [];
}
```

- [ ] **Step 6: テストがパスすることを確認**

Run: `bun test tests/commands/teams/`
Expected: 全テスト PASS

- [ ] **Step 7: コミット**

```bash
git add src/commands/teams/ tests/commands/teams/
git commit -m "feat: add teams commands (create, list, admins list, owners list)"
```

---

### Task 7: teams settings コマンド群

**Files:**
- Create: `src/commands/teams/settings/info.ts`
- Create: `src/commands/teams/settings/set-name.ts`
- Create: `src/commands/teams/settings/set-icon.ts`
- Create: `src/commands/teams/settings/set-description.ts`
- Create: `src/commands/teams/settings/set-discoverability.ts`
- Create: `tests/commands/teams/settings/info.test.ts`
- Create: `tests/commands/teams/settings/set-name.test.ts`
- Create: `tests/commands/teams/settings/set-icon.test.ts`
- Create: `tests/commands/teams/settings/set-description.test.ts`
- Create: `tests/commands/teams/settings/set-discoverability.test.ts`

- [ ] **Step 1: settings のテストを全て書く**

```typescript
// tests/commands/teams/settings/info.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeSettingsInfo } from "../../../../src/commands/teams/settings/info";

describe("teams settings info", () => {
  test("calls admin.teams.settings.info with team_id", async () => {
    const mockInfo = mock(() =>
      Promise.resolve({
        ok: true,
        team: { id: "T001", name: "ws-1", domain: "ws1" },
      }),
    );
    const client = {
      admin: { teams: { settings: { info: mockInfo } } },
    } as any;

    const result = await executeSettingsInfo(client, { teamId: "T001" });
    expect(mockInfo).toHaveBeenCalledWith({ team_id: "T001" });
    expect(result.id).toBe("T001");
  });
});
```

```typescript
// tests/commands/teams/settings/set-name.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeSetName } from "../../../../src/commands/teams/settings/set-name";

describe("teams settings set-name", () => {
  test("calls setName with team_id and name", async () => {
    const mockSetName = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setName: mockSetName } } },
    } as any;

    await executeSetName(client, { teamId: "T001", name: "New Name" });
    expect(mockSetName).toHaveBeenCalledWith({
      team_id: "T001",
      name: "New Name",
    });
  });
});
```

```typescript
// tests/commands/teams/settings/set-icon.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeSetIcon } from "../../../../src/commands/teams/settings/set-icon";

describe("teams settings set-icon", () => {
  test("calls setIcon with team_id and image_url", async () => {
    const mockSetIcon = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setIcon: mockSetIcon } } },
    } as any;

    await executeSetIcon(client, {
      teamId: "T001",
      imageUrl: "https://example.com/icon.png",
    });
    expect(mockSetIcon).toHaveBeenCalledWith({
      team_id: "T001",
      image_url: "https://example.com/icon.png",
    });
  });
});
```

```typescript
// tests/commands/teams/settings/set-description.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeSetDescription } from "../../../../src/commands/teams/settings/set-description";

describe("teams settings set-description", () => {
  test("calls setDescription with team_id and description", async () => {
    const mockSetDesc = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setDescription: mockSetDesc } } },
    } as any;

    await executeSetDescription(client, {
      teamId: "T001",
      description: "New description",
    });
    expect(mockSetDesc).toHaveBeenCalledWith({
      team_id: "T001",
      description: "New description",
    });
  });
});
```

```typescript
// tests/commands/teams/settings/set-discoverability.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeSetDiscoverability } from "../../../../src/commands/teams/settings/set-discoverability";

describe("teams settings set-discoverability", () => {
  test("calls setDiscoverability with team_id and discoverability", async () => {
    const mockSetDisc = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { teams: { settings: { setDiscoverability: mockSetDisc } } },
    } as any;

    await executeSetDiscoverability(client, {
      teamId: "T001",
      discoverability: "invite_only",
    });
    expect(mockSetDisc).toHaveBeenCalledWith({
      team_id: "T001",
      discoverability: "invite_only",
    });
  });
});
```

- [ ] **Step 2: テストが全て失敗することを確認**

Run: `bun test tests/commands/teams/settings/`
Expected: 全て FAIL

- [ ] **Step 3: settings コマンドを実装**

```typescript
// src/commands/teams/settings/info.ts
import type { WebClient } from "@slack/web-api";

export async function executeSettingsInfo(
  client: WebClient,
  opts: { teamId: string },
) {
  const response = await (client.admin.teams.settings.info as Function)({
    team_id: opts.teamId,
  });
  return response.team;
}
```

```typescript
// src/commands/teams/settings/set-name.ts
import type { WebClient } from "@slack/web-api";

export async function executeSetName(
  client: WebClient,
  opts: { teamId: string; name: string },
) {
  return await (client.admin.teams.settings.setName as Function)({
    team_id: opts.teamId,
    name: opts.name,
  });
}
```

```typescript
// src/commands/teams/settings/set-icon.ts
import type { WebClient } from "@slack/web-api";

export async function executeSetIcon(
  client: WebClient,
  opts: { teamId: string; imageUrl: string },
) {
  return await (client.admin.teams.settings.setIcon as Function)({
    team_id: opts.teamId,
    image_url: opts.imageUrl,
  });
}
```

```typescript
// src/commands/teams/settings/set-description.ts
import type { WebClient } from "@slack/web-api";

export async function executeSetDescription(
  client: WebClient,
  opts: { teamId: string; description: string },
) {
  return await (client.admin.teams.settings.setDescription as Function)({
    team_id: opts.teamId,
    description: opts.description,
  });
}
```

```typescript
// src/commands/teams/settings/set-discoverability.ts
import type { WebClient } from "@slack/web-api";

type Discoverability = "open" | "closed" | "invite_only" | "unlisted";

export async function executeSetDiscoverability(
  client: WebClient,
  opts: { teamId: string; discoverability: Discoverability },
) {
  return await (client.admin.teams.settings.setDiscoverability as Function)({
    team_id: opts.teamId,
    discoverability: opts.discoverability,
  });
}
```

- [ ] **Step 4: テストがパスすることを確認**

Run: `bun test tests/commands/teams/settings/`
Expected: 全テスト PASS

- [ ] **Step 5: コミット**

```bash
git add src/commands/teams/settings/ tests/commands/teams/settings/
git commit -m "feat: add teams settings commands (info, set-name, set-icon, set-description, set-discoverability)"
```

---

### Task 8: users コマンド群

**Files:**
- Create: `src/commands/users/list.ts`
- Create: `src/commands/users/invite.ts`
- Create: `src/commands/users/assign.ts`
- Create: `src/commands/users/remove.ts`
- Create: `src/commands/users/set-admin.ts`
- Create: `src/commands/users/set-owner.ts`
- Create: `src/commands/users/set-regular.ts`
- Create: `src/commands/users/session-reset.ts`
- Create: `tests/commands/users/list.test.ts`
- Create: `tests/commands/users/invite.test.ts`
- Create: `tests/commands/users/assign.test.ts`
- Create: `tests/commands/users/remove.test.ts`
- Create: `tests/commands/users/set-admin.test.ts`
- Create: `tests/commands/users/set-owner.test.ts`
- Create: `tests/commands/users/set-regular.test.ts`
- Create: `tests/commands/users/session-reset.test.ts`

- [ ] **Step 1: users list のテストを書く**

```typescript
// tests/commands/users/list.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersList } from "../../../src/commands/users/list";

describe("users list", () => {
  test("returns users from API", async () => {
    const mockList = mock(() =>
      Promise.resolve({
        ok: true,
        users: [
          { id: "U001", email: "a@ex.com", is_admin: false },
          { id: "U002", email: "b@ex.com", is_admin: true },
        ],
      }),
    );
    const client = { admin: { users: { list: mockList } } } as any;

    const result = await executeUsersList(client, { teamId: "T001" });
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("U001");
  });

  test("passes optional filters", async () => {
    const mockList = mock(() =>
      Promise.resolve({ ok: true, users: [] }),
    );
    const client = { admin: { users: { list: mockList } } } as any;

    await executeUsersList(client, {
      teamId: "T001",
      isActive: true,
      cursor: "c1",
      limit: 25,
    });
    expect(mockList).toHaveBeenCalledWith({
      team_id: "T001",
      is_active: true,
      cursor: "c1",
      limit: 25,
    });
  });
});
```

- [ ] **Step 2: users invite のテストを書く**

```typescript
// tests/commands/users/invite.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersInvite } from "../../../src/commands/users/invite";

describe("users invite", () => {
  test("calls invite with required args", async () => {
    const mockInvite = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { invite: mockInvite } } } as any;

    await executeUsersInvite(client, {
      teamId: "T001",
      email: "user@example.com",
      channelIds: ["C001", "C002"],
    });
    expect(mockInvite).toHaveBeenCalledWith({
      team_id: "T001",
      email: "user@example.com",
      channel_ids: ["C001", "C002"],
    });
  });

  test("passes optional params", async () => {
    const mockInvite = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { invite: mockInvite } } } as any;

    await executeUsersInvite(client, {
      teamId: "T001",
      email: "guest@example.com",
      channelIds: ["C001"],
      isRestricted: true,
      realName: "Guest User",
      customMessage: "Welcome!",
    });
    expect(mockInvite).toHaveBeenCalledWith({
      team_id: "T001",
      email: "guest@example.com",
      channel_ids: ["C001"],
      is_restricted: true,
      real_name: "Guest User",
      custom_message: "Welcome!",
    });
  });
});
```

- [ ] **Step 3: users assign のテストを書く**

```typescript
// tests/commands/users/assign.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersAssign } from "../../../src/commands/users/assign";

describe("users assign", () => {
  test("calls assign with team_id and user_id", async () => {
    const mockAssign = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { assign: mockAssign } } } as any;

    await executeUsersAssign(client, {
      teamId: "T001",
      userId: "U001",
    });
    expect(mockAssign).toHaveBeenCalledWith({
      team_id: "T001",
      user_id: "U001",
    });
  });

  test("passes optional guest params", async () => {
    const mockAssign = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { assign: mockAssign } } } as any;

    await executeUsersAssign(client, {
      teamId: "T001",
      userId: "U001",
      channelIds: ["C001"],
      isRestricted: true,
    });
    expect(mockAssign).toHaveBeenCalledWith({
      team_id: "T001",
      user_id: "U001",
      channel_ids: ["C001"],
      is_restricted: true,
    });
  });
});
```

- [ ] **Step 4: users remove / set-admin / set-owner / set-regular のテストを書く**

```typescript
// tests/commands/users/remove.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersRemove } from "../../../src/commands/users/remove";

describe("users remove", () => {
  test("calls remove with team_id and user_id", async () => {
    const mockRemove = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { remove: mockRemove } } } as any;

    await executeUsersRemove(client, { teamId: "T001", userId: "U001" });
    expect(mockRemove).toHaveBeenCalledWith({
      team_id: "T001",
      user_id: "U001",
    });
  });
});
```

```typescript
// tests/commands/users/set-admin.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetAdmin } from "../../../src/commands/users/set-admin";

describe("users set-admin", () => {
  test("calls setAdmin with team_id and user_id", async () => {
    const mockSetAdmin = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setAdmin: mockSetAdmin } } } as any;

    await executeUsersSetAdmin(client, { teamId: "T001", userId: "U001" });
    expect(mockSetAdmin).toHaveBeenCalledWith({
      team_id: "T001",
      user_id: "U001",
    });
  });
});
```

```typescript
// tests/commands/users/set-owner.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetOwner } from "../../../src/commands/users/set-owner";

describe("users set-owner", () => {
  test("calls setOwner with team_id and user_id", async () => {
    const mockSetOwner = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setOwner: mockSetOwner } } } as any;

    await executeUsersSetOwner(client, { teamId: "T001", userId: "U001" });
    expect(mockSetOwner).toHaveBeenCalledWith({
      team_id: "T001",
      user_id: "U001",
    });
  });
});
```

```typescript
// tests/commands/users/set-regular.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeUsersSetRegular } from "../../../src/commands/users/set-regular";

describe("users set-regular", () => {
  test("calls setRegular with team_id and user_id", async () => {
    const mockSetRegular = mock(() => Promise.resolve({ ok: true }));
    const client = { admin: { users: { setRegular: mockSetRegular } } } as any;

    await executeUsersSetRegular(client, { teamId: "T001", userId: "U001" });
    expect(mockSetRegular).toHaveBeenCalledWith({
      team_id: "T001",
      user_id: "U001",
    });
  });
});
```

- [ ] **Step 5: users session reset のテストを書く**

```typescript
// tests/commands/users/session-reset.test.ts
import { describe, expect, test, mock } from "bun:test";
import { executeSessionReset } from "../../../src/commands/users/session-reset";

describe("users session reset", () => {
  test("calls session.reset with user_id", async () => {
    const mockReset = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { users: { session: { reset: mockReset } } },
    } as any;

    await executeSessionReset(client, { userId: "U001" });
    expect(mockReset).toHaveBeenCalledWith({ user_id: "U001" });
  });

  test("passes mobile_only flag", async () => {
    const mockReset = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { users: { session: { reset: mockReset } } },
    } as any;

    await executeSessionReset(client, { userId: "U001", mobileOnly: true });
    expect(mockReset).toHaveBeenCalledWith({
      user_id: "U001",
      mobile_only: true,
    });
  });

  test("passes web_only flag", async () => {
    const mockReset = mock(() => Promise.resolve({ ok: true }));
    const client = {
      admin: { users: { session: { reset: mockReset } } },
    } as any;

    await executeSessionReset(client, { userId: "U001", webOnly: true });
    expect(mockReset).toHaveBeenCalledWith({
      user_id: "U001",
      web_only: true,
    });
  });
});
```

- [ ] **Step 6: テストが全て失敗することを確認**

Run: `bun test tests/commands/users/`
Expected: 全て FAIL

- [ ] **Step 7: users コマンドを実装**

```typescript
// src/commands/users/list.ts
import type { WebClient } from "@slack/web-api";

interface UsersListOptions {
  teamId?: string;
  isActive?: boolean;
  cursor?: string;
  limit?: number;
}

export async function executeUsersList(
  client: WebClient,
  opts: UsersListOptions,
) {
  const args: Record<string, unknown> = {};
  if (opts.teamId) args.team_id = opts.teamId;
  if (opts.isActive !== undefined) args.is_active = opts.isActive;
  if (opts.cursor) args.cursor = opts.cursor;
  if (opts.limit) args.limit = opts.limit;

  const response = await (client.admin.users.list as Function)(args);
  return response.users ?? [];
}
```

```typescript
// src/commands/users/invite.ts
import type { WebClient } from "@slack/web-api";

interface UsersInviteOptions {
  teamId: string;
  email: string;
  channelIds: string[];
  customMessage?: string;
  realName?: string;
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
  guestExpirationTs?: string;
  resend?: boolean;
}

export async function executeUsersInvite(
  client: WebClient,
  opts: UsersInviteOptions,
) {
  const args: Record<string, unknown> = {
    team_id: opts.teamId,
    email: opts.email,
    channel_ids: opts.channelIds,
  };
  if (opts.customMessage) args.custom_message = opts.customMessage;
  if (opts.realName) args.real_name = opts.realName;
  if (opts.isRestricted) args.is_restricted = opts.isRestricted;
  if (opts.isUltraRestricted) args.is_ultra_restricted = opts.isUltraRestricted;
  if (opts.guestExpirationTs) args.guest_expiration_ts = opts.guestExpirationTs;
  if (opts.resend) args.resend = opts.resend;

  return await (client.admin.users.invite as Function)(args);
}
```

```typescript
// src/commands/users/assign.ts
import type { WebClient } from "@slack/web-api";

interface UsersAssignOptions {
  teamId: string;
  userId: string;
  channelIds?: string[];
  isRestricted?: boolean;
  isUltraRestricted?: boolean;
}

export async function executeUsersAssign(
  client: WebClient,
  opts: UsersAssignOptions,
) {
  const args: Record<string, unknown> = {
    team_id: opts.teamId,
    user_id: opts.userId,
  };
  if (opts.channelIds) args.channel_ids = opts.channelIds;
  if (opts.isRestricted) args.is_restricted = opts.isRestricted;
  if (opts.isUltraRestricted) args.is_ultra_restricted = opts.isUltraRestricted;

  return await (client.admin.users.assign as Function)(args);
}
```

```typescript
// src/commands/users/remove.ts
import type { WebClient } from "@slack/web-api";

export async function executeUsersRemove(
  client: WebClient,
  opts: { teamId: string; userId: string },
) {
  return await (client.admin.users.remove as Function)({
    team_id: opts.teamId,
    user_id: opts.userId,
  });
}
```

```typescript
// src/commands/users/set-admin.ts
import type { WebClient } from "@slack/web-api";

export async function executeUsersSetAdmin(
  client: WebClient,
  opts: { teamId: string; userId: string },
) {
  return await (client.admin.users.setAdmin as Function)({
    team_id: opts.teamId,
    user_id: opts.userId,
  });
}
```

```typescript
// src/commands/users/set-owner.ts
import type { WebClient } from "@slack/web-api";

export async function executeUsersSetOwner(
  client: WebClient,
  opts: { teamId: string; userId: string },
) {
  return await (client.admin.users.setOwner as Function)({
    team_id: opts.teamId,
    user_id: opts.userId,
  });
}
```

```typescript
// src/commands/users/set-regular.ts
import type { WebClient } from "@slack/web-api";

export async function executeUsersSetRegular(
  client: WebClient,
  opts: { teamId: string; userId: string },
) {
  return await (client.admin.users.setRegular as Function)({
    team_id: opts.teamId,
    user_id: opts.userId,
  });
}
```

```typescript
// src/commands/users/session-reset.ts
import type { WebClient } from "@slack/web-api";

interface SessionResetOptions {
  userId: string;
  mobileOnly?: boolean;
  webOnly?: boolean;
}

export async function executeSessionReset(
  client: WebClient,
  opts: SessionResetOptions,
) {
  const args: Record<string, unknown> = { user_id: opts.userId };
  if (opts.mobileOnly) args.mobile_only = opts.mobileOnly;
  if (opts.webOnly) args.web_only = opts.webOnly;

  return await (client.admin.users.session.reset as Function)(args);
}
```

- [ ] **Step 8: テストがパスすることを確認**

Run: `bun test tests/commands/users/`
Expected: 全テスト PASS

- [ ] **Step 9: コミット**

```bash
git add src/commands/users/ tests/commands/users/
git commit -m "feat: add users commands (list, invite, assign, remove, set-admin, set-owner, set-regular, session reset)"
```

---

### Task 9: CLI エントリポイント (index.ts)

**Files:**
- Create: `src/index.ts`

- [ ] **Step 1: index.ts を実装**

optique の `command()` + `or()` パターンで全コマンドを結合する。

```typescript
#!/usr/bin/env bun
// src/index.ts
import { object, or } from "@optique/core/constructs";
import { optional } from "@optique/core/modifiers";
import { argument, command, constant, option } from "@optique/core/primitives";
import { string, integer } from "@optique/core/valueparser";
import { run } from "@optique/run";
import { defineProgram } from "@optique/core/program";

import { ProfileStore } from "./config";
import { createSlackClient } from "./client";
import { formatOutput, type OutputFormat } from "./output";

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

// --- Token commands ---
const tokenAdd = command(
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

const tokenList = command(
  "token",
  command(
    "list",
    object({ cmd: constant("token-list" as const) }),
  ),
);

const tokenRemove = command(
  "token",
  command(
    "remove",
    object({
      cmd: constant("token-remove" as const),
      name: argument(string({ metavar: "NAME" })),
    }),
  ),
);

const tokenStatus = command(
  "token",
  command(
    "status",
    object({ cmd: constant("token-status" as const) }),
  ),
);

// --- Teams commands ---
const teamsCreate = command(
  "teams",
  command(
    "create",
    object({
      cmd: constant("teams-create" as const),
      teamDomain: option("--domain", string({ metavar: "DOMAIN" })),
      teamName: option("--name", string({ metavar: "NAME" })),
      teamDescription: optional(option("--description", string())),
      teamDiscoverability: optional(option("--discoverability", string())),
    }),
  ),
);

const teamsList = command(
  "teams",
  command(
    "list",
    object({
      cmd: constant("teams-list" as const),
      cursor: optional(option("--cursor", string())),
      limit: optional(option("--limit", integer())),
    }),
  ),
);

const teamsAdminsList = command(
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

const teamsOwnersList = command(
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

const teamsSettingsInfo = command(
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

const teamsSettingsSetName = command(
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

const teamsSettingsSetIcon = command(
  "teams",
  command(
    "settings",
    command(
      "set-icon",
      object({
        cmd: constant("teams-settings-set-icon" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        imageUrl: option("--image-url", string({ metavar: "URL" })),
      }),
    ),
  ),
);

const teamsSettingsSetDescription = command(
  "teams",
  command(
    "settings",
    command(
      "set-description",
      object({
        cmd: constant("teams-settings-set-description" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        description: option("--description", string({ metavar: "TEXT" })),
      }),
    ),
  ),
);

const teamsSettingsSetDiscoverability = command(
  "teams",
  command(
    "settings",
    command(
      "set-discoverability",
      object({
        cmd: constant("teams-settings-set-discoverability" as const),
        teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
        discoverability: option("--discoverability", string({ metavar: "VALUE" })),
      }),
    ),
  ),
);

// --- Users commands ---
const usersList = command(
  "users",
  command(
    "list",
    object({
      cmd: constant("users-list" as const),
      teamId: optional(option("--team-id", string({ metavar: "TEAM_ID" }))),
      isActive: optional(option("--is-active", string())),
      cursor: optional(option("--cursor", string())),
      limit: optional(option("--limit", integer())),
    }),
  ),
);

const usersInvite = command(
  "users",
  command(
    "invite",
    object({
      cmd: constant("users-invite" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      email: option("--email", string({ metavar: "EMAIL" })),
      channelIds: option("--channel-ids", string({ metavar: "IDS" })),
      customMessage: optional(option("--custom-message", string())),
      realName: optional(option("--real-name", string())),
      isRestricted: optional(option("--is-restricted", string())),
      isUltraRestricted: optional(option("--is-ultra-restricted", string())),
    }),
  ),
);

const usersAssign = command(
  "users",
  command(
    "assign",
    object({
      cmd: constant("users-assign" as const),
      teamId: option("--team-id", string({ metavar: "TEAM_ID" })),
      userId: option("--user-id", string({ metavar: "USER_ID" })),
      channelIds: optional(option("--channel-ids", string())),
      isRestricted: optional(option("--is-restricted", string())),
      isUltraRestricted: optional(option("--is-ultra-restricted", string())),
    }),
  ),
);

const usersRemove = command(
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

const usersSetAdmin = command(
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

const usersSetOwner = command(
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

const usersSetRegular = command(
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

const usersSessionReset = command(
  "users",
  command(
    "session",
    command(
      "reset",
      object({
        cmd: constant("users-session-reset" as const),
        userId: option("--user-id", string({ metavar: "USER_ID" })),
        mobileOnly: optional(option("--mobile-only", string())),
        webOnly: optional(option("--web-only", string())),
      }),
    ),
  ),
);

// --- Root parser ---
const parser = or(
  tokenAdd, tokenList, tokenRemove, tokenStatus,
  teamsCreate, teamsList, teamsAdminsList, teamsOwnersList,
  teamsSettingsInfo, teamsSettingsSetName, teamsSettingsSetIcon,
  teamsSettingsSetDescription, teamsSettingsSetDiscoverability,
  usersList, usersInvite, usersAssign, usersRemove,
  usersSetAdmin, usersSetOwner, usersSetRegular, usersSessionReset,
);

const program = defineProgram({
  parser,
  metadata: {
    name: "sladm",
    version: "0.1.0",
  },
});

async function main() {
  const config = run(program, {
    help: "both",
    version: { command: true, option: true, value: "0.1.0" },
  });

  // グローバルフラグは process.argv から手動解析
  const args = process.argv.slice(2);
  const profileFlag = args.includes("--profile")
    ? args[args.indexOf("--profile") + 1]
    : undefined;
  const jsonFlag = args.includes("--json") || args.includes("-j");
  const plainFlag = args.includes("--plain") || args.includes("-p");
  const outputFormat: OutputFormat = jsonFlag ? "json" : plainFlag ? "plain" : "table";

  const store = new ProfileStore();

  try {
    switch (config.cmd) {
      // Token commands
      case "token-add": {
        await executeTokenAdd(store, config.name, config.token);
        console.log(`Profile '${config.name}' added.`);
        break;
      }
      case "token-list": {
        const profiles = await executeTokenList(store);
        const data = profiles.map((p) => ({
          name: p.name,
          default: p.default ? "*" : "",
        }));
        console.log(formatOutput(data, ["name", "default"], outputFormat));
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
        const data = [{ name: status.name, token: status.token, default: status.isDefault ? "*" : "" }];
        console.log(formatOutput(data, ["name", "token", "default"], outputFormat));
        break;
      }

      // Teams commands
      case "teams-create": {
        const client = await createSlackClient(store, profileFlag);
        const result = await executeTeamsCreate(client, {
          teamDomain: config.teamDomain,
          teamName: config.teamName,
          teamDescription: config.teamDescription,
          teamDiscoverability: config.teamDiscoverability as any,
        });
        if (jsonFlag) {
          console.log(JSON.stringify(result, null, 2));
        } else {
          console.log(`Team created: ${result.team}`);
        }
        break;
      }
      case "teams-list": {
        const client = await createSlackClient(store, profileFlag);
        const teams = await executeTeamsList(client, {
          cursor: config.cursor,
          limit: config.limit,
        });
        console.log(formatOutput(teams, ["id", "name", "domain"], outputFormat));
        break;
      }
      case "teams-admins-list": {
        const client = await createSlackClient(store, profileFlag);
        const ids = await executeTeamsAdminsList(client, { teamId: config.teamId });
        const data = ids.map((id: string) => ({ user_id: id }));
        console.log(formatOutput(data, ["user_id"], outputFormat));
        break;
      }
      case "teams-owners-list": {
        const client = await createSlackClient(store, profileFlag);
        const ids = await executeTeamsOwnersList(client, { teamId: config.teamId });
        const data = ids.map((id: string) => ({ user_id: id }));
        console.log(formatOutput(data, ["user_id"], outputFormat));
        break;
      }
      case "teams-settings-info": {
        const client = await createSlackClient(store, profileFlag);
        const team = await executeSettingsInfo(client, { teamId: config.teamId });
        if (jsonFlag) {
          console.log(JSON.stringify(team, null, 2));
        } else {
          console.log(formatOutput([team], Object.keys(team), outputFormat));
        }
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
        await executeSetDiscoverability(client, {
          teamId: config.teamId,
          discoverability: config.discoverability as any,
        });
        console.log("Team discoverability updated.");
        break;
      }

      // Users commands
      case "users-list": {
        const client = await createSlackClient(store, profileFlag);
        const users = await executeUsersList(client, {
          teamId: config.teamId,
          isActive: config.isActive === "true" ? true : config.isActive === "false" ? false : undefined,
          cursor: config.cursor,
          limit: config.limit,
        });
        console.log(formatOutput(users, ["id", "email", "is_admin"], outputFormat));
        break;
      }
      case "users-invite": {
        const client = await createSlackClient(store, profileFlag);
        await executeUsersInvite(client, {
          teamId: config.teamId,
          email: config.email,
          channelIds: config.channelIds.split(","),
          customMessage: config.customMessage,
          realName: config.realName,
          isRestricted: config.isRestricted === "true",
          isUltraRestricted: config.isUltraRestricted === "true",
        });
        console.log("User invited.");
        break;
      }
      case "users-assign": {
        const client = await createSlackClient(store, profileFlag);
        await executeUsersAssign(client, {
          teamId: config.teamId,
          userId: config.userId,
          channelIds: config.channelIds?.split(","),
          isRestricted: config.isRestricted === "true",
          isUltraRestricted: config.isUltraRestricted === "true",
        });
        console.log("User assigned.");
        break;
      }
      case "users-remove": {
        const client = await createSlackClient(store, profileFlag);
        await executeUsersRemove(client, { teamId: config.teamId, userId: config.userId });
        console.log("User removed.");
        break;
      }
      case "users-set-admin": {
        const client = await createSlackClient(store, profileFlag);
        await executeUsersSetAdmin(client, { teamId: config.teamId, userId: config.userId });
        console.log("User set as admin.");
        break;
      }
      case "users-set-owner": {
        const client = await createSlackClient(store, profileFlag);
        await executeUsersSetOwner(client, { teamId: config.teamId, userId: config.userId });
        console.log("User set as owner.");
        break;
      }
      case "users-set-regular": {
        const client = await createSlackClient(store, profileFlag);
        await executeUsersSetRegular(client, { teamId: config.teamId, userId: config.userId });
        console.log("User set as regular.");
        break;
      }
      case "users-session-reset": {
        const client = await createSlackClient(store, profileFlag);
        await executeSessionReset(client, {
          userId: config.userId,
          mobileOnly: config.mobileOnly === "true",
          webOnly: config.webOnly === "true",
        });
        console.log("Session reset.");
        break;
      }
      default: {
        const _exhaustive: never = config;
        throw new Error(`Unknown command: ${(_exhaustive as any).cmd}`);
      }
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();
```

- [ ] **Step 2: 動作確認**

Run: `bun run src/index.ts --help`
Expected: ヘルプメッセージが表示される

Run: `bun run src/index.ts version`
Expected: バージョンが表示される

- [ ] **Step 3: コミット**

```bash
git add src/index.ts
git commit -m "feat: add CLI entry point with all command routing"
```

---

### Task 10: 全体テスト実行と最終確認

- [ ] **Step 1: 全テスト実行**

Run: `bun test`
Expected: 全テスト PASS

- [ ] **Step 2: TypeScript コンパイルチェック**

Run: `bunx tsc --noEmit`
Expected: エラーなし

- [ ] **Step 3: .gitignore を追加**

```gitignore
node_modules/
dist/
.DS_Store
```

- [ ] **Step 4: コミット**

```bash
git add .gitignore
git commit -m "chore: add .gitignore"
```

- [ ] **Step 5: 全テストが通ることを最終確認**

Run: `bun test`
Expected: 全テスト PASS、0 failures
