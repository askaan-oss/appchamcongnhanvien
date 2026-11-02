import 'dart:async';
import 'connectivity_service.dart';
import 'offline_database_service.dart';
import 'api_service.dart';
import '../models/sync_offline_package.dart';
import '../config/app_config.dart';

class SyncService {
  static final SyncService instance = SyncService._init();
  Timer? _timer;
  bool _isSyncing = false;

  SyncService._init();

  void init() {
    // Listen to network transitions from offline to online
    ConnectivityService.instance.onConnectionChanged.listen((isOnline) {
      if (isOnline) {
        syncPendingRecords();
      }
    });

    // Periodic check every 60 seconds
    _timer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (ConnectivityService.instance.isOnline) {
        syncPendingRecords();
      }
    });
  }

  Future<int> syncPendingRecords() async {
    if (_isSyncing) return 0;
    _isSyncing = true;

    try {
      final unsynced = await OfflineDatabaseService.instance.getUnsyncedRecords();
      if (unsynced.isEmpty) {
        _isSyncing = false;
        return 0;
      }

      final package = SyncOfflinePackage(
        deviceId: AppConfig.deviceId,
        records: unsynced,
      );

      final success = await ApiService.instance.syncOffline(package);
      if (success) {
        final ids = unsynced.where((r) => r.id != null).map((r) => r.id!).toList();
        await OfflineDatabaseService.instance.markAsSynced(ids);
        return ids.length;
      }
    } catch (_) {
      // Sync retry next cycle
    } finally {
      _isSyncing = false;
    }
    return 0;
  }

  void dispose() {
    _timer?.cancel();
  }
}

