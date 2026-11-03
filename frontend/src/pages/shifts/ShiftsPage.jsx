import React, { useState, useEffect, useCallback } from 'react'
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  CheckCircle,
  AlertCircle,
  CheckSquare,
} from 'lucide-react'
import shiftApi from '../../api/shiftApi'
import employeeApi from '../../api/employeeApi'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import ConfirmModal from '../../components/common/ConfirmModal'
import ShiftFormModal from '../../components/modals/ShiftFormModal'
import ShiftAssignModal from '../../components/modals/ShiftAssignModal'
import { formatTime, formatDate } from '../../utils/formatters'
import { DAYS_OF_WEEK } from '../../utils/constants'

export function ShiftsPage() {
  const [activeTab, setActiveTab] = useState('catalog') // 'catalog' | 'roster'
  const [shifts, setShifts] = useState([])
  const [employeesWithShifts, setEmployeesWithShifts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Shift Form Modal
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingShift, setEditingShift] = useState(null)

  // Shift Assign Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [assignEmployeeId, setAssignEmployeeId] = useState(null)

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingShift, setDeletingShift] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadShifts = useCallback(async () => {
    setIsLoading(true)
    try {
      const [shiftRes, empRes] = await Promise.all([
        shiftApi.getAll(),
        employeeApi.getAll({ pageSize: 100 }),
      ])

      const sData = shiftRes.data?.data || shiftRes.data || []
      setShifts(Array.isArray(sData) ? sData : [])

      const eData = empRes.data?.data?.items || empRes.data?.data || empRes.data?.items || empRes.data || []
      setEmployeesWithShifts(Array.isArray(eData) ? eData : [])
    } catch (err) {
      console.error('Failed to load shifts:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadShifts()
  }, [loadShifts])

  const handleDelete = async () => {
    if (!deletingShift) return
    setIsDeleting(true)
    try {
      await shiftApi.delete(deletingShift.id)
      setDeleteModalOpen(false)
      setDeletingShift(null)
      loadShifts()
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa ca làm việc')
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDays = (daysStr) => {
    if (!daysStr) return '-'
    const dayNumbers = daysStr.split(',').map(d => Number(d.trim()))
    return dayNumbers
      .map(num => DAYS_OF_WEEK.find(d => d.value === num)?.label || `Thứ ${num}`)
      .join(', ')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Ca Làm Việc & Phân Ca Tuần</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cấu hình khung giờ chuẩn, thời gian ân hạn đi trễ và thiết lập lịch phân ca nhân sự
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'catalog' ? (
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingShift(null)
                setFormModalOpen(true)
              }}
            >
              Thêm Ca Mới
            </Button>
          ) : (
            <Button
              variant="primary"
              icon={Calendar}
              onClick={() => {
                setAssignEmployeeId(null)
                setAssignModalOpen(true)
              }}
            >
              Phân Ca Nhân Sự
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Danh Mục Ca ({shifts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Lịch Phân Ca Nhân Sự</span>
        </button>
      </div>

      {/* Tab 1: Catalog */}
      {activeTab === 'catalog' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <Spinner size="lg" className="text-blue-600" />
              <span className="text-xs text-slate-500">Đang tải danh mục ca...</span>
            </div>
          ) : shifts.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-semibold text-slate-700">Chưa có ca làm việc nào</h3>
              <p className="text-xs text-slate-400 mt-1">
                Nhấn "Thêm Ca Mới" để tạo khung giờ làm việc đầu tiên.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3 px-4">Tên Ca</th>
                    <th className="py-3 px-4">Khung Giờ Làm Việc</th>
                    <th className="py-3 px-4">Nghỉ Trưa</th>
                    <th className="py-3 px-4 text-center">Ân Hạn Đi Trễ</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                    <th className="py-3 px-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shifts.map((shift) => {
                    const isDefault = shift.isDefault || shift.shiftName?.includes('Hành Chính') || shift.name?.includes('Hành Chính')
                    return (
                      <tr key={shift.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                          <div className="flex items-center gap-2">
                            <span>{shift.shiftName || shift.name}</span>
                            {isDefault && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                Ca Mặc Định
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">
                          {formatTime(shift.startTime)} &rarr; {formatTime(shift.endTime)}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">
                          {shift.breakStartTime && shift.breakEndTime
                            ? `${formatTime(shift.breakStartTime)} - ${formatTime(shift.breakEndTime)}`
                            : '-'}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-slate-700">
                          {shift.graceMinutes} phút
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={shift.isActive ? 'success' : 'default'} size="sm">
                            {shift.isActive ? 'Đang kích hoạt' : 'Ngừng sử dụng'}
                          </Badge>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setEditingShift(shift)
                                setFormModalOpen(true)
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Sửa ca làm việc"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (isDefault) {
                                  alert('Không thể xóa ca mặc định của hệ thống!')
                                  return
                                }
                                setDeletingShift(shift)
                                setDeleteModalOpen(true)
                              }}
                              className={`p-1.5 rounded-lg border border-slate-200 transition-colors ${
                                isDefault
                                  ? 'text-slate-300 cursor-not-allowed bg-slate-50'
                                  : 'text-slate-600 hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={isDefault ? 'Không thể xóa ca mặc định' : 'Xóa ca làm việc'}
                              disabled={isDefault}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Roster / Employee Assignments */}
      {activeTab === 'roster' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-800">Danh Sách Phân Ca Nhân Viên</h2>
            <div className="text-xs text-slate-400">
              Mỗi nhân viên có thể gán theo các thứ trong tuần kèm ngày hiệu lực
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Phòng ban</th>
                  <th className="py-3 px-4">Ca Hiện Tại</th>
                  <th className="py-3 px-4">Các Thứ Áp Dụng</th>
                  <th className="py-3 px-4">Hiệu Lực</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employeesWithShifts.map((emp) => {
                  const assignment = emp.shiftAssignments?.[0] || emp.currentShiftAssignment
                  const defaultShift = shifts.find(s => s.isDefault || s.shiftName?.includes('Hành Chính') || s.name?.includes('Hành Chính')) || shifts[0]
                  const assignedShift = assignment?.shift || shifts.find(s => s.id === assignment?.shiftId) || (assignment?.isDefault ? defaultShift : null)
                  const isCustom = assignment && !assignment.isDefault

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{emp.fullName}</div>
                        <div className="font-mono text-[11px] text-slate-400">{emp.employeeCode}</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">{emp.department || 'Chưa thiết lập'}</td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {isCustom ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-blue-600 font-bold">{assignment.shiftName || assignedShift?.shiftName || assignedShift?.name}</span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              ({formatTime(assignment.startTime || assignedShift?.startTime)}-{formatTime(assignment.endTime || assignedShift?.endTime)})
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-700 font-medium">Ca Hành Chính</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Mặc định
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              ({formatTime(defaultShift?.startTime || '08:00:00')}-{formatTime(defaultShift?.endTime || '17:30:00')})
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {assignment?.daysOfWeek ? (
                          formatDays(assignment.daysOfWeek)
                        ) : (
                          <span className="text-slate-600 font-medium">Thứ 2, Thứ 3, Thứ 4, Thứ 5, Thứ 6</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {isCustom && assignment?.effectiveFrom ? (
                          <span>
                            {formatDate(assignment.effectiveFrom)} &rarr;{' '}
                            {assignment.effectiveTo ? formatDate(assignment.effectiveTo) : 'Vô hạn'}
                          </span>
                        ) : (
                          <span className="text-slate-400">Toàn thời gian</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={Calendar}
                          onClick={() => {
                            setAssignEmployeeId(emp.id)
                            setAssignModalOpen(true)
                          }}
                        >
                          {isCustom ? 'Đổi ca' : 'Phân ca'}
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <ShiftFormModal
        isOpen={formModalOpen}
        initialData={editingShift}
        onClose={() => setFormModalOpen(false)}
        onSuccess={loadShifts}
      />

      <ShiftAssignModal
        isOpen={assignModalOpen}
        initialEmployeeId={assignEmployeeId}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={loadShifts}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xác nhận xóa ca làm việc"
        message={`Bạn có chắc chắn muốn xóa ca làm việc "${deletingShift?.shiftName}"? Các phân ca nhân viên liên quan có thể bị ảnh hưởng.`}
        confirmText="Xóa ca"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}

export default ShiftsPage

