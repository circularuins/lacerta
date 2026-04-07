import 'package:flutter/material.dart';

import '../theme/lacerta_tokens.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: colorSurface,
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.rocket_launch, size: 64, color: colorAccent),
            SizedBox(height: spacingMd),
            Text(
              'Lacerta',
              style: TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.bold,
                color: colorTextPrimary,
              ),
            ),
            SizedBox(height: spacingSm),
            CircularProgressIndicator(color: colorAccent),
          ],
        ),
      ),
    );
  }
}
