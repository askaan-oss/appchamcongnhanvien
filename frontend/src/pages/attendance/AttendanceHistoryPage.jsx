import React, { useState, useEffect, useCallback } from 'react'
import {
  CalendarCheck,
  CalendarClock,
  Search,
  Filter,
  Building,
  CreditCard,
  QrCode,
  SlidersHorizontal,
  FileSpreadsheet,
} from 'lucide-react'
import attendanceApi from '../../api/attendanceApi'
import employeeApi from '../../api/employeeApi'
import useDebounce from '../../hooks/useDebounce'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import ManualAttendanceModal from '../../components/modals/ManualAttendanceModal'
import { ATTENDANCE_STATUS, METHOD_LABELS } from '../../utils/constants'
import { formatTime, formatDate, formatDurationHours } from '../../utils/formatters'

export function AttendanceHistoryPage() {
  const [history, setHistory] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(15)
  const [totalCount, setTotalCount] = useState(0)

  // Filters
  const [fromDate, setFromDate] = useState(() => {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  })
  const [toDate, setToDate] = useState(() => new Date().toISOString().split('T')[0])
  const [department, setDepartment] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Manual modal
  const [manualModalOpen, setManualModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState(null)

  useEffect(() => {
    // Load employee list for filter dropdown
    employeeApi.getAll({ pageSize: 100 }).then((res) => {
      const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data || []
      setEmployees(Array.isArray(data) ? data : [])
    }).catch(err => console.error(err))
  }, [])

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await attendanceApi.getHistory({
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        department: department || undefined,
        employeeId: employeeId ? Number(employeeId) : undefined,
        pageIndex,
        pageSize,
      })

      const data = res.data?.data || res.data || {}
      if (Array.isArray(data)) {
        setHistory(data)
        setTotalCount(data.length)
      } else {
        setHistory(data.items || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (err) {
      console.error('Failed to load attendance history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [fromDate, toDate, department, employeeId, pageIndex, pageSize])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  const openManualModal = (record = null) => {
    setSelectedRecord(record)
    setManualModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Lịch Sử & Bù Công Chấm Công</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tra cứu toàn diện nhật ký quẹt thẻ, đi trễ, về sớm và thực hiện điều chỉnh giờ công khi nhân viên quên quẹt
          </p>
        </div>

        <Button
          variant="warning"
          icon={CalendarClock}
          onClick={() => openManualModal(null)}
        >
          Bù / Điều Chỉnh Công
        </Button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            label="Từ ngày"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value)
              setPageIndex(1)
            }}
          />

          <Input
            label="Đến ngày"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value)
              setPageIndex(1)
            }}
          />

          <Select
            label="Nhân viên"
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value)
              setPageIndex(1)
            }}
            placeholder="Tất cả nhân viên"
            options={employees.map((emp) => ({
              value: emp.id,
              label: `${emp.fullName} (${emp.employeeCode})`,
            }))}
          />

          <Input
            label="Phòng ban"
            placeholder="Kỹ thuật, Kế toán..."
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value)
              setPageIndex(1)
            }}
          />
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-blue-600" />
            <span className="text-xs text-slate-500">Đang tải lịch sử chấm công...</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center">
            <CalendarCheck className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Không có nhật ký chấm công trong khoảng thời gian này</h3>
            <p className="text-xs text-slate-400 mt-1">
              Thử mở rộng khoảng ngày hoặc xóa bớt tiêu chí lọc.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Ngày Làm Việc</th>
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Ca Làm Việc</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4 text-center">Trễ</th>
                  <th className="py-3 px-4 text-center">Tổng giờ</th>
                  <th className="py-3 px-4 text-center">Phương thức</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Điều chỉnh</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((row) => {
                  const statusConf = ATTENDANCE_STATUS[row.status] || {
                    label: row.status,
                    color: 'bg-slate-100 text-slate-800 border-slate-200',
                  }
                  const methodConf = METHOD_LABELS[row.method] || {
                    label: row.method || 'NFC',
                    color: 'bg-slate-100 text-slate-600',
                  }

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                        {formatDate(row.date)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{row.employeeName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{row.employeeCode}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{row.department}</td>

                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-700">{row.shiftName || 'Ca Hành Chính'}</span>
                          {row.shiftTime && (
                            <span className="text-[11px] font-mono text-slate-400">{row.shiftTime}</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                        {row.checkInTime ? formatTime(row.checkInTime) : '-'}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {row.checkOutTime ? formatTime(row.checkOutTime) : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {row.lateMinutes > 0 ? (
                          <span className="font-bold text-rose-600 font-mono">
                            +{row.lateMinutes}p
                          </span>
                        ) : (
                          <span className="text-slate-400">0p</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                        {row.totalWorkHours !== null && row.totalWorkHours !== undefined
                          ? formatDurationHours(row.totalWorkHours)
                          : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${methodConf.color}`}
                        >
                          {row.method === 'QR' ? (
                            <QrCode className="w-3 h-3" />
                          ) : (
                            <CreditCard className="w-3 h-3" />
                          )}
                          {methodConf.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {row.status === 'OVERTIME' || (row.overtimeMinutes && row.overtimeMinutes > 0) ? (
                          <div className="inline-flex items-center gap-1 flex-wrap justify-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border bg-blue-100 text-blue-800 border-blue-200">
                              Hoàn thành
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border bg-purple-100 text-purple-800 border-purple-200">
                              Tăng ca {row.overtimeMinutes > 0 ? `+${row.overtimeMinutes}p` : ''}
                            </span>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.color}`}
                          >
                            {statusConf.label}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => openManualModal(row)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Sửa bản ghi này"
                        >
                          <CalendarClock className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(newP) => setPageIndex(newP)}
        />
      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={manualModalOpen}
        initialRecord={selectedRecord}
        onClose={() => setManualModalOpen(false)}
        onSuccess={loadHistory}
      />
    </div>
  )
}

export default AttendanceHistoryPage

