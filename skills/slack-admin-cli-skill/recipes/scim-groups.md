# SCIM Groups 操作

SCIM v2.0 API 経由のグループ（IDP グループ）管理。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `scim-groups list` | グループ一覧 | `admin` |
| `scim-groups get` | グループ詳細取得 | `admin` |
| `scim-groups create` | グループ作成 | `admin` |
| `scim-groups update` | グループ更新 | `admin` |
| `scim-groups delete` | グループ削除 | `admin` |

## 使用例

```bash
# グループ一覧
sladm scim-groups list

# グループ詳細（メンバー一覧含む）
sladm scim-groups get --id G12345

# グループ作成（メンバー付き）
sladm scim-groups create --display-name "Engineering" --member-ids U001,U002,U003

# グループ名変更
sladm scim-groups update --id G12345 --display-name "Platform Engineering"

# メンバー追加
sladm scim-groups update --id G12345 --add-member-ids U004,U005

# メンバー削除
sladm scim-groups update --id G12345 --remove-member-ids U001

# グループ削除（メンバーはアクティブのまま）
sladm scim-groups delete --id G12345
```

## Tips

- `delete` はグループのみ削除。メンバーのアカウントには影響しない
- `update` の `--add-member-ids` と `--remove-member-ids` は同時に指定可能
- 大量メンバー追加は 5,000 件以下に分割することを推奨（Slack 制限）
