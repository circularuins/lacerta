## フロントエンド実装ルール

### デザイントークンの使用

新しい色・フォントサイズ・余白を使う場合、`lib/theme/lacerta_tokens.dart` に定義してから参照すること。`Color(0xFF...)` のハードコードは禁止。

### データ操作・ビジネスロジックは Provider/Notifier 層で

Widget 層から GraphQL クライアントを直接操作しない。データの取得・変更・楽観的更新ロジックは必ず Provider/Notifier 経由。

### 表示ウィジェットにナビゲーションを混ぜない

再利用可能なウィジェット内で `context.go()` / `context.push()` を直接呼ばない。Screen レベルでナビゲーション決定。

### サーバーエラーメッセージを UI に露出しない

`e.toString()` や GraphQL エラーメッセージをそのまま UI に表示しない。`debugPrint` でログ + 安全なメッセージを UI に表示。

### Riverpod 3.x Notifier パターン

- `DisposableNotifier` mixin を使用（`lib/providers/disposable_notifier.dart`）
- `build()` 冒頭で `initDisposable()` を呼び、async コールバック内で `if (disposed) return;` チェック
- テストは `ProviderContainer` + `overrides` パターン

### シングルトン Provider の状態汚染防止

複数画面で同じ `NotifierProvider` を使い回す場合、`load` メソッドの冒頭で state を完全リセットし、`FetchPolicy.networkOnly` でキャッシュも回避する。

### Mutation 後の re-fetch には networkOnly が必須

mutation でデータが変わった後の Provider `load()` は `FetchPolicy.networkOnly` を使う。

### ログアウト時のプロバイダー invalidate

ログアウト処理では全ユーザー固有 Provider を invalidate すること。

### リスト state の更新は新しいインスタンスで

`setState` でリストを更新する場合、`.add()` ではなく `[...list, newItem]` で新しいリストを作る。
