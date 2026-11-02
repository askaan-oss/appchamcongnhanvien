import 'package:flutter/material.dart';
import '../../services/api_service.dart';
import '../../models/employee_model.dart';
import '../../utils/dialog_utils.dart';
import 'hr_nfc_assign_screen.dart';

class HrEmployeeListScreen extends StatefulWidget {
  final String mode; // 'assign' | 'revoke'

  const HrEmployeeListScreen({
    super.key,
    this.mode = 'assign',
  });

  @override
  State<HrEmployeeListScreen> createState() => _HrEmployeeListScreenState();
}

class _HrEmployeeListScreenState extends State<HrEmployeeListScreen> {
  List<EmployeeModel> _employees = [];
  List<EmployeeModel> _filteredEmployees = [];
  bool _isLoading = true;
  final TextEditingController _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadEmployees();
    _searchController.addListener(_filter);
  }

  Future<void> _loadEmployees() async {
    setState(() => _isLoading = true);
    try {
      final list = await ApiService.instance.getEmployees();
      setState(() {
        _employees = list;
        _filteredEmployees = list;
      });
    } catch (_) {
      if (mounted) {
        DialogUtils.showSnackBar(context, 'Không tải được danh sách nhân viên', isError: true);
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _filter() {
    final query = _searchController.text.toLowerCase().trim();
    if (query.isEmpty) {
      setState(() => _filteredEmployees = _employees);
    } else {
      setState(() {
        _filteredEmployees = _employees.where((e) {
          return e.fullName.toLowerCase().contains(query) ||
              e.employeeCode.toLowerCase().contains(query) ||
              e.department.toLowerCase().contains(query);
        }).toList();
      });
    }
  }

  Future<void> _handleRevokeCard(EmployeeModel emp, String cardUid) async {
    final confirm = await DialogUtils.showConfirmDialog(
      context,
      title: 'Khóa Thẻ NFC Báo Mất',
      content: 'Bạn có chắc chắn muốn khóa thẻ [$cardUid] của nhân viên ${emp.fullName}? Thẻ này sẽ không thể dùng để chấm công nữa.',
      confirmText: 'Khóa thẻ ngay',
      isDanger: true,
    );

    if (confirm == true) {
      final success = await ApiService.instance.revokeNfc(
        cardUid: cardUid,
        reason: 'Nhân viên báo mất thẻ',
      );

      if (mounted) {
        if (success) {
          DialogUtils.showSnackBar(context, 'Đã khóa thẻ $cardUid thành công!');
          _loadEmployees();
        } else {
          DialogUtils.showSnackBar(context, 'Không thể khóa thẻ. Vui lòng thử lại.', isError: true);
        }
      }
    }
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isAssignMode = widget.mode == 'assign';

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: Text(isAssignMode ? 'Chọn Nhân Viên Để Cấp Thẻ' : 'Khóa Thẻ NFC Báo Mất'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadEmployees,
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Tìm kiếm theo tên, mã NV, phòng ban...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
          ),

          // Employees List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _filteredEmployees.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.people_outline, size: 48, color: Colors.grey.shade400),
                            const SizedBox(height: 12),
                            Text(
                              'Không tìm thấy nhân viên nào',
                              style: TextStyle(color: Colors.grey.shade600, fontSize: 14),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadEmployees,
                        child: ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          itemCount: _filteredEmployees.length,
                          separatorBuilder: (_, __) => const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final emp = _filteredEmployees[index];
                            final hasCards = emp.activeCardUids.isNotEmpty;

                            return Card(
                              elevation: 0,
                              color: Colors.white,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(14),
                                side: const BorderSide(color: Color(0xFFE2E8F0)),
                              ),
                              child: Padding(
                                padding: const EdgeInsets.all(14),
                                child: Row(
                                  children: [
                                    // Avatar circle
                                    CircleAvatar(
                                      backgroundColor: Colors.blue.shade100,
                                      foregroundColor: Colors.blue.shade800,
                                      child: Text(
                                        emp.fullName.isNotEmpty ? emp.fullName[0].toUpperCase() : 'N',
                                        style: const TextStyle(fontWeight: FontWeight.bold),
                                      ),
                                    ),
                                    const SizedBox(width: 14),

                                    // Info
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            emp.fullName,
                                            style: const TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 14,
                                              color: Color(0xFF1E293B),
                                            ),
                                          ),
                                          const SizedBox(height: 2),
                                          Text(
                                            '${emp.employeeCode} • ${emp.department}',
                                            style: TextStyle(color: Colors.grey.shade600, fontSize: 12),
                                          ),
                                          const SizedBox(height: 4),
                                          if (hasCards)
                                            Wrap(
                                              spacing: 4,
                                              children: emp.activeCardUids.map((uid) {
                                                return Container(
                                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                  decoration: BoxDecoration(
                                                    color: Colors.indigo.shade50,
                                                    borderRadius: BorderRadius.circular(4),
                                                    border: Border.all(color: Colors.indigo.shade200),
                                                  ),
                                                  child: Text(
                                                    uid,
                                                    style: TextStyle(
                                                      color: Colors.indigo.shade800,
                                                      fontSize: 10,
                                                      fontFamily: 'monospace',
                                                      fontWeight: FontWeight.bold,
                                                    ),
                                                  ),
                                                );
                                              }).toList(),
                                            )
                                          else
                                            Text(
                                              'Chưa có thẻ NFC',
                                              style: TextStyle(color: Colors.amber.shade800, fontSize: 11, fontStyle: FontStyle.italic),
                                            ),
                                        ],
                                      ),
                                    ),

                                    // Action Button
                                    if (isAssignMode)
                                      ElevatedButton.icon(
                                        onPressed: () async {
                                          final success = await Navigator.push<bool>(
                                            context,
                                            MaterialPageRoute(
                                              builder: (_) => HrNfcAssignScreen(employee: emp),
                                            ),
                                          );
                                          if (success == true) _loadEmployees();
                                        },
                                        icon: const Icon(Icons.nfc, size: 16),
                                        label: const Text('Gán thẻ'),
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: Colors.blue.shade600,
                                          foregroundColor: Colors.white,
                                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                        ),
                                      )
                                    else if (hasCards)
                                      IconButton(
                                        icon: const Icon(Icons.lock, color: Colors.red),
                                        tooltip: 'Khóa thẻ báo mất',
                                        onPressed: () => _handleRevokeCard(emp, emp.activeCardUids.first),
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

