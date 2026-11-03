using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Entities;

namespace NfcAttendance.Api.Services
{
    public class EmployeeService
    {
        private readonly NfcAttendanceDbContext _context;

        public EmployeeService(NfcAttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<PagedResult<EmployeeResponseDto>> GetEmployeesAsync(EmployeeFilterDto filter)
        {
            var query = _context.Employees
                .Include(e => e.NfcCards)
                .Include(e => e.EmployeeShifts)
                    .ThenInclude(es => es.Shift)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(filter.Department))
            {
                query = query.Where(e => e.Department == filter.Department);
            }

            if (!string.IsNullOrWhiteSpace(filter.Search))
            {
                var search = filter.Search.Trim().ToLower();
                query = query.Where(e => e.EmployeeCode.ToLower().Contains(search) ||
                                         e.FullName.ToLower().Contains(search) ||
                                         (e.Email != null && e.Email.ToLower().Contains(search)) ||
                                         (e.Phone != null && e.Phone.Contains(search)) ||
                                         (e.QrCode != null && e.QrCode.ToLower().Contains(search)));
            }

            var totalCount = await query.CountAsync();
            var pageIndex = filter.PageIndex > 0 ? filter.PageIndex : 1;
            var pageSize = filter.PageSize > 0 ? filter.PageSize : 10;

            var defaultShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.IsActive && s.Name.Contains("Hành Chính"))
                ?? await _context.Shifts.FirstOrDefaultAsync(s => s.IsActive);

            var rawEmployees = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var items = rawEmployees.Select(e =>
            {
                var assignments = e.EmployeeShifts
                    .Where(es => es.Shift != null && es.Shift.IsActive)
                    .GroupBy(es => es.ShiftId)
                    .Select(g => new EmployeeShiftSummaryDto
                    {
                        ShiftId = g.Key,
                        ShiftName = g.First().Shift?.Name ?? "",
                        StartTime = g.First().Shift?.StartTime.ToString(@"hh\:mm\:ss") ?? "",
                        EndTime = g.First().Shift?.EndTime.ToString(@"hh\:mm\:ss") ?? "",
                        DaysOfWeek = string.Join(",", g.Select(x => x.DayOfWeek).OrderBy(x => x)),
                        EffectiveFrom = g.Min(x => x.EffectiveFrom),
                        EffectiveTo = g.Max(x => x.EffectiveTo),
                        IsDefault = false
                    })
                    .ToList();

                var currentShift = assignments.FirstOrDefault() ?? new EmployeeShiftSummaryDto
                {
                    ShiftId = defaultShift?.Id ?? 0,
                    ShiftName = defaultShift?.Name ?? "Ca Hành Chính",
                    StartTime = defaultShift?.StartTime.ToString(@"hh\:mm\:ss") ?? "08:00:00",
                    EndTime = defaultShift?.EndTime.ToString(@"hh\:mm\:ss") ?? "17:30:00",
                    DaysOfWeek = "1,2,3,4,5",
                    IsDefault = true
                };

                return new EmployeeResponseDto
                {
                    Id = e.Id,
                    EmployeeCode = e.EmployeeCode,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    Department = e.Department,
                    Position = e.Position,
                    AvatarUrl = e.AvatarUrl,
                    QrCode = e.QrCode,
                    Status = e.Status,
                    CreatedAt = e.CreatedAt,
                    NfcCardUids = e.NfcCards.Where(c => c.Status == "ACTIVE").Select(c => c.Uid).ToList(),
                    ShiftAssignments = assignments,
                    CurrentShiftAssignment = currentShift
                };
            }).ToList();

            return new PagedResult<EmployeeResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                PageIndex = pageIndex,
                PageSize = pageSize
            };
        }

        public async Task<EmployeeResponseDto?> GetEmployeeByIdAsync(int id)
        {
            var e = await _context.Employees
                .Include(x => x.NfcCards)
                .Include(x => x.EmployeeShifts)
                    .ThenInclude(es => es.Shift)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (e == null) return null;

            var defaultShift = await _context.Shifts
                .FirstOrDefaultAsync(s => s.IsActive && s.Name.Contains("Hành Chính"))
                ?? await _context.Shifts.FirstOrDefaultAsync(s => s.IsActive);

            var assignments = e.EmployeeShifts
                .Where(es => es.Shift != null && es.Shift.IsActive)
                .GroupBy(es => es.ShiftId)
                .Select(g => new EmployeeShiftSummaryDto
                {
                    ShiftId = g.Key,
                    ShiftName = g.First().Shift?.Name ?? "",
                    StartTime = g.First().Shift?.StartTime.ToString(@"hh\:mm\:ss") ?? "",
                    EndTime = g.First().Shift?.EndTime.ToString(@"hh\:mm\:ss") ?? "",
                    DaysOfWeek = string.Join(",", g.Select(x => x.DayOfWeek).OrderBy(x => x)),
                    EffectiveFrom = g.Min(x => x.EffectiveFrom),
                    EffectiveTo = g.Max(x => x.EffectiveTo),
                    IsDefault = false
                })
                .ToList();

            var currentShift = assignments.FirstOrDefault() ?? new EmployeeShiftSummaryDto
            {
                ShiftId = defaultShift?.Id ?? 0,
                ShiftName = defaultShift?.Name ?? "Ca Hành Chính",
                StartTime = defaultShift?.StartTime.ToString(@"hh\:mm\:ss") ?? "08:00:00",
                EndTime = defaultShift?.EndTime.ToString(@"hh\:mm\:ss") ?? "17:30:00",
                DaysOfWeek = "1,2,3,4,5",
                IsDefault = true
            };

            return new EmployeeResponseDto
            {
                Id = e.Id,
                EmployeeCode = e.EmployeeCode,
                FullName = e.FullName,
                Phone = e.Phone,
                Email = e.Email,
                Department = e.Department,
                Position = e.Position,
                AvatarUrl = e.AvatarUrl,
                QrCode = e.QrCode,
                Status = e.Status,
                CreatedAt = e.CreatedAt,
                NfcCardUids = e.NfcCards.Where(c => c.Status == "ACTIVE").Select(c => c.Uid).ToList(),
                ShiftAssignments = assignments,
                CurrentShiftAssignment = currentShift
            };
        }

        public async Task<(bool Success, string Message, EmployeeResponseDto? Data)> CreateEmployeeAsync(CreateEmployeeDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.EmployeeCode) || string.IsNullOrWhiteSpace(dto.FullName))
            {
                return (false, "Mã nhân viên và họ tên là bắt buộc!", null);
            }

            var exists = await _context.Employees.AnyAsync(e => e.EmployeeCode == dto.EmployeeCode.Trim());
            if (exists)
            {
                return (false, $"Mã nhân viên '{dto.EmployeeCode}' đã tồn tại trong hệ thống!", null);
            }

            // Nếu người dùng không nhập mã QR, tự sinh mã QR an toàn
            var qrCode = !string.IsNullOrWhiteSpace(dto.QrCode)
                ? dto.QrCode.Trim()
                : GenerateSecureQrCode(dto.EmployeeCode.Trim());

            // Kiểm tra trùng QrCode nếu có nhập
            if (await _context.Employees.AnyAsync(e => e.QrCode == qrCode))
            {
                return (false, $"Mã QR '{qrCode}' đã được gán cho nhân viên khác!", null);
            }

            var employee = new Employee
            {
                EmployeeCode = dto.EmployeeCode.Trim(),
                FullName = dto.FullName.Trim(),
                Phone = dto.Phone?.Trim(),
                Email = dto.Email?.Trim(),
                Department = dto.Department?.Trim(),
                Position = dto.Position?.Trim(),
                AvatarUrl = dto.AvatarUrl,
                QrCode = qrCode,
                Status = "ACTIVE",
                CreatedAt = DateTime.Now
            };

            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();

            return (true, "Thêm nhân viên thành công!", new EmployeeResponseDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Phone = employee.Phone,
                Email = employee.Email,
                Department = employee.Department,
                Position = employee.Position,
                AvatarUrl = employee.AvatarUrl,
                QrCode = employee.QrCode,
                Status = employee.Status,
                CreatedAt = employee.CreatedAt
            });
        }

        public async Task<(bool Success, string Message, EmployeeResponseDto? Data)> UpdateEmployeeAsync(int id, UpdateEmployeeDto dto)
        {
            var employee = await _context.Employees.Include(e => e.NfcCards).FirstOrDefaultAsync(e => e.Id == id);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên!", null);
            }

            if (!string.IsNullOrWhiteSpace(dto.QrCode) && dto.QrCode.Trim() != employee.QrCode)
            {
                var qrExists = await _context.Employees.AnyAsync(e => e.Id != id && e.QrCode == dto.QrCode.Trim());
                if (qrExists)
                {
                    return (false, $"Mã QR '{dto.QrCode}' đã được gán cho nhân viên khác!", null);
                }
                employee.QrCode = dto.QrCode.Trim();
            }

            employee.FullName = dto.FullName.Trim();
            employee.Phone = dto.Phone?.Trim();
            employee.Email = dto.Email?.Trim();
            employee.Department = dto.Department?.Trim();
            employee.Position = dto.Position?.Trim();
            employee.AvatarUrl = dto.AvatarUrl;
            employee.Status = string.IsNullOrWhiteSpace(dto.Status) ? employee.Status : dto.Status;

            await _context.SaveChangesAsync();

            return (true, "Cập nhật thông tin nhân viên thành công!", new EmployeeResponseDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Phone = employee.Phone,
                Email = employee.Email,
                Department = employee.Department,
                Position = employee.Position,
                AvatarUrl = employee.AvatarUrl,
                QrCode = employee.QrCode,
                Status = employee.Status,
                CreatedAt = employee.CreatedAt,
                NfcCardUids = employee.NfcCards.Where(c => c.Status == "ACTIVE").Select(c => c.Uid).ToList()
            });
        }

        public async Task<(bool Success, string Message)> DeleteEmployeeAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên!");
            }

            // Vô hiệu hóa (Soft delete)
            employee.Status = "INACTIVE";
            await _context.SaveChangesAsync();

            return (true, $"Đã chuyển trạng thái nhân viên {employee.EmployeeCode} sang INACTIVE.");
        }

        public async Task<(bool Success, string Message, QrResponseDto? Data)> AssignOrGenerateQrCodeAsync(int id, string? customQr)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên!", null);
            }

            string newQr = !string.IsNullOrWhiteSpace(customQr)
                ? customQr.Trim()
                : GenerateSecureQrCode(employee.EmployeeCode);

            // Kiểm tra trùng mã QR với nhân viên khác
            var qrExists = await _context.Employees.AnyAsync(e => e.Id != id && e.QrCode == newQr);
            if (qrExists)
            {
                return (false, $"Mã QR '{newQr}' đã được gán cho nhân viên khác!", null);
            }

            employee.QrCode = newQr;

            _context.AuditLogs.Add(new AuditLog
            {
                Action = "QR_ASSIGN",
                Details = $"Gán mã QR '{newQr}' cho nhân viên {employee.EmployeeCode} ({employee.FullName})",
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();

            return (true, "Gán / Cấp mã QR thành công!", new QrResponseDto
            {
                EmployeeId = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                QrCode = employee.QrCode,
                GeneratedAt = DateTime.Now
            });
        }

        public async Task<(bool Success, string Message, QrResponseDto? Data)> GetQrCodeAsync(int id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên!", null);
            }

            if (string.IsNullOrEmpty(employee.QrCode))
            {
                // Nếu chưa có, tự động tạo và lưu mã QR cho nhân viên
                employee.QrCode = GenerateSecureQrCode(employee.EmployeeCode);
                await _context.SaveChangesAsync();
            }

            return (true, "Lấy thông tin mã QR thành công!", new QrResponseDto
            {
                EmployeeId = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                QrCode = employee.QrCode,
                GeneratedAt = DateTime.Now
            });
        }

        private static string GenerateSecureQrCode(string employeeCode)
        {
            var randomBytes = new byte[6];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomBytes);
            var token = Convert.ToHexString(randomBytes);
            return $"QR_{employeeCode}_{token}";
        }
    }
}
