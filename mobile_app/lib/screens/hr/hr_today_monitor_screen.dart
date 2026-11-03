import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../widgets/status_badge.dart';
import '../../utils/date_time_utils.dart';
import '../../utils/dialog_utils.dart';

class HrTodayMonitorScreen extends StatefulWidget {
  const HrTodayMonitorScreen({super.key});

  @override
  State<HrTodayMonitorScreen> createState() => _HrTodayMonitorScreenState();
}

class _HrTodayMonitorScreenState extends State<HrTodayMonitorScreen> {
  List<Map<String, dynamic>> _attendances = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadTodayData();
  }

  Future<void> _loadTodayData() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.instance.getTodayAttendance();
      setState(() {
        _attendances = list;
      });
    } catch (_) {
      if (mounted) {
        DialogUtils.showSnackBar(context, 'Không tải được dữ liệu hôm nay', isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final attendedCount = _attendances.length;
    final lateCount = _attendances.where((a) => (a['lateMinutes'] ?? 0) > 0).length;

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Today Monitor Bỏ Túi'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadTodayData,
          ),
        ],
      ),
      body: Column(
        children: [
          // 2 Summary KPIs
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.check_circle_outline, color: Colors.green.shade600, size: 20),
                            const SizedBox(width: 8),
                            const Text('Đã đến làm', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$attendedCount người',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.green.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.access_time, color: Colors.red.shade600, size: 20),
                            const SizedBox(width: 8),
                            const Text('Đi trễ hôm nay', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text(
                          '$lateCount người',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                            color: Colors.red.shade700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // List of Attendances
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _attendances.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.access_time_outlined, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              'Hôm nay chưa có ai quẹt thẻ chấm công',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 13),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadTodayData,
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: _attendances.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final item = _attendances[index];
                            final name = item['employeeName'] ?? 'Nhân viên';
                            final code = item['employeeCode'] ?? '';
                            final dept = item['department'] ?? '';
                            final checkIn = item['checkInTime'] != null
                                ? DateTime.tryParse(item['checkInTime'])
                                : null;
                            final checkOut = item['checkOutTime'] != null
                                ? DateTime.tryParse(item['checkOutTime'])
                                : null;
                            final status = item['status'] ?? item['Status'] ?? 'ON_TIME';
                            final method = item['method'] ?? 'NFC';
                            final lateMin = item['lateMinutes'] ?? item['LateMinutes'] ?? 0;
                            final rawOt = item['overtimeMinutes'] ?? item['OvertimeMinutes'] ?? 0;
                            final overtimeMin = rawOt is int ? rawOt : int.tryParse(rawOt.toString()) ?? 0;

                            return Card(
                              elevation: 0,
                              color: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                                side: const BorderSide(color: Color(0xFFE2E8F0)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text(
                                          name,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            fontSize: 14,
                                            color: Color(0xFF1E293B),
                                          ),
                                        ),
                                        StatusBadge(
                                          status: status.toString(),
                                          overtimeMinutes: overtimeMin,
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '$code • $dept',
                                      style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                    ),
                                    const Divider(height: 16),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Row(
                                          children: [
                                            const Icon(Icons.login, size: 16, color: Colors.green),
                                            const SizedBox(width: 4),
                                            Text(
                                              checkIn != null ? DateTimeUtils.formatShortTime(checkIn) : '-',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                            ),
                                          ],
                                        ),
                                        Row(
                                          children: [
                                            const Icon(Icons.logout, size: 16, color: Colors.blue),
                                            const SizedBox(width: 4),
                                            Text(
                                              checkOut != null ? DateTimeUtils.formatShortTime(checkOut) : '-',
                                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                            ),
                                          ],
                                        ),
                                        if (lateMin > 0)
                                          Text(
                                            '+$lateMin phút',
                                            style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                                          )
                                        else
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: Colors.grey.shade100,
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              method,
                                              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold),
                                            ),
                                          ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}

