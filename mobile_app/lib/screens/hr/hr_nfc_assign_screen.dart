import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../models/employee_model.dart';
import '../../services/nfc_service.dart';
import '../../services/api_service.dart';
import '../../widgets/nfc_scan_animation.dart';
import '../../utils/dialog_utils.dart';

class HrNfcAssignScreen extends StatefulWidget {
  final EmployeeModel employee;

  const HrNfcAssignScreen({
    super.key,
    required this.employee,
  });

  @override
  State<HrNfcAssignScreen> createState() => _HrNfcAssignScreenState();
}

class _HrNfcAssignScreenState extends State<HrNfcAssignScreen> {
  bool _isProcessing = false;
  String? _detectedUid;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _startNfcListening();
  }

  void _startNfcListening() {
    NfcService.instance.startListening(
      onCardScanned: _onCardDetected,
      onError: (err) {
        if (mounted) {
          setState(() {
            _errorMessage = err;
          });
        }
      },
    );
  }

  Future<void> _onCardDetected(String uid) async {
    if (_isProcessing) return;
    setState(() {
      _isProcessing = true;
      _detectedUid = uid;
    });

    HapticFeedback.heavyImpact();
    await NfcService.instance.stopListening();

    try {
      final success = await ApiService.instance.assignNfc(
        employeeId: widget.employee.id,
        cardUid: uid,
        note: 'Gán thẻ qua App Mobile HR (Chạm lưng điện thoại)',
      );

      if (mounted) {
        if (success) {
          await _showSuccessDialog(uid);
          if (mounted) Navigator.of(context).pop(true);
        } else {
          DialogUtils.showSnackBar(
            context,
            'Không thể gán thẻ $uid. Có thể thẻ đã được gán cho người khác.',
            isError: true,
          );
          setState(() => _isProcessing = false);
          _startNfcListening();
        }
      }
    } catch (e) {
      if (mounted) {
        DialogUtils.showSnackBar(context, 'Lỗi kết nối server: $e', isError: true);
        setState(() => _isProcessing = false);
        _startNfcListening();
      }
    }
  }

  Future<void> _showSuccessDialog(String uid) {
    return showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green, size: 28),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'Gán Thẻ Thành Công!',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
          ],
        ),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Đã liên kết thẻ NFC cho nhân viên ${widget.employee.fullName}.',
                style: const TextStyle(fontSize: 14),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.credit_card, color: Colors.blue, size: 20),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Mã UID: $uid',
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          fontWeight: FontWeight.bold,
                          fontSize: 13,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Bây giờ bạn có thể trao thẻ này cho nhân viên sử dụng để quẹt tại máy Kiosk.',
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.blue.shade700,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: const Text('Hoàn tất'),
          ),
        ],
      ),
    );
  }

  void _manualInputUid() async {
    final controller = TextEditingController();
    final uid = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Nhập Mã Thẻ Thủ Công'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(
            labelText: 'Mã UID Thẻ NFC (Hex)',
            hintText: 'Ví dụ: 04A1B2C3D4E5F6',
          ),
          textCapitalization: TextCapitalization.characters,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.of(ctx).pop(), child: const Text('Hủy')),
          ElevatedButton(
            onPressed: () => Navigator.of(ctx).pop(controller.text.trim().toUpperCase()),
            child: const Text('Gán thẻ'),
          ),
        ],
      ),
    );

    if (uid != null && uid.isNotEmpty) {
      _onCardDetected(uid);
    }
  }

  @override
  void dispose() {
    NfcService.instance.stopListening();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final emp = widget.employee;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Chạm Lưng Điện Thoại Gán Thẻ'),
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              // Employee Card Header
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withAlpha(10),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: Colors.blue.shade100,
                      foregroundColor: Colors.blue.shade800,
                      child: Text(
                        emp.fullName.isNotEmpty ? emp.fullName[0].toUpperCase() : 'N',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            emp.fullName,
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            '${emp.employeeCode} • ${emp.department}',
                            style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Animated NFC Radar Pulse
              if (_isProcessing)
                Column(
                  children: [
                    const SizedBox(
                      width: 60,
                      height: 60,
                      child: CircularProgressIndicator(strokeWidth: 3),
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Đang gán mã UID $_detectedUid...',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                )
              else
                Column(
                  children: [
                    const NfcScanAnimation(
                      size: 240,
                      color: Color(0xFF4F46E5),
                      icon: Icon(Icons.phone_android, color: Colors.white, size: 48),
                    ),
                    const SizedBox(height: 24),
                    const Text(
                      'CHẠM THẺ VÀO LƯNG ĐIỆN THOẠI',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1.2,
                        color: Color(0xFF1E293B),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Áp thẻ NTAG215 trắng vào khu vực cảm biến NFC ở mặt lưng máy',
                      textAlign: TextAlign.center,
                      style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                    ),
                    if (_errorMessage != null) ...[
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(color: Colors.red, fontSize: 12),
                      ),
                    ],
                  ],
                ),

              const Spacer(),

              // Manual Input option
              TextButton.icon(
                onPressed: _isProcessing ? null : _manualInputUid,
                icon: const Icon(Icons.keyboard_outlined, size: 18),
                label: const Text('Nhập mã UID thủ công nếu máy không có NFC'),
                style: TextButton.styleFrom(foregroundColor: Colors.grey.shade700),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
