using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Entities;
using NfcAttendance.Api.Hubs;

namespace NfcAttendance.Api.Services
{
    public class AttendanceService
    {
        private readonly NfcAttendanceDbContext _context;
        private readonly IHubContext<AttendanceHub> _hubContext;

        public AttendanceService(NfcAttendanceDbContext context, IHubContext<AttendanceHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<TapAttendanceResponseDto> ProcessCheckInAsync(TapAttendanceRequestDto request)
        {
            return await ProcessTapInternalAsync(request, forcedAction: "CHECK_IN");
        }

        public async Task<TapAttendanceResponseDto> ProcessCheckOutAsync(TapAttendanceRequestDto request)
        {
            return await ProcessTapInternalAsync(request, forcedAction: "CHECK_OUT");
        }

        public async Task<TapAttendanceResponseDto> ProcessTapAsync(TapAttendanceRequestDto request)
        {
            return await ProcessTapInternalAsync(request, forcedAction: null);
        }

        private async Task<TapAttendanceResponseDto> ProcessTapInternalAsync(TapAttendanceRequestDto request, string? forcedAction)
        {
            DateTime scanTime = request.Timestamp ?? DateTime.Now;
            DateTime today = scanTime.Date;

            // 1. Tìm nhân viên thông qua Thẻ NFC UID hoặc Mã QR
            Employee? employee = null;
            if (!string.IsNullOrEmpty(request.CardUid))
            {
                var card = await _context.NfcCards.Include(c => c.Employee)
                    .FirstOrDefaultAsync(c => c.Uid == request.CardUid.Trim() && c.Status == "ACTIVE");
                employee = card?.Employee;
            }
            else if (!string.IsNullOrEmpty(request.QrPayload))
            {
                var qr = request.QrPayload.Trim();
                employee = await _context.Employees
                    .FirstOrDefaultAsync(e => (e.QrCode == qr || e.EmployeeCode == qr) && e.Status == "ACTIVE");
            }

            if (employee == null)
            {
                return new TapAttendanceResponseDto
                {
                    Success = false,
                    Message = "Thẻ hoặc mã QR không hợp lệ hoặc đã bị khóa trong hệ thống!"
                };
            }

            // 2. Tìm ca làm việc của nhân viên hôm nay (hoặc ca mặc định)
            byte dayOfWeek = (byte)today.DayOfWeek;
            var empShift = await _context.EmployeeShifts
                .Include(es => es.Shift)
                .FirstOrDefaultAsync(es => es.EmployeeId == employee.Id &&
                                           es.DayOfWeek == dayOfWeek &&
                                           es.EffectiveFrom <= today &&
                                           (es.EffectiveTo == null || es.EffectiveTo >= today));

            var shift = empShift?.Shift ?? await _context.Shifts.FirstOrDefaultAsync(s => s.IsActive);
            if (shift == null)
            {
                return new TapAttendanceResponseDto { Success = false, Message = "Chưa thiết lập ca làm việc trong hệ thống!" };
            }

            // 3. Kiểm tra xem hôm nay nhân viên đã có bản ghi chấm công chưa
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == today);

            TapAttendanceResponseDto response;

            bool isCheckIn = forcedAction == "CHECK_IN" || (forcedAction == null && attendance == null);

            if (isCheckIn)
            {
                // ========== LUỒNG CHECK-IN ==========
                TimeSpan currentScanTimeOfDay = scanTime.TimeOfDay;
                TimeSpan lateThreshold = shift.StartTime.Add(TimeSpan.FromMinutes(shift.GraceMinutes));

                int lateMinutes = 0;
                string status = "ON_TIME";
                string message = "Check-in thành công (Đúng giờ)";

                if (currentScanTimeOfDay > lateThreshold)
                {
                    lateMinutes = (int)(currentScanTimeOfDay - shift.StartTime).TotalMinutes;
                    status = "LATE";
                    message = $"Check-in thành công (Đi trễ {lateMinutes} phút)";
                }

                if (attendance == null)
                {
                    attendance = new Attendance
                    {
                        EmployeeId = employee.Id,
                        ShiftId = shift.Id,
                        Date = today,
                        CheckIn = scanTime,
                        LateMinutes = lateMinutes,
                        Status = status,
                        CheckInMethod = request.CheckInMethod,
                        DeviceId = request.DeviceId
                    };
                    _context.Attendances.Add(attendance);
                }
                else
                {
                    // Đã có bản ghi nhưng gọi ép CHECK_IN
                    attendance.CheckIn = scanTime;
                    attendance.LateMinutes = lateMinutes;
                    attendance.Status = status;
                }

                await _context.SaveChangesAsync();

                response = new TapAttendanceResponseDto
                {
                    Success = true,
                    Action = "CHECK_IN",
                    EmployeeCode = employee.EmployeeCode,
                    FullName = employee.FullName,
                    Department = employee.Department ?? "Chưa gán",
                    AvatarUrl = employee.AvatarUrl,
                    Timestamp = scanTime,
                    Status = status,
                    Message = message
                };
            }
            else
            {
                // ========== LUỒNG CHECK-OUT ==========
                if (attendance == null)
                {
                    // Trường hợp chưa check-in mà quẹt check-out
                    attendance = new Attendance
                    {
                        EmployeeId = employee.Id,
                        ShiftId = shift.Id,
                        Date = today,
                        CheckIn = scanTime,
                        CheckInMethod = request.CheckInMethod,
                        DeviceId = request.DeviceId
                    };
                    _context.Attendances.Add(attendance);
                }

                attendance.CheckOut = scanTime;

                // Tính về sớm (EarlyMinutes)
                int earlyMinutes = 0;
                if (scanTime.TimeOfDay < shift.EndTime)
                {
                    earlyMinutes = (int)(shift.EndTime - scanTime.TimeOfDay).TotalMinutes;
                }

                // Tính tăng ca (OvertimeMinutes)
                int overtimeMinutes = 0;
                if (scanTime.TimeOfDay > shift.EndTime)
                {
                    overtimeMinutes = (int)(scanTime.TimeOfDay - shift.EndTime).TotalMinutes;
                }

                // Tính tổng phút làm việc thực tế (trừ giờ nghỉ trưa)
                TimeSpan breakDuration = shift.BreakEnd - shift.BreakStart;
                int totalMinutes = (int)(attendance.CheckOut.Value - attendance.CheckIn).TotalMinutes;
                totalMinutes = Math.Max(0, totalMinutes - (int)breakDuration.TotalMinutes);

                attendance.EarlyMinutes = earlyMinutes;
                attendance.OvertimeMinutes = overtimeMinutes;
                attendance.TotalWorkingMinutes = totalMinutes;
                attendance.Status = "COMPLETED";

                await _context.SaveChangesAsync();

                response = new TapAttendanceResponseDto
                {
                    Success = true,
                    Action = "CHECK_OUT",
                    EmployeeCode = employee.EmployeeCode,
                    FullName = employee.FullName,
                    Department = employee.Department ?? "Chưa gán",
                    AvatarUrl = employee.AvatarUrl,
                    Timestamp = scanTime,
                    Status = earlyMinutes > 0 ? "EARLY" : (overtimeMinutes > 0 ? "OVERTIME" : "COMPLETED"),
                    Message = $"Check-out thành công (Tổng làm việc: {totalMinutes / 60}h{totalMinutes % 60}p)"
                };
            }

            // 4. BẮN DỮ LIỆU REALTIME LÊN WEB ADMIN QUA SIGNALR
            await _hubContext.Clients.All.SendAsync("ReceiveAttendanceEvent", response);

            return response;
        }

        public async Task<List<AttendanceHistoryDto>> GetTodayAttendanceAsync()
        {
            var today = DateTime.Today;
            return await _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.Date == today)
                .OrderByDescending(a => a.CheckIn)
                .Select(a => new AttendanceHistoryDto
                {
                    Id = a.Id,
                    EmployeeId = a.EmployeeId,
                    EmployeeCode = a.Employee != null ? a.Employee.EmployeeCode : string.Empty,
                    FullName = a.Employee != null ? a.Employee.FullName : string.Empty,
                    Department = a.Employee != null ? (a.Employee.Department ?? string.Empty) : string.Empty,
                    Date = a.Date,
                    CheckIn = a.CheckIn.ToString("HH:mm:ss"),
                    CheckOut = a.CheckOut.HasValue ? a.CheckOut.Value.ToString("HH:mm:ss") : "--:--",
                    LateMinutes = a.LateMinutes,
                    EarlyMinutes = a.EarlyMinutes,
                    OvertimeMinutes = a.OvertimeMinutes,
                    TotalWorkingMinutes = a.TotalWorkingMinutes,
                    Status = a.Status,
                    CheckInMethod = a.CheckInMethod,
                    DeviceId = a.DeviceId
                })
                .ToListAsync();
        }

        public async Task<List<AttendanceHistoryDto>> GetAttendanceHistoryAsync(AttendanceHistoryFilterDto filter)
        {
            var query = _context.Attendances
                .Include(a => a.Employee)
                .AsQueryable();

            if (filter.FromDate.HasValue)
            {
                var from = filter.FromDate.Value.Date;
                query = query.Where(a => a.Date >= from);
            }

            if (filter.ToDate.HasValue)
            {
                var to = filter.ToDate.Value.Date;
                query = query.Where(a => a.Date <= to);
            }

            if (!string.IsNullOrWhiteSpace(filter.Department))
            {
                query = query.Where(a => a.Employee != null && a.Employee.Department == filter.Department);
            }

            if (filter.EmployeeId.HasValue)
            {
                query = query.Where(a => a.EmployeeId == filter.EmployeeId.Value);
            }

            return await query
                .OrderByDescending(a => a.Date)
                .ThenByDescending(a => a.CheckIn)
                .Select(a => new AttendanceHistoryDto
                {
                    Id = a.Id,
                    EmployeeId = a.EmployeeId,
                    EmployeeCode = a.Employee != null ? a.Employee.EmployeeCode : string.Empty,
                    FullName = a.Employee != null ? a.Employee.FullName : string.Empty,
                    Department = a.Employee != null ? (a.Employee.Department ?? string.Empty) : string.Empty,
                    Date = a.Date,
                    CheckIn = a.CheckIn.ToString("HH:mm:ss"),
                    CheckOut = a.CheckOut.HasValue ? a.CheckOut.Value.ToString("HH:mm:ss") : "--:--",
                    LateMinutes = a.LateMinutes,
                    EarlyMinutes = a.EarlyMinutes,
                    OvertimeMinutes = a.OvertimeMinutes,
                    TotalWorkingMinutes = a.TotalWorkingMinutes,
                    Status = a.Status,
                    CheckInMethod = a.CheckInMethod,
                    DeviceId = a.DeviceId
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string Message)> AdjustAttendanceManualAsync(ManualAttendanceDto dto)
        {
            var employee = await _context.Employees.FindAsync(dto.EmployeeId);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên!");
            }

            var recordDate = dto.Date.Date;
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == dto.EmployeeId && a.Date == recordDate);

            if (attendance == null)
            {
                attendance = new Attendance
                {
                    EmployeeId = dto.EmployeeId,
                    Date = recordDate,
                    CheckIn = dto.CheckIn,
                    CheckOut = dto.CheckOut,
                    CheckInMethod = "MANUAL",
                    Status = dto.Status
                };
                _context.Attendances.Add(attendance);
            }
            else
            {
                attendance.CheckIn = dto.CheckIn;
                attendance.CheckOut = dto.CheckOut;
                attendance.CheckInMethod = "MANUAL";
                attendance.Status = dto.Status;
            }

            if (dto.CheckOut.HasValue && dto.CheckOut.Value >= dto.CheckIn)
            {
                attendance.TotalWorkingMinutes = (int)(dto.CheckOut.Value - dto.CheckIn).TotalMinutes;
            }

            await _context.SaveChangesAsync();
            return (true, $"Đã cập nhật công thủ công cho nhân viên {employee.FullName} ngày {recordDate:dd/MM/yyyy}.");
        }

        public async Task<SyncOfflineResponseDto> ProcessSyncOfflineAsync(SyncOfflineRequestDto request)
        {
            int count = 0;
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var record in request.Records)
                {
                    record.DeviceId = request.DeviceId;
                    var result = await ProcessTapAsync(record);
                    if (result.Success) count++;
                }

                await transaction.CommitAsync();

                return new SyncOfflineResponseDto
                {
                    Success = true,
                    SyncedCount = count,
                    Message = $"Đồng bộ thành công {count}/{request.Records.Count} bản ghi vào hệ thống!"
                };
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return new SyncOfflineResponseDto
                {
                    Success = false,
                    SyncedCount = 0,
                    Message = $"Lỗi khi đồng bộ ngoại tuyến: {ex.Message}"
                };
            }
        }
    }
}
