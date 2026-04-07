# ADR 002: Technology Stack

**Status:** Accepted
**Date:** 2026-04-07

## Context

Lacerta は yatima プロジェクトの第2弾アプリ。Gleisner（第1弾）との技術スタック共通化による効率と、Lacerta 固有の要件（AI 中心、モバイルファースト）の最適化のバランスを取る必要がある。

## Decision

| レイヤー | 技術 | Gleisner との関係 |
|----------|------|------------------|
| Frontend | Flutter 3.x (Dart) | 同一 — モバイル native（プッシュ通知・ウィジェット・オフライン）のため |
| Backend | TypeScript + Hono | 同一 |
| Database | PostgreSQL 16 + Drizzle ORM | 同一 |
| API | GraphQL (yoga + pothos) | 同一 |
| Auth | JWT (email + password) | **簡略化** — DID/Ed25519 不要 |
| AI | Claude API (Sonnet) via `@anthropic-ai/sdk` | **新規** — プラン生成・再計算がコア機能 |
| Job Queue | BullMQ (Redis) | **新規** — 日次再計算・通知（Phase 1+） |
| Push | FCM (iOS/Android) | **新規** — 日次タスク配信（Phase 1+） |
| Media Storage | なし | テキスト中心のため R2 不要 |
| Hosting | Cloudflare Pages + Railway | 同一 |
| License | AGPL v3 | 同一 |

### Gleisner と異なる判断の理由

**認証の簡略化:**
- Gleisner の DID/Ed25519 はアーティストの作品永続性のために本質的
- タスク管理データには分散基盤による永続性は不要
- 将来 yatima 共通 ID を作る時に移行可能なよう UUID を採用

**AI サービスレイヤー（新規）:**
- Gleisner では AI はタイトル自動生成の補助的役割
- Lacerta では AI がプロダクトの核心（逆算計画、再計算、ペース学習）
- `src/services/ai.ts` に集約し、GraphQL リゾルバから分離

**BullMQ / FCM（Phase 1+ で追加）:**
- 日次タスク再計算にバックグラウンドジョブが必要
- 「今日のタスク」のプッシュ通知がユーザー体験の核心
- MVP ではまだ不要

## Consequences

- Gleisner と共通の CI/CD パイプライン、デプロイフローが使える
- 認証基盤のコード共有は限定的（JWT 部分のみ）
- AI サービスレイヤーのパターンは将来 Gleisner にも適用可能
- DB ポートは 5434（Gleisner の 5433 と重複しない）
- バックエンドポートは 4001（Gleisner の 4000 と重複しない）
