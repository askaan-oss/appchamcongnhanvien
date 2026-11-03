import React, { useState, useEffect, useCallback } from 'react'
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CreditCard,
  QrCode,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  Briefcase,
  Clock,
} from 'lucide-react'
import employeeApi from '../../api/employeeApi'
import useDebounce from '../../hooks/useDebounce'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Badge from '../../components/common/Badge'
import Spinner from '../../components/common/Spinner'
import Pagination from '../../components/common/Pagination'
import ConfirmModal from '../../components/common/ConfirmModal'
import EmployeeFormModal from '../../components/modals/EmployeeFormModal'
import NfcAssignModal from '../../components/modals/NfcAssignModal'
import QrCodeModal from '../../components/modals/QrCodeModal'
import { EMPLOYEE_STATUS } from '../../utils/constants'

export function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [pageIndex, setPageIndex] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modals state
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState(null)

  const [nfcModalOpen, setNfcModalOpen] = useState(false)
  const [selectedForNfc, setSelectedForNfc] = useState(null)

  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [selectedForQr, setSelectedForQr] = useState(null)

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deletingEmployee, setDeletingEmployee] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const debouncedSearch = useDebounce(search, 400)

  const loadEmployees = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await employeeApi.getAll({
        search: debouncedSearch.trim() || undefined,
        department: department || undefined,
        pageIndex,
        pageSize,
      })

      const data = res.data?.data || res.data || {}
      if (Array.isArray(data)) {
        setEmployees(data)
        setTotalCount(data.length)
      } else {
        setEmployees(data.items || [])
        setTotalCount(data.totalCount || 0)
      }
    } catch (err) {
      console.error('Failed to load employees:', err)
    } finally {
      setIsLoading(false)
    }
  }, [debouncedSearch, department, pageIndex, pageSize])

  useEffect(() => {
    loadEmployees()
  }, [loadEmployees])

  const handleDelete = async () => {
    if (!deletingEmployee) return
    setIsDeleting(true)
    try {
      await employeeApi.delete(deletingEmployee.id)
      setDeleteModalOpen(false)
      setDeletingEmployee(null)
      loadEmployees()
    } catch (err) {
      alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa nhân viên')
    } finally {
      setIsDeleting(false)
    }
  }

  const openAddModal = () => {
    setEditingEmployee(null)
    setFormModalOpen(true)
  }

  const openEditModal = (emp) => {
    setEditingEmployee(emp)
    setFormModalOpen(true)
  }

  const openNfcModal = (emp) => {
    setSelectedForNfc(emp)
    setNfcModalOpen(true)
  }

  const openQrModal = (emp) => {
    setSelectedForQr(emp)
    setQrModalOpen(true)
  }

  const openDeleteConfirm = (emp) => {
    setDeletingEmployee(emp)
    setDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <span>Danh Sách Nhân Viên</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {totalCount} hồ sơ
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý hồ sơ nhân sự, số điện thoại, gán mã thẻ NFC và mã QR chấm công Kiosk
          </p>
        </div>

        <Button variant="primary" icon={UserPlus} onClick={openAddModal}>
          Thêm Nhân Viên
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="w-full md:w-80">
          <Input
            placeholder="Tìm theo tên, mã NV, SĐT, Email..."
            icon={Search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPageIndex(1)
            }}
          />
        </div>

        <div className="w-full md:w-64">
          <Input
            placeholder="Lọc theo phòng ban..."
            icon={Building}
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value)
              setPageIndex(1)
            }}
          />
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-blue-600" />
            <span className="text-xs text-slate-500">Đang tải danh sách nhân viên...</span>
          </div>
        ) : employees.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Không tìm thấy nhân viên nào</h3>
            <p className="text-xs text-slate-400 mt-1">
              Thử tìm kiếm với từ khóa khác hoặc nhấn "Thêm Nhân Viên" để tạo hồ sơ mới.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Nhân viên</th>
                  <th className="py-3 px-4">Phòng ban & Chức vụ</th>
                  <th className="py-3 px-4">Số Điện Thoại / Email</th>
                  <th className="py-3 px-4">Ca Làm Việc</th>
                  <th className="py-3 px-4 text-center">Thẻ NFC Đã Gán</th>
                  <th className="py-3 px-4 text-center">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => {
                  const statusConf = EMPLOYEE_STATUS[emp.status] || {
                    label: emp.status || 'ACTIVE',
                    color: 'bg-slate-100 text-slate-700 border-slate-200',
                  }

                  // Lấy số điện thoại (hỗ trợ cả phone và phoneNumber)
                  const phoneNumber = emp.phone || emp.phoneNumber

                  // Lấy danh sách thẻ NFC đã gán (hỗ trợ cả nfcCardUids và nfcCards)
                  const activeCardUids = (emp.nfcCardUids && emp.nfcCardUids.length > 0)
                    ? emp.nfcCardUids
                    : (emp.nfcCards || []).map((c) => (typeof c === 'string' ? c : (c.cardUid || c.uid))).filter(Boolean)
                  const activeCardCount = activeCardUids.length

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Cột 1: Nhân viên */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{emp.fullName}</div>
                        <div className="font-mono text-[11px] text-blue-600 font-semibold mt-0.5">
                          {emp.employeeCode}
                        </div>
                      </td>

                      {/* Cột 2: Phòng ban & Chức vụ */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{emp.department}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                          <Briefcase className="w-3 h-3 text-slate-400" />
                          <span>{emp.position}</span>
                        </div>
                      </td>

                      {/* Cột 3: Số Điện Thoại & Email */}
                      <td className="py-3.5 px-4">
                        {phoneNumber ? (
                          <div className="flex items-center gap-1.5 text-slate-800 font-bold font-mono text-xs">
                            <Phone className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>{phoneNumber}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa có SĐT</span>
                        )}
                        {emp.email && (
                          <div className="flex items-center gap-1.5 mt-1 text-slate-500 text-[11px]">
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[160px]">{emp.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Cột 4: Ca làm việc */}
                      <td className="py-3.5 px-4 font-medium">
                        {emp.shiftAssignments && emp.shiftAssignments.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {emp.shiftAssignments.map((ass, idx) => (
                              <div key={idx} className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="text-blue-700 font-bold text-xs">{ass.shiftName}</span>
                                {ass.startTime && ass.endTime && (
                                  <span className="font-mono text-slate-400 text-[11px]">
                                    ({ass.startTime.substring(0, 5)}-{ass.endTime.substring(0, 5)})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="text-emerald-700 font-medium text-xs">Ca Hành Chính</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Mặc định
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              (08:00-17:30)
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Cột 5: Thẻ NFC Đã Gán */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openNfcModal(emp)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            activeCardCount > 0
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 shadow-xs'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={
                            activeCardCount > 0
                              ? `Mã thẻ: ${activeCardUids.join(', ')} - Nhấn để quản lý/thu hồi`
                              : 'Nhấn để gán thẻ NFC'
                          }
                        >
                          <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                          {activeCardCount > 0 ? (
                            <span className="font-mono font-bold tracking-wider">
                              {activeCardUids[0]}
                              {activeCardCount > 1 && (
                                <span className="ml-1 text-[10px] bg-indigo-200 px-1 py-0.2 rounded text-indigo-900">
                                  +{activeCardCount - 1}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-[11px]">Chưa gán</span>
                          )}
                        </button>
                      </td>

                      {/* Cột 5: Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Cột 6: Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* QR Code button */}
                          <button
                            onClick={() => openQrModal(emp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                            title="Xem / In Mã QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          {/* Edit button */}
                          <button
                            onClick={() => openEditModal(emp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Chỉnh sửa hồ sơ"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Delete button */}
                          <button
                            onClick={() => openDeleteConfirm(emp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Xóa nhân viên"
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

        {/* Pagination */}
        {!isLoading && totalCount > pageSize && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <Pagination
              currentPage={pageIndex}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setPageIndex}
            />
          </div>
        )}
      </div>

      {/* Modal: Thêm / Sửa Nhân viên */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        initialData={editingEmployee}
        onClose={() => setFormModalOpen(false)}
        onSuccess={loadEmployees}
      />

      {/* Modal: Gán & Quản lý Thẻ NFC */}
      <NfcAssignModal
        isOpen={nfcModalOpen}
        employee={selectedForNfc}
        onClose={() => setNfcModalOpen(false)}
        onSuccess={loadEmployees}
      />

      {/* Modal: Xem & In Mã QR */}
      <QrCodeModal
        isOpen={qrModalOpen}
        employee={selectedForQr}
        onClose={() => setQrModalOpen(false)}
        onSuccess={loadEmployees}
      />

      {/* Modal: Xác nhận Xóa Nhân viên */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xác nhận xóa nhân viên"
        message={`Bạn có chắc chắn muốn xóa hồ sơ nhân viên "${deletingEmployee?.fullName}" (${deletingEmployee?.employeeCode})? Toàn bộ lịch sử chấm công và thẻ NFC liên kết cũng sẽ bị ảnh hưởng.`}
        confirmText="Xác nhận xóa"
        confirmVariant="danger"
        isLoading={isDeleting}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
      />
    </div>
  )
}

export default EmployeesPage
