import 'package:flutter/material.dart';
import '../config/app_config.dart';
import '../config/app_constants.dart';
import 'kiosk/kiosk_home_screen.dart';
import 'hr/hr_login_screen.dart';
import 'hr/hr_dashboard_screen.dart';

class ModeSelectScreen extends StatelessWidget {
  const ModeSelectScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 540),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Logo & System Title
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF2563EB), Color(0xFF4F46E5)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.blue.withAlpha(100),
                          blurRadius: 20,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.nfc,
                      color: Colors.white,
                      size: 40,
                    ),
                  ),

                  const SizedBox(height: 20),

                  const Text(
                    'NFC ATTENDANCE SYSTEM',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                    ),
                  ),

                  const SizedBox(height: 6),

                  const Text(
                    'Vui lòng chọn chế độ hoạt động cho thiết bị này',
                    style: TextStyle(
                      color: Color(0xFF94A3B8),
                      fontSize: 13,
                    ),
                  ),

                  const SizedBox(height: 36),

                  // Option 1: Kiosk Station Mode
                  _buildModeCard(
                    context: context,
                    icon: Icons.tablet_mac,
                    iconColor: Colors.blue.shade400,
                    title: 'Chế Độ 1: Kiosk Trạm Chấm Công',
                    subtitle: 'Cài đặt trên máy tính bảng ở cổng ra vào văn phòng hoặc nhà máy. Quẹt thẻ NFC và quét Camera QR một chạm 3 giây.',
                    badgeText: 'Station Kiosk Mode',
                    onTap: () async {
                      await AppConfig.setAppMode(AppConstants.modeKiosk);
                      if (context.mounted) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (_) => const KioskHomeScreen()),
                        );
                      }
                    },
                  ),

                  const SizedBox(height: 20),

                  // Option 2: HR Assistant Mode
                  _buildModeCard(
                    context: context,
                    icon: Icons.phone_android,
                    iconColor: Colors.indigo.shade400,
                    title: 'Chế Độ 2: Trợ Lý Nhân Sự (HR)',
                    subtitle: 'Cài trên điện thoại cán bộ HR. Chạm thẻ NFC vào lưng điện thoại để đọc UID & gán thẻ ngay lập tức, khóa thẻ mất và xem Today Monitor.',
                    badgeText: 'HR Mobile Assistant',
                    onTap: () async {
                      await AppConfig.setAppMode(AppConstants.modeHr);
                      if (context.mounted) {
                        final token = AppConfig.authToken;
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => token != null && token.isNotEmpty
                                ? const HrDashboardScreen()
                                : const HrLoginScreen(),
                          ),
                        );
                      }
                    },
                  ),

                  const SizedBox(height: 32),

                  const Text(
                    'Bạn có thể chuyển đổi lại chế độ bất kỳ lúc nào trong phần Cài đặt.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Color(0xFF64748B),
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModeCard({
    required BuildContext context,
    required IconData icon,
    required Color iconColor,
    required String title,
    required String subtitle,
    required String badgeText,
    required VoidCallback onTap,
  }) {
    return Material(
      color: const Color(0xFF1E293B),
      borderRadius: BorderRadius.circular(20),
      elevation: 2,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        splashColor: iconColor.withAlpha(50),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF334155)),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconColor.withAlpha(40),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(icon, color: iconColor, size: 28),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Flexible(
                          child: Text(
                            title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 15,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, color: Colors.white38, size: 14),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: iconColor.withAlpha(50),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        badgeText,
                        style: TextStyle(
                          color: iconColor,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      subtitle,
                      style: const TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
