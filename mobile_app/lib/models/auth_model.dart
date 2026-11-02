class AuthModel {
  final String token;
  final String? refreshToken;
  final String username;
  final String role;
  final String? fullName;

  AuthModel({
    required this.token,
    this.refreshToken,
    required this.username,
    required this.role,
    this.fullName,
  });

  factory AuthModel.fromJson(Map<String, dynamic> json) {
    final userData = json['user'] ?? json;
    return AuthModel(
      token: json['token'] ?? '',
      refreshToken: json['refreshToken'],
      username: userData['username'] ?? '',
      role: userData['role'] ?? 'ADMIN',
      fullName: userData['fullName'] ?? userData['username'],
    );
  }
}

