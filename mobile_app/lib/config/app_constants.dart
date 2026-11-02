class AppConstants {
  // App Mode
  static const String modeKiosk = 'KIOSK';
  static const String modeHr = 'HR';

  // SharedPreferences Keys
  static const String prefAppMode = 'app_mode';
  static const String prefDeviceId = 'device_id';
  static const String prefDeviceName = 'device_name';
  static const String prefApiBaseUrl = 'api_base_url';
  static const String prefAuthToken = 'auth_token';
  static const String prefRefreshToken = 'refresh_token';
  static const String prefUserData = 'user_data';

  // Attendance Statuses
  static const String statusOnTime = 'ON_TIME';
  static const String statusLate = 'LATE';
  static const String statusEarly = 'EARLY';
  static const String statusCompleted = 'COMPLETED';
  static const String statusOvertime = 'OVERTIME';

  // Attendance Methods
  static const String methodNfc = 'NFC';
  static const String methodQr = 'QR';
  static const String methodManual = 'MANUAL';

  // Default Pin for Kiosk Setting
  static const String defaultAdminPin = '888888';
}

