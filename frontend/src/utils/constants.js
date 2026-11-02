export const ATTENDANCE_STATUS = {
  ON_TIME: { label: 'Đúng giờ', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  LATE: { label: 'Đi trễ', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  EARLY: { label: 'Về sớm', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  OVERTIME: { label: 'Tăng ca', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  ABSENT: { label: 'Vắng mặt', color: 'bg-gray-100 text-gray-800 border-gray-200' },
}

export const LEAVE_STATUS = {
  PENDING: { label: 'Chờ duyệt', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  APPROVED: { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  REJECTED: { label: 'Đã từ chối', color: 'bg-rose-100 text-rose-800 border-rose-200' },
}

export const LEAVE_TYPES = {
  ANNUAL: { label: 'Phép năm' },
  SICK: { label: 'Nghỉ ốm' },
  UNPAID: { label: 'Việc riêng không lương' },
}

export const EMPLOYEE_STATUS = {
  ACTIVE: { label: 'Đang làm việc', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  INACTIVE: { label: 'Đã nghỉ việc', color: 'bg-slate-100 text-slate-700 border-slate-200' },
  PROBATION: { label: 'Thử việc', color: 'bg-amber-100 text-amber-800 border-amber-200' },
}

export const CARD_STATUS = {
  ACTIVE: { label: 'Đang hoạt động', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  LOCKED: { label: 'Đã khóa', color: 'bg-rose-100 text-rose-800 border-rose-200' },
}

export const METHOD_LABELS = {
  NFC: { label: 'Thẻ NFC', color: 'bg-indigo-100 text-indigo-700' },
  QR: { label: 'Mã QR', color: 'bg-sky-100 text-sky-700' },
  MANUAL: { label: 'Thủ công', color: 'bg-neutral-100 text-neutral-700' },
}

export const DAYS_OF_WEEK = [
  { value: 1, label: 'Thứ Hai' },
  { value: 2, label: 'Thứ Ba' },
  { value: 3, label: 'Thứ Tư' },
  { value: 4, label: 'Thứ Năm' },
  { value: 5, label: 'Thứ Sáu' },
  { value: 6, label: 'Thứ Bảy' },
  { value: 0, label: 'Chủ Nhật' },
]

