# Functions 操作

カスタム関数（Slack の次世代プラットフォーム）の一覧・権限管理。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `functions list` | 関数一覧 | `admin.workflows:read` |
| `functions permissions lookup` | 権限確認 | `admin.workflows:read` |
| `functions permissions set` | 権限設定 | `admin.workflows:write` |

## 使用例

```bash
# アプリの関数一覧
sladm functions list --app-ids A1,A2 --json

# 特定チームの関数一覧
sladm functions list --app-ids A1 --team-id T123

# 関数の権限確認
sladm functions permissions lookup --function-ids Fn1,Fn2

# 全員にアクセス許可
sladm functions permissions set --function-id Fn1 --visibility everyone

# 特定ユーザーのみにアクセス許可
sladm functions permissions set --function-id Fn1 --visibility named_entities --user-ids U1,U2
```

## Tips

- `visibility` の値: `everyone`, `app_collaborators`, `named_entities`, `no_one`
- `named_entities` の場合は `--user-ids` が必須
