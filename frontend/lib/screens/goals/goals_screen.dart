import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../theme/lacerta_tokens.dart';

class GoalsScreen extends ConsumerWidget {
  const GoalsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: colorSurface,
      appBar: AppBar(
        title: const Text('Goals'),
        backgroundColor: colorSurfaceVariant,
      ),
      body: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.flag, size: 64, color: colorTextMuted),
            SizedBox(height: spacingMd),
            Text(
              'No goals yet',
              style: TextStyle(fontSize: 18, color: colorTextSecondary),
            ),
            SizedBox(height: spacingSm),
            Text(
              'Create a goal to get started',
              style: TextStyle(color: colorTextMuted),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          // TODO: Navigate to create goal
        },
        backgroundColor: colorAccent,
        child: const Icon(Icons.add),
      ),
    );
  }
}
