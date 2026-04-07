# sladm conversations — admin.conversations.* 設計ドキュメント

## 概要

既存の `sladm` CLI に `admin.conversations.*` の全メソッド（25コマンド）を追加する。既存の `teams` / `users` と同じパターンを踏襲し、SDK の薄いラッパーとして実装する。

唯一の例外は `set-teams` で、意図しないワークスペース切断を防ぐ安全弁を内蔵する。

## コマンド体系

### conversations（admin.conversations.*）

| コマンド | Slack API メソッド | 必要スコープ |
|----------|-------------------|-------------|
| `sladm conversations create` | `admin.conversations.create` | `admin.conversations:write` |
| `sladm conversations delete` | `admin.conversations.delete` | `admin.conversations:write` |
| `sladm conversations archive` | `admin.conversations.archive` | `admin.conversations:write` |
| `sladm conversations unarchive` | `admin.conversations.unarchive` | `admin.conversations:write` |
| `sladm conversations rename` | `admin.conversations.rename` | `admin.conversations:write` |
| `sladm conversations search` | `admin.conversations.search` | `admin.conversations:read` |
| `sladm conversations invite` | `admin.conversations.invite` | `admin.conversations:write` |
| `sladm conversations convert-to-private` | `admin.conversations.convertToPrivate` | `admin.conversations:write` |
| `sladm conversations convert-to-public` | `admin.conversations.convertToPublic` | `admin.conversations:write` |
| `sladm conversations get-teams` | `admin.conversations.getTeams` | `admin.conversations:read` |
| `sladm conversations set-teams` | `admin.conversations.setTeams` | `admin.conversations:write` |
| `sladm conversations disconnect-shared` | `admin.conversations.disconnectShared` | `admin.conversations:write` |
| `sladm conversations get-prefs` | `admin.conversations.getConversationPrefs` | `admin.conversations:read` |
| `sladm conversations set-prefs` | `admin.conversations.setConversationPrefs` | `admin.conversations:write` |
| `sladm conversations lookup` | `admin.conversations.lookup` | `admin.conversations:read` |
| `sladm conversations bulk-archive` | `admin.conversations.bulkArchive` | `admin.conversations:write` |
| `sladm conversations bulk-delete` | `admin.conversations.bulkDelete` | `admin.conversations:write` |
| `sladm conversations bulk-move` | `admin.conversations.bulkMove` | `admin.conversations:write` |
| `sladm conversations get-custom-retention` | `admin.conversations.getCustomRetention` | `admin.conversations:read` |
| `sladm conversations set-custom-retention` | `admin.conversations.setCustomRetention` | `admin.conversations:write` |
| `sladm conversations remove-custom-retention` | `admin.conversations.removeCustomRetention` | `admin.conversations:write` |
| `sladm conversations restrict-access add-group` | `admin.conversations.restrictAccess.addGroup` | `admin.conversations:write` |
| `sladm conversations restrict-access list-groups` | `admin.conversations.restrictAccess.listGroups` | `admin.conversations:read` |
| `sladm conversations restrict-access remove-group` | `admin.conversations.restrictAccess.removeGroup` | `admin.conversations:write` |
| `sladm conversations ekm list-original-connected-channel-info` | `admin.conversations.ekm.listOriginalConnectedChannelInfo` | `admin.conversations:read` |

## ファイル構造

```
src/commands/conversations/
├── create.ts
├── delete.ts
├── archive.ts
├── unarchive.ts
├── rename.ts
├── search.ts
├── invite.ts
├── convert-to-private.ts
├── convert-to-public.ts
├── get-teams.ts
├── set-teams.ts
├── disconnect-shared.ts
├── get-prefs.ts
├── set-prefs.ts
├── lookup.ts
├── bulk-archive.ts
├── bulk-delete.ts
├── bulk-move.ts
├── get-custom-retention.ts
├── set-custom-retention.ts
├── remove-custom-retention.ts
├── restrict-access/
│   ├── add-group.ts
│   ├── list-groups.ts
│   └── remove-group.ts
└── ekm/
    └── list-original-connected-channel-info.ts

tests/commands/conversations/
├── create.test.ts
├── delete.test.ts
├── archive.test.ts
├── unarchive.test.ts
├── rename.test.ts
├── search.test.ts
├── invite.test.ts
├── convert-to-private.test.ts
├── convert-to-public.test.ts
├── get-teams.test.ts
├── set-teams.test.ts          # 安全弁ロジックのテスト含む
├── disconnect-shared.test.ts
├── get-prefs.test.ts
├── set-prefs.test.ts
├── lookup.test.ts
├── bulk-archive.test.ts
├── bulk-delete.test.ts
├── bulk-move.test.ts
├── get-custom-retention.test.ts
├── set-custom-retention.test.ts
├── remove-custom-retention.test.ts
├── restrict-access/
│   ├── add-group.test.ts
│   ├── list-groups.test.ts
│   └── remove-group.test.ts
└── ekm/
    └── list-original-connected-channel-info.test.ts
```

## 実装パターン

### 標準コマンド（24コマンド）

既存の `teams` / `users` コマンドと同一パターン。`WebClient` を受け取り、SDKメソッドを直接呼び出す薄いラッパー。

```typescript
// 例: src/commands/conversations/archive.ts
import type { WebClient } from "@slack/web-api";

export async function executeConversationsArchive(
  client: WebClient,
  args: { channelId: string },
): Promise<void> {
  await client.admin.conversations.archive({ channel_id: args.channelId });
}
```

### set-teams（安全弁付き）

`setTeams` は、指定した `target_team_ids` で接続先ワークスペースを上書きするAPIである。含め忘れたワークスペースは切断される。これは事故の原因になるため、以下の安全弁を内蔵する。

**ロジック:**

1. `getTeams` で現在の接続ワークスペース一覧を取得
2. `target_team_ids` と比較し、現在接続中だが `target_team_ids` に含まれないワークスペースを特定
3. 切断されるワークスペースがあり、`allowDisconnect` が `false` → エラーを投げる。メッセージに切断されるワークスペースIDを列挙し、`--allow-disconnect` の指定を促す
4. `allowDisconnect` が `true`、または切断されるワークスペースがない → `setTeams` を実行

**注意:** `org_channel: true` を指定する場合（org全体に公開）は、`target_team_ids` は不要なので差分チェックをスキップする。

### index.ts への統合

`conversationsCommands` を定義し、`rootParser` の `or()` に追加する。

```typescript
const rootParser = or(tokenCommands, teamsCommands, usersCommands, conversationsCommands);
```

25コマンドは多いため、optique の `or()` のアリティ制限に注意する。`restrict-access` と `ekm` は `teamsSettingsCommands` と同じネストパターンで分割し、メインの `or()` の要素数を抑える。

## 各コマンドのパラメータ（SDK型定義に準拠）

### create
- `--name` (必須): チャンネル名
- `--is-private` (必須): `true`/`false`
- `--team-id`: ワークスペースID（`--org-wide` 未指定時は必須）
- `--org-wide`: `true` で org 全体に公開
- `--description`: チャンネル説明

### delete
- `--channel-id` (必須)

### archive
- `--channel-id` (必須)

### unarchive
- `--channel-id` (必須)

### rename
- `--channel-id` (必須)
- `--name` (必須): 新しいチャンネル名

### search
- `--query`: チャンネル名で検索
- `--team-ids`: ワークスペースIDリスト（カンマ区切り）
- `--search-channel-types`: チャンネルタイプフィルタ
- `--sort`: `relevant` | `name` | `member_count` | `created`
- `--sort-dir`: `asc` | `desc`
- `--connected-team-ids`: 外部org検索用
- `--total-count-only`: カウントのみ返す
- `--cursor`, `--limit`: ページネーション

### invite
- `--channel-id` (必須)
- `--user-ids` (必須): ユーザーIDリスト（カンマ区切り）

### convert-to-private
- `--channel-id` (必須)
- `--name`: MPIM変換時の新チャンネル名

### convert-to-public
- `--channel-id` (必須)

### get-teams
- `--channel-id` (必須)
- `--cursor`, `--limit`: ページネーション

### set-teams
- `--channel-id` (必須)
- `--team-ids`: 接続先ワークスペースIDリスト（カンマ区切り）
- `--team-id`: チャンネルが所属するワークスペース
- `--org-channel`: `true` で org 全体に公開
- `--allow-disconnect`: 既存ワークスペースの切断を許可

### disconnect-shared
- `--channel-id` (必須)
- `--leaving-team-ids`: 切断するワークスペースIDリスト（カンマ区切り、2チーム時は省略可）

### get-prefs
- `--channel-id` (必須)

### set-prefs
- `--channel-id` (必須)
- `--prefs` (必須): JSON文字列（`who_can_post`, `can_thread` 等）

### lookup
- `--team-ids` (必須): ワークスペースIDリスト（カンマ区切り）
- `--last-message-activity-before` (必須): UNIXタイムスタンプ
- `--max-member-count`: 最大メンバー数フィルタ
- `--cursor`, `--limit`: ページネーション

### bulk-archive
- `--channel-ids` (必須): チャンネルIDリスト（カンマ区切り）

### bulk-delete
- `--channel-ids` (必須): チャンネルIDリスト（カンマ区切り）

### bulk-move
- `--channel-ids` (必須): チャンネルIDリスト（カンマ区切り）
- `--target-team-id` (必須): 移動先ワークスペースID

### get-custom-retention
- `--channel-id` (必須)

### set-custom-retention
- `--channel-id` (必須)
- `--duration-days` (必須): 保持日数

### remove-custom-retention
- `--channel-id` (必須)

### restrict-access add-group
- `--channel-id` (必須)
- `--group-id` (必須): IDPグループID
- `--team-id`: ワークスペースID（単一WS限定チャンネルの場合必須）

### restrict-access list-groups
- `--channel-id` (必須)
- `--team-id`: ワークスペースID

### restrict-access remove-group
- `--channel-id` (必須)
- `--group-id` (必須): IDPグループID
- `--team-id`: ワークスペースID

### ekm list-original-connected-channel-info
- `--team-ids`: ワークスペースIDリスト（カンマ区切り）
- `--channel-ids`: チャンネルIDリスト（カンマ区切り）
- `--cursor`, `--limit`: ページネーション

## テスト戦略

既存パターンと同一。`WebClient` をモックし、各コマンドが正しい引数でSDKメソッドを呼ぶことを検証。

`set-teams` は追加で以下をテスト：
- 切断されるワークスペースがあり `allowDisconnect: false` → エラー
- 切断されるワークスペースがあり `allowDisconnect: true` → 実行される
- 切断されるワークスペースがない → `allowDisconnect` なしでも実行される
- `org_channel: true` → 差分チェックをスキップして実行

## 必要スコープ

既存のボットトークンに以下を追加する：
- `admin.conversations:read`
- `admin.conversations:write`
