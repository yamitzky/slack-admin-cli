# Invite Requests 操作

ワークスペース参加リクエストの管理（承認・拒否・一覧）。

## コマンド一覧

| コマンド | 説明 | 必須スコープ |
|---------|------|-------------|
| `invite-requests approve` | リクエスト承認 | `admin.invites:write` |
| `invite-requests deny` | リクエスト拒否 | `admin.invites:write` |
| `invite-requests list` | 保留中リクエスト一覧 | `admin.invites:read` |
| `invite-requests approved list` | 承認済みリクエスト一覧 | `admin.invites:read` |
| `invite-requests denied list` | 拒否済みリクエスト一覧 | `admin.invites:read` |

## 使用例

```bash
# 保留中の招待リクエスト一覧
sladm invite-requests list --team-id T123

# リクエストを承認
sladm invite-requests approve --invite-request-id Ir123 --team-id T456

# リクエストを拒否
sladm invite-requests deny --invite-request-id Ir123 --team-id T456

# 承認済みリクエストの確認
sladm invite-requests approved list --team-id T123 --json
```
