# SCIM Users 操作

SCIM v2.0 API 経由のユーザー管理。組織全体（Org レベル）でのユーザー作成・更新・無効化が可能。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `scim-users list` | ユーザー一覧 | `admin` |
| `scim-users get` | ユーザー詳細取得 | `admin` |
| `scim-users create` | ユーザー作成 | `admin` |
| `scim-users update` | ユーザー属性更新 | `admin` |
| `scim-users deactivate` | ユーザー無効化 | `admin` |

## 使用例

```bash
# ユーザー一覧（最初の50件）
sladm scim-users list --count 50

# フィルターで検索
sladm scim-users list --filter 'userName eq "alice"'

# ユーザー詳細
sladm scim-users get --id U12345

# ユーザー作成
sladm scim-users create --user-name alice --email alice@example.com --given-name Alice --family-name Smith

# ユーザー属性更新
sladm scim-users update --id U12345 --title "Senior Engineer" --display-name "Alice S."

# ユーザー無効化（組織全体から deactivate）
sladm scim-users deactivate --id U12345
```

## admin.users との違い

| 操作 | admin.users | scim-users |
|------|------------|------------|
| ユーザー一覧 | ワークスペース単位（`--team-id` 必須） | 組織全体 |
| ユーザー作成 | `invite`（招待） | `create`（直接作成） |
| ユーザー無効化 | `remove`（ワークスペースから除外のみ） | `deactivate`（組織全体で無効化） |
| プロフィール更新 | 不可 | `update` で可能 |

## Tips

- `--filter` は SCIM フィルター構文: `userName eq "alice"`, `active eq "true"` 等
- `deactivate` は完全削除ではなく無効化。ユーザーレコードは残る
- `update` は指定したフィールドのみ更新（PATCH）。省略したフィールドは変更されない
