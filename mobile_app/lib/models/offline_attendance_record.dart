class OfflineAttendanceRecord {
  final int? id;
  final String? cardUid;
  final String? qrPayload;
  final String method; // NFC or QR
  final String timestamp;
  final String deviceId;
  final int isSynced; // 0: no, 1: yes

  OfflineAttendanceRecord({
    this.id,
    this.cardUid,
    this.qrPayload,
    required this.method,
    required this.timestamp,
    required this.deviceId,
    this.isSynced = 0,
  });

  Map<String, dynamic> toMap() {
    return {
      if (id != null) 'id': id,
      'card_uid': cardUid,
      'qr_payload': qrPayload,
      'method': method,
      'timestamp': timestamp,
      'device_id': deviceId,
      'is_synced': isSynced,
    };
  }

  factory OfflineAttendanceRecord.fromMap(Map<String, dynamic> map) {
    return OfflineAttendanceRecord(
      id: map['id'],
      cardUid: map['card_uid'],
      qrPayload: map['qr_payload'],
      method: map['method'] ?? 'NFC',
      timestamp: map['timestamp'],
      deviceId: map['device_id'],
      isSynced: map['is_synced'] ?? 0,
    );
  }
}

