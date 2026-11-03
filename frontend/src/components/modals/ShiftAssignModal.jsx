import React, { useState, useEffect } from 'react'
import { X, Calendar, CheckSquare, Square } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import shiftApi from '../../api/shiftApi'
import employeeApi from '../../api/employeeApi'
import { DAYS_OF_WEEK } from '../../utils/constants'
import { getLocalDateString } from '../../utils/formatters'

export function ShiftAssignModal({ isOpen, onClose, onSuccess, initialEmployeeId = null }) {
  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [employeeId, setEmployeeId] = useState(initialEmployeeId || '')
  const [shiftId, setShiftId] = useState('')
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]) // Monday - Friday by default
  const [effectiveFrom, setEffectiveFrom] = useState(() => getLocalDateString(new Date(), 0))
  const [effectiveTo, setEffectiveTo] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadDependencies()
      if (initialEmployeeId) setEmployeeId(initialEmployeeId)
    }
  }, [isOpen, initialEmployeeId])

  const loadDependencies = async () => {
    try {
      const [empRes, shiftRes] = await Promise.all([
        employeeApi.getAll({ pageSize: 100 }),
        shiftApi.getAll(),
      ])
      const empData = empRes.data?.data?.items || empRes.data?.data || empRes.data?.items || empRes.data || []
      const sData = shiftRes.data?.data || shiftRes.data || []
      setEmployees(empData)
      setShifts(sData)
      if (sData.length > 0 && !shiftId) {
        const defaultShift = sData.find(s => s.isDefault || s.shiftName?.includes('Hành Chính') || s.name?.includes('Hành Chính')) || sData[0]
        setShiftId(defaultShift.id)
      }
    } catch (err) {
      console.error('Failed to load employees or shifts', err)
    }
  }

  // Khi chọn nhân viên, tự động điền cấu hình phân ca hiện tại của nhân viên đó nếu có
  useEffect(() => {
    if (employeeId && employees.length > 0) {
      const selectedEmp = employees.find(e => e.id === Number(employeeId))
      const currentAss = selectedEmp?.shiftAssignments?.[0] || selectedEmp?.currentShiftAssignment
      if (currentAss && !currentAss.isDefault && currentAss.shiftId) {
        setShiftId(currentAss.shiftId)
        if (currentAss.daysOfWeek) {
          const days = currentAss.daysOfWeek.split(',').map(Number).filter(n => !isNaN(n))
          if (days.length > 0) setSelectedDays(days)
        }
        if (currentAss.effectiveFrom) {
          setEffectiveFrom(currentAss.effectiveFrom.split('T')[0])
        }
        if (currentAss.effectiveTo) {
          setEffectiveTo(currentAss.effectiveTo.split('T')[0])
        }
      }
    }
  }, [employeeId, employees])

  if (!isOpen) return null

  const toggleDay = (dayVal) => {
    if (selectedDays.includes(dayVal)) {
      setSelectedDays(selectedDays.filter((d) => d !== dayVal))
    } else {
      setSelectedDays([...selectedDays, dayVal].sort((a, b) => a - b))
    }
  }

  const validate = () => {
    const errs = {}
    if (!employeeId) errs.employeeId = 'Vui lòng chọn nhân viên'
    if (!shiftId) errs.shiftId = 'Vui lòng chọn ca làm việc'
    if (selectedDays.length === 0) errs.days = 'Vui lòng chọn ít nhất một thứ trong tuần'
    if (!effectiveFrom) errs.effectiveFrom = 'Vui lòng chọn ngày bắt đầu hiệu lực'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await shiftApi.assign({
        employeeId: Number(employeeId),
        shiftId: Number(shiftId),
        daysOfWeek: selectedDays.join(','),
        selectedDays: selectedDays,
        effectiveFrom: effectiveFrom,
        effectiveTo: effectiveTo || null,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        global: err.response?.data?.message || 'Không thể phân ca làm việc cho nhân viên',
      }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-600">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Phân Ca Làm Việc Tuần</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {errors.global && (
              <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
                {errors.global}
              </div>
            )}

            <Select
              label="Chọn Nhân viên (*)"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              error={errors.employeeId}
              options={employees.map((emp) => ({
                value: emp.id,
                label: `${emp.fullName} (${emp.employeeCode} - ${emp.department})`,
              }))}
            />

            <Select
              label="Chọn Ca làm việc (*)"
              value={shiftId}
              onChange={(e) => setShiftId(e.target.value)}
              error={errors.shiftId}
              options={shifts.map((s) => {
                const isDefault = s.isDefault || s.shiftName?.includes('Hành Chính') || s.name?.includes('Hành Chính')
                return {
                  value: s.id,
                  label: `${s.shiftName || s.name} (${(s.startTime || '').substring(0, 5)} - ${(s.endTime || '').substring(0, 5)})${isDefault ? ' [Mặc Định]' : ''}`,
                }
              })}
            />

            {/* Days of week picker */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
                Các thứ áp dụng trong tuần (*)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isChecked = selectedDays.includes(day.value)
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => toggleDay(day.value)}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition-all ${
                        isChecked
                          ? 'border-purple-500 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {isChecked ? (
                        <CheckSquare className="w-4 h-4 text-purple-600 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span>{day.label}</span>
                    </button>
                  )
                })}
              </div>
              {errors.days && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.days}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ngày bắt đầu hiệu lực (*)"
                type="date"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                error={errors.effectiveFrom}
              />
              <Input
                label="Ngày kết thúc hiệu lực"
                type="date"
                value={effectiveTo}
                onChange={(e) => setEffectiveTo(e.target.value)}
                helperText="Để trống nếu áp dụng vô thời hạn"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              Lưu phân ca
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ShiftAssignModal

