import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/services.dart';

class AudioService {
  static final AudioService instance = AudioService._init();
  final AudioPlayer _audioPlayer = AudioPlayer();

  AudioService._init();

  Future<void> playSuccessBeep() async {
    try {
      HapticFeedback.mediumImpact();
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/beep_success.mp3'));
    } catch (_) {
      // Fallback to system sound
      SystemSound.play(SystemSoundType.click);
    }
  }

  Future<void> playErrorBeep() async {
    try {
      HapticFeedback.heavyImpact();
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/beep_error.mp3'));
    } catch (_) {
      SystemSound.play(SystemSoundType.alert);
    }
  }

  void dispose() {
    _audioPlayer.dispose();
  }
}

