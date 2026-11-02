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

  const openDeleteModal = (emp) => {
    setDeletingEmployee(emp)
    setDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Hồ Sơ Nhân Sự & Định Danh</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý thông tin nhân viên, cấp phát thẻ NFC NTAG215 và mã QR bảo mật cá nhân
          </p>
        </div>

        <Button variant="primary" icon={UserPlus} onClick={openAddModal}>
          Thêm Nhân Viên
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="w-full md:flex-1 relative">
          <Input
            placeholder="Tìm theo Mã NV, Họ tên, Email..."
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
                  <th className="py-3 px-4">Liên hệ</th>
                  <th className="py-3 px-4 text-center">Thẻ NFC</th>
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
                  const activeCardCount = (emp.nfcCards || []).filter(c => c.status === 'ACTIVE').length

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{emp.fullName}</div>
                        <div className="font-mono text-[11px] text-blue-600 font-semibold">
                          {emp.employeeCode}
                        </div>
                      </td>

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

                      <td className="py-3.5 px-4 text-slate-600">
                        {emp.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{emp.email}</span>
                          </div>
                        )}
                        {emp.phoneNumber && (
                          <div className="flex items-center gap-1.5 mt-0.5 text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{emp.phoneNumber}</span>
                          </div>
                        )}
                        {!emp.email && !emp.phoneNumber && <span className="text-slate-400">-</span>}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openNfcModal(emp)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                            activeCardCount > 0
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title="Quản lý thẻ NFC"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>{activeCardCount > 0 ? `${activeCardCount} thẻ` : 'Chưa gán'}</span>
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusConf.color}`}
                        >
                          {statusConf.label}
                        </span>
                      </td>

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
                            onClick={() => openDeleteModal(emp)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Vô hiệu hóa"
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

        <Pagination
          pageIndex={pageIndex}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={(newP) => setPageIndex(newP)}
        />
      </div>

      {/* Modals */}
      <EmployeeFormModal
        isOpen={formModalOpen}
        initialData={editingEmployee}
        onClose={() => setFormModalOpen(false)}
        onSuccess={loadEmployees}
      />

      <NfcAssignModal
        isOpen={nfcModalOpen}
        employee={selectedForNfc}
        onClose={() => setNfcModalOpen(false)}
        onSuccess={loadEmployees}
      />

      <QrCodeModal
        isOpen={qrModalOpen}
        employee={selectedForQr}
        onClose={() => setQrModalOpen(false)}
      />

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Xác nhận vô hiệu hóa nhân viên"
        message={`Bạn có chắc chắn muốn vô hiệu hóa nhân viên ${deletingEmployee?.fullName} (${deletingEmployee?.employeeCode})? Tài khoản và các phương thức chấm công liên quan sẽ tạm dừng.`}
        confirmText="Vô hiệu hóa"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteModalOpen(false)}
      />
    </div>
  )
}

export default EmployeesPage

