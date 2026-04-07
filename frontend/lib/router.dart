import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'providers/auth_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/goals/goals_screen.dart';
import 'screens/splash_screen.dart';
import 'screens/today/today_screen.dart';
import 'widgets/bottom_nav_shell.dart';

final _authNotifierProvider = Provider<ValueNotifier<AuthStatus>>((ref) {
  final notifier = ValueNotifier(AuthStatus.loading);
  ref.listen<AuthState>(authProvider, (prev, next) {
    notifier.value = next.status;
  });
  notifier.value = ref.read(authProvider).status;
  ref.onDispose(notifier.dispose);
  return notifier;
});

final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(_authNotifierProvider);

  final router = GoRouter(
    initialLocation: '/splash',
    refreshListenable: authNotifier,
    redirect: (context, state) {
      final path = state.uri.path;
      final status = authNotifier.value;

      if (status == AuthStatus.loading) {
        return path == '/splash' ? null : '/splash';
      }

      final isAuthRoute = path == '/login' || path == '/signup';

      if (status == AuthStatus.unauthenticated) {
        return isAuthRoute ? null : '/login';
      }

      // authenticated
      if (isAuthRoute || path == '/splash') return '/today';
      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
      GoRoute(
        path: '/signup',
        builder: (context, state) => const SignupScreen(),
      ),

      // Main app with bottom navigation
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) =>
            BottomNavShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/today',
                builder: (context, state) => const TodayScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/goals',
                builder: (context, state) => const GoalsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );

  ref.onDispose(router.dispose);
  return router;
});
