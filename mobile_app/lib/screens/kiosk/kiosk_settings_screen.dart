import 'package:flutter/material.dart';
import '../../config/app_config.dart';
import '../../services/sync_service.dart';
import '../../services/offline_database_service.dart';
import '../../utils/dialog_utils.dart';
import '../mode_select_screen.dart';

class KioskSettingsScreen extends StatefulWidget {
  const KioskSettingsScreen({super.key});

  @override
  State<KioskSettingsScreen> createState() => _KioskSettingsScreenState();
}

class _KioskSettingsScreenState extends State<KioskSettingsScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _deviceIdController;
  late TextEditingController _deviceNameController;
  late TextEditingController _apiUrlController;
  bool _isSyncing = false;
  int _offlineCount = 0;

  @override
  void initState() {
    super.initState();
    _deviceIdController = TextEditingController(text: AppConfig.deviceId);
    _deviceNameController = TextEditingController(text: AppConfig.deviceName);
    _apiUrlController = TextEditingController(text: AppConfig.apiBaseUrl);
    _loadOfflineCount();
  }

  Future<void> _loadOfflineCount() async {
    final count = await OfflineDatabaseService.instance.getUnsyncedCount();
    if (mounted) {
      setState(() {
        _offlineCount = count;
      });
    }
  }

  Future<void> _saveSettings() async {
    if (!_formKey.currentState!.validate()) return;

    await AppConfig.setDeviceId(_deviceIdController.text.trim());
    await AppConfig.setDeviceName(_deviceNameController.text.trim());
    await AppConfig.setApiBaseUrl(_apiUrlController.text.trim());

    if (mounted) {
      DialogUtils.showSnackBar(context, 'Đã lưu cấu hình trạm thành công!');
      Navigator.of(context).pop(true);
    }
  }

  Future<void> _triggerManualSync() async {
    setState(() => _isSyncing = true);
    final count = await SyncService.instance.syncPendingRecords();
    await _loadOfflineCount();
    if (mounted) setState(() => _isSyncing = false);

    if (mounted) {
      DialogUtils.showSnackBar(
        context,
        count > 0 ? 'Đã đồng bộ thành công $count bản ghi!' : 'Không có bản ghi nào cần đồng bộ.',
      );
    }
  }

  void _switchAppMode() async {
    final confirm = await DialogUtils.showConfirmDialog(
      context,
      title: 'Đổi Chế Độ Hoạt Động',
      content: 'Bạn có chắc chắn muốn thoát khỏi chế độ Kiosk để chuyển sang chế độ khác không?',
      confirmText: 'Chuyển chế độ',
    );

    if (confirm == true && mounted) {
      await AppConfig.setAppMode('');
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
  void dispose() {
    _deviceIdController.dispose();
    _deviceNameController.dispose();
    _apiUrlController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        title: const Text('Cài Đặt Trạm Kiosk Chấm Công'),
        backgroundColor: const Color(0xFF1E293B),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Offline sync card
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF334155)),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.withAlpha(40),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.sync, color: Colors.amber, size: 28),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Dữ liệu Offline cục bộ',
                            style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Text(
                            'Hiện có $_offlineCount bản ghi chờ đồng bộ lên server',
                            style: const TextStyle(color: Color(0xFF94A3B8), fontSize: 12),
                          ),
                        ],
                      ),
                    ),
                    ElevatedButton(
                      onPressed: _isSyncing ? null : _triggerManualSync,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.amber.shade700,
                        foregroundColor: Colors.white,
                      ),
                      child: _isSyncing
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                          : const Text('Đồng bộ ngay'),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              const Text(
                'THAM SỐ TRẠM KIOSK',
                style: TextStyle(color: Colors.blueAccent, fontWeight: FontWeight.bold, fontSize: 12, letterSpacing: 1.2),
              ),

              const SizedBox(height: 12),

              _buildTextField(
                controller: _deviceIdController,
                label: 'Mã định danh trạm (Device ID)',
                hint: 'KIOSK_GATE_01',
                icon: Icons.qr_code,
              ),

              const SizedBox(height: 16),

              _buildTextField(
                controller: _deviceNameController,
                label: 'Tên trạm hiển thị',
                hint: 'Cổng Chính, Xưởng 1, Quầy Lễ Tân...',
                icon: Icons.title,
              ),

              const SizedBox(height: 16),

              _buildTextField(
                controller: _apiUrlController,
                label: 'Địa chỉ Backend API',
                hint: 'http://192.168.1.100:5013/api/v1',
                icon: Icons.dns,
              ),

              const SizedBox(height: 32),

              Row(
                children: [
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: _saveSettings,
                      icon: const Icon(Icons.save),
                      label: const Text('Lưu Thay Đổi', style: TextStyle(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue.shade600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 32),
              const Divider(color: Colors.white12),
              const SizedBox(height: 16),

              // Switch Mode Button
              Center(
                child: TextButton.icon(
                  onPressed: _switchAppMode,
                  icon: const Icon(Icons.swap_horiz, color: Color(0xFF94A3B8)),
                  label: const Text(
                    'Đổi Chế Độ Ứng Dụng (Kiosk <-> HR)',
                    style: TextStyle(color: Color(0xFF94A3B8), fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600)),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          style: const TextStyle(color: Colors.white, fontSize: 14),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.white24),
            prefixIcon: Icon(icon, color: Colors.blueAccent, size: 20),
            filled: true,
            fillColor: const Color(0xFF1E293B),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF334155))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.blueAccent, width: 2)),
          ),
          validator: (v) => v == null || v.trim().isEmpty ? 'Vui lòng không để trống trường này' : null,
        ),
      ],
    );
  }
}
