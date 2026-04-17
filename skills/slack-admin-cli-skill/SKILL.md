---
name: slack-admin-cli-skill
description: >-
  Slack Admin CLI (`sladm`) を使って Slack Admin API / SCIM API を操作する。
  チーム管理・ユーザー管理・チャンネル管理・アプリ管理・ワークフロー管理・招待リクエスト管理・関数管理・SCIMユーザー/グループ管理・
  認証ポリシー・情報バリア・絵文字・ロール・ユーザーグループ管理など、Slack ワークスペースの管理操作を行いたいときに使う。
---

# Slack Admin CLI (sladm)

Slack Enterprise Grid / Business+ ワークスペースの管理 CLI。
`admin.*` スコープの API を直接叩けるため、Web UI では面倒な一括操作やスクリプト化が可能。

## CLI の使い方を調べる

CLI はセルフドキュメンティング。推測せず、必ず `--help` で確認すること。

```bash
sladm --help                          # トップレベルのコマンド一覧
sladm conversations --help            # conversations グループのサブコマンド一覧
sladm conversations search --help     # 個別コマンドのオプション詳細
```

## インストール

```bash
# Bun でグローバルインストール
bun link

# または直接実行
bun run src/index.ts
```

## 認証

```bash
# プロファイルにトークンを登録（キーチェーンに保存）
sladm token add <PROFILE_NAME> <xoxp-...>

# 登録済みプロファイル一覧
sladm token list

# トークンの有効性を確認
sladm token status
```

トークンには `admin.*` スコープが必要。環境変数 `SLADM_PROFILE` でデフォルトプロファイルを指定可能。

## 出力形式

すべてのコマンドで3種類の出力形式をサポート:

- `--json` — JSON 形式（パイプ処理向き）
- `--plain` — タブ区切りテキスト（TSV、スクリプト向き）
- デフォルト — 整形済みテーブル表示

## プロファイル切り替え

```bash
sladm --profile production teams list
sladm --profile staging users list
```

## コマンドグループ

| グループ | 用途 | レシピ |
|---------|------|--------|
| `token` | プロファイル・トークン管理 | — |
| `teams` | チーム作成・設定・管理者一覧 | [teams](recipes/teams.md) |
| `users` | ユーザー招待・昇格・セッション管理 | [users](recipes/users.md) |
| `conversations` | チャンネル操作・一括処理・アクセス制御 | [conversations](recipes/conversations.md) |
| `apps` | アプリ承認・制限・設定 | [apps](recipes/apps.md) |
| `invite-requests` | ワークスペース招待の承認・拒否 | [invite-requests](recipes/invite-requests.md) |
| `workflows` | ワークフロー検索・権限・コラボレーター | [workflows](recipes/workflows.md) |
| `functions` | カスタム関数の一覧・権限設定 | [functions](recipes/functions.md) |
| `scim-users` | SCIM ユーザー管理（作成・更新・無効化） | [scim-users](recipes/scim-users.md) |
| `scim-groups` | SCIM グループ管理（作成・更新・削除） | [scim-groups](recipes/scim-groups.md) |
| `auth-policy` | 認証ポリシーへのエンティティ割り当て | — |
| `barriers` | 情報バリア（Information Barriers）の作成・更新・削除 | — |
| `emoji` | カスタム絵文字の追加・エイリアス・リネーム・削除 | — |
| `roles` | システムロール割り当ての追加・一覧・削除 | — |
| `usergroups` | ユーザーグループのチーム・デフォルトチャンネル管理 | — |

## 新規グループの使用例

レシピ未整備のグループについては `--help` で詳細を確認すること。代表的な例:

```bash
# カスタム絵文字一覧
sladm emoji list --json

# カスタム絵文字追加（URL 指定）
sladm emoji add --name party-parrot --url https://example.com/parrot.gif

# 情報バリア一覧
sladm barriers list

# ロール割り当て一覧（例: チャンネル管理者 ロール）
sladm roles list-assignments --role-id Rl0A

# ユーザーグループにデフォルトチャンネルを追加
sladm usergroups add-channels --usergroup-id S123 --team-id T123 --channel-ids C1,C2

# 認証ポリシーにエンティティを割り当て
sladm auth-policy assign-entities --policy-name email_password --entity-type user --entity-ids U1,U2
```

## トラブルシューティング

- **`Token not found`**: `sladm token add` でトークンを登録する
- **`not_authed` / `invalid_auth`**: トークンが無効。`sladm token status` で確認
- **`missing_scope`**: トークンに必要な `admin.*` スコープがない
- **`not_an_admin`**: Enterprise Grid / Business+ の管理者権限が必要
- **配列パラメータ**: カンマ区切りで指定（例: `--channel-ids C1,C2,C3`）
