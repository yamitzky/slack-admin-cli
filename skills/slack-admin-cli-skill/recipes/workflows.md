# Workflows 操作

ワークフロービルダーで作成されたワークフローの検索・管理・権限設定。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `workflows search` | ワークフロー検索 | `admin.workflows:read` |
| `workflows unpublish` | ワークフロー非公開化 | `admin.workflows:write` |
| `workflows permissions lookup` | 権限確認 | `admin.workflows:read` |
| `workflows collaborators add` | コラボレーター追加 | `admin.workflows:write` |
| `workflows collaborators remove` | コラボレーター削除 | `admin.workflows:write` |

## 使用例

```bash
# ワークフロー検索
sladm workflows search --query "onboarding" --json

# 特定アプリのワークフロー
sladm workflows search --app-id A123

# コラボレーターなしのワークフロー
sladm workflows search --no-collaborators true

# ワークフロー非公開化（複数指定可）
sladm workflows unpublish --workflow-ids Fn1,Fn2

# 権限確認
sladm workflows permissions lookup --workflow-ids Fn1,Fn2

# コラボレーター追加
sladm workflows collaborators add --collaborator-ids U1,U2 --workflow-ids Fn1
```

## Tips

- `--workflow-ids` / `--collaborator-ids` はカンマ区切りで複数指定
- `search` の `--sort` は `premium_org_usage` 等を指定可能
