class TapAttendanceRequest {
  final String? cardUid;
  final String? qrPayload;
  final String deviceId;
  final DateTime timestamp;
  final double? latitude;
  final double? longitude;

  TapAttendanceRequest({
    this.cardUid,
    this.qrPayload,
    required this.deviceId,
    required this.timestamp,
    this.latitude,
    this.longitude,
  });

  Map<String, dynamic> toJson() {
    return {
      if (cardUid != null) 'cardUid': cardUid,
      if (qrPayload != null) 'qrPayload': qrPayload,
      'deviceId': deviceId,
      'timestamp': timestamp.toIso8601String(),
      if (latitude != null) 'latitude': latitude,
      if (longitude != null) 'longitude': longitude,
    };
  }
}

