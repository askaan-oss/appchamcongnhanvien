import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination({ pageIndex = 1, pageSize = 10, totalCount = 0, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const startItem = totalCount === 0 ? 0 : (pageIndex - 1) * pageSize + 1
  const endItem = Math.min(pageIndex * pageSize, totalCount)

  if (totalCount === 0) return null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200">
      <div className="text-xs text-slate-500">
        Hiển thị <span className="font-semibold text-slate-800">{startItem}</span> -{' '}
        <span className="font-semibold text-slate-800">{endItem}</span> trên tổng số{' '}
        <span className="font-semibold text-slate-800">{totalCount}</span> bản ghi
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex <= 1}
          className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang trước"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-xs font-medium text-slate-700 px-2">
          Trang {pageIndex} / {totalPages}
        </span>

        <button
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= totalPages}
          className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="Trang kế"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default Pagination

