import 'dart:async';
import 'package:flutter/material.dart';
import '../models/tap_attendance_response.dart';
import '../widgets/status_badge.dart';
import '../utils/date_time_utils.dart';

class AttendanceResultModal extends StatefulWidget {
  final TapAttendanceResponse response;
  final VoidCallback onDismissed;

  const AttendanceResultModal({
    super.key,
    required this.response,
    required this.onDismissed,
  });

  @override
  State<AttendanceResultModal> createState() => _AttendanceResultModalState();
}

class _AttendanceResultModalState extends State<AttendanceResultModal> with SingleTickerProviderStateMixin {
  late AnimationController _progressController;
  Timer? _dismissTimer;

  @override
  void initState() {
    super.initState();
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..forward();

    _dismissTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) {
        widget.onDismissed();
      }
    });
  }

  @override
  void dispose() {
    _dismissTimer?.cancel();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final res = widget.response;
    final isSuccess = res.isSuccess;

    return Center(
      child: Material(
        color: Colors.transparent,
        child: Container(
          width: 440,
          margin: const EdgeInsets.symmetric(horizontal: 24),
          decoration: BoxDecoration(
            color: const Color(0xFF1E293B),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(
              color: isSuccess ? Colors.green.shade500 : Colors.red.shade500,
              width: 2,
            ),
            boxShadow: [
              BoxShadow(
                color: (isSuccess ? Colors.green : Colors.red).withAlpha(80),
                blurRadius: 30,
                spreadRadius: 4,
              ),
            ],
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Top countdown linear progress
                ClipRRect(
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                  child: AnimatedBuilder(
                    animation: _progressController,
                    builder: (context, _) => LinearProgressIndicator(
                      value: 1.0 - _progressController.value,
                      backgroundColor: Colors.transparent,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        isSuccess ? Colors.green.shade400 : Colors.red.shade400,
                      ),
                      minHeight: 4,
                    ),
                  ),
                ),

                Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    children: [
                      // Icon Header
                      Container(
                        width: 72,
                        height: 72,
                        decoration: BoxDecoration(
                          color: (isSuccess ? Colors.green : Colors.red).withAlpha(40),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: (isSuccess ? Colors.green : Colors.red).withAlpha(120),
                            width: 2,
                          ),
                        ),
                        child: Icon(
                          isSuccess ? (res.isCheckOut ? Icons.logout : Icons.check_circle_outline) : Icons.error_outline,
                          color: isSuccess ? Colors.green.shade400 : Colors.red.shade400,
                          size: 40,
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Title
                      Text(
                        isSuccess
                            ? (res.isCheckOut ? 'CHECK-OUT THÀNH CÔNG!' : 'CHECK-IN THÀNH CÔNG!')
                            : 'CHẤM CÔNG THẤT BẠI',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          color: isSuccess ? Colors.green.shade300 : Colors.red.shade300,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          letterSpacing: 1.2,
                        ),
                      ),

                      const SizedBox(height: 8),

                      Text(
                        res.message,
                        textAlign: TextAlign.center,
                        style: const TextStyle(
                          color: Color(0xFFCBD5E1),
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                      if (isSuccess && res.employeeName != null) ...[
                        const SizedBox(height: 20),
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: const Color(0xFF0F172A),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: const Color(0xFF334155)),
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  const Text('Họ và tên:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      res.employeeName!,
                                      textAlign: TextAlign.end,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 14,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                              const Divider(color: Colors.white10, height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Mã nhân viên:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                  Text(
                                    res.employeeCode ?? '-',
                                    style: const TextStyle(
                                      color: Colors.blueAccent,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 13,
                                      fontFamily: 'monospace',
                                    ),
                                  ),
                                ],
                              ),
                              if (res.department != null) ...[
                                const Divider(color: Colors.white10, height: 16),
                                Row(
                                  children: [
                                    const Text('Phòng ban:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        res.department!,
                                        textAlign: TextAlign.end,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(color: Colors.white, fontSize: 13),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                              if (res.shiftName != null && res.shiftName!.isNotEmpty) ...[
                                const Divider(color: Colors.white10, height: 16),
                                Row(
                                  children: [
                                    const Text('Ca làm việc:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        res.shiftTime != null
                                            ? '${res.shiftName!} (${res.shiftTime!})'
                                            : res.shiftName!,
                                        textAlign: TextAlign.end,
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(
                                          color: Color(0xFF38BDF8),
                                          fontSize: 13,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                              const Divider(color: Colors.white10, height: 16),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  const Text('Thời gian:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                  Text(
                                    res.checkTime != null ? DateTimeUtils.formatFullDate(res.checkTime!) : DateTimeUtils.formatFullDate(DateTime.now()),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 12,
                                      fontFamily: 'monospace',
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                              if (res.status != null) ...[
                                const Divider(color: Colors.white10, height: 16),
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text('Trạng thái:', style: TextStyle(color: Colors.grey, fontSize: 13)),
                                    StatusBadge(status: res.status!),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 16),

                      // Countdown text
                      AnimatedBuilder(
                        animation: _progressController,
                        builder: (context, _) {
                          final remaining = (3.0 * (1.0 - _progressController.value)).ceil();
                          return Text(
                            'Tự động đóng sau ${remaining}s...',
                            style: const TextStyle(
                              color: Color(0xFF94A3B8),
                              fontSize: 11,
                              fontStyle: FontStyle.italic,
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
