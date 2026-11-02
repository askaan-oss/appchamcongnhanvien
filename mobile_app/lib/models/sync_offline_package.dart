import 'offline_attendance_record.dart';

class SyncOfflinePackage {
  final String deviceId;
  final List<OfflineAttendanceRecord> records;

  SyncOfflinePackage({
    required this.deviceId,
    required this.records,
  });

  Map<String, dynamic> toJson() {
    return {
      'deviceId': deviceId,
      'records': records.map((r) => {
        if (r.cardUid != null) 'cardUid': r.cardUid,
        if (r.qrPayload != null) 'qrPayload': r.qrPayload,
        'timestamp': r.timestamp,
      }).toList(),
    };
  }
}

