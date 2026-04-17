# Non-admin Management APIs 対応設計

## 背景

現在の `sladm` は Slack の `admin.*` API のみをカバーしている。しかし、Slack ワークスペースの管理運用には `admin.*` だけでは不足する領域があり、以下の非 admin API にも「管理系」として扱える範囲で対応する必要がある。

事前調査の結果、admin 版と非 admin 版は**包含関係にない**（それぞれ別の情報を返す）ため、両方を提供する意味がある:

- `admin.users.list` = 管理メタ（`billable_info`, ゲスト期限 等） / `users.*` = プロフィール詳細
- `admin.conversations.search` = Grid 横断検索 / `conversations.list/info/members` = 単一 WS の基本属性・メンバー一覧
- `admin.usergroups.*` = IDP 連携の一部のみ / `usergroups.*` = CRUD + 有効化/無効化 + メンバー管理（admin 版に代替なし）
- `admin.teams.list` = Grid 全 WS 列挙 / `team.*` = 単一 WS 内の詳細

## スコープ

以下 22 コマンドを追加する。`users.list` は既存 `sladm users list` (admin.users.list) と衝突するため**除外**（要望が出るまで対応しない）。

### users（8コマンド）

| コマンド | API |
|---|---|
| `sladm users info <user>` | users.info |
| `sladm users lookup-by-email <email>` | users.lookupByEmail |
| `sladm users get-presence <user>` | users.getPresence |
| `sladm users set-presence <presence>` | users.setPresence |
| `sladm users conversations` | users.conversations |
| `sladm users identity` | users.identity |
| `sladm users profile get [<user>]` | users.profile.get |
| `sladm users profile set <user>` | users.profile.set |

### conversations（3コマンド）

| コマンド | API |
|---|---|
| `sladm conversations list` | conversations.list |
| `sladm conversations info <channel>` | conversations.info |
| `sladm conversations members <channel>` | conversations.members |

### usergroups（7コマンド）

| コマンド | API |
|---|---|
| `sladm usergroups list` | usergroups.list |
| `sladm usergroups create <name>` | usergroups.create |
| `sladm usergroups update <id>` | usergroups.update |
| `sladm usergroups enable <id>` | usergroups.enable |
| `sladm usergroups disable <id>` | usergroups.disable |
| `sladm usergroups users list <id>` | usergroups.users.list |
| `sladm usergroups users update <id>` | usergroups.users.update |

### teams（5コマンド）

| コマンド | API |
|---|---|
| `sladm teams info` | team.info |
| `sladm teams profile get` | team.profile.get |
| `sladm teams billable-info` | team.billableInfo |
| `sladm teams access-logs` | team.accessLogs |
| `sladm teams integration-logs` | team.integrationLogs |

## アーキテクチャ

既存パターン（`src/commands/<group>/<subcommand>.ts`）を踏襲し、新規要素は最小限に抑える。

### ファイル配置

```
src/commands/
├── users/
│   ├── info.ts                   ← 追加
│   ├── lookup-by-email.ts        ← 追加
│   ├── get-presence.ts           ← 追加
│   ├── set-presence.ts           ← 追加
│   ├── conversations.ts          ← 追加
│   ├── identity.ts               ← 追加
│   └── profile/                  ← 新サブディレクトリ
│       ├── get.ts
│       └── set.ts
├── conversations/
│   ├── list.ts                   ← 追加
│   ├── info.ts                   ← 追加
│   └── members.ts                ← 追加
├── usergroups/
│   ├── list.ts                   ← 追加
│   ├── create.ts                 ← 追加
│   ├── update.ts                 ← 追加
│   ├── enable.ts                 ← 追加
│   ├── disable.ts                ← 追加
│   └── users/                    ← 新サブディレクトリ
│       ├── list.ts
│       └── update.ts
└── teams/
    ├── info.ts                   ← 追加
    ├── billable-info.ts          ← 追加
    ├── access-logs.ts            ← 追加
    ├── integration-logs.ts       ← 追加
    └── profile/                  ← 新サブディレクトリ
        └── get.ts
```

サブグループ（`profile/`, `users/`）は既存パターン（`conversations/restrict-access/`, `conversations/ekm/`, `users/session/`, `teams/settings/`）と同じ構造。

### 実装パターン

CLAUDE.md 記載の既存パターンをそのまま使う:

1. `Options` インターフェース（camelCase）
2. `execute(client: WebClient, opts: Options): Promise<void | T[]>` 関数
3. camelCase → snake_case に変換して API に渡す
4. 型付きメソッド（`client.users.info()` 等）を基本とし、SDK 型バグ回避時のみ `client.apiCall()` を使う
5. `as` キャスト禁止（既存ルール通り）

### CLI 登録（`src/index.ts`）

既存の switch 文に 22 ケース追加。サブグループは `or(...)` でネストする（既存の `session`, `settings`, `restrict-access`, `ekm` と同じ構造）。

### 共通モジュール

- `client.ts`: 変更なし。同じ `WebClient` を流用（admin / 非 admin で分けない）
- `output.ts`: 変更なし。JSON / table / plain をそのまま利用。各コマンドで table の列定義を追加
- `config.ts`: 変更なし。profile ごとに user token 1 つを保存する既存設計のまま

### ページネーション

既存の cursor/limit パターン（`admin.conversations.search` 等で実装済み）に揃える。対象:

- `conversations.list`
- `users.conversations`
- `usergroups.users.list`
- `team.accessLogs`
- `team.integrationLogs`

### テスト

各コマンドに対応する `tests/commands/<group>/<subcommand>.test.ts` を追加。モックパターンは CLAUDE.md 記載の通り（`apiCall` or 型付きメソッドのモック）。

## トークン・スコープ運用

既存の単一 user token を流用する方針（追加トークンの分離はしない）。必要スコープを README の「必要スコープ」セクションに追記:

- `users:read`, `users:read.email`, `users.profile:read`, `users.profile:write`
- `channels:read`, `groups:read`, `mpim:read`, `im:read`
- `usergroups:read`, `usergroups:write`
- `team:read`
- `admin`（`team.accessLogs` / `team.billableInfo` 用 — user token に admin 権限が必要）

`missing_scope` エラーはそのまま Slack API のエラーを表示する（追加の案内ロジックは入れない）。

## 破壊的変更

なし。既存コマンドの挙動・名前は変更しない。追加のみ。バージョンは v0.5.0（minor）想定。

## ドキュメント

- README のコマンド表に 22 コマンド追加
- Skill 定義（`skills/slack-admin-cli-skill`）の説明文にコマンド追加を反映
- CLAUDE.md は構造変更がないため更新不要

## コミット粒度

グループごとに 4 PR 程度（users / conversations / usergroups / teams）に分割するか、1 PR でまとめる。実装時に判断。
