import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import '../graphql/client.dart';
import '../graphql/queries/auth.dart';
import '../models/user.dart';
import 'disposable_notifier.dart';

enum AuthStatus { loading, authenticated, unauthenticated }

class AuthState {
  final AuthStatus status;
  final User? user;
  final String? error;

  const AuthState({this.status = AuthStatus.loading, this.user, this.error});
}

class AuthNotifier extends Notifier<AuthState>
    with DisposableNotifier<AuthState> {
  late GraphQLClient _client;
  final _storage = const FlutterSecureStorage();

  @override
  AuthState build() {
    _client = ref.watch(graphqlClientProvider);
    initDisposable();
    _initialize();
    return const AuthState();
  }

  Future<void> _initialize() async {
    final token = await _storage.read(key: 'jwt');
    if (token == null) {
      if (disposed) return;
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }

    final result = await _client.query(
      QueryOptions(
        document: gql(meQuery),
        fetchPolicy: FetchPolicy.networkOnly,
      ),
    );

    if (disposed) return;

    if (result.hasException || result.data?['me'] == null) {
      await _storage.delete(key: 'jwt');
      state = const AuthState(status: AuthStatus.unauthenticated);
      return;
    }

    final user = User.fromJson(result.data!['me'] as Map<String, dynamic>);
    state = AuthState(status: AuthStatus.authenticated, user: user);
  }

  Future<void> signup({
    required String email,
    required String password,
    required String username,
  }) async {
    final result = await _client.mutate(
      MutationOptions(
        document: gql(signupMutation),
        variables: {'email': email, 'password': password, 'username': username},
      ),
    );

    if (disposed) return;

    if (result.hasException) {
      final message =
          result.exception?.graphqlErrors.firstOrNull?.message ??
          'Signup failed. Please try again.';
      state = AuthState(status: AuthStatus.unauthenticated, error: message);
      return;
    }

    final data = result.data!['signup'] as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);

    await _storage.write(key: 'jwt', value: token);
    state = AuthState(status: AuthStatus.authenticated, user: user);
  }

  Future<void> login({required String email, required String password}) async {
    final result = await _client.mutate(
      MutationOptions(
        document: gql(loginMutation),
        variables: {'email': email, 'password': password},
      ),
    );

    if (disposed) return;

    if (result.hasException) {
      state = const AuthState(
        status: AuthStatus.unauthenticated,
        error: 'Invalid credentials',
      );
      return;
    }

    final data = result.data!['login'] as Map<String, dynamic>;
    final token = data['token'] as String;
    final user = User.fromJson(data['user'] as Map<String, dynamic>);

    await _storage.write(key: 'jwt', value: token);
    state = AuthState(status: AuthStatus.authenticated, user: user);
  }

  Future<void> logout() async {
    await _storage.delete(key: 'jwt');
    _client.cache.store.reset();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void clearError() {
    if (state.error != null) {
      state = AuthState(status: state.status, user: state.user);
    }
  }
}

final authProvider = NotifierProvider<AuthNotifier, AuthState>(
  AuthNotifier.new,
);
