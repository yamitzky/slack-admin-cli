# sladm — Slack Admin CLI for humans and AI agents

Slack Enterprise Grid / Business+ ワークスペースの `admin.*` API を操作するための CLI & Agent Skill。

[English README](README.md)

## Features

- **107の管理コマンド** — teams, users, conversations, apps, invite-requests, workflows, functions, scim-users, scim-groups, auth-policy, barriers, emoji, roles, usergroups, token の15グループをカバー
- **Agent Skill** — Claude Code / Codex のスキルとして動作し、AI エージェントが CLI 経由で Slack 管理操作を実行可能
- **一括操作** — `conversations bulk-*` で数百チャンネルのアーカイブ・削除・移動を一発実行
- **出力形式** — テーブル（人間向け）、JSON（プログラム連携）、TSV（パイプ向け）
- **複数組織対応** — `--profile` で組織を切り替え、トークンは OS キーチェーンに保存

※このCLIはα版です。自己責任で使ってください。一部の機能しか動作確認を行っていません。

## Installation

[Bun](https://bun.sh) ランタイムが必要です:

```bash
npm install -g sladm-cli
# or
bun install -g sladm-cli
```

インストールせずに直接実行:

```bash
npx sladm-cli --help
# or
bunx sladm-cli --help
```

### ビルド済みバイナリ

ランタイム不要のスタンドアロンバイナリを [Releases](https://github.com/yamitzky/slack-admin-cli/releases) ページからダウンロードできます:

| プラットフォーム | ファイル |
|----------------|---------|
| macOS (Apple Silicon) | `sladm-darwin-arm64` |
| macOS (Intel) | `sladm-darwin-x64` |
| Linux (x64) | `sladm-linux-x64` |
| Linux (arm64) | `sladm-linux-arm64` |
| Windows (x64) | `sladm-windows-x64.exe` |

```bash
# 例: macOS (Apple Silicon) でダウンロード・インストール
curl -L https://github.com/yamitzky/slack-admin-cli/releases/latest/download/sladm-darwin-arm64 -o sladm
chmod +x sladm
sudo mv sladm /usr/local/bin/
```

## Agent Skill

Claude Code、Cursor、OpenCode 等のコーディングエージェントでスキルとして利用する場合:

```bash
npx skills add yamitzky/slack-admin-cli
```

スキルが有効な場合、エージェントは Slack 管理操作に対して自動的に `sladm` コマンドを使用する。コマンドグループごとの recipes が API リファレンスとしてコンテキストに注入される。

## Quick Start

### 1. Slack App の準備

[Slack API](https://api.slack.com/apps) で App を作成し、必要な `admin.*` スコープを付与する（[Required Scopes](#required-scopes) 参照）。

### 2. トークン登録

```bash
sladm token add default xoxp-your-token-here
```

### 3. 動作確認

```bash
sladm token status
sladm teams list
```

## Usage Examples

### ユーザーの招待

```bash
# フルメンバーとして招待
sladm users invite --team-id T024XCDSF --email new-member@example.com \
  --channel-ids C01ABCD2EFG

# シングルチャンネルゲストとして招待
sladm users invite --team-id T024XCDSF --email guest@partner.com \
  --channel-ids C01ABCD2EFG --is-ultra-restricted true
```

### ユーザーの無効化

```bash
# ユーザーを検索
sladm scim-users list --filter 'email eq "leaving@example.com"'

# アカウントを無効化（SCIM API で組織全体に適用）
sladm scim-users deactivate --id U02T7QBTFGA
```

## Authentication

### プロファイル管理

```bash
sladm token add production xoxp-prod-token    # プロファイル追加
sladm token add staging xoxp-staging-token     # 別プロファイル追加
sladm token list                               # プロファイル一覧
sladm token remove staging                     # プロファイル削除
```

トークンは OS のキーチェーン（macOS Keychain / Linux Secret Service）に保存される。キーチェーンが利用できない場合は `~/.config/sladm/.token-<name>` にフォールバック。

### プロファイル切り替え

```bash
sladm --profile production teams list          # フラグで指定
SLADM_PROFILE=staging sladm teams list         # 環境変数で指定
```

優先順位: `--profile` フラグ > `SLADM_PROFILE` 環境変数 > デフォルトプロファイル

プロファイルが一つしかない場合は、`--profile` を指定する必要はありません。

## Output

すべてのデータ返却コマンドで3種類の出力形式をサポート:

```bash
sladm teams list                 # テーブル形式（デフォルト）
sladm teams list --json          # JSON 形式
sladm teams list --plain         # TSV 形式（スクリプト連携向け）
```

## Commands

### Token

| コマンド | 説明 |
|---------|------|
| `token add <NAME> <TOKEN>` | プロファイル追加 |
| `token list` | プロファイル一覧 |
| `token remove <NAME>` | プロファイル削除 |
| `token status` | トークン状態確認 |

### Teams

| コマンド | 説明 |
|---------|------|
| `teams create` | チーム作成 |
| `teams list` | チーム一覧 |
| `teams admins list` | 管理者一覧 |
| `teams owners list` | オーナー一覧 |
| `teams settings info` | チーム設定取得 |
| `teams settings set-name` | チーム名変更 |
| `teams settings set-icon` | アイコン変更 |
| `teams settings set-description` | 説明文変更 |
| `teams settings set-discoverability` | 公開設定変更 |
| `teams settings set-default-channels` | デフォルトチャンネル設定 |

### Users

| コマンド | 説明 |
|---------|------|
| `users list` | ユーザー一覧 |
| `users invite` | ユーザー招待 |
| `users assign` | チームへ割り当て |
| `users remove` | チームから削除 |
| `users set-admin` | 管理者に昇格 |
| `users set-owner` | オーナーに昇格 |
| `users set-regular` | 一般ユーザーに降格 |
| `users set-expiration` | ゲストアカウント有効期限設定 |
| `users unsupported-versions export` | 非対応Slackバージョンのユーザー一覧エクスポート |
| `users session reset` | セッションリセット |
| `users session list` | アクティブセッション一覧 |
| `users session invalidate` | セッション無効化 |
| `users session reset-bulk` | セッション一括リセット |
| `users session get-settings` | セッション設定取得 |
| `users session set-settings` | セッション設定変更 |
| `users session clear-settings` | セッション設定クリア |

### Conversations

| コマンド | 説明 |
|---------|------|
| `conversations create` | チャンネル作成 |
| `conversations delete` | チャンネル削除 |
| `conversations archive` | アーカイブ |
| `conversations unarchive` | アーカイブ解除 |
| `conversations rename` | 名前変更 |
| `conversations search` | チャンネル検索 |
| `conversations invite` | ユーザー招待 |
| `conversations convert-to-private` | プライベートに変換 |
| `conversations convert-to-public` | パブリックに変換 |
| `conversations get-prefs` | チャンネル設定取得 |
| `conversations set-prefs` | チャンネル設定変更 |
| `conversations get-custom-retention` | 保持ポリシー取得 |
| `conversations set-custom-retention` | 保持ポリシー設定 |
| `conversations remove-custom-retention` | 保持ポリシー削除 |
| `conversations get-teams` | 所属チーム一覧 |
| `conversations set-teams` | チーム関連付け |
| `conversations disconnect-shared` | 共有チャンネル切断 |
| `conversations bulk-archive` | 一括アーカイブ |
| `conversations bulk-delete` | 一括削除 |
| `conversations bulk-move` | 一括チーム移動 |
| `conversations lookup` | 条件検索 |
| `conversations restrict-access add-group` | アクセスグループ追加 |
| `conversations restrict-access list-groups` | アクセスグループ一覧 |
| `conversations restrict-access remove-group` | アクセスグループ削除 |
| `conversations ekm list-original-connected-channel-info` | EKM チャンネル情報 |

### SCIM Users

| コマンド | 説明 |
|---------|------|
| `scim-users list` | ユーザー一覧（SCIM） |
| `scim-users get` | ユーザー詳細取得（SCIM） |
| `scim-users create` | ユーザー作成（SCIM） |
| `scim-users update` | ユーザー属性更新（SCIM） |
| `scim-users deactivate` | ユーザー無効化（SCIM） |

### SCIM Groups

| コマンド | 説明 |
|---------|------|
| `scim-groups list` | グループ一覧（SCIM） |
| `scim-groups get` | グループ詳細取得（SCIM） |
| `scim-groups create` | グループ作成（SCIM） |
| `scim-groups update` | グループ更新（SCIM） |
| `scim-groups delete` | グループ削除（SCIM） |

### Apps

| コマンド | 説明 |
|---------|------|
| `apps approve` | アプリ承認 |
| `apps restrict` | アプリ制限 |
| `apps clear-resolution` | 承認/制限クリア |
| `apps uninstall` | アンインストール |
| `apps activities list` | アクティビティログ |
| `apps approved list` | 承認済みアプリ一覧 |
| `apps restricted list` | 制限済みアプリ一覧 |
| `apps requests list` | リクエスト一覧 |
| `apps requests cancel` | リクエストキャンセル |
| `apps config lookup` | アプリ設定取得 |
| `apps config set` | アプリ設定変更 |

### Invite Requests

| コマンド | 説明 |
|---------|------|
| `invite-requests approve` | リクエスト承認 |
| `invite-requests deny` | リクエスト拒否 |
| `invite-requests list` | 保留中リクエスト一覧 |
| `invite-requests approved list` | 承認済み一覧 |
| `invite-requests denied list` | 拒否済み一覧 |

### Workflows

| コマンド | 説明 |
|---------|------|
| `workflows search` | ワークフロー検索 |
| `workflows unpublish` | ワークフロー非公開化 |
| `workflows permissions lookup` | 権限確認 |
| `workflows collaborators add` | コラボレーター追加 |
| `workflows collaborators remove` | コラボレーター削除 |

### Functions

| コマンド | 説明 |
|---------|------|
| `functions list` | 関数一覧 |
| `functions permissions lookup` | 権限確認 |
| `functions permissions set` | 権限設定 |

### Auth Policy

| コマンド | 説明 |
|---------|------|
| `auth-policy assign-entities` | ポリシーにエンティティを割り当て |
| `auth-policy get-entities` | ポリシーに割り当てられたエンティティ一覧 |
| `auth-policy remove-entities` | ポリシーからエンティティを削除 |

### Barriers

| コマンド | 説明 |
|---------|------|
| `barriers create` | 情報バリア作成 |
| `barriers delete` | バリア削除 |
| `barriers list` | バリア一覧 |
| `barriers update` | バリア更新 |

### Emoji

| コマンド | 説明 |
|---------|------|
| `emoji add` | カスタム絵文字追加 |
| `emoji add-alias` | 絵文字エイリアス追加 |
| `emoji list` | カスタム絵文字一覧 |
| `emoji remove` | 絵文字削除 |
| `emoji rename` | 絵文字リネーム |

### Roles

| コマンド | 説明 |
|---------|------|
| `roles add-assignments` | ロール割り当て追加 |
| `roles list-assignments` | ロール割り当て一覧 |
| `roles remove-assignments` | ロール割り当て削除 |

### Usergroups

| コマンド | 説明 |
|---------|------|
| `usergroups add-channels` | ユーザーグループにデフォルトチャンネル追加 |
| `usergroups add-teams` | ユーザーグループにチーム追加 |
| `usergroups list-channels` | ユーザーグループのデフォルトチャンネル一覧 |
| `usergroups remove-channels` | ユーザーグループからデフォルトチャンネル削除 |

## Required Scopes

| スコープ | 用途 |
|---------|------|
| `admin.teams:read` | チーム一覧・設定取得 |
| `admin.teams:write` | チーム作成・設定変更 |
| `admin.users:read` | ユーザー一覧 |
| `admin.users:write` | ユーザー招待・権限変更 |
| `admin.conversations:read` | チャンネル検索・設定取得 |
| `admin.conversations:write` | チャンネル操作・一括処理 |
| `admin.apps:read` | アプリ一覧・設定取得 |
| `admin.apps:write` | アプリ承認・制限・設定変更 |
| `admin.invites:read` | 招待リクエスト一覧 |
| `admin.invites:write` | 招待リクエスト承認・拒否 |
| `admin.workflows:read` | ワークフロー・関数一覧 |
| `admin.workflows:write` | ワークフロー管理・権限設定 |
| `admin` | SCIM ユーザー・グループ管理 |

## Development

```bash
git clone https://github.com/mitsuki-ogasahara/slack-admin-cli.git
cd slack-admin-cli
bun install

bun run dev -- <command>   # 開発時実行
bun test                   # テスト
bun run lint               # 型チェック（tsc --noEmit）
bun link                   # グローバルコマンドとしてリンク
```

### Tech Stack

TypeScript / Bun / [@slack/web-api](https://www.npmjs.com/package/@slack/web-api) / [@optique/core](https://www.npmjs.com/package/@optique/core)

アーキテクチャ詳細: [CLAUDE.md](./CLAUDE.md) 参照

## Related Links

- [Slack Admin API ドキュメント](https://api.slack.com/admins)
- [Slack API メソッド一覧（`admin.*`）](https://api.slack.com/methods?filter=admin)
- [Slack App 管理](https://api.slack.com/apps)

## License

MIT
