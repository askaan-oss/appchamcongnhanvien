import React, { useState, useEffect, useRef } from 'react'
import { X, QrCode, Download, RefreshCw, Printer, CheckCircle2, AlertTriangle } from 'lucide-react'
import { QRCodeCanvas } from 'qrcode.react'
import Button from '../common/Button'
import Spinner from '../common/Spinner'
import employeeApi from '../../api/employeeApi'

export function QrCodeModal({ isOpen, onClose, employee }) {
  const [qrCodeData, setQrCodeData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)
  const qrRef = useRef(null)

  useEffect(() => {
    if (isOpen && employee?.id) {
      loadQrCode()
    } else {
      setQrCodeData(null)
      setMessage(null)
      setError(null)
    }
  }, [isOpen, employee])

  const loadQrCode = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await employeeApi.getQrCode(employee.id)
      const data = res.data?.data || res.data
      setQrCodeData(data.qrCode || data)
    } catch (err) {
      setError(err.response?.data?.message || 'Chưa có mã QR hoặc không tải được mã QR')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn cấp mã QR mới? Mã QR cũ sẽ bị vô hiệu hóa!')) {
      return
    }

    setIsRegenerating(true)
    setError(null)
    setMessage(null)
    try {
      const res = await employeeApi.regenerateQrCode(employee.id)
      const data = res.data?.data || res.data
      setQrCodeData(data.qrCode || data)
      setMessage('Đã cấp mã QR mới thành công!')
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể cấp lại mã QR')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleDownload = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const pngUrl = canvas.toDataURL('image/png')
    const downloadLink = document.createElement('a')
    downloadLink.href = pngUrl
    downloadLink.download = `QR_${employee?.employeeCode}_${employee?.fullName}.png`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

  const handlePrint = () => {
    window.print()
  }

  if (!isOpen || !employee) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Mã QR Chấm Công</h3>
              <p className="text-xs text-slate-500">{employee.fullName} ({employee.employeeCode})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center text-center">
          {message && (
            <div className="w-full mb-4 p-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="w-full mb-4 p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Spinner size="lg" className="text-blue-600" />
              <span className="text-xs text-slate-500">Đang tạo mã QR...</span>
            </div>
          ) : qrCodeData ? (
            <div className="flex flex-col items-center">
              {/* Badge Card for Printing */}
              <div
                ref={qrRef}
                className="p-5 bg-white border-2 border-slate-200 rounded-2xl shadow-md flex flex-col items-center"
              >
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">
                  THẺ CHẤM CÔNG DOANH NGHIỆP
                </div>
                <div className="p-2 bg-white rounded-xl shadow-inner border border-slate-100">
                  <QRCodeCanvas
                    value={qrCodeData}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div className="mt-3 font-bold text-slate-800 text-sm">{employee.fullName}</div>
                <div className="text-xs text-slate-500 font-mono">{employee.employeeCode} • {employee.department}</div>
                <div className="mt-2 text-[10px] text-slate-400 font-mono tracking-tight break-all max-w-[200px]">
                  {qrCodeData}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8">
              <p className="text-sm text-slate-500 mb-4">Nhân viên này chưa có mã QR chấm công.</p>
              <Button
                variant="primary"
                onClick={handleRegenerate}
                isLoading={isRegenerating}
                icon={RefreshCw}
              >
                Tạo mã QR đầu tiên
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          {qrCodeData && (
            <div className="w-full mt-6 flex flex-wrap items-center justify-center gap-2 print:hidden">
              <Button
                variant="secondary"
                size="sm"
                icon={Download}
                onClick={handleDownload}
              >
                Tải ảnh (PNG)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                icon={Printer}
                onClick={handlePrint}
              >
                In thẻ
              </Button>
              <Button
                variant="warning"
                size="sm"
                icon={RefreshCw}
                onClick={handleRegenerate}
                isLoading={isRegenerating}
              >
                Cấp lại mã mới
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex justify-end print:hidden">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QrCodeModal

