import 'package:flutter/material.dart';

class NfcScanAnimation extends StatefulWidget {
  final double size;
  final Color color;
  final Widget? icon;

  const NfcScanAnimation({
    super.key,
    this.size = 200,
    this.color = const Color(0xFF3B82F6),
    this.icon,
  });

  @override
  State<NfcScanAnimation> createState() => _NfcScanAnimationState();
}

class _NfcScanAnimationState extends State<NfcScanAnimation> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: _PulsePainter(
              animationValue: _controller.value,
              color: widget.color,
            ),
            child: Center(
              child: Container(
                width: widget.size * 0.45,
                height: widget.size * 0.45,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: widget.color,
                  boxShadow: [
                    BoxShadow(
                      color: widget.color.withAlpha(128),
                      blurRadius: 20,
                      spreadRadius: 2,
                    ),
                  ],
                ),
                child: Center(
                  child: widget.icon ??
                      const Icon(
                        Icons.nfc,
                        color: Colors.white,
                        size: 40,
                      ),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class _PulsePainter extends CustomPainter {
  final double animationValue;
  final Color color;

  _PulsePainter({required this.animationValue, required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    for (int i = 0; i < 3; i++) {
      final waveProgress = (animationValue + (i * 0.33)) % 1.0;
      final currentRadius = (size.width * 0.22) + (waveProgress * (maxRadius - (size.width * 0.22)));
      final opacity = (1.0 - waveProgress).clamp(0.0, 1.0);

      final paint = Paint()
        ..color = color.withAlpha((opacity * 100).toInt())
        ..style = PaintingStyle.stroke
        ..strokeWidth = 3.0;

      canvas.drawCircle(center, currentRadius, paint);
    }
  }

  @override
  bool shouldRepaint(_PulsePainter oldDelegate) => true;
}
