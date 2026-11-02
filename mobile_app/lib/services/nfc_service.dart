import 'package:nfc_manager/nfc_manager.dart';
import 'package:nfc_manager/platform_tags.dart';

class NfcService {
  static final NfcService instance = NfcService._init();
  bool _isScanning = false;
  bool get isScanning => _isScanning;

  NfcService._init();

  Future<bool> isAvailable() async {
    try {
      return await NfcManager.instance.isAvailable();
    } catch (_) {
      return false;
    }
  }

  Future<void> startListening({
    required Function(String cardUid) onCardScanned,
    Function(String error)? onError,
  }) async {
    if (_isScanning) return;

    final available = await isAvailable();
    if (!available) {
      onError?.call('Thiết bị không hỗ trợ NFC hoặc chưa bật NFC');
      return;
    }

    _isScanning = true;
    try {
      await NfcManager.instance.startSession(
        onDiscovered: (NfcTag tag) async {
          final uid = extractUid(tag);
          if (uid != null && uid.isNotEmpty) {
            onCardScanned(uid);
          } else {
            onError?.call('Không đọc được mã UID của thẻ');
          }
        },
        onError: (e) async {
          _isScanning = false;
          onError?.call(e.message);
        },
      );
    } catch (e) {
      _isScanning = false;
      onError?.call(e.toString());
    }
  }

  Future<void> stopListening() async {
    if (!_isScanning) return;
    _isScanning = false;
    try {
      await NfcManager.instance.stopSession();
    } catch (_) {}
  }

  static String? extractUid(NfcTag tag) {
    List<int>? identifier;

    // 1. Try NfcA (NTAG213, NTAG215, Mifare Ultralight, etc.)
    final nfcA = NfcA.from(tag);
    if (nfcA != null) {
      identifier = nfcA.identifier;
    }

    // 2. Try Mifare
    if (identifier == null) {
      final mifare = MifareClassic.from(tag);
      if (mifare != null) {
        identifier = mifare.identifier;
      }
    }

    // 3. Try IsoDep
    if (identifier == null) {
      final isoDep = IsoDep.from(tag);
      if (isoDep != null) {
        identifier = isoDep.identifier;
      }
    }

    // 4. Try NfcB
    if (identifier == null) {
      final nfcB = NfcB.from(tag);
      if (nfcB != null) {
        identifier = nfcB.identifier;
      }
    }

    // 5. Try NfcV
    if (identifier == null) {
      final nfcV = NfcV.from(tag);
      if (nfcV != null) {
        identifier = nfcV.identifier;
      }
    }

    if (identifier == null || identifier.isEmpty) return null;

    // Convert byte array to uppercase hex string e.g. 04A1B2C3D4E5F6
    return identifier
        .map((byte) => byte.toRadixString(16).padLeft(2, '0').toUpperCase())
        .join();
  }
}
