import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'app_constants.dart';

class AppConfig {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    try {
      await dotenv.load(fileName: 'assets/.env');
    } catch (_) {
      try {
        await dotenv.load(fileName: '.env');
      } catch (_) {
        // Fallback if file missing
      }
    }
    _prefs = await SharedPreferences.getInstance();
  }

  static String get apiBaseUrl {
    final saved = _prefs.getString(AppConstants.prefApiBaseUrl);
    if (saved != null && saved.isNotEmpty && !saved.contains('localhost') && !saved.contains('10.0.2.2')) {
      return saved;
    }
    return dotenv.env['API_BASE_URL'] ?? 'http://192.168.2.13:5013/api/v1';
  }

  static Future<void> setApiBaseUrl(String url) async {
    await _prefs.setString(AppConstants.prefApiBaseUrl, url);
  }

  static String get deviceId {
    return _prefs.getString(AppConstants.prefDeviceId) ??
        dotenv.env['DEFAULT_DEVICE_ID'] ??
        'KIOSK_GATE_01';
  }

  static Future<void> setDeviceId(String id) async {
    await _prefs.setString(AppConstants.prefDeviceId, id);
  }

  static String get deviceName {
    return _prefs.getString(AppConstants.prefDeviceName) ??
        dotenv.env['DEFAULT_DEVICE_NAME'] ??
        'Cổng Chính';
  }

  static Future<void> setDeviceName(String name) async {
    await _prefs.setString(AppConstants.prefDeviceName, name);
  }

  static String get adminPin {
    return dotenv.env['ADMIN_PIN'] ?? AppConstants.defaultAdminPin;
  }

  static String? get appMode {
    return _prefs.getString(AppConstants.prefAppMode);
  }

  static Future<void> setAppMode(String mode) async {
    await _prefs.setString(AppConstants.prefAppMode, mode);
  }

  static String? get authToken {
    return _prefs.getString(AppConstants.prefAuthToken);
  }

  static Future<void> setAuthToken(String? token) async {
    if (token == null) {
      await _prefs.remove(AppConstants.prefAuthToken);
    } else {
      await _prefs.setString(AppConstants.prefAuthToken, token);
    }
  }

  static String? get userData {
    return _prefs.getString(AppConstants.prefUserData);
  }

  static Future<void> setUserData(String? data) async {
    if (data == null) {
      await _prefs.remove(AppConstants.prefUserData);
    } else {
      await _prefs.setString(AppConstants.prefUserData, data);
    }
  }

  static Future<void> logout() async {
    await _prefs.remove(AppConstants.prefAuthToken);
    await _prefs.remove(AppConstants.prefRefreshToken);
    await _prefs.remove(AppConstants.prefUserData);
  }
}

