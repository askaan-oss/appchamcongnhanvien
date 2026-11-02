import React, { useState, useEffect, useCallback } from 'react'
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Calendar,
  Download,
  PieChart as PieChartIcon,
  CheckCircle,
  Clock,
  CalendarOff,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import reportApi from '../../api/reportApi'
import { downloadFile } from '../../utils/fileDownloader'
import Button from '../../components/common/Button'
import Spinner from '../../components/common/Spinner'

const COLORS = ['#10b981', '#f43f5e', '#f59e0b', '#6366f1']

export function ReportsPage() {
  const currentDate = new Date()
  const [month, setMonth] = useState(currentDate.getMonth() + 1)
  const [year, setYear] = useState(currentDate.getFullYear())
  const [summary, setSummary] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExportingExcel, setIsExportingExcel] = useState(false)
  const [isExportingPdf, setIsExportingPdf] = useState(false)

  const loadSummary = useCallback(async () => {
    setIsLoading(true)
    try {
      // Pick first day of chosen month/year
      const dateParam = `${year}-${String(month).padStart(2, '0')}-01`
      const res = await reportApi.getSummary(dateParam)
      const data = res.data?.data || res.data || {}
      setSummary(data)
    } catch (err) {
      console.error('Failed to load report summary:', err)
    } finally {
      setIsLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    loadSummary()
  }, [loadSummary])

  const handleExportExcel = async () => {
    setIsExportingExcel(true)
    try {
      const res = await reportApi.exportExcel(month, year)
      downloadFile(
        res.data,
        `BangCong_Thang${month}_${year}.xlsx`,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xuất file Excel bảng công')
    } finally {
      setIsExportingExcel(false)
    }
  }

  const handleExportPdf = async () => {
    setIsExportingPdf(true)
    try {
      const res = await reportApi.exportPdf(month, year)
      downloadFile(
        res.data,
        `BaoCaoChuyenCan_Thang${month}_${year}.pdf`,
        'application/pdf'
      )
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xuất báo cáo PDF')
    } finally {
      setIsExportingPdf(false)
    }
  }

  // Prepare chart data
  const attendedCount = summary?.attendedToday || summary?.presentToday || 0
  const lateCount = summary?.lateToday || 0
  const onLeaveCount = summary?.onLeaveToday || 0
  const onTimeCount = Math.max(0, attendedCount - lateCount)

  const pieData = [
    { name: 'Đúng Giờ', value: onTimeCount },
    { name: 'Đi Trễ', value: lateCount },
    { name: 'Nghỉ Phép', value: onLeaveCount },
  ]

  const barData = [
    { name: 'Đúng giờ', count: onTimeCount },
    { name: 'Đi trễ', count: lateCount },
    { name: 'Nghỉ phép', count: onLeaveCount },
    { name: 'Tổng lượt', count: attendedCount },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Báo Cáo & Trích Xuất Dữ Liệu</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích tỷ lệ chuyên cần, tải file Excel bảng công chi tiết và tài liệu PDF tổng hợp
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="success"
            icon={FileSpreadsheet}
            onClick={handleExportExcel}
            isLoading={isExportingExcel}
          >
            Xuất Bảng Công Excel (.xlsx)
          </Button>

          <Button
            variant="danger"
            icon={FileText}
            onClick={handleExportPdf}
            isLoading={isExportingPdf}
          >
            Xuất Báo Cáo PDF (.pdf)
          </Button>
        </div>
      </div>

      {/* Month & Year Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Kỳ Báo Cáo:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Tháng:</label>
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="rounded-lg border border-slate-300 text-sm py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500">Năm:</label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-lg border border-slate-300 text-sm py-1.5 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            {[2024, 2025, 2026, 2027].map((y) => (
              <option key={y} value={y}>
                Năm {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Visual Analytics Cards */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" className="text-blue-600" />
          <span className="text-xs text-slate-500">Đang tạo số liệu báo cáo...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
                Tỷ Lệ Chuyên Cần Trong Kỳ
              </h3>
              <span className="text-xs text-slate-400">Tháng {month}/{year}</span>
            </div>

            <div className="h-64 w-full">
              {pieData.every(d => d.value === 0) ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  Chưa có dữ liệu chấm công phát sinh trong tháng này
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={45}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Số Lượng Lượt Chấm Công Phân Loại
              </h3>
              <span className="text-xs text-slate-400">Tháng {month}/{year}</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" name="Số lượt" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage

