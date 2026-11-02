import 'dart:async';
import 'package:flutter/material.dart';
import '../services/connectivity_service.dart';
import '../services/offline_database_service.dart';
import '../config/app_config.dart';
import '../utils/date_time_utils.dart';

class KioskHeader extends StatefulWidget {
  final VoidCallback onSettingsPressed;

  const KioskHeader({
    super.key,
    required this.onSettingsPressed,
  });

  @override
  State<KioskHeader> createState() => _KioskHeaderState();
}

class _KioskHeaderState extends State<KioskHeader> {
  late Timer _clockTimer;
  DateTime _currentTime = DateTime.now();
  int _offlineCount = 0;

  @override
  void initState() {
    super.initState();
    _clockTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (mounted) {
        setState(() {
          _currentTime = DateTime.now();
        });
      }
    });
    _checkOfflineCount();
  }

  Future<void> _checkOfflineCount() async {
    final count = await OfflineDatabaseService.instance.getUnsyncedCount();
    if (mounted) {
      setState(() {
        _offlineCount = count;
      });
    }
  }

  @override
  void dispose() {
    _clockTimer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        final isNarrow = constraints.maxWidth < 600;

        return Container(
          padding: EdgeInsets.symmetric(
            horizontal: isNarrow ? 12 : 20,
            vertical: isNarrow ? 10 : 12,
          ),
          decoration: const BoxDecoration(
            color: Color(0xFF1E293B),
            border: Border(bottom: BorderSide(color: Color(0xFF334155))),
          ),
          child: Row(
            children: [
              // Left: Device & Station Info
              Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: Colors.blue.shade600,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.tablet_mac, color: Colors.white, size: 18),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      AppConfig.deviceName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const Text(
                      'Kiosk Chấm Công',
                      style: TextStyle(
                        color: Color(0xFF94A3B8),
                        fontSize: 10,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(width: 8),

              // Center: Live Digital Clock
              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    DateTimeUtils.formatTime(_currentTime),
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: isNarrow ? 18 : 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                  Text(
                    DateTimeUtils.formatDayOfWeek(_currentTime),
                    style: TextStyle(
                      color: const Color(0xFFCBD5E1),
                      fontSize: isNarrow ? 9 : 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),

              const SizedBox(width: 8),

              // Right: Online / Offline Indicator
              StreamBuilder<bool>(
                stream: ConnectivityService.instance.onConnectionChanged,
                initialData: ConnectivityService.instance.isOnline,
                builder: (context, snapshot) {
                  final isOnline = snapshot.data ?? true;
                  return Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: isOnline
                          ? Colors.green.shade900.withAlpha(120)
                          : Colors.red.shade900.withAlpha(120),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isOnline ? Colors.green.shade500 : Colors.red.shade500,
                        width: 1,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          isOnline ? Icons.wifi : Icons.wifi_off,
                          color: isOnline ? Colors.green.shade400 : Colors.red.shade400,
                          size: 12,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isOnline ? 'ONLINE' : 'OFFLINE',
                          style: TextStyle(
                            color: isOnline ? Colors.green.shade300 : Colors.red.shade300,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),

              if (_offlineCount > 0) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade900.withAlpha(120),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: Colors.amber.shade500),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.sync, color: Colors.amber, size: 11),
                      const SizedBox(width: 2),
                      Text(
                        '$_offlineCount',
                        style: const TextStyle(
                          color: Colors.amber,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }
}
