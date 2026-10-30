using System;
using System.Linq;
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
            var query = _context.Employees.Include(e => e.NfcCards).AsQueryable();

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
                                         (e.Phone != null && e.Phone.Contains(search)));
            }

            var totalCount = await query.CountAsync();
            var pageIndex = filter.PageIndex > 0 ? filter.PageIndex : 1;
            var pageSize = filter.PageSize > 0 ? filter.PageSize : 10;

            var items = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip((pageIndex - 1) * pageSize)
                .Take(pageSize)
                .Select(e => new EmployeeResponseDto
                {
                    Id = e.Id,
                    EmployeeCode = e.EmployeeCode,
                    FullName = e.FullName,
                    Phone = e.Phone,
                    Email = e.Email,
                    Department = e.Department,
                    Position = e.Position,
                    AvatarUrl = e.AvatarUrl,
                    Status = e.Status,
                    CreatedAt = e.CreatedAt,
                    NfcCardUids = e.NfcCards.Where(c => c.Status == "ACTIVE").Select(c => c.Uid).ToList()
                })
                .ToListAsync();

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
                .FirstOrDefaultAsync(x => x.Id == id);

            if (e == null) return null;

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
                Status = e.Status,
                CreatedAt = e.CreatedAt,
                NfcCardUids = e.NfcCards.Where(c => c.Status == "ACTIVE").Select(c => c.Uid).ToList()
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

            var employee = new Employee
            {
                EmployeeCode = dto.EmployeeCode.Trim(),
                FullName = dto.FullName.Trim(),
                Phone = dto.Phone?.Trim(),
                Email = dto.Email?.Trim(),
                Department = dto.Department?.Trim(),
                Position = dto.Position?.Trim(),
                AvatarUrl = dto.AvatarUrl,
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
    }
}

