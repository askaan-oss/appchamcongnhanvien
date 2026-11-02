import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  CheckCircle2,
  Clock,
  CalendarOff,
  RefreshCw,
  Sparkles,
  QrCode,
  CreditCard,
  SlidersHorizontal,
} from 'lucide-react'
import { useSignalR } from '../../hooks/useSignalR'
import attendanceApi from '../../api/attendanceApi'
import reportApi from '../../api/reportApi'
import Badge from '../../components/common/Badge'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'
import { ATTENDANCE_STATUS, METHOD_LABELS } from '../../utils/constants'
import { formatTime, formatDurationHours, formatMinutes, formatDate } from '../../utils/formatters'

export function DashboardPage() {
  const { subscribeAttendance, isConnected } = useSignalR()
  const [summary, setSummary] = useState({
    totalEmployees: 0,
    attendedToday: 0,
    lateToday: 0,
    onLeaveToday: 0,
  })
  const [todayAttendance, setTodayAttendance] = useState([])
  const [highlightedId, setHighlightedId] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    try {
      const [sumRes, attRes] = await Promise.all([
        reportApi.getSummary(),
        attendanceApi.getToday(),
      ])

      const sumData = sumRes.data?.data || sumRes.data || {}
      setSummary({
        totalEmployees: sumData.totalEmployees || 0,
        attendedToday: sumData.attendedToday || sumData.presentToday || 0,
        lateToday: sumData.lateToday || 0,
        onLeaveToday: sumData.onLeaveToday || 0,
      })

      const attData = attRes.data?.data || attRes.data || []
      setTodayAttendance(Array.isArray(attData) ? attData : [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Handle Realtime SignalR attendance events
  useEffect(() => {
    const unsubscribe = subscribeAttendance((eventData) => {
      console.log('Realtime push received in Dashboard:', eventData)

      setTodayAttendance((prev) => {
        // Check if employee already has a record today
        const existingIndex = prev.findIndex(
          (item) => item.employeeId === eventData.employeeId || item.id === eventData.id
        )

        let updated = [...prev]
        const incomingRecord = {
          id: eventData.id || `realtime-${Date.now()}`,
          employeeId: eventData.employeeId,
          employeeCode: eventData.employeeCode,
          employeeName: eventData.employeeName,
          department: eventData.department,
          checkInTime: eventData.checkInTime,
          checkOutTime: eventData.checkOutTime,
          lateMinutes: eventData.lateMinutes || 0,
          totalWorkHours: eventData.totalWorkHours,
          status: eventData.status,
          method: eventData.method,
          isManual: false,
        }

        if (existingIndex >= 0) {
          // Update existing row
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...incomingRecord,
          }
        } else {
          // Prepend new row to the top
          updated = [incomingRecord, ...updated]
        }

        // Highlight the updated/new item
        setHighlightedId(incomingRecord.id)
        setTimeout(() => setHighlightedId(null), 2500)

        return updated
      })

      // Update KPI counters
      setSummary((prev) => ({
        ...prev,
        attendedToday: prev.attendedToday + (eventData.isCheckOut ? 0 : 1),
        lateToday: prev.lateToday + (eventData.lateMinutes > 0 ? 1 : 0),
      }))
    })

    return () => unsubscribe()
  }, [subscribeAttendance])

  const handleManualRefresh = () => {
    setIsRefreshing(true)
    loadData()
  }

  const todayStr = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date())

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Giám Sát Chấm Công Hôm Nay</span>
            {isConnected && (
              <span className="flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                Live Hub
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 capitalize mt-0.5">{todayStr}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={RefreshCw}
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
          >
            Làm mới
          </Button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Employees */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-800">{summary.totalEmployees}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Tổng Nhân Sự
            </div>
          </div>
        </div>

        {/* Card 2: Attended Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-emerald-600">{summary.attendedToday}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Đã Chấm Công
            </div>
          </div>
        </div>

        {/* Card 3: Late Today */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">{summary.lateToday}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Đi Trễ Hôm Nay
            </div>
          </div>
        </div>

        {/* Card 4: On Leave */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <CalendarOff className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">{summary.onLeaveToday}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-0.5">
              Nghỉ Phép Hôm Nay
            </div>
          </div>
        </div>
      </div>

      {/* Realtime Today Monitor Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Bảng Giám Sát Realtime (Today Monitor)</h2>
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 text-slate-600">
              {todayAttendance.length} lượt
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Tự động cập nhật qua WebSocket khi nhân viên quẹt thẻ Kiosk
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-blue-600" />
            <span className="text-xs text-slate-500">Đang tải nhật ký chấm công hôm nay...</span>
          </div>
        ) : todayAttendance.length === 0 ? (
          <div className="py-16 text-center">
            <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Chưa có lượt chấm công nào hôm nay</h3>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu sẽ tự động xuất hiện ngay khi nhân viên quẹt thẻ NFC hoặc quét mã QR tại Kiosk.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Check-In</th>
                  <th className="py-3 px-4">Check-Out</th>
                  <th className="py-3 px-4 text-center">Trễ</th>
                  <th className="py-3 px-4 text-center">Tổng giờ</th>
                  <th className="py-3 px-4 text-center">Phương thức</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendance.map((row) => {
                  const isHighlighted = row.id === highlightedId
                  const statusConf = ATTENDANCE_STATUS[row.status] || {
                    label: row.status,
                    color: 'bg-slate-100 text-slate-800 border-slate-200',
                  }
                  const methodConf = METHOD_LABELS[row.method] || {
                    label: row.method || 'NFC',
                    color: 'bg-slate-100 text-slate-600',
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-500 hover:bg-slate-50/70 ${
                        isHighlighted ? 'bg-blue-100/60 animate-highlight' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{row.employeeName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{row.employeeCode}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{row.department}</td>

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
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DashboardPage

