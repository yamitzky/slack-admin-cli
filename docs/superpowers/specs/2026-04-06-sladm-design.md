# sladm — Slack Admin CLI 設計ドキュメント

## 概要

Slack Enterprise Grid の Admin API（`admin.teams.*`, `admin.users.*`）を操作する CLI ツール。人間にも AI エージェントにも使いやすい設計を目指す。

## 技術スタック

| 項目 | 選定 |
|------|------|
| ランタイム | Bun |
| 言語 | TypeScript |
| CLI パーサー | [optique](https://github.com/dahlia/optique) |
| Slack API | [@slack/web-api](https://github.com/slackapi/node-slack-sdk) |
| テスト | bun:test |
| 認証情報管理 | Bun.secrets（OS キーチェーン） |

## コマンド体系

### teams（admin.teams.*）

| コマンド | Slack API メソッド | 必要スコープ |
|----------|-------------------|-------------|
| `sladm teams create` | `admin.teams.create` | `admin.teams:write` |
| `sladm teams list` | `admin.teams.list` | `admin.teams:read` |
| `sladm teams admins list` | `admin.teams.admins.list` | `admin.teams:read` |
| `sladm teams owners list` | `admin.teams.owners.list` | `admin.teams:read` |
| `sladm teams settings info` | `admin.teams.settings.info` | `admin.teams:read` |
| `sladm teams settings set-name` | `admin.teams.settings.setName` | `admin.teams:write` |
| `sladm teams settings set-icon` | `admin.teams.settings.setIcon` | `admin.teams:write` |
| `sladm teams settings set-description` | `admin.teams.settings.setDescription` | `admin.teams:write` |
| `sladm teams settings set-discoverability` | `admin.teams.settings.setDiscoverability` | `admin.teams:write` |

### users（admin.users.*）

| コマンド | Slack API メソッド | 必要スコープ |
|----------|-------------------|-------------|
| `sladm users list` | `admin.users.list` | `admin.users:read` |
| `sladm users invite` | `admin.users.invite` | `admin.users:write` |
| `sladm users assign` | `admin.users.assign` | `admin.users:write` |
| `sladm users remove` | `admin.users.remove` | `admin.users:write` |
| `sladm users set-admin` | `admin.users.setAdmin` | `admin.users:write` |
| `sladm users set-owner` | `admin.users.setOwner` | `admin.users:write` |
| `sladm users set-regular` | `admin.users.setRegular` | `admin.users:write` |
| `sladm users session reset` | `admin.users.session.reset` | `admin.users:write` |

### token（プロファイル管理）

| コマンド | 説明 |
|----------|------|
| `sladm token add [name]` | トークンを登録（名前省略時は "default"） |
| `sladm token list` | 登録済みプロファイル一覧 |
| `sladm token remove <name>` | プロファイル削除 |
| `sladm token status` | 現在の認証状態（トークンの有効性確認） |

### ユーティリティ

| コマンド | 説明 |
|----------|------|
| `sladm version` | バージョン表示 |
| `sladm completion` | シェル補完スクリプト出力 |

## グローバルフラグ

| フラグ | 説明 |
|--------|------|
| `--profile <name>` | 使用するプロファイル指定（省略時は default） |
| `-j, --json` | JSON 出力 |
| `-p, --plain` | TSV 出力（スクリプト・パイプ向け） |
| `-v, --verbose` | 詳細ログ出力 |

## アーキテクチャ

### レイヤー構成

```
CLI層（コマンド定義・引数パース）
    ↓
クライアント層（プロファイル→トークン解決、WebClient 生成）
    ↓
@slack/web-api（Slack API 通信）
```

### プロジェクト構造

```
slack-admin-cli/
├── src/
│   ├── index.ts                 # エントリポイント
│   ├── commands/
│   │   ├── teams/
│   │   │   ├── create.ts
│   │   │   ├── list.ts
│   │   │   ├── admins-list.ts
│   │   │   ├── owners-list.ts
│   │   │   └── settings/
│   │   │       ├── info.ts
│   │   │       ├── set-name.ts
│   │   │       ├── set-icon.ts
│   │   │       ├── set-description.ts
│   │   │       └── set-discoverability.ts
│   │   ├── users/
│   │   │   ├── list.ts
│   │   │   ├── invite.ts
│   │   │   ├── assign.ts
│   │   │   ├── remove.ts
│   │   │   ├── set-admin.ts
│   │   │   ├── set-owner.ts
│   │   │   ├── set-regular.ts
│   │   │   └── session-reset.ts
│   │   └── token/
│   │       ├── add.ts
│   │       ├── list.ts
│   │       ├── remove.ts
│   │       └── status.ts
│   ├── client.ts                # プロファイル→WebClient 生成
│   ├── config.ts                # プロファイル管理（config.json + Bun.secrets）
│   └── output.ts                # JSON / テーブル / TSV フォーマッタ
├── tests/
│   ├── commands/
│   │   ├── teams/
│   │   ├── users/
│   │   └── token/
│   ├── client.test.ts
│   ├── config.test.ts
│   └── output.test.ts
├── package.json
├── tsconfig.json
└── docs/
```

## 認証・プロファイル管理

### トークン保存

トークン本体は `Bun.secrets` 経由で OS キーチェーンに保存する。

```typescript
// 保存
await Bun.secrets.set({ service: "sladm", name: profileName, value: token });

// 取得
const token = await Bun.secrets.get({ service: "sladm", name: profileName });

// 削除
await Bun.secrets.delete({ service: "sladm", name: profileName });
```

### 設定ファイル

`~/.config/sladm/config.json` にプロファイル名と default のみ保存。トークンは含まない。

```json
{
  "profiles": ["my-org", "staging"],
  "default": "my-org"
}
```

### プロファイル解決順序

1. `--profile` フラグで明示指定
2. `SLADM_PROFILE` 環境変数
3. config.json の `default` 値
4. プロファイルが1つしかなければそれを使用
5. いずれも該当しなければエラー

## 出力フォーマット

### デフォルト（テーブル）

人間が読みやすいテーブル形式。

### JSON（`--json`）

API レスポンスをそのまま JSON で出力。AI エージェントやスクリプトでの利用に適する。

### TSV（`--plain`）

タブ区切り、カラーなし。パイプやスクリプト処理向け。

## テスト戦略

### コマンド層テスト

- `@slack/web-api` の `WebClient` をモック
- 各コマンドが正しい引数で SDK メソッドを呼ぶことを検証
- JSON / テーブル / TSV 各出力フォーマットの検証
- エラーレスポンス時のハンドリング検証

### 設定層テスト

- プロファイルの追加・削除・一覧・デフォルト切り替え
- `Bun.secrets` をモック、config.json は一時ディレクトリで実行

### テストフレームワーク

`bun:test` を使用。

## 将来の拡張

初期スコープは `admin.teams.*` と `admin.users.*` に限定するが、以下の拡張を想定：

- `admin.conversations.*` — チャンネル管理
- `admin.roles.*` — ロール管理
- `admin.usergroups.*` — IDP グループ管理
- SCIM API 対応
