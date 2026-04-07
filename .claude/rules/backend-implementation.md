## バックエンド実装ルール

### 認証パターン

- JWT + scrypt パスワードハッシュ（N=16384, r=8, p=1）
- `authMiddleware` が Bearer トークンを検証し `c.set("authUser")` にセット
- GraphQL リゾルバ内で `ctx.authUser` をチェックして認証ガード
- ログイン失敗は一律 "Invalid credentials"（情報漏洩防止）
- DB クエリで `passwordHash` / `passwordSalt` を select しない（`userColumns` を使用）

### AI サービスレイヤー

**GraphQL リゾルバから Anthropic SDK を直接呼ばないこと。** `src/services/ai.ts` を経由する。

- AI 呼び出しは常に try-catch で包む（AI 障害でアプリが止まらないように）
- AI の応答は JSON パースして構造を検証する
- `ANTHROPIC_API_KEY` 未設定時は AI 機能を無効化（エラーにしない）
- 外部 API エラーをクライアントに露出しない

### GraphQL フィールドの追加

**フロントエンドの GraphQL クエリにフィールドを追加する前に、バックエンドの Pothos 型定義で当該フィールドが expose されているか確認すること。**

### 認可チェックの全経路統一

**同じデータに到達する全クエリ/リゾルバに同一の認可条件を適用すること。**

### N+1 クエリの解消

子リゾルバが親ごとに個別 SELECT を発行する N+1 は、JOIN + プリフェッチで解消する。

### Drizzle ORM: nullable カラムでの eq() 型エラー

nullable カラムに対して `eq()` を使うと TypeScript の型エラーになる。`sql` テンプレートを使うこと。

### 複合 mutation はトランザクション必須

複数テーブルに書き込む mutation は `db.transaction()` で包む。

### 外部 SDK エラーのクライアント露出防止

外部 SDK（Anthropic SDK 等）のエラーメッセージをクライアントにそのまま返さない。

### テスト

- 共通ヘルパーは `src/graphql/__tests__/helpers.ts` に集約
- 各テストファイルの `beforeEach` で `TRUNCATE users CASCADE` を実行
