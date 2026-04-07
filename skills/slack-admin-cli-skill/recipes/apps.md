# Apps 操作

アプリの承認・制限・アンインストール・設定管理。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `apps approve` | アプリ承認 | `admin.apps:write` |
| `apps restrict` | アプリ制限 | `admin.apps:write` |
| `apps clear-resolution` | 承認/制限のクリア | `admin.apps:write` |
| `apps uninstall` | アンインストール | `admin.apps:write` |
| `apps activities list` | アクティビティログ | `admin.apps:read` |
| `apps approved list` | 承認済みアプリ一覧 | `admin.apps:read` |
| `apps restricted list` | 制限済みアプリ一覧 | `admin.apps:read` |
| `apps requests list` | リクエスト一覧 | `admin.apps:read` |
| `apps requests cancel` | リクエストキャンセル | `admin.apps:write` |
| `apps config lookup` | アプリ設定取得 | `admin.apps:read` |
| `apps config set` | アプリ設定変更 | `admin.apps:write` |

## 使用例

```bash
# 承認済みアプリ一覧
sladm apps approved list --team-id T123 --json

# アプリを承認（app_id で指定）
sladm apps approve --app-id A123 --team-id T456

# アプリを承認（request_id で指定）
sladm apps approve --request-id Ar123 --team-id T456

# アプリのアンインストール
sladm apps uninstall --app-id A123 --enterprise-id E789

# アクティビティログ確認
sladm apps activities list --app-id A123 --min-log-level error

# アプリ設定変更
sladm apps config set --app-id A123 --workflow-auth-strategy end_user_only

# ドメイン制限の設定
sladm apps config set --app-id A123 --domain-restrictions '{"urls":["https://example.com"]}'
```

## Tips

- `approve` / `restrict` は `--app-id` か `--request-id` のどちらかを指定
- `--team-id` か `--enterprise-id` のどちらかを指定（Enterprise Grid の場合）
- `config lookup` の `--app-ids` はカンマ区切り
