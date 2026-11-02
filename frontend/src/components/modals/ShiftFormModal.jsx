import React, { useState, useEffect } from 'react'
import { X, Clock, Save } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import shiftApi from '../../api/shiftApi'

export function ShiftFormModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const isEdit = !!initialData
  const [formData, setFormData] = useState({
    shiftName: '',
    startTime: '08:00',
    endTime: '17:30',
    breakStartTime: '12:00',
    breakEndTime: '13:30',
    graceMinutes: 15,
    isActive: true,
  })
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        shiftName: initialData.shiftName || '',
        startTime: initialData.startTime ? initialData.startTime.substring(0, 5) : '08:00',
        endTime: initialData.endTime ? initialData.endTime.substring(0, 5) : '17:30',
        breakStartTime: initialData.breakStartTime ? initialData.breakStartTime.substring(0, 5) : '12:00',
        breakEndTime: initialData.breakEndTime ? initialData.breakEndTime.substring(0, 5) : '13:30',
        graceMinutes: initialData.graceMinutes ?? 15,
        isActive: initialData.isActive !== false,
      })
    } else {
      setFormData({
        shiftName: '',
        startTime: '08:00',
        endTime: '17:30',
        breakStartTime: '12:00',
        breakEndTime: '13:30',
        graceMinutes: 15,
        isActive: true,
      })
    }
    setErrors({})
  }, [initialData, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const validate = () => {
    const errs = {}
    if (!formData.shiftName?.trim()) errs.shiftName = 'Vui lòng nhập tên ca làm việc'
    if (!formData.startTime) errs.startTime = 'Vui lòng chọn giờ bắt đầu'
    if (!formData.endTime) errs.endTime = 'Vui lòng chọn giờ kết thúc'
    if (formData.graceMinutes < 0) errs.graceMinutes = 'Số phút ân hạn không được âm'
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
        graceMinutes: Number(formData.graceMinutes),
      }

      if (isEdit) {
        await shiftApi.update(initialData.id, payload)
      } else {
        await shiftApi.create(payload)
      }
      onSuccess?.()
      onClose()
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        global: err.response?.data?.message || 'Có lỗi xảy ra khi lưu ca làm việc',
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
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {isEdit ? 'Chỉnh sửa ca làm việc' : 'Thêm ca làm việc mới'}
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

            <Input
              label="Tên ca làm việc (*)"
              name="shiftName"
              placeholder="Ví dụ: Ca Hành Chính, Ca Sáng, Ca Chiều..."
              value={formData.shiftName}
              onChange={handleChange}
              error={errors.shiftName}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Giờ bắt đầu (*)"
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                error={errors.startTime}
              />
              <Input
                label="Giờ kết thúc (*)"
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                error={errors.endTime}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Bắt đầu nghỉ trưa"
                type="time"
                name="breakStartTime"
                value={formData.breakStartTime}
                onChange={handleChange}
              />
              <Input
                label="Kết thúc nghỉ trưa"
                type="time"
                name="breakEndTime"
                value={formData.breakEndTime}
                onChange={handleChange}
              />
            </div>

            <Input
              label="Số phút ân hạn đi trễ (Grace Minutes)"
              type="number"
              name="graceMinutes"
              min="0"
              max="120"
              value={formData.graceMinutes}
              onChange={handleChange}
              error={errors.graceMinutes}
              helperText="Quá số phút này khi check-in sẽ bị tính là ĐI TRỄ"
            />

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-700 cursor-pointer">
                Kích hoạt ca làm việc này
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
            <Button variant="secondary" type="button" onClick={onClose} disabled={isLoading}>
              Hủy bỏ
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {isEdit ? 'Lưu thay đổi' : 'Tạo ca làm việc'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ShiftFormModal

