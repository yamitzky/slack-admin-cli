# SCIM API Support Design

## Goal

Slack SCIM v2.0 API のフルカバーを CLI に追加する。主動機は `admin.*` API では不可能な org レベルのユーザー無効化。CLI の設計思想として SCIM API の全操作（Users CRUD + Groups CRUD）に対応する。

## Background

- `admin.users.remove` はワークスペース単位の除外のみ。組織全体でのユーザー無効化は SCIM API でしかできない
- SCIM API は `@slack/web-api` の `WebClient` ではサポートされていない。REST エンドポイント（`https://api.slack.com/scim/v2/`）に直接リクエストする必要がある
- 認証は既存の `admin.*` API と同じ OAuth トークン（`admin` スコープ）を使い回す

## Decisions

| 判断項目 | 決定 | 理由 |
|---------|------|------|
| SCIM バージョン | v2.0 のみ | v1.1 のスーパーセット。機能欠落なし。公式も v2 推奨 |
| コマンド名前空間 | `scim-users`, `scim-groups` | トップレベルにフラットに配置。2グループのみなので `scim` 親コマンドは不要 |
| HTTP クライアント | リソース指向 `ScimClient` クラス | `WebClient` の `client.admin.users.list()` パターンに近い使い心地。型安全 |
| PUT（replace）| 省略 | 事故リスクが高い（省略フィールドが空になる）。PATCH で十分 |
| DELETE /Users の命名 | `deactivate` | 実際の動作（無効化）に忠実。完全削除ではないことを明示 |
| 認証 | 既存トークン使い回し | SCIM も同じ OAuth トークンで動作する |
| 外部依存 | なし | Bun ネイティブの `fetch` のみ使用 |

## Architecture

### ScimClient (`src/scim-client.ts`)

`fetch` ベースのリソース指向 HTTP クライアント。

```typescript
class ScimClient {
  constructor(token: string)

  users: {
    list(params?: { startIndex?: number; count?: number; filter?: string }): Promise<ScimListResponse<ScimUser>>
    get(id: string): Promise<ScimUser>
    create(params: CreateScimUserParams): Promise<ScimUser>
    update(id: string, operations: ScimPatchOperation[]): Promise<ScimUser>
    deactivate(id: string): Promise<void>
  }

  groups: {
    list(params?: { startIndex?: number; count?: number; filter?: string }): Promise<ScimListResponse<ScimGroup>>
    get(id: string): Promise<ScimGroup>
    create(params: CreateScimGroupParams): Promise<ScimGroup>
    update(id: string, operations: ScimPatchOperation[]): Promise<ScimGroup>
    delete(id: string): Promise<void>
  }
}
```

- `createScimClient(store, profileName?)` で生成（`createSlackClient` と同パターン）
- ベース URL: `https://api.slack.com/scim/v2`
- ヘッダー: `Authorization: Bearer <token>`, `Content-Type: application/json`
- エラー時は SCIM v2 エラーレスポンス（`detail`, `status`）をパースして throw

### 型定義 (`src/scim-types.ts`)

```typescript
interface ScimUser {
  id: string
  userName: string
  name: { givenName: string; familyName: string }
  displayName: string
  emails: Array<{ value: string; primary: boolean }>
  active: boolean
  title?: string
  // ...
}

interface ScimGroup {
  id: string
  displayName: string
  members: Array<{ value: string; display?: string }>
}

interface ScimListResponse<T> {
  totalResults: number
  itemsPerPage: number
  startIndex: number
  Resources: T[]
}

interface ScimPatchOperation {
  op: "add" | "remove" | "replace"
  path?: string
  value?: unknown
}

interface CreateScimUserParams {
  userName: string
  email: string
  givenName?: string
  familyName?: string
  displayName?: string
}

interface CreateScimGroupParams {
  displayName: string
  memberIds?: string[]
}
```

## Commands

### scim-users

| コマンド | SCIM エンドポイント | オプション |
|---------|-------------------|-----------|
| `list` | `GET /Users` | `--start-index`, `--count`, `--filter` |
| `get` | `GET /Users/{id}` | `--id`（必須） |
| `create` | `POST /Users` | `--user-name`（必須）, `--email`（必須）, `--given-name`, `--family-name`, `--display-name` |
| `update` | `PATCH /Users/{id}` | `--id`（必須）, `--active`, `--user-name`, `--email`, `--given-name`, `--family-name`, `--display-name`, `--title` |
| `deactivate` | `DELETE /Users/{id}` | `--id`（必須） |

`update` は指定されたフィールドを SCIM PATCH の `replace` オペレーションに変換して送る。

### scim-groups

| コマンド | SCIM エンドポイント | オプション |
|---------|-------------------|-----------|
| `list` | `GET /Groups` | `--start-index`, `--count`, `--filter` |
| `get` | `GET /Groups/{id}` | `--id`（必須） |
| `create` | `POST /Groups` | `--display-name`（必須）, `--member-ids`（カンマ区切り） |
| `update` | `PATCH /Groups/{id}` | `--id`（必須）, `--display-name`, `--add-member-ids`, `--remove-member-ids` |
| `delete` | `DELETE /Groups/{id}` | `--id`（必須） |

`update` の `--display-name` は `replace` オペレーション、`--add-member-ids` は `add`、`--remove-member-ids` は `remove` オペレーションに変換。

## File Structure

### New Files

```
src/
├── scim-client.ts          # ScimClient クラス + createScimClient
├── scim-types.ts           # SCIM 型定義
└── commands/
    ├── scim-users/
    │   ├── list.ts
    │   ├── get.ts
    │   ├── create.ts
    │   ├── update.ts
    │   └── deactivate.ts
    └── scim-groups/
        ├── list.ts
        ├── get.ts
        ├── create.ts
        ├── update.ts
        └── delete.ts

tests/
├── scim-client.test.ts
└── commands/
    ├── scim-users/
    │   ├── list.test.ts
    │   ├── get.test.ts
    │   ├── create.test.ts
    │   ├── update.test.ts
    │   └── deactivate.test.ts
    └── scim-groups/
        ├── list.test.ts
        ├── get.test.ts
        ├── create.test.ts
        ├── update.test.ts
        └── delete.test.ts
```

### Modified Files

- `src/index.ts` — パーサー定義 + rootParser 追加 + switch ケース追加

## Integration with index.ts

### Parser

```typescript
const scimUsersCommands = command("scim-users", or(
  command("list", object({ cmd: constant("scim-users-list" as const), ... })),
  command("get", object({ cmd: constant("scim-users-get" as const), ... })),
  // ...
));

const scimGroupsCommands = command("scim-groups", or(
  command("list", object({ cmd: constant("scim-groups-list" as const), ... })),
  // ...
));
```

### Routing

```typescript
case "scim-users-list": {
  const client = await createScimClient(store, profileFlag);
  const result = await executeScimUsersList(client, { ... });
  console.log(formatOutput(result, [...], outputFormat));
  break;
}
```

`createScimClient` は `createSlackClient` と同じく `ProfileStore` からトークン取得。返すのは `ScimClient`。

## Testing

コマンドテストでは `ScimClient` のメソッドをモック:

```typescript
const mockList = mock(() => Promise.resolve({ totalResults: 1, Resources: [...] }));
const client = { users: { list: mockList } } as any;
```

`tests/scim-client.test.ts` では `fetch` をモックして ScimClient 自体のリクエスト組み立て・エラーハンドリングをテスト。
