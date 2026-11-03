import 'package:flutter/material.dart';
import '../../config/app_config.dart';
import '../../services/nfc_service.dart';
import '../../services/api_service.dart';
import '../../services/offline_database_service.dart';
import '../../services/connectivity_service.dart';
import '../../services/audio_service.dart';
import '../../models/tap_attendance_request.dart';
import '../../models/tap_attendance_response.dart';
import '../../models/offline_attendance_record.dart';
import '../../widgets/kiosk_header.dart';
import '../../widgets/nfc_scan_animation.dart';
import '../../widgets/attendance_result_modal.dart';
import '../mode_select_screen.dart';
import 'pin_dialog.dart';
import 'kiosk_settings_screen.dart';
import 'qr_scanner_screen.dart';

class KioskHomeScreen extends StatefulWidget {
  const KioskHomeScreen({super.key});

  @override
  State<KioskHomeScreen> createState() => _KioskHomeScreenState();
}

class _KioskHomeScreenState extends State<KioskHomeScreen> {
  bool _isProcessing = false;
  TapAttendanceResponse? _activeResult;
  String _attendanceMode = 'AUTO'; // 'AUTO', 'IN', 'OUT'

  @override
  void initState() {
    super.initState();
    _startNfcSession();
  }

  void _startNfcSession() {
    if (_isProcessing) return;
    NfcService.instance.startListening(
      onCardScanned: _handleNfcCardScanned,
      onError: (err) {
        Future.delayed(const Duration(seconds: 1), () {
          if (mounted && !_isProcessing) _startNfcSession();
        });
      },
    );
  }

  Future<void> _handleNfcCardScanned(String cardUid) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);
    await NfcService.instance.stopListening();

    await _processAttendance(cardUid: cardUid, qrPayload: null, method: 'NFC');
  }

  Future<void> _handleQrScanner() async {
    if (_isProcessing) return;
    await NfcService.instance.stopListening();
    if (!mounted) return;

    final qrResult = await Navigator.push<String>(
      context,
      MaterialPageRoute(builder: (_) => const QrScannerScreen()),
    );

    if (!mounted) return;
    if (qrResult != null && qrResult.isNotEmpty) {
      setState(() => _isProcessing = true);
      await _processAttendance(cardUid: null, qrPayload: qrResult, method: 'QR');
    } else {
      _startNfcSession();
    }
  }

  Future<void> _processAttendance({
    required String? cardUid,
    required String? qrPayload,
    required String method,
  }) async {
    TapAttendanceResponse result;
    final now = DateTime.now();
    final isOnline = ConnectivityService.instance.isOnline;

    if (isOnline) {
      final request = TapAttendanceRequest(
        cardUid: cardUid,
        qrPayload: qrPayload,
        deviceId: AppConfig.deviceId,
        timestamp: now,
      );

      if (_attendanceMode == 'IN') {
        result = await ApiService.instance.checkIn(request);
      } else if (_attendanceMode == 'OUT') {
        result = await ApiService.instance.checkOut(request);
      } else {
        result = await ApiService.instance.tapAttendance(request);
      }

      if (!result.isSuccess && (result.message.contains('SocketException') || result.message.contains('Lỗi kết nối'))) {
        await _saveOffline(cardUid, qrPayload, method, now);
        result = TapAttendanceResponse.offlineSaved(codeOrUid: cardUid ?? qrPayload ?? 'N/A', method: method);
      }
    } else {
      await _saveOffline(cardUid, qrPayload, method, now);
      result = TapAttendanceResponse.offlineSaved(codeOrUid: cardUid ?? qrPayload ?? 'N/A', method: method);
    }

    if (result.isSuccess) {
      AudioService.instance.playSuccessBeep();
    } else {
      AudioService.instance.playErrorBeep();
    }

    if (mounted) {
      setState(() {
        _activeResult = result;
      });
    }
  }

  Future<void> _saveOffline(String? cardUid, String? qrPayload, String method, DateTime now) async {
    final record = OfflineAttendanceRecord(
      cardUid: cardUid,
      qrPayload: qrPayload,
      method: method,
      timestamp: now.toIso8601String(),
      deviceId: AppConfig.deviceId,
      isSynced: 0,
    );
    await OfflineDatabaseService.instance.insertAttendance(record);
  }

  void _onModalDismissed() {
    setState(() {
      _activeResult = null;
      _isProcessing = false;
    });
    _startNfcSession();
  }

  Future<void> _openSettingsWithPin() async {
    await NfcService.instance.stopListening();
    if (!mounted) return;

    final pinValid = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (_) => const PinDialog(),
    );

    if (pinValid == true && mounted) {
      await Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => const KioskSettingsScreen()),
      );
    }

    _startNfcSession();
  }

  Future<void> _confirmBackToModeSelect() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1E293B),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF334155)),
        ),
        title: const Row(
          children: [
            Icon(Icons.swap_horiz_rounded, color: Colors.blueAccent),
            SizedBox(width: 10),
            Text('Đổi chế độ ứng dụng', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: const Text(
          'Bạn có muốn quay về màn hình chọn chế độ (Kiosk hoặc Trợ lý HR) không?',
          style: TextStyle(color: Color(0xFFCBD5E1), fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Ở LẠI', style: TextStyle(color: Colors.grey)),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF2563EB),
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('QUAY VỀ'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await NfcService.instance.stopListening();
      if (!mounted) return;
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const ModeSelectScreen()),
      );
    }
  }

  @override
  void dispose() {
    NfcService.instance.stopListening();
    super.dispose();
  }

  Widget _buildModeChip(String mode, String label, IconData icon) {
    final isSelected = _attendanceMode == mode;
    Color activeColor = const Color(0xFF3B82F6);
    if (mode == 'IN') activeColor = const Color(0xFF10B981);
    if (mode == 'OUT') activeColor = const Color(0xFFF59E0B);

    return InkWell(
      onTap: () {
        setState(() => _attendanceMode = mode);
      },
      borderRadius: BorderRadius.circular(10),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? activeColor.withAlpha(50) : Colors.transparent,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? activeColor : Colors.transparent,
            width: 1.5,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 14,
              color: isSelected ? activeColor : const Color(0xFF94A3B8),
            ),
            const SizedBox(width: 4),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : const Color(0xFF94A3B8),
                fontSize: 11.5,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final animSize = (screenWidth * 0.48).clamp(140.0, 220.0);

    Color animColor = const Color(0xFF3B82F6);
    String titleText = 'CHẠM THẺ NFC ĐỂ CHẤM CÔNG';
    String subText = 'Hệ thống tự động ghi nhận Check-In / Check-Out';
    if (_attendanceMode == 'IN') {
      animColor = const Color(0xFF10B981);
      titleText = 'CHẠM THẺ ĐỂ VÀO CA (CHECK-IN)';
      subText = 'Chế độ cố định: Ghi nhận giờ vào ca làm việc';
    } else if (_attendanceMode == 'OUT') {
      animColor = const Color(0xFFF59E0B);
      titleText = 'CHẠM THẺ ĐỂ RA CA (CHECK-OUT)';
      subText = 'Chế độ cố định: Ghi nhận giờ tan ca ra về';
    }

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      body: SafeArea(
        child: Stack(
          children: [
            Column(
              children: [
                KioskHeader(
                  onSettingsPressed: _openSettingsWithPin,
                ),

                Expanded(
                  child: Center(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          // Thanh chuyển chế độ: Tự động / Vào Ca / Ra Ca
                          Container(
                            margin: const EdgeInsets.only(bottom: 16),
                            padding: const EdgeInsets.all(3),
                            decoration: BoxDecoration(
                              color: const Color(0xFF1E293B),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: const Color(0xFF334155)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _buildModeChip('AUTO', 'Tự Động', Icons.auto_awesome),
                                const SizedBox(width: 4),
                                _buildModeChip('IN', 'Vào Ca', Icons.login),
                                const SizedBox(width: 4),
                                _buildModeChip('OUT', 'Ra Ca', Icons.logout),
                              ],
                            ),
                          ),

                          NfcScanAnimation(
                            size: animSize,
                            color: animColor,
                          ),

                          const SizedBox(height: 20),

                          Text(
                            titleText,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.2,
                            ),
                          ),

                          const SizedBox(height: 6),

                          Text(
                            subText,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 13,
                              fontWeight: FontWeight.w500,
                            ),
                          ),

                          const SizedBox(height: 24),

                          OutlinedButton.icon(
                            onPressed: _isProcessing ? null : _handleQrScanner,
                            icon: const Icon(Icons.qr_code_scanner, size: 22),
                            label: Text(
                              _attendanceMode == 'OUT'
                                  ? 'QUÉT MÃ QR RA CA'
                                  : (_attendanceMode == 'IN' ? 'QUÉT MÃ QR VÀO CA' : 'QUÉT MÃ QR CÁ NHÂN'),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1),
                            ),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.white,
                              side: BorderSide(color: animColor, width: 2),
                              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),

            if (_activeResult != null)
              Container(
                color: Colors.black.withAlpha(200),
                child: AttendanceResultModal(
                  response: _activeResult!,
                  onDismissed: _onModalDismissed,
                ),
              ),
          ],
        ),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Color(0xFF1E293B),
          border: Border(top: BorderSide(color: Color(0xFF334155), width: 1)),
          boxShadow: [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 10,
              offset: Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 4),
            child: Row(
              children: [
                Expanded(
                  child: _buildNavItem(
                    icon: Icons.nfc,
                    label: 'Chấm NFC',
                    isActive: true,
                    onTap: () {},
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    icon: Icons.qr_code_scanner,
                    label: 'Quét QR',
                    isActive: false,
                    onTap: _isProcessing ? null : _handleQrScanner,
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    icon: Icons.swap_horiz_rounded,
                    label: 'Đổi chế độ',
                    isActive: false,
                    highlightColor: Colors.amberAccent,
                    onTap: _confirmBackToModeSelect,
                  ),
                ),
                Expanded(
                  child: _buildNavItem(
                    icon: Icons.settings_outlined,
                    label: 'Cài đặt',
                    isActive: false,
                    onTap: _openSettingsWithPin,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required bool isActive,
    Color? highlightColor,
    required VoidCallback? onTap,
  }) {
    final color = isActive
        ? (highlightColor ?? const Color(0xFF3B82F6))
        : (highlightColor ?? const Color(0xFF94A3B8));

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 4),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 3),
            Text(
              label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: color,
                fontSize: 10.5,
                fontWeight: isActive ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
