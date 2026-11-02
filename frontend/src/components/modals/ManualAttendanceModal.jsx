import React, { useState, useEffect } from 'react'
import { X, CalendarClock, Save } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import attendanceApi from '../../api/attendanceApi'
import employeeApi from '../../api/employeeApi'

export function ManualAttendanceModal({ isOpen, onClose, onSuccess, initialRecord = null }) {
  const [employees, setEmployees] = useState([])
  const [employeeId, setEmployeeId] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [checkInTime, setCheckInTime] = useState('08:00')
  const [checkOutTime, setCheckOutTime] = useState('17:30')
  const [status, setStatus] = useState('COMPLETED')
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadEmployees()
      if (initialRecord) {
        setEmployeeId(initialRecord.employeeId || '')
        setDate(initialRecord.date ? initialRecord.date.split('T')[0] : new Date().toISOString().split('T')[0])
        setCheckInTime(initialRecord.checkInTime ? initialRecord.checkInTime.substring(11, 16) : '08:00')
        setCheckOutTime(initialRecord.checkOutTime ? initialRecord.checkOutTime.substring(11, 16) : '17:30')
        setStatus(initialRecord.status || 'COMPLETED')
        setNote(initialRecord.note || '')
      } else {
        setEmployeeId('')
        setDate(new Date().toISOString().split('T')[0])
        setCheckInTime('08:00')
        setCheckOutTime('17:30')
        setStatus('COMPLETED')
        setNote('')
      }
      setErrors({})
    }
  }, [isOpen, initialRecord])

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ pageSize: 100 })
      const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data || []
      setEmployees(data)
    } catch (err) {
      console.error('Failed to load employees for manual attendance', err)
    }
  }

  if (!isOpen) return null

  const validate = () => {
    const errs = {}
    if (!employeeId) errs.employeeId = 'Vui lòng chọn nhân viên'
    if (!date) errs.date = 'Vui lòng chọn ngày công'
    if (!checkInTime) errs.checkInTime = 'Vui lòng chọn giờ Check-In'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      // Build ISO strings for checkIn and checkOut
      const checkInISO = checkInTime ? `${date}T${checkInTime}:00` : null
      const checkOutISO = checkOutTime ? `${date}T${checkOutTime}:00` : null

      await attendanceApi.manualAdjust({
        employeeId: Number(employeeId),
        date: date,
        checkInTime: checkInISO,
        checkOutTime: checkOutISO,
        status: status,
        note: note.trim() || 'Điều chỉnh công thủ công từ Web Admin',
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        global: err.response?.data?.message || 'Có lỗi xảy ra khi lưu điều chỉnh công',
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
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Điều Chỉnh / Bù Công Thủ Công</h3>
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
              disabled={!!initialRecord}
              options={employees.map((emp) => ({
                value: emp.id,
                label: `${emp.fullName} (${emp.employeeCode} - ${emp.department})`,
              }))}
            />

            <Input
              label="Ngày làm việc (*)"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              error={errors.date}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giờ Check-In (*)"
                type="time"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
                error={errors.checkInTime}
              />
              <Input
                label="Giờ Check-Out"
                type="time"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
            </div>

            <Select
              label="Trạng thái công"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: 'COMPLETED', label: 'Hoàn thành (Đủ công)' },
                { value: 'ON_TIME', label: 'Đúng giờ' },
                { value: 'LATE', label: 'Đi trễ' },
                { value: 'EARLY', label: 'Về sớm' },
                { value: 'OVERTIME', label: 'Tăng ca' },
              ]}
            />

            <Input
              label="Lý do điều chỉnh (*)"
              placeholder="Nhân viên quên quẹt thẻ, thẻ bị lỗi, được duyệt bù..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading} icon={Save}>
              Lưu điều chỉnh
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ManualAttendanceModal

