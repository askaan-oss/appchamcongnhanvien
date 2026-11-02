import React from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarCheck,
  FileText,
  BarChart3,
  CreditCard,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  {
    name: 'Tổng quan',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    name: 'Quản lý Nhân sự',
    path: '/employees',
    icon: Users,
  },
  {
    name: 'Ca & Phân ca',
    path: '/shifts',
    icon: Clock,
  },
  {
    name: 'Lịch sử Chấm công',
    path: '/attendance',
    icon: CalendarCheck,
  },
  {
    name: 'Đơn nghỉ phép',
    path: '/leaves',
    icon: FileText,
  },
  {
    name: 'Báo cáo Thống kê',
    path: '/reports',
    icon: BarChart3,
  },
]

export function Sidebar({ collapsed, setCollapsed }) {
  const { user } = useAuth()

  return (
    <aside
      className={`relative flex flex-col bg-slate-900 text-slate-200 transition-all duration-300 ease-in-out border-r border-slate-800 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-slate-800 justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shrink-0 shadow-lg shadow-blue-500/30">
            <CreditCard className="w-5 h-5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-sm text-white tracking-wide leading-tight">
                NFC ATTENDANCE
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Kiosk Admin Portal
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                    : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                } ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Role / System Info Badge */}
      <div className="p-3 border-t border-slate-800">
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 ${collapsed ? 'justify-center' : ''}`}>
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          {!collapsed && (
            <div className="truncate">
              <div className="text-[11px] font-semibold text-slate-300">
                {user?.role === 'ADMIN' ? 'Toàn quyền Admin' : 'Nhân sự HR'}
              </div>
              <div className="text-[10px] text-slate-500">API v1 Connected</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}

export default Sidebar

