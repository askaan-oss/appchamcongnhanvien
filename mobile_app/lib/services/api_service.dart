import 'package:dio/dio.dart';
import '../config/app_config.dart';
import '../models/tap_attendance_request.dart';
import '../models/tap_attendance_response.dart';
import '../models/sync_offline_package.dart';
import '../models/employee_model.dart';
import '../models/auth_model.dart';

class ApiService {
  static final ApiService instance = ApiService._init();
  late Dio _dio;

  ApiService._init() {
    _dio = Dio(
      BaseOptions(
        baseUrl: AppConfig.apiBaseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 15),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    // Interceptor: inject Bearer token and dynamically use latest BaseUrl
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) {
          options.baseUrl = AppConfig.apiBaseUrl;
          final token = AppConfig.authToken;
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
      ),
    );
  }

  // 1. Kiosk: Smart Tap Attendance (Auto Detect Check-In / Check-Out)
  Future<TapAttendanceResponse> tapAttendance(TapAttendanceRequest request) async {
    try {
      final response = await _dio.post(
        '/attendance/tap',
        data: request.toJson(),
      );

      final data = response.data is Map ? response.data : {};
      final payload = data['data'] ?? data;
      return TapAttendanceResponse.fromJson(payload);
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        return TapAttendanceResponse.fromJson(Map<String, dynamic>.from(e.response!.data as Map));
      }
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi kết nối máy chủ';
      return TapAttendanceResponse.error(msg);
    } catch (e) {
      return TapAttendanceResponse.error(e.toString());
    }
  }

  // 1b. Kiosk: Forced Check-In
  Future<TapAttendanceResponse> checkIn(TapAttendanceRequest request) async {
    try {
      final response = await _dio.post(
        '/attendance/check-in',
        data: request.toJson(),
      );

      final data = response.data is Map ? response.data : {};
      final payload = data['data'] ?? data;
      return TapAttendanceResponse.fromJson(payload);
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        return TapAttendanceResponse.fromJson(Map<String, dynamic>.from(e.response!.data as Map));
      }
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi kết nối máy chủ';
      return TapAttendanceResponse.error(msg);
    } catch (e) {
      return TapAttendanceResponse.error(e.toString());
    }
  }

  // 1c. Kiosk: Forced Check-Out
  Future<TapAttendanceResponse> checkOut(TapAttendanceRequest request) async {
    try {
      final response = await _dio.post(
        '/attendance/check-out',
        data: request.toJson(),
      );

      final data = response.data is Map ? response.data : {};
      final payload = data['data'] ?? data;
      return TapAttendanceResponse.fromJson(payload);
    } on DioException catch (e) {
      if (e.response?.data is Map) {
        return TapAttendanceResponse.fromJson(Map<String, dynamic>.from(e.response!.data as Map));
      }
      final msg = e.response?.data?['message'] ?? e.message ?? 'Lỗi kết nối máy chủ';
      return TapAttendanceResponse.error(msg);
    } catch (e) {
      return TapAttendanceResponse.error(e.toString());
    }
  }

  // 2. Kiosk: Verify NFC Card
  Future<bool> verifyCard(String cardUid) async {
    try {
      final response = await _dio.post('/nfc/verify', data: {'cardUid': cardUid});
      return response.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // 3. Kiosk: Sync Offline Attendances
  Future<bool> syncOffline(SyncOfflinePackage package) async {
    try {
      final response = await _dio.post(
        '/attendance/sync-offline',
        data: package.toJson(),
      );
      return response.statusCode == 200 || response.statusCode == 201;
    } catch (_) {
      return false;
    }
  }

  // 4. HR: Login
  Future<AuthModel> login(String username, String password) async {
    final response = await _dio.post(
      '/auth/login',
      data: {'username': username, 'password': password},
    );

    final data = response.data is Map ? response.data : {};
    final payload = data['data'] ?? data;
    final auth = AuthModel.fromJson(payload);

    await AppConfig.setAuthToken(auth.token);
    await AppConfig.setUserData(auth.username);
    return auth;
  }

  // 5. HR: Get Employees List
  Future<List<EmployeeModel>> getEmployees({String? search, String? department}) async {
    final response = await _dio.get(
      '/employees',
      queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        if (department != null && department.isNotEmpty) 'department': department,
        'pageSize': 100,
      },
    );

    final data = response.data is Map ? response.data : {};
    final payload = data['data'] ?? data;
    final items = payload is List ? payload : (payload['items'] ?? []);

    return (items as List).map((json) => EmployeeModel.fromJson(json)).toList();
  }

  // 6. HR: Assign NFC Card UID via phone back tap
  Future<bool> assignNfc({
    required int employeeId,
    required String cardUid,
    String? note,
  }) async {
    final cleanUid = cardUid.trim().toUpperCase();
    final response = await _dio.post(
      '/nfc/assign',
      data: {
        'employeeId': employeeId,
        'uid': cleanUid,
        'cardUid': cleanUid,
        if (note != null) 'note': note,
      },
    );
    return response.statusCode == 200 || response.statusCode == 201;
  }

  // 7. HR: Revoke / Lock Card
  Future<bool> revokeNfc({required String cardUid, String? reason}) async {
    final response = await _dio.post(
      '/nfc/revoke',
      data: {
        'cardUid': cardUid,
        'reason': reason ?? 'Khóa thẻ từ App Mobile HR',
      },
    );
    return response.statusCode == 200;
  }

  // 8. HR: Today Monitor
  Future<List<Map<String, dynamic>>> getTodayAttendance() async {
    final response = await _dio.get('/attendance/today');
    final data = response.data is Map ? response.data : {};
    final payload = data['data'] ?? data;
    if (payload is List) {
      return payload.map((e) => Map<String, dynamic>.from(e)).toList();
    }
    return [];
  }
}

