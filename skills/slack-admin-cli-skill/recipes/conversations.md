# Conversations 操作

チャンネルの作成・検索・一括操作・アクセス制御。最も豊富なコマンドセット。

## コマンド一覧

### 基本操作

| コマンド | 説明 |
|---------|------|
| `conversations create` | チャンネル作成 |
| `conversations delete` | チャンネル削除 |
| `conversations archive` | アーカイブ |
| `conversations unarchive` | アーカイブ解除 |
| `conversations rename` | チャンネル名変更 |
| `conversations search` | チャンネル検索 |
| `conversations invite` | ユーザー招待 |

### 変換

| コマンド | 説明 |
|---------|------|
| `conversations convert-to-private` | パブリック → プライベート |
| `conversations convert-to-public` | プライベート → パブリック |

### 設定

| コマンド | 説明 |
|---------|------|
| `conversations get-prefs` | チャンネル設定取得 |
| `conversations set-prefs` | チャンネル設定変更 |
| `conversations get-custom-retention` | 保持ポリシー取得 |
| `conversations set-custom-retention` | 保持ポリシー設定 |
| `conversations remove-custom-retention` | 保持ポリシー削除 |

### チーム関連

| コマンド | 説明 |
|---------|------|
| `conversations get-teams` | チャンネルの所属チーム |
| `conversations set-teams` | チームの関連付け |
| `conversations disconnect-shared` | 共有チャンネル切断 |

### 一括操作

| コマンド | 説明 |
|---------|------|
| `conversations bulk-archive` | 一括アーカイブ |
| `conversations bulk-delete` | 一括削除 |
| `conversations bulk-move` | 一括チーム移動 |

### 高度な機能

| コマンド | 説明 |
|---------|------|
| `conversations lookup` | 条件検索（最終投稿日時・メンバー数） |
| `conversations restrict-access add-group` | アクセスグループ追加 |
| `conversations restrict-access list-groups` | アクセスグループ一覧 |
| `conversations restrict-access remove-group` | アクセスグループ削除 |
| `conversations ekm list-original-connected-channel-info` | EKM チャンネル情報 |

## 使用例

```bash
# チャンネル検索
sladm conversations search --query "project" --team-ids T123 --json

# パブリックチャンネル作成
sladm conversations create --name "new-channel" --is-private false --team-id T123

# 一括アーカイブ
sladm conversations bulk-archive --channel-ids C1,C2,C3

# 非アクティブチャンネルの検索（90日以上投稿なし）
sladm conversations lookup --team-ids T123 --last-message-activity-before 1704067200

# カスタム保持ポリシー設定（30日）
sladm conversations set-custom-retention --channel-id C123 --duration-days 30

# アクセスグループ制限
sladm conversations restrict-access add-group --channel-id C123 --group-id S456
```

## Tips

- `--last-message-activity-before` は UNIX タイムスタンプ（秒）
- `bulk-*` コマンドの `--channel-ids` はカンマ区切り
- `set-prefs` の `--prefs` は JSON 文字列で指定
- `set-teams --allow-disconnect true` で安全チェックをスキップ
