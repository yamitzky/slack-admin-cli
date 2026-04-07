# Users 操作

ユーザーの招待・割り当て・権限昇格・セッション管理。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `users list` | ユーザー一覧 | `admin.users:read` |
| `users invite` | ユーザー招待 | `admin.users:write` |
| `users assign` | チームへ割り当て | `admin.users:write` |
| `users remove` | チームから削除 | `admin.users:write` |
| `users set-admin` | 管理者に昇格 | `admin.users:write` |
| `users set-owner` | オーナーに昇格 | `admin.users:write` |
| `users set-regular` | 一般ユーザーに降格 | `admin.users:write` |
| `users session reset` | セッションリセット | `admin.users:write` |

## 使用例

```bash
# アクティブユーザー一覧
sladm users list --team-id T123 --is-active true

# ユーザー招待（チャンネル指定）
sladm users invite --team-id T123 --email user@example.com --channel-ids C1,C2

# ゲストユーザーとして招待
sladm users invite --team-id T123 --email guest@example.com --channel-ids C1 --is-restricted true

# 管理者に昇格
sladm users set-admin --team-id T123 --user-id U456

# セッションリセット（モバイルのみ）
sladm users session reset --user-id U456 --mobile-only true
```

## Tips

- `--is-restricted true` でマルチチャンネルゲスト
- `--is-ultra-restricted true` でシングルチャンネルゲスト
- セッションリセットで `--mobile-only` / `--web-only` を指定可能
