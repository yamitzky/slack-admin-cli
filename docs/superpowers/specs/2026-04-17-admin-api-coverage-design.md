# Admin API カバレッジ拡張 設計

## 背景

現状の `sladm` は Slack Admin API の主要グループを実装済みだが、SDK (`@slack/web-api`) が対応している admin.* メソッドのうち以下が未実装：

- グループ丸ごと未対応: `auth-policy`, `barriers`, `emoji`, `roles`, `usergroups`
- 既存グループ内で未対応: `teams settings setDefaultChannels`、`users` 系の `setExpiration` / `unsupportedVersions.export` / `session.*` （6 メソッド）

SDK が対応していないメソッド（`admin.analytics.*`、`admin.audit.anomaly.allow.*`、`admin.conversations.{bulkSetExcludeFromSlackAi, createForObjects, linkObjects, unlinkObjects}`、`admin.users.getExpiration`、`admin.workflows.triggers.types.permissions.*`）は本対応のスコープ外とする。

## 目的

SDK 対応済みの未実装 admin.* メソッド 28 個を一括で追加し、`sladm` の admin API カバレッジを完成させる。

## スコープ（追加コマンド一覧）

### 新規グループ

- `sladm auth-policy assign-entities` → `admin.auth.policy.assignEntities`
- `sladm auth-policy get-entities` → `admin.auth.policy.getEntities`
- `sladm auth-policy remove-entities` → `admin.auth.policy.removeEntities`
- `sladm barriers create` → `admin.barriers.create`
- `sladm barriers delete` → `admin.barriers.delete`
- `sladm barriers list` → `admin.barriers.list`
- `sladm barriers update` → `admin.barriers.update`
- `sladm emoji add` → `admin.emoji.add`
- `sladm emoji add-alias` → `admin.emoji.addAlias`
- `sladm emoji list` → `admin.emoji.list`
- `sladm emoji remove` → `admin.emoji.remove`
- `sladm emoji rename` → `admin.emoji.rename`
- `sladm roles add-assignments` → `admin.roles.addAssignments`
- `sladm roles list-assignments` → `admin.roles.listAssignments`
- `sladm roles remove-assignments` → `admin.roles.removeAssignments`
- `sladm usergroups add-channels` → `admin.usergroups.addChannels`
- `sladm usergroups add-teams` → `admin.usergroups.addTeams`
- `sladm usergroups list-channels` → `admin.usergroups.listChannels`
- `sladm usergroups remove-channels` → `admin.usergroups.removeChannels`

### 既存グループへの追加

- `sladm teams settings set-default-channels` → `admin.teams.settings.setDefaultChannels`
- `sladm users set-expiration` → `admin.users.setExpiration`
- `sladm users unsupported-versions export` → `admin.users.unsupportedVersions.export`
- `sladm users session clear-settings` → `admin.users.session.clearSettings`
- `sladm users session get-settings` → `admin.users.session.getSettings`
- `sladm users session invalidate` → `admin.users.session.invalidate`
- `sladm users session list` → `admin.users.session.list`
- `sladm users session reset-bulk` → `admin.users.session.resetBulk`
- `sladm users session set-settings` → `admin.users.session.setSettings`

合計 **28 コマンド**。

## 実装方針

### ディレクトリ構造

既存の `src/commands/<group>/[<sub>/]<action>.ts` パターンに従う：

```
src/commands/
├── auth-policy/
│   ├── assign-entities.ts
│   ├── get-entities.ts
│   └── remove-entities.ts
├── barriers/
│   ├── create.ts
│   ├── delete.ts
│   ├── list.ts
│   └── update.ts
├── emoji/
│   ├── add.ts
│   ├── add-alias.ts
│   ├── list.ts
│   ├── remove.ts
│   └── rename.ts
├── roles/
│   ├── add-assignments.ts
│   ├── list-assignments.ts
│   └── remove-assignments.ts
├── usergroups/
│   ├── add-channels.ts
│   ├── add-teams.ts
│   ├── list-channels.ts
│   └── remove-channels.ts
├── teams/settings/set-default-channels.ts
└── users/
    ├── set-expiration.ts
    ├── unsupported-versions/export.ts
    └── session/
        ├── clear-settings.ts
        ├── get-settings.ts
        ├── invalidate.ts
        ├── list.ts
        ├── reset-bulk.ts
        └── set-settings.ts
```

### コーディング規約

- `Options` インターフェースは camelCase で定義
- `execute(client, opts)` シグネチャ
- camelCase オプション → snake_case で `client.apiCall(method, params)` に渡す（型回避は `as` ではなく `apiCall()` 経由）
- データ返却メソッド（list 系）は `Promise<T[]>` を返し、`output.ts` のフォーマッタで整形
- `as` キャスト禁止（既存ルール踏襲）
- 各コマンドに対応するテストを `tests/commands/<同パス>` に追加

### CLI ルーティング

`src/index.ts` の `@optique/core` パーサー定義および switch 文に新コマンドを追加。既存の `teams settings`, `users` 配下のサブグループパターンを踏襲。

### 出力フォーマット

- list 系（`barriers list`, `emoji list`, `roles list-assignments`, `usergroups list-channels`, `users session list`, `auth-policy get-entities` など）はテーブル/JSON/plain 切り替えに対応
- 副作用系（create/delete/set/remove/invalidate 等）は成功時に簡潔なメッセージまたは更新後オブジェクトを返す

## ドキュメント更新

- `README.md`: コマンド一覧表に 28 コマンドを追加。コマンド総数（現在 79）を更新。
- `skills/slack-admin-cli-skill/SKILL.md`: 新グループ・新コマンドの説明と典型的な使用例を追記。

## テスト方針

各コマンドについて、既存の `apiCall` モックパターンでユニットテストを追加：

```typescript
const mockApiCall = mock(() => Promise.resolve({ ok: true, /* ... */ }));
const client = { apiCall: mockApiCall } as any;
```

- 引数が正しく snake_case で渡されること
- 必須/任意パラメータの分岐
- list 系は配列/オブジェクト返却の検証

## デリバリ

1. 実装＋テスト
2. `bun run lint` と `bun test` がグリーン
3. README / SKILL 更新
4. 1 本の PR を作成（タイトル例: `feat: cover remaining SDK-supported admin.* methods`）

## スコープ外

- SDK 非対応メソッドの対応（`admin.analytics.*` 等）
- 出力フォーマッタや既存コマンドのリファクタ
- 新規プロファイル/認証フローの変更
