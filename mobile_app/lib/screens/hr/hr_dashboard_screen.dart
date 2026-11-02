import 'package:flutter/material.dart';
import '../../config/app_config.dart';
import '../../widgets/hr_bottom_nav.dart';
import '../../utils/dialog_utils.dart';
import 'hr_employee_list_screen.dart';
import 'hr_today_monitor_screen.dart';
import '../mode_select_screen.dart';

class HrDashboardScreen extends StatefulWidget {
  const HrDashboardScreen({super.key});

  @override
  State<HrDashboardScreen> createState() => _HrDashboardScreenState();
}

class _HrDashboardScreenState extends State<HrDashboardScreen> {
  int _currentIndex = 0;

  void _handleLogout() async {
    final confirm = await DialogUtils.showConfirmDialog(
      context,
      title: 'Đăng Xuất',
      content: 'Bạn có chắc chắn muốn đăng xuất tài khoản HR khỏi thiết bị này?',
      confirmText: 'Đăng xuất',
    );

    if (confirm == true && mounted) {
      await AppConfig.logout();
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => const ModeSelectScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Trợ Lý Quản Trị Nhân Sự'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Đăng xuất',
            onPressed: _handleLogout,
          ),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeTab(),
          const HrEmployeeListScreen(mode: 'assign'),
          const HrTodayMonitorScreen(),
        ],
      ),
      bottomNavigationBar: HrBottomNav(
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
      ),
    );
  }

  Widget _buildHomeTab() {
    final user = AppConfig.userData ?? 'Cán bộ HR';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Greeting Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.blue.withAlpha(80),
                  blurRadius: 15,
                  offset: const Offset(0, 5),
                ),
              ],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(50),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.badge, color: Colors.white, size: 32),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Xin chào,',
                        style: TextStyle(color: Colors.white70, fontSize: 13),
                      ),
                      Text(
                        user,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'Hệ thống quản lý chấm công & cấp thẻ NFC',
                        style: TextStyle(color: Colors.white70, fontSize: 11),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          const Text(
            'CHỨC NĂNG NGHIỆP VỤ BỎ TÚI',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.1,
              color: Color(0xFF64748B),
            ),
          ),

          const SizedBox(height: 12),

          // Feature 1: Assign NFC
          _buildFeatureCard(
            icon: Icons.contactless,
            iconBg: Colors.indigo.shade50,
            iconColor: Colors.indigo.shade600,
            title: '1. Cấp Thẻ NFC Mới (Chạm Lưng ĐT)',
            description: 'Chọn nhân viên rồi chạm thẻ trắng NTAG215 vào lưng máy để đọc UID và gán thẻ tức thì mà không cần đầu đọc USB.',
            badge: 'Phương án A Khuyên dùng',
            badgeColor: Colors.indigo,
            onTap: () => setState(() => _currentIndex = 1),
          ),

          const SizedBox(height: 16),

          // Feature 2: Revoke card
          _buildFeatureCard(
            icon: Icons.lock_clock,
            iconBg: Colors.red.shade50,
            iconColor: Colors.red.shade600,
            title: '2. Khóa / Thu Hồi Thẻ Mất',
            description: 'Khóa ngay thẻ NFC khi nhân viên báo rơi hoặc mất thẻ, ngăn chặn gian lận quẹt thẻ tại Kiosk.',
            badge: 'Khóa thẻ mất',
            badgeColor: Colors.red,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const HrEmployeeListScreen(mode: 'revoke')),
              );
            },
          ),

          const SizedBox(height: 16),

          // Feature 3: Pocket Today Monitor
          _buildFeatureCard(
            icon: Icons.analytics_outlined,
            iconBg: Colors.green.shade50,
            iconColor: Colors.green.shade600,
            title: '3. Today Monitor Bỏ Túi',
            description: 'Giám sát trực tiếp trên điện thoại danh sách nhân viên đã đến làm việc hôm nay, ai đi trễ, ai chưa tới.',
            badge: 'Xem nhanh',
            badgeColor: Colors.green,
            onTap: () => setState(() => _currentIndex = 2),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureCard({
    required IconData icon,
    required Color iconBg,
    required Color iconColor,
    required String title,
    required String description,
    required String badge,
    required Color badgeColor,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: iconBg,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: iconColor, size: 26),
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
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                              color: Color(0xFF1E293B),
                            ),
                          ),
                        ),
                        const Icon(Icons.arrow_forward_ios, size: 12, color: Colors.grey),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: badgeColor.withAlpha(25),
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(
                        badge,
                        style: TextStyle(color: badgeColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      description,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        height: 1.35,
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
