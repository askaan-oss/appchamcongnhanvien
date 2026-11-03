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
  Briefcase,
  User,
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
      if (eventData.success === false || eventData.isSuccess === false) {
        return
      }

      setTodayAttendance((prev) => {
        const existingIndex = prev.findIndex(
          (item) => item.employeeId === eventData.employeeId || item.id === eventData.id
        )

        let updated = [...prev]
        const incomingRecord = {
          id: eventData.id || `realtime-${Date.now()}`,
          employeeId: eventData.employeeId,
          employeeCode: eventData.employeeCode,
          fullName: eventData.fullName || eventData.employeeName,
          employeeName: eventData.employeeName || eventData.fullName,
          department: eventData.department,
          shiftName: eventData.shiftName || 'Ca Hành Chính',
          shiftTime: eventData.shiftTime,
          checkIn: eventData.checkInTime || eventData.checkIn,
          checkInTime: eventData.checkInTime || eventData.checkIn,
          checkOut: eventData.checkOutTime || eventData.checkOut,
          checkOutTime: eventData.checkOutTime || eventData.checkOut,
          lateMinutes: eventData.lateMinutes || 0,
          totalWorkingMinutes: eventData.totalWorkingMinutes || (eventData.totalWorkHours ? eventData.totalWorkHours * 60 : 0),
          totalWorkHours: eventData.totalWorkHours,
          status: eventData.status,
          method: eventData.method || eventData.checkInMethod || 'NFC',
          isManual: false,
        }

        if (existingIndex >= 0) {
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...incomingRecord,
          }
        } else {
          updated = [incomingRecord, ...updated]
        }

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

  // Helper tính toán tổng giờ làm việc thực tế từ Check-In và Check-Out
  const calculateWorkHours = (row) => {
    const inStr = row.checkIn || row.checkInTime
    const outStr = row.checkOut || row.checkOutTime

    const parseToMinutes = (str) => {
      if (!str || str === '-' || str === '--:--') return null
      if (str.includes('T') || str.includes(' ')) {
        const d = new Date(str)
        if (!isNaN(d.getTime())) return d.getHours() * 60 + d.getMinutes()
      }
      const parts = str.split(':')
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10)
        if (!isNaN(h) && !isNaN(m)) return h * 60 + m
      }
      return null
    }

    const inM = parseToMinutes(inStr)
    const outM = parseToMinutes(outStr)

    // Nếu đã có cả giờ Check-in và Check-out hợp lệ
    if (inM !== null && outM !== null) {
      let diff = outM >= inM ? (outM - inM) : (outM + 24 * 60 - inM)
      // Nếu có nghỉ trưa hoặc totalWorkingMinutes từ server
      if (row.totalWorkingMinutes && row.totalWorkingMinutes > 0) {
        diff = row.totalWorkingMinutes
      }
      const h = Math.floor(diff / 60)
      const m = diff % 60
      const decimalHours = (diff / 60).toFixed(1)
      return {
        text: `${h}h ${m}p`,
        subText: `(${decimalHours} giờ)`,
        isWorking: false,
      }
    }

    // Nếu chỉ mới Check-In mà chưa Check-Out
    if (inM !== null) {
      return {
        text: 'Đang làm việc',
        subText: null,
        isWorking: true,
      }
    }

    return { text: '-', subText: null, isWorking: false }
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
                  <th className="py-3 px-4">Mã NV</th>
                  <th className="py-3 px-4">Tên Nhân Viên</th>
                  <th className="py-3 px-4">Phòng Ban</th>
                  <th className="py-3 px-4">Ca Làm Việc</th>
                  <th className="py-3 px-4 text-center">Check-In</th>
                  <th className="py-3 px-4 text-center">Check-Out</th>
                  <th className="py-3 px-4 text-center">Tổng Giờ</th>
                  <th className="py-3 px-4 text-center">Đi Trễ</th>
                  <th className="py-3 px-4 text-center">Phương Thức</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todayAttendance.map((row) => {
                  const isHighlighted = row.id === highlightedId
                  const empCode = row.employeeCode || '-'
                  const empName = row.fullName || row.employeeName || 'Nhân viên'
                  const dept = row.department || '-'
                  const inTime = row.checkIn || row.checkInTime
                  const outTime = row.checkOut || row.checkOutTime
                  const workInfo = calculateWorkHours(row)

                  const statusConf = ATTENDANCE_STATUS[row.status] || {
                    label: row.status,
                    color: 'bg-slate-100 text-slate-800 border-slate-200',
                  }
                  const methodStr = row.method || row.checkInMethod || 'NFC'
                  const methodConf = METHOD_LABELS[methodStr] || {
                    label: methodStr,
                    color: 'bg-slate-100 text-slate-600',
                  }

                  return (
                    <tr
                      key={row.id}
                      className={`transition-colors duration-500 hover:bg-slate-50/70 ${
                        isHighlighted ? 'bg-blue-100/60 animate-highlight' : ''
                      }`}
                    >
                      {/* Cột 1: Mã NV */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        <span className="bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded text-xs">
                          {empCode}
                        </span>
                      </td>

                      {/* Cột 2: Tên nhân viên */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{empName}</div>
                      </td>

                      {/* Cột 3: Phòng ban */}
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {dept}
                      </td>

                      {/* Cột 4: Ca làm việc */}
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-blue-700">{row.shiftName || 'Ca Hành Chính'}</span>
                          {row.shiftTime && (
                            <span className="text-[11px] font-mono text-slate-400">{row.shiftTime}</span>
                          )}
                        </div>
                      </td>

                      {/* Cột 5: Check-In */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {inTime && inTime !== '-' ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            {formatTime(inTime)}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      {/* Cột 5: Check-Out */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {outTime && outTime !== '--:--' && outTime !== '-' ? (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                            {formatTime(outTime)}
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-400 font-medium">
                            --:--
                          </span>
                        )}
                      </td>

                      {/* Cột 6: Tổng giờ */}
                      <td className="py-3.5 px-4 text-center font-mono">
                        {workInfo.isWorking ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            Đang làm việc
                          </span>
                        ) : (
                          <div>
                            <div className="font-bold text-slate-800 text-xs">{workInfo.text}</div>
                            {workInfo.subText && (
                              <div className="text-[10px] text-slate-400">{workInfo.subText}</div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Cột 7: Đi trễ */}
                      <td className="py-3.5 px-4 text-center">
                        {row.lateMinutes > 0 ? (
                          <span className="font-bold text-rose-600 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            +{row.lateMinutes}p
                          </span>
                        ) : (
                          <span className="text-slate-400">0p</span>
                        )}
                      </td>

                      {/* Cột 8: Phương thức */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${methodConf.color}`}
                        >
                          {methodStr === 'QR' ? (
                            <QrCode className="w-3 h-3" />
                          ) : (
                            <CreditCard className="w-3 h-3" />
                          )}
                          {methodConf.label}
                        </span>
                      </td>

                      {/* Cột 9: Trạng thái */}
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
