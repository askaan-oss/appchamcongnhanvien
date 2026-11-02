import React from 'react'
import { LogOut, User, Radio, Wifi, WifiOff } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useSignalR } from '../../hooks/useSignalR'
import Badge from '../common/Badge'

export function Topbar() {
  const { user, logout } = useAuth()
  const { isConnected } = useSignalR()

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-xs sticky top-0 z-30">
      {/* Left: SignalR Realtime status */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
          title={isConnected ? 'SignalR WebSocket đang hoạt động' : 'Đang kết nối lại SignalR...'}
        >
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Realtime Kiosk Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Realtime Kết nối lại...</span>
            </>
          )}
        </div>
      </div>

      {/* Right: User profile and Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-xs border border-blue-200">
            {user?.fullName ? user.fullName.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-sm font-semibold text-slate-800 leading-tight">
              {user?.fullName || user?.username || 'Quản trị viên'}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge
                variant={user?.role === 'ADMIN' ? 'purple' : 'primary'}
                size="sm"
                className="py-0 px-1.5 text-[10px]"
              >
                {user?.role || 'STAFF'}
              </Badge>
              <span className="text-[11px] text-slate-400">@{user?.username}</span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors"
          title="Đăng xuất khỏi hệ thống"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}

export default Topbar

