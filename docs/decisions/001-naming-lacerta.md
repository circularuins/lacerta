# ADR 001: Naming — Lacerta

**Status:** Accepted
**Date:** 2026-04-07

## Context

yatima プロジェクトの第2弾アプリの名前を決定する必要がある。yatima の命名規則として、Greg Egan 作品の概念・用語からインスピレーションを得ること、および「なぜその名前か」をドキュメントに残すことが求められている。

## Decision

**Lacerta** と命名する。

Greg Egan "Diaspora" において、Lacerta（とかげ座）方面からの天文信号が物語全体の原動力となる。ポリス市民たちはこの遠い信号を検知し、そこへ到達するための遠征を逆算して計画する。

この構造が、本アプリの本質と一致する：

| Diaspora | 本アプリ |
|----------|---------|
| Lacerta 信号（遠い目標） | ユーザーの目標（グラミー賞、ライブ本番等） |
| 遠征の逆算計画 | AI によるタスク逆算 |
| 宇宙の曲率に応じた航路修正 | 進捗に応じた計画再計算 |
| 経験からの知見蓄積 | ユーザーペースの学習 |

また「Lacerta」は星座名でもあり、Gleisner の「アーティストの宇宙」ビジュアルテーマ（星＝投稿、星座＝接続）と自然に接続する。

## Consequences

- アプリ名: Lacerta
- リポジトリ名: `lacerta`
- パッケージ名: `lacerta` (frontend), `lacerta-backend` (backend)
- ドメイン候補: `lacerta.app`
