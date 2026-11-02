import React, { useState } from 'react'
import { X, CreditCard, ShieldAlert, CheckCircle2, Lock, Smartphone } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Badge from '../common/Badge'
import { nfcApi } from '../../api/nfcApi'
import { formatDate } from '../../utils/formatters'

export function NfcAssignModal({ isOpen, onClose, onSuccess, employee }) {
  const [cardUid, setCardUid] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [revokingCard, setRevokingCard] = useState(null)
  const [revokeReason, setRevokeReason] = useState('')

  if (!isOpen || !employee) return null

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!cardUid.trim()) {
      setError('Vui lòng quét hoặc nhập mã UID của thẻ NFC')
      return
    }

    setIsLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await nfcApi.assign({
        employeeId: employee.id,
        cardUid: cardUid.trim(),
        note: note.trim() || undefined,
      })
      setSuccessMsg('Gán thẻ NFC thành công!')
      setCardUid('')
      setNote('')
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.message || 'Không thể gán thẻ. Vui lòng kiểm tra xem thẻ đã bị gán cho người khác chưa.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevoke = async (card) => {
    setIsLoading(true)
    setError(null)
    setSuccessMsg(null)

    try {
      await nfcApi.revoke({
        cardUid: card.cardUid,
        reason: revokeReason.trim() || 'Thu hồi thẻ từ trang Quản trị',
      })
      setSuccessMsg(`Đã khóa/thu hồi thẻ ${card.cardUid}`)
      setRevokingCard(null)
      setRevokeReason('')
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra khi thu hồi thẻ'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const activeCards = employee.nfcCards || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-600">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Quản lý & Cấp phát Thẻ NFC</h3>
              <p className="text-xs text-slate-500">
                Nhân viên: <span className="font-semibold text-slate-700">{employee.fullName}</span> ({employee.employeeCode})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Cards */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Danh sách thẻ NFC đã liên kết ({activeCards.length})
            </h4>
            {activeCards.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-lg border border-slate-100">
                Nhân viên này chưa được gán thẻ NFC nào.
              </p>
            ) : (
              <div className="space-y-2">
                {activeCards.map((card) => (
                  <div
                    key={card.id || card.cardUid}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-sm text-slate-800 tracking-wider">
                          {card.cardUid}
                        </span>
                        <Badge variant={card.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                          {card.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đã khóa'}
                        </Badge>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Ngày cấp: {formatDate(card.issuedAt || card.createdAt)} {card.note ? `• ${card.note}` : ''}
                      </div>
                    </div>

                    {card.status === 'ACTIVE' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setRevokingCard(card)}
                        disabled={isLoading}
                      >
                        <Lock className="w-3.5 h-3.5 mr-1" />
                        Khóa thẻ
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm revoke sub-panel */}
          {revokingCard && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
              <p className="text-xs font-semibold text-rose-800">
                Khóa thẻ: <span className="font-mono">{revokingCard.cardUid}</span>
              </p>
              <Input
                placeholder="Nhập lý do khóa thẻ (Mất thẻ, hư hỏng...)"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="bg-white"
              />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" size="sm" onClick={() => setRevokingCard(null)}>
                  Hủy
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleRevoke(revokingCard)}>
                  Xác nhận khóa thẻ
                </Button>
              </div>
            </div>
          )}

          {/* Assign New Card Form */}
          <form onSubmit={handleAssign} className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Gán thêm thẻ NFC mới
            </h4>

            <Input
              label="Mã UID Thẻ NFC (Hex)"
              placeholder="Ví dụ: 04A1B2C3D4E5F6"
              value={cardUid}
              onChange={(e) => setCardUid(e.target.value.toUpperCase())}
              helperText="Quét thẻ qua đầu đọc USB hoặc nhập chuỗi UID 14 ký tự Hex"
              className="font-mono tracking-wider"
              autoFocus
            />

            <Input
              label="Ghi chú (Tùy chọn)"
              placeholder="Thẻ NTAG215 cấp lần đầu..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />

            <div className="flex items-center gap-2 p-2.5 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-blue-700">
              <Smartphone className="w-4 h-4 shrink-0 text-blue-600" />
              <span>
                <strong>Gợi ý:</strong> HR cũng có thể mở App Mobile (Chế độ HR), áp lưng điện thoại vào thẻ để gán siêu tốc mà không cần đầu đọc USB.
              </span>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" type="submit" isLoading={isLoading}>
                Gán thẻ này cho nhân viên
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NfcAssignModal

