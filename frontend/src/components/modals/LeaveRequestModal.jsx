import React, { useState, useEffect } from 'react'
import { X, FileText, Send } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import leaveApi from '../../api/leaveApi'
import employeeApi from '../../api/employeeApi'

export function LeaveRequestModal({ isOpen, onClose, onSuccess }) {
  const [employees, setEmployees] = useState([])
  const [formData, setFormData] = useState({
    employeeId: '',
    leaveType: 'ANNUAL',
    fromDate: () => new Date().toISOString().split('T')[0],
    toDate: () => new Date().toISOString().split('T')[0],
    reason: '',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadEmployees()
      setFormData({
        employeeId: '',
        leaveType: 'ANNUAL',
        fromDate: new Date().toISOString().split('T')[0],
        toDate: new Date().toISOString().split('T')[0],
        reason: '',
      })
      setErrors({})
    }
  }, [isOpen])

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getAll({ pageSize: 100 })
      const data = res.data?.data?.items || res.data?.data || res.data?.items || res.data || []
      setEmployees(data)
      if (data.length > 0 && !formData.employeeId) {
        setFormData((prev) => ({ ...prev, employeeId: data[0].id }))
      }
    } catch (err) {
      console.error('Failed to load employees for leave request', err)
    }
  }

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.employeeId) errs.employeeId = 'Vui lòng chọn nhân viên'
    if (!formData.fromDate) errs.fromDate = 'Vui lòng chọn từ ngày'
    if (!formData.toDate) errs.toDate = 'Vui lòng chọn đến ngày'
    if (formData.fromDate > formData.toDate) errs.toDate = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu'
    if (!formData.reason?.trim()) errs.reason = 'Vui lòng nhập lý do xin nghỉ'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      await leaveApi.create({
        employeeId: Number(formData.employeeId),
        leaveType: formData.leaveType,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        reason: formData.reason.trim(),
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        global: err.response?.data?.message || 'Có lỗi xảy ra khi gửi đơn nghỉ phép',
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
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tạo Đơn Xin Nghỉ Phép</h3>
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
              label="Nhân viên xin nghỉ (*)"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              error={errors.employeeId}
              options={employees.map((emp) => ({
                value: emp.id,
                label: `${emp.fullName} (${emp.employeeCode} - ${emp.department})`,
              }))}
            />

            <Select
              label="Loại nghỉ phép (*)"
              name="leaveType"
              value={formData.leaveType}
              onChange={handleChange}
              options={[
                { value: 'ANNUAL', label: 'Nghỉ phép năm (Có lương)' },
                { value: 'SICK', label: 'Nghỉ ốm / Khám bệnh' },
                { value: 'UNPAID', label: 'Việc riêng không lương' },
              ]}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Từ ngày (*)"
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                error={errors.fromDate}
              />
              <Input
                label="Đến ngày (*)"
                type="date"
                name="toDate"
                value={formData.toDate}
                onChange={handleChange}
                error={errors.toDate}
              />
            </div>

            <Input
              label="Lý do xin nghỉ (*)"
              name="reason"
              placeholder="Đi khám sức khỏe, giải quyết việc gia đình..."
              value={formData.reason}
              onChange={handleChange}
              error={errors.reason}
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading} icon={Send}>
              Gửi đơn xin nghỉ
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LeaveRequestModal

