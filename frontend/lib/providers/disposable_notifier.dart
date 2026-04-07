import 'package:flutter_riverpod/flutter_riverpod.dart';

/// Mixin for Notifiers that need to track disposal state.
/// Call [initDisposable] in [build] and check [disposed] in async callbacks.
mixin DisposableNotifier<T> on Notifier<T> {
  bool _disposed = false;
  bool get disposed => _disposed;

  void initDisposable() {
    _disposed = false;
    ref.onDispose(() => _disposed = true);
  }
}
