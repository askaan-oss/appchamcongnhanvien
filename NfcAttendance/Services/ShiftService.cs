using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Entities;

namespace NfcAttendance.Api.Services
{
    public class ShiftService
    {
        private readonly NfcAttendanceDbContext _context;

        public ShiftService(NfcAttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<List<ShiftDto>> GetAllShiftsAsync()
        {
            return await _context.Shifts
                .Where(s => s.IsActive)
                .OrderByDescending(s => s.Name.Contains("Hành Chính") || s.Name.ToLower().Contains("office"))
                .ThenBy(s => s.Id)
                .Select(s => new ShiftDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    StartTime = s.StartTime.ToString(@"hh\:mm\:ss"),
                    EndTime = s.EndTime.ToString(@"hh\:mm\:ss"),
                    BreakStart = s.BreakStart.ToString(@"hh\:mm\:ss"),
                    BreakEnd = s.BreakEnd.ToString(@"hh\:mm\:ss"),
                    GraceMinutes = s.GraceMinutes,
                    IsActive = s.IsActive,
                    IsDefault = s.Name.Contains("Hành Chính") || s.Name.ToLower().Contains("office")
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string Message, ShiftDto? Data)> CreateShiftAsync(CreateShiftDto dto)
        {
            var shiftName = (dto.Name ?? dto.ShiftName ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(shiftName))
            {
                return (false, "Tên ca làm việc là bắt buộc!", null);
            }

            var shift = new Shift
            {
                Name = shiftName,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                BreakStart = dto.BreakStart ?? new TimeSpan(12, 0, 0),
                BreakEnd = dto.BreakEnd ?? new TimeSpan(13, 30, 0),
                GraceMinutes = dto.GraceMinutes,
                IsActive = true
            };

            _context.Shifts.Add(shift);
            await _context.SaveChangesAsync();

            return (true, "Tạo ca làm việc thành công!", new ShiftDto
            {
                Id = shift.Id,
                Name = shift.Name,
                StartTime = shift.StartTime.ToString(@"hh\:mm\:ss"),
                EndTime = shift.EndTime.ToString(@"hh\:mm\:ss"),
                BreakStart = shift.BreakStart.ToString(@"hh\:mm\:ss"),
                BreakEnd = shift.BreakEnd.ToString(@"hh\:mm\:ss"),
                GraceMinutes = shift.GraceMinutes,
                IsActive = shift.IsActive
            });
        }

        public async Task<(bool Success, string Message, ShiftDto? Data)> UpdateShiftAsync(int id, UpdateShiftDto dto)
        {
            var shift = await _context.Shifts.FindAsync(id);
            if (shift == null)
            {
                return (false, "Không tìm thấy ca làm việc!", null);
            }

            var shiftName = (dto.Name ?? dto.ShiftName ?? string.Empty).Trim();
            if (!string.IsNullOrWhiteSpace(shiftName))
            {
                shift.Name = shiftName;
            }

            shift.StartTime = dto.StartTime;
            shift.EndTime = dto.EndTime;
            if (dto.BreakStart.HasValue) shift.BreakStart = dto.BreakStart.Value;
            if (dto.BreakEnd.HasValue) shift.BreakEnd = dto.BreakEnd.Value;
            shift.GraceMinutes = dto.GraceMinutes;
            shift.IsActive = dto.IsActive;

            await _context.SaveChangesAsync();

            return (true, "Cập nhật ca làm việc thành công!", new ShiftDto
            {
                Id = shift.Id,
                Name = shift.Name,
                StartTime = shift.StartTime.ToString(@"hh\:mm\:ss"),
                EndTime = shift.EndTime.ToString(@"hh\:mm\:ss"),
                BreakStart = shift.BreakStart.ToString(@"hh\:mm\:ss"),
                BreakEnd = shift.BreakEnd.ToString(@"hh\:mm\:ss"),
                GraceMinutes = shift.GraceMinutes,
                IsActive = shift.IsActive
            });
        }

        public async Task<(bool Success, string Message)> DeleteShiftAsync(int id)
        {
            var shift = await _context.Shifts.FindAsync(id);
            if (shift == null)
            {
                return (false, "Không tìm thấy ca làm việc!");
            }

            shift.IsActive = false;
            await _context.SaveChangesAsync();

            return (true, $"Đã ngừng kích hoạt ca làm việc '{shift.Name}'.");
        }

        public async Task<(bool Success, string Message, EmployeeShiftResponseDto? Data)> AssignShiftAsync(AssignShiftDto dto)
        {
            var employee = await _context.Employees.FindAsync(dto.EmployeeId);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên!", null);
            }

            var shift = await _context.Shifts.FindAsync(dto.ShiftId);
            if (shift == null || !shift.IsActive)
            {
                return (false, "Ca làm việc không hợp lệ hoặc đã ngừng hoạt động!", null);
            }

            // Thu thập danh sách các thứ trong tuần được chọn
            var targetDays = new HashSet<byte>();
            if (dto.SelectedDays != null && dto.SelectedDays.Count > 0)
            {
                foreach (var d in dto.SelectedDays)
                {
                    targetDays.Add((byte)d);
                }
            }
            if (!string.IsNullOrWhiteSpace(dto.DaysOfWeek))
            {
                var parts = dto.DaysOfWeek.Split(new[] { ',', ';', ' ' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parts)
                {
                    if (byte.TryParse(p.Trim(), out var b))
                    {
                        targetDays.Add(b);
                    }
                }
            }
            if (dto.DayOfWeek.HasValue)
            {
                targetDays.Add(dto.DayOfWeek.Value);
            }

            // Nếu không có thứ nào được chỉ định, mặc định Thứ 2 -> Thứ 6 (1, 2, 3, 4, 5)
            if (targetDays.Count == 0)
            {
                for (byte d = 1; d <= 5; d++) targetDays.Add(d);
            }

            // Xóa các phân ca trùng lặp trước đó của nhân viên này trên các ngày đã chọn để ghi đè cập nhật mới
            var existingShifts = await _context.EmployeeShifts
                .Where(es => es.EmployeeId == dto.EmployeeId && targetDays.Contains(es.DayOfWeek))
                .ToListAsync();

            if (existingShifts.Any())
            {
                _context.EmployeeShifts.RemoveRange(existingShifts);
            }

            // Thêm các bản ghi EmployeeShift mới cho từng ngày
            var newAssignments = new List<EmployeeShift>();
            foreach (var day in targetDays)
            {
                newAssignments.Add(new EmployeeShift
                {
                    EmployeeId = dto.EmployeeId,
                    ShiftId = dto.ShiftId,
                    DayOfWeek = day,
                    EffectiveFrom = dto.EffectiveFrom,
                    EffectiveTo = dto.EffectiveTo
                });
            }

            await _context.EmployeeShifts.AddRangeAsync(newAssignments);
            await _context.SaveChangesAsync();

            var firstAssignment = newAssignments.First();
            var daysStr = string.Join(",", targetDays.OrderBy(x => x));

            return (true, $"Phân ca '{shift.Name}' cho nhân viên '{employee.FullName}' thành công ({targetDays.Count} ngày/tuần)!", new EmployeeShiftResponseDto
            {
                Id = firstAssignment.Id,
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                ShiftId = shift.Id,
                ShiftName = shift.Name,
                DayOfWeek = firstAssignment.DayOfWeek,
                DaysOfWeek = daysStr,
                EffectiveFrom = firstAssignment.EffectiveFrom,
                EffectiveTo = firstAssignment.EffectiveTo
            });
        }
    }
}
