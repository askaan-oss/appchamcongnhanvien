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
                .Select(s => new ShiftDto
                {
                    Id = s.Id,
                    Name = s.Name,
                    StartTime = s.StartTime.ToString(@"hh\:mm\:ss"),
                    EndTime = s.EndTime.ToString(@"hh\:mm\:ss"),
                    BreakStart = s.BreakStart.ToString(@"hh\:mm\:ss"),
                    BreakEnd = s.BreakEnd.ToString(@"hh\:mm\:ss"),
                    GraceMinutes = s.GraceMinutes,
                    IsActive = s.IsActive
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string Message, ShiftDto? Data)> CreateShiftAsync(CreateShiftDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Name))
            {
                return (false, "Tên ca làm việc là bắt buộc!", null);
            }

            var shift = new Shift
            {
                Name = dto.Name.Trim(),
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                BreakStart = dto.BreakStart,
                BreakEnd = dto.BreakEnd,
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

            shift.Name = dto.Name.Trim();
            shift.StartTime = dto.StartTime;
            shift.EndTime = dto.EndTime;
            shift.BreakStart = dto.BreakStart;
            shift.BreakEnd = dto.BreakEnd;
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

            var employeeShift = new EmployeeShift
            {
                EmployeeId = dto.EmployeeId,
                ShiftId = dto.ShiftId,
                DayOfWeek = dto.DayOfWeek,
                EffectiveFrom = dto.EffectiveFrom,
                EffectiveTo = dto.EffectiveTo
            };

            _context.EmployeeShifts.Add(employeeShift);
            await _context.SaveChangesAsync();

            return (true, $"Phân ca '{shift.Name}' cho nhân viên '{employee.FullName}' thành công!", new EmployeeShiftResponseDto
            {
                Id = employeeShift.Id,
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                ShiftId = shift.Id,
                ShiftName = shift.Name,
                DayOfWeek = employeeShift.DayOfWeek,
                EffectiveFrom = employeeShift.EffectiveFrom,
                EffectiveTo = employeeShift.EffectiveTo
            });
        }
    }
}

