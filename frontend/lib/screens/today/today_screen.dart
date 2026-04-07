import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../theme/lacerta_tokens.dart';

class TodayScreen extends ConsumerWidget {
  const TodayScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: colorSurface,
      appBar: AppBar(
        title: const Text('Today'),
        backgroundColor: colorSurfaceVariant,
      ),
      body: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.check_circle_outline, size: 64, color: colorTextMuted),
            SizedBox(height: spacingMd),
            Text(
              'No tasks for today',
              style: TextStyle(fontSize: 18, color: colorTextSecondary),
            ),
            SizedBox(height: spacingSm),
            Text(
              'Create a goal and AI will plan your tasks',
              style: TextStyle(color: colorTextMuted),
            ),
          ],
        ),
      ),
    );
  }
}
