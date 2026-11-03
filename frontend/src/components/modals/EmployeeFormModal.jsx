import React, { useState, useEffect } from 'react'
import { X, UserPlus, Save } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Select from '../common/Select'
import employeeApi from '../../api/employeeApi'

export function EmployeeFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const isEdit = !!initialData
  const [formData, setFormData] = useState({
    employeeCode: '',
    fullName: '',
    department: '',
    position: '',
    email: '',
    phoneNumber: '',
    status: 'ACTIVE',
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeCode: initialData.employeeCode || '',
        fullName: initialData.fullName || '',
        department: initialData.department || '',
        position: initialData.position || '',
        email: initialData.email || '',
        phoneNumber: initialData.phone || initialData.phoneNumber || '',
        status: initialData.status || 'ACTIVE',
      })
    } else {
      setFormData({
        employeeCode: '',
        fullName: '',
        department: '',
        position: '',
        email: '',
        phoneNumber: '',
        status: 'ACTIVE',
      })
    }
    setErrors({})
  }, [initialData, isOpen])

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
    if (!formData.employeeCode?.trim()) errs.employeeCode = 'Vui lòng nhập mã nhân viên'
    if (!formData.fullName?.trim()) errs.fullName = 'Vui lòng nhập họ và tên'
    if (!formData.department?.trim()) errs.department = 'Vui lòng nhập phòng ban'
    if (!formData.position?.trim()) errs.position = 'Vui lòng nhập chức vụ'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsLoading(true)
    try {
      const payload = {
        ...formData,
        phone: formData.phoneNumber?.trim() || undefined,
        phoneNumber: formData.phoneNumber?.trim() || undefined,
      }
      if (isEdit) {
        await employeeApi.update(initialData.id, payload)
      } else {
        await employeeApi.create(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi lưu nhân viên'
      setErrors((prev) => ({ ...prev, global: msg }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
              {isEdit ? <Save className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {isEdit ? 'Chỉnh sửa hồ sơ nhân viên' : 'Thêm mới nhân viên'}
            </h3>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Mã nhân viên (*)"
                name="employeeCode"
                value={formData.employeeCode}
                onChange={handleChange}
                error={errors.employeeCode}
                placeholder="NV001, IT002..."
                disabled={isEdit}
              />

              <Input
                label="Họ và tên (*)"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={errors.fullName}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phòng ban (*)"
                name="department"
                value={formData.department}
                onChange={handleChange}
                error={errors.department}
                placeholder="Kỹ thuật, Kế toán, HR..."
              />

              <Input
                label="Chức vụ (*)"
                name="position"
                value={formData.position}
                onChange={handleChange}
                error={errors.position}
                placeholder="Kỹ sư phần mềm, Trưởng phòng..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="example@company.com"
              />

              <Input
                label="Số điện thoại"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                error={errors.phoneNumber}
                placeholder="0912345678"
              />
            </div>

            {isEdit && (
              <Select
                label="Trạng thái làm việc"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={[
                  { value: 'ACTIVE', label: 'Đang làm việc' },
                  { value: 'PROBATION', label: 'Thử việc' },
                  { value: 'INACTIVE', label: 'Đã nghỉ việc' },
                ]}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {isEdit ? 'Lưu thay đổi' : 'Thêm nhân viên'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EmployeeFormModal

