import 'package:flutter/material.dart';

class StatusBadge extends StatelessWidget {
  final String status;
  final double fontSize;
  final int overtimeMinutes;

  const StatusBadge({
    super.key,
    required this.status,
    this.fontSize = 12,
    this.overtimeMinutes = 0,
  });

  @override
  Widget build(BuildContext context) {
    final cleanStatus = status.trim().toUpperCase();
    final isOvertime = cleanStatus == 'OVERTIME' || overtimeMinutes > 0;

    if (isOvertime) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.blue.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.blue.shade300),
            ),
            child: Text(
              'Hoàn thành',
              style: TextStyle(
                color: Colors.blue.shade700,
                fontSize: fontSize,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: Colors.purple.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.purple.shade300),
            ),
            child: Text(
              overtimeMinutes > 0 ? 'Tăng ca +${overtimeMinutes}p' : 'Tăng ca',
              style: TextStyle(
                color: Colors.purple.shade700,
                fontSize: fontSize,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      );
    }

    Color bg;
    Color fg;
    String text;

    switch (cleanStatus) {
      case 'ON_TIME':
        bg = Colors.green.shade50;
        fg = Colors.green.shade700;
        text = 'Đúng giờ';
        break;
      case 'LATE':
        bg = Colors.red.shade50;
        fg = Colors.red.shade700;
        text = 'Đi trễ';
        break;
      case 'EARLY':
        bg = Colors.amber.shade50;
        fg = Colors.amber.shade700;
        text = 'Về sớm';
        break;
      case 'COMPLETED':
        bg = Colors.blue.shade50;
        fg = Colors.blue.shade700;
        text = 'Hoàn thành';
        break;
      case 'OFFLINE_SAVED':
        bg = Colors.orange.shade50;
        fg = Colors.orange.shade800;
        text = 'Đã lưu Offline';
        break;
      default:
        bg = Colors.grey.shade100;
        fg = Colors.grey.shade800;
        text = status;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: fg.withAlpha(80), width: 1),
      ),
      child: Text(
        text,
        style: TextStyle(
          color: fg,
          fontSize: fontSize,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}
