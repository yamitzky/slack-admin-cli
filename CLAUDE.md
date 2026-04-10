# CLAUDE.md

## Overview

Slack Admin CLI (`sladm`) — Slack Admin API を操作するための CLI ツール。Enterprise Grid / Business+ ワークスペースの管理操作をコマンドラインから実行できる。

## Build & Run

```bash
bun run dev -- <command>       # 開発時実行
bun link                       # グローバルインストール（sladm コマンド）
```

## Test & Lint

```bash
bun test                       # 全テスト実行
bun test tests/commands/apps   # 特定ディレクトリのテスト
bun run lint                   # TypeScript 型チェック（tsc --noEmit）
```

## Architecture

- **Runtime**: Bun
- **CLI Parser**: `@optique/core` + `@optique/run`
- **Slack SDK**: `@slack/web-api` (`WebClient`)
- **Token Storage**: OS キーチェーン（`Bun.secrets`）、フォールバックでファイル保存

### ディレクトリ構成

```
src/
├── index.ts          # CLI パーサー定義 + コマンドルーティング（switch文）
├── client.ts         # WebClient ファクトリ
├── config.ts         # プロファイル・トークン管理
├── output.ts         # 出力フォーマッタ（JSON / table / plain）
└── commands/         # コマンド実装（グループ/サブコマンドごとにファイル分割）
    ├── token/
    ├── teams/
    ├── users/
    ├── conversations/
    ├── apps/
    ├── invite-requests/
    ├── workflows/
    └── functions/
tests/                # テスト（commands/ 以下と同構造）
skills/               # Agent Skill 定義
```

### コマンド実装パターン

各コマンドファイルは以下のパターンに従う:

1. **Options インターフェース**: camelCase で定義
2. **execute 関数**: `(client: WebClient, opts: Options) => Promise<void | T[]>`
3. **パラメータ変換**: camelCase → snake_case で Slack API に渡す
4. **discriminated union 対応**: SDK の型制約がある場合は `client.apiCall()` を使用

### 型安全性ルール

- **`as` キャスト原則禁止**: 実装コードで `as` を使わない。`satisfies` または設計の見直しで対応
- **SDK 型バグの回避**: SDK の型定義が実際の API と異なる場合、`apiCall()` より `as` での回避を優先する
- **discriminated union**: `client.apiCall(methodName, params)` で `Record<string, unknown>` として渡す（void メソッド）
- **データ返却メソッド**: ブランチパターンで型安全に（`if (opts.teamId) { ... } else if (opts.enterpriseId) { ... }`）

### テストパターン

```typescript
// apiCall を使うコマンド
const mockApiCall = mock(() => Promise.resolve({ ok: true }));
const client = { apiCall: mockApiCall } as any;

// 型付きメソッドを使うコマンド
const mockList = mock(() => Promise.resolve({ ok: true, items: [] }));
const client = { admin: { apps: { approved: { list: mockList } } } } as any;
```

## Commit Style

```
feat: add conversations search command
fix: handle empty response in teams list
```

短い1行サマリー。本文は必要な場合のみ。
