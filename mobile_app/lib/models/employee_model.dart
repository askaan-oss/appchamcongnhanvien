class EmployeeModel {
  final int id;
  final String employeeCode;
  final String fullName;
  final String department;
  final String position;
  final String? email;
  final String? phoneNumber;
  final String status;
  final List<String> activeCardUids;

  EmployeeModel({
    required this.id,
    required this.employeeCode,
    required this.fullName,
    required this.department,
    required this.position,
    this.email,
    this.phoneNumber,
    required this.status,
    this.activeCardUids = const [],
  });

  factory EmployeeModel.fromJson(Map<String, dynamic> json) {
    List<String> cards = [];
    if (json['nfcCardUids'] != null && json['nfcCardUids'] is List) {
      cards = (json['nfcCardUids'] as List).map((e) => e.toString()).toList();
    } else if (json['nfcCards'] != null && json['nfcCards'] is List) {
      for (var c in json['nfcCards']) {
        if (c is Map && c['status'] == 'ACTIVE') {
          final uid = c['uid'] ?? c['cardUid'];
          if (uid != null) cards.add(uid.toString());
        } else if (c is String) {
          cards.add(c);
        }
      }
    }

    return EmployeeModel(
      id: json['id'] ?? 0,
      employeeCode: json['employeeCode'] ?? '',
      fullName: json['fullName'] ?? '',
      department: json['department'] ?? '',
      position: json['position'] ?? '',
      email: json['email'],
      phoneNumber: json['phoneNumber'] ?? json['phone'],
      status: json['status'] ?? 'ACTIVE',
      activeCardUids: cards,
    );
  }
}
