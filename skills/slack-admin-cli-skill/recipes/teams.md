# Teams 操作

チーム（ワークスペース）の作成・一覧・設定変更。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `teams create` | 新規チーム作成 | `admin.teams:write` |
| `teams list` | チーム一覧 | `admin.teams:read` |
| `teams admins list` | チーム管理者一覧 | `admin.teams:read` |
| `teams owners list` | チームオーナー一覧 | `admin.teams:read` |
| `teams settings info` | チーム設定の詳細 | `admin.teams:read` |
| `teams settings set-name` | チーム名変更 | `admin.teams:write` |
| `teams settings set-icon` | アイコン設定 | `admin.teams:write` |
| `teams settings set-description` | 説明文変更 | `admin.teams:write` |
| `teams settings set-discoverability` | 公開設定変更 | `admin.teams:write` |
| `teams settings set-default-channels` | デフォルトチャンネル設定 | `admin.teams:write` |

## 使用例

```bash
# チーム一覧を取得
sladm teams list --json

# 新規チーム作成
sladm teams create --domain new-team --name "New Team" --description "Description" --discoverability open

# チーム設定を確認
sladm teams settings info --team-id T1234567

# 公開設定を変更（open / closed / invite_only / unlisted）
sladm teams settings set-discoverability --team-id T1234567 --discoverability closed
```
