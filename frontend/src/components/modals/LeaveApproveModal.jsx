import React, { useState } from 'react'
import { X, CheckCircle, XCircle, FileQuestion } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Badge from '../common/Badge'
import leaveApi from '../../api/leaveApi'
import { formatDate } from '../../utils/formatters'
import { LEAVE_TYPES } from '../../utils/constants'

export function LeaveApproveModal({ isOpen, onClose, onSuccess, leaveRequest }) {
  const [reviewNote, setReviewNote] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  if (!isOpen || !leaveRequest) return null

  const handleUpdateStatus = async (status) => {
    setIsLoading(true)
    setError(null)
    try {
      await leaveApi.updateStatus(leaveRequest.id, {
        status,
        reviewNote: reviewNote.trim() || undefined,
      })
      onSuccess?.()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái đơn')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
              <FileQuestion className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Xét Duyệt Đơn Nghỉ Phép</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Details Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Nhân viên:</span>
              <span className="font-semibold text-slate-800 text-sm">
                {leaveRequest.employeeName || leaveRequest.employee?.fullName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Loại phép:</span>
              <Badge variant="purple" size="sm">
                {LEAVE_TYPES[leaveRequest.leaveType]?.label || leaveRequest.leaveType}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Thời gian nghỉ:</span>
              <span className="font-medium text-slate-800">
                {formatDate(leaveRequest.fromDate)} &rarr; {formatDate(leaveRequest.toDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Lý do nghỉ:</span>
              <p className="p-2 rounded bg-white border border-slate-200 text-slate-700 italic">
                "{leaveRequest.reason || 'Không có lý do'}"
              </p>
            </div>
          </div>

          <Input
            label="Ghi chú xét duyệt (Tùy chọn)"
            placeholder="Đồng ý / Từ chối vì lý do..."
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isLoading}>
            Đóng
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="danger"
              size="sm"
              icon={XCircle}
              onClick={() => handleUpdateStatus('REJECTED')}
              isLoading={isLoading}
            >
              Từ chối
            </Button>
            <Button
              variant="success"
              size="sm"
              icon={CheckCircle}
              onClick={() => handleUpdateStatus('APPROVED')}
              isLoading={isLoading}
            >
              Chấp thuận
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LeaveApproveModal

