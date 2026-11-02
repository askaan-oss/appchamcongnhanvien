import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';

class ConnectivityService {
  static final ConnectivityService instance = ConnectivityService._init();
  final Connectivity _connectivity = Connectivity();
  final StreamController<bool> _connectionStreamController = StreamController<bool>.broadcast();

  bool _isOnline = true;
  bool get isOnline => _isOnline;
  Stream<bool> get onConnectionChanged => _connectionStreamController.stream;

  ConnectivityService._init() {
    _initConnectivity();
    _connectivity.onConnectivityChanged.listen(_updateConnectionStatus);
  }

  Future<void> _initConnectivity() async {
    try {
      final results = await _connectivity.checkConnectivity();
      _updateConnectionStatus(results);
    } catch (_) {
      _isOnline = true;
      _connectionStreamController.add(_isOnline);
    }
  }

  void _updateConnectionStatus(List<ConnectivityResult> results) {
    final hasNet = results.any((r) => r != ConnectivityResult.none);
    if (_isOnline != hasNet) {
      _isOnline = hasNet;
      _connectionStreamController.add(_isOnline);
    }
  }

  void dispose() {
    _connectionStreamController.close();
  }
}

