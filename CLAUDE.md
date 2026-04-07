# CLAUDE.md — Lacerta

このファイルは Lacerta 固有の Claude Code 設定です。
yatima ルートの CLAUDE.md（設計思想・共通ワークフロー）を継承した上で、本ファイルの技術スタック固有ルールが追加適用されます。

## プロジェクト概要

Lacerta は、目標と期日を入力すると AI がジャンル別の工程テンプレートに基づいて逆算し、日々のタスクリストを自動生成するアプリ。ユーザーが毎日の進捗を入力すると、AI がペースを学習し、翌日以降の計画を再計算する。

- 目標からの逆算で実行可能な日次タスクを自動生成
- 進捗入力に応じて AI が計画を再計算
- 使い込むほどユーザーのペースを学習し精度向上

### 命名の由来

Greg Egan "Diaspora" で、ポリス市民を宇宙探索へ駆り立てた **Lacerta 方面からの信号** に由来。遠い目標を検知し、そこへの到達経路を逆算するというアプリの本質と一致。
詳細: `docs/decisions/001-naming-lacerta.md`

## 技術スタック

> **Status: Accepted** — ADR 002 で選定済み。

| レイヤー | 技術 | 備考 |
|----------|------|------|
| Frontend | Flutter 3.x (Dart) | Web first、後に iOS/Android 追加 |
| Backend | TypeScript + Hono | Node.js ランタイム |
| Database | PostgreSQL 16 + Drizzle ORM | 型安全クエリ、Drizzle Kit でマイグレーション |
| API | GraphQL (yoga + pothos) | 型安全な API 層 |
| Auth | JWT (email + password) | シンプルな認証。DID/Ed25519 なし |
| AI | Claude API (Sonnet) | プラン生成・再計算・ペース学習 |
| Hosting | Cloudflare Pages + Railway | フロント: Pages / バックエンド+DB: Railway |

## アーキテクチャ

- **API ファースト設計**: バックエンドとフロントエンドは完全分離。API を介してのみ通信する。
- **モノレポ構成**: `backend/` と `frontend/` が同居。
- **AI サービスレイヤー**: `src/services/ai.ts` に集約。GraphQL リゾルバから直接 Claude API を呼ばない。

## 意思決定ドキュメント

`docs/decisions/` に ADR（Architecture Decision Records）を蓄積する。

- 新規 ADR は連番で追加: `NNN-slug.md`
- 既存 ADR の変更は「Superseded by」で新 ADR を参照
- フォーマット: タイトル / ステータス / コンテキスト / 決定 / 結果

## ADR 駆動開発

**新機能の計画・実装を始める前に、必ず `docs/decisions/` と `docs/ideas/` の関連ドキュメントを読むこと。**

- ADR/Idea に設計済みの機能を独自に再設計してはいけない
- プランニング時は「この機能に関連する ADR/Idea は何か」を先にリストアップする

## 開発コマンド

### 初回セットアップ

```bash
./scripts/dev-setup.sh
```

### 日常の開発

```bash
# バックエンド開発サーバー起動（PostgreSQL も自動起動）
./scripts/dev-start.sh

# フロントエンド開発（別ターミナル）
cd frontend && flutter run -d chrome
```

> **CORS 注意**: Flutter Web のポートは毎回変わるため、バックエンドは `CORS_ORIGIN=*` で起動する必要がある。
> `dev-start.sh` を使わず手動で起動する場合: `CORS_ORIGIN="*" pnpm dev`

### バックエンド個別コマンド

```bash
cd backend
pnpm dev              # 開発サーバー（hot reload）
pnpm build            # TypeScript ビルド
pnpm lint             # ESLint 実行
pnpm lint:fix         # ESLint 自動修正
pnpm format           # Prettier でフォーマット
pnpm format:check     # フォーマットチェック（CI 用）
pnpm db:push          # スキーマをDBに反映（開発用）
pnpm db:generate      # マイグレーションファイル生成
pnpm db:migrate       # マイグレーション実行
pnpm db:studio        # Drizzle Studio（DB GUI）
pnpm test             # テスト実行
pnpm test:watch       # テストウォッチモード
```

### フロントエンド個別コマンド

```bash
cd frontend
dart analyze lib/      # 静的解析
dart format .          # Dart フォーマッタ
flutter test           # テスト実行
```

## 実装ルール

バックエンド・フロントエンドの詳細な実装ルールは `.claude/rules/` に分離（自動読み込み）。

- `.claude/rules/backend-implementation.md` — 認証パターン、AI サービスレイヤー、GraphQL 実装ルール
- `.claude/rules/frontend-implementation.md` — Provider 層ルール、Riverpod 3.x パターン

## Git ワークフロー

**main ブランチへの直接 push は GitHub リポジトリルールで禁止。** 必ずブランチ → PR → マージのフローで作業すること。

## PR 前チェック（Lacerta 固有）

yatima ルートの共通チェック（ビルド・リンター・テスト・diff 確認）に加え、以下を実行:

```bash
# バックエンド
cd backend && pnpm build && pnpm lint && pnpm format:check && pnpm test

# フロントエンド
cd frontend && dart analyze lib/ && dart format --set-exit-if-changed .
```
