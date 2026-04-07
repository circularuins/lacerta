import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

import 'graphql/client.dart';
import 'theme/lacerta_tokens.dart';
import 'router.dart';

final _darkTextTheme = ThemeData.dark().textTheme;
final _bodyTextTheme = GoogleFonts.plusJakartaSansTextTheme(_darkTextTheme);
final _displayTextTheme = GoogleFonts.urbanistTextTheme(_darkTextTheme);

final _lacertaTheme = ThemeData(
  brightness: Brightness.dark,
  colorScheme: ColorScheme.fromSeed(
    seedColor: colorSeed,
    brightness: Brightness.dark,
  ),
  useMaterial3: true,
  textTheme: _bodyTextTheme.copyWith(
    displayLarge: _displayTextTheme.displayLarge,
    displayMedium: _displayTextTheme.displayMedium,
    displaySmall: _displayTextTheme.displaySmall,
    headlineLarge: _displayTextTheme.headlineLarge,
    headlineMedium: _displayTextTheme.headlineMedium,
    headlineSmall: _displayTextTheme.headlineSmall,
    titleLarge: _displayTextTheme.titleLarge,
  ),
);

class LacertaApp extends ConsumerWidget {
  const LacertaApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);
    final clientNotifier = ref.watch(graphqlClientNotifierProvider);

    return GraphQLProvider(
      client: clientNotifier,
      child: MaterialApp.router(
        title: 'Lacerta',
        debugShowCheckedModeBanner: false,
        theme: _lacertaTheme,
        routerConfig: router,
      ),
    );
  }
}
