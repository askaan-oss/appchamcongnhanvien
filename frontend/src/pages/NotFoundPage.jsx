import React from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, Home } from 'lucide-react'
import Button from '../components/common/Button'

export function NotFoundPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-50 text-center">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-black text-slate-800">404 - Không Tìm Thấy Trang</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-sm">
        Đường dẫn bạn yêu cầu không tồn tại hoặc đã được di chuyển trong hệ thống quản trị.
      </p>
      <div className="mt-6">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Quay Về Trang Chủ
          </Button>
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage

