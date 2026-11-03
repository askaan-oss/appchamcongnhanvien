class TapAttendanceResponse {
  final bool isSuccess;
  final String? employeeCode;
  final String? employeeName;
  final String? department;
  final String? shiftName;
  final String? shiftTime;
  final DateTime? checkTime;
  final String? status;
  final int lateMinutes;
  final String? method;
  final String message;
  final bool isCheckOut;

  TapAttendanceResponse({
    required this.isSuccess,
    this.employeeCode,
    this.employeeName,
    this.department,
    this.shiftName,
    this.shiftTime,
    this.checkTime,
    this.status,
    this.lateMinutes = 0,
    this.method,
    required this.message,
    this.isCheckOut = false,
  });

  factory TapAttendanceResponse.fromJson(Map<String, dynamic> json) {
    return TapAttendanceResponse(
      isSuccess: json['isSuccess'] ?? json['success'] ?? false,
      employeeCode: json['employeeCode'],
      employeeName: json['employeeName'] ?? json['fullName'],
      department: json['department'],
      shiftName: json['shiftName'] ?? json['ShiftName'],
      shiftTime: json['shiftTime'] ?? json['ShiftTime'],
      checkTime: json['checkTime'] != null 
          ? DateTime.tryParse(json['checkTime']) 
          : (json['timestamp'] != null ? DateTime.tryParse(json['timestamp']) : null),
      status: json['status'],
      lateMinutes: json['lateMinutes'] ?? 0,
      method: json['method'],
      message: json['message'] ?? 'Thao tác thành công',
      isCheckOut: json['isCheckOut'] == true || (json['action'] ?? json['Action']) == 'CHECK_OUT',
    );
  }

  factory TapAttendanceResponse.offlineSaved({required String codeOrUid, required String method}) {
    return TapAttendanceResponse(
      isSuccess: true,
      employeeCode: codeOrUid,
      employeeName: 'Lưu Offline',
      department: 'Chờ đồng bộ',
      checkTime: DateTime.now(),
      status: 'OFFLINE_SAVED',
      lateMinutes: 0,
      method: method,
      message: 'Đã lưu cục bộ! Sẽ tự đồng bộ khi có mạng.',
    );
  }

  factory TapAttendanceResponse.error(String message) {
    return TapAttendanceResponse(
      isSuccess: false,
      message: message,
    );
  }
}

