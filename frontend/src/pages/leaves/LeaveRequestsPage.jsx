import React, { useState, useEffect, useCallback } from 'react'
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import leaveApi from '../../api/leaveApi'
import Button from '../../components/common/Button'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import LeaveRequestModal from '../../components/modals/LeaveRequestModal'
import LeaveApproveModal from '../../components/modals/LeaveApproveModal'
import { LEAVE_STATUS, LEAVE_TYPES } from '../../utils/constants'
import { formatDate } from '../../utils/formatters'

export function LeaveRequestsPage() {
  const [activeTab, setActiveTab] = useState('PENDING') // 'PENDING' | 'APPROVED' | 'REJECTED'
  const [requests, setRequests] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // Modals
  const [requestModalOpen, setRequestModalOpen] = useState(false)
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState(null)

  const loadRequests = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await leaveApi.getAll({
        status: activeTab,
        pageIndex,
        pageSize,
      })

      const data = res.data?.data || res.data || {}
      if (Array.isArray(data)) {
        setRequests(data)
        setTotalCount(data.length)
      } else {
        setRequests(data.items || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (err) {
      console.error('Failed to load leave requests:', err)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab, pageIndex, pageSize])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  const openApproveModal = (req) => {
    setSelectedRequest(req)
    setApproveModalOpen(true)
  }

  const handleQuickStatus = async (req, newStatus) => {
    try {
      await leaveApi.updateStatus(req.id, {
        status: newStatus,
        reviewNote: `Xét duyệt nhanh từ giao diện Web Admin (${newStatus})`,
      })
      loadRequests()
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi khi xét duyệt đơn')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quy Trình & Đơn Nghỉ Phép</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý phê duyệt các đơn xin nghỉ phép năm, nghỉ ốm và việc riêng của toàn thể nhân sự
          </p>
        </div>

        <Button
          variant="primary"
          icon={Plus}
          onClick={() => setRequestModalOpen(true)}
        >
          Tạo Đơn Xin Nghỉ
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => {
            setActiveTab('PENDING')
            setPageIndex(1)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'PENDING'
              ? 'border-amber-500 text-amber-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Chờ Duyệt (Pending)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('APPROVED')
            setPageIndex(1)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'APPROVED'
              ? 'border-emerald-600 text-emerald-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          <span>Đã Chấp Thuận</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('REJECTED')
            setPageIndex(1)
          }}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'REJECTED'
              ? 'border-rose-600 text-rose-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Đã Từ Chối</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-blue-600" />
            <span className="text-xs text-slate-500">Đang tải danh sách đơn nghỉ phép...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Không có đơn nghỉ phép nào ở trạng thái này</h3>
            <p className="text-xs text-slate-400 mt-1">
              Các đơn mới được tạo sẽ xuất hiện tại tab "Chờ Duyệt".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Loại Phép</th>
                  <th className="py-3 px-4">Thời Gian Nghỉ</th>
                  <th className="py-3 px-4">Lý Do</th>
                  <th className="py-3 px-4">Ghi Chú Phê Duyệt</th>
                  <th className="py-3 px-4 text-center">Trạng Thái</th>
                  {activeTab === 'PENDING' && <th className="py-3 px-4 text-right">Xét Duyệt</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const statusConf = LEAVE_STATUS[req.status] || {
                    label: req.status,
                    color: 'bg-slate-100 text-slate-800 border-slate-200',
                  }
                  const typeLabel = LEAVE_TYPES[req.leaveType]?.label || req.leaveType

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">
                          {req.employeeName || req.employee?.fullName}
                        </div>
                        <div className="font-mono text-[11px] text-slate-400">
                          {req.employeeCode || req.employee?.employeeCode}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="purple" size="sm">
                          {typeLabel}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        {formatDate(req.fromDate)} &rarr; {formatDate(req.toDate)}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate">
                        {req.reviewNote || '-'}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      {activeTab === 'PENDING' && (
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="success"
                              size="sm"
                              icon={CheckCircle}
                              onClick={() => handleQuickStatus(req, 'APPROVED')}
                            >
                              Duyệt
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openApproveModal(req)}
                            >
                              Ghi chú
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(newP) => setPageIndex(newP)}
        />
      </div>

      {/* Modals */}
      <LeaveRequestModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
        onSuccess={loadRequests}
      />

      <LeaveApproveModal
        isOpen={approveModalOpen}
        leaveRequest={selectedRequest}
        onClose={() => setApproveModalOpen(false)}
        onSuccess={loadRequests}
      />
    </div>
  )
}

export default LeaveRequestsPage

