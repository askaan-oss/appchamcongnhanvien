import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'config/app_config.dart';
import 'config/app_constants.dart';
import 'config/app_theme.dart';
import 'services/sync_service.dart';
import 'screens/mode_select_screen.dart';
import 'screens/kiosk/kiosk_home_screen.dart';
import 'screens/hr/hr_login_screen.dart';
import 'screens/hr/hr_dashboard_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Initialize Config & DotEnv
  await AppConfig.init();

  // Initialize background Offline Sync Worker
  SyncService.instance.init();

  // Transparent system status bar
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );

  runApp(const NfcAttendanceApp());
}

class NfcAttendanceApp extends StatelessWidget {
  const NfcAttendanceApp({super.key});

  @override
  Widget build(BuildContext context) {
    final mode = AppConfig.appMode;
    final isKiosk = mode == AppConstants.modeKiosk;

    Widget homeScreen;
    if (mode == AppConstants.modeKiosk) {
      homeScreen = const KioskHomeScreen();
    } else if (mode == AppConstants.modeHr) {
      final token = AppConfig.authToken;
      homeScreen = (token != null && token.isNotEmpty)
          ? const HrDashboardScreen()
          : const HrLoginScreen();
    } else {
      homeScreen = const ModeSelectScreen();
    }
 
    return MaterialApp(
      title: 'NFC Attendance Kiosk',
      debugShowCheckedModeBanner: false,
      theme: isKiosk ? AppTheme.kioskTheme : AppTheme.hrTheme,
      home: homeScreen,
    );
  }
}
