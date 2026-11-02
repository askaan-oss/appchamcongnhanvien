import 'package:flutter/material.dart';

class HrBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const HrBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return NavigationBar(
      selectedIndex: currentIndex,
      onDestinationSelected: onTap,
      backgroundColor: Colors.white,
      elevation: 3,
      indicatorColor: Colors.blue.shade100,
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.dashboard_outlined),
          selectedIcon: Icon(Icons.dashboard, color: Colors.blue),
          label: 'Tổng quan',
        ),
        NavigationDestination(
          icon: Icon(Icons.credit_card_outlined),
          selectedIcon: Icon(Icons.credit_card, color: Colors.blue),
          label: 'Cấp thẻ NFC',
        ),
        NavigationDestination(
          icon: Icon(Icons.today_outlined),
          selectedIcon: Icon(Icons.today, color: Colors.blue),
          label: 'Today Monitor',
        ),
      ],
    );
  }
}

