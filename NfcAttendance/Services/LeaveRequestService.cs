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
    public class LeaveRequestService
    {
        private readonly NfcAttendanceDbContext _context;

        public LeaveRequestService(NfcAttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<List<LeaveRequestResponseDto>> GetLeaveRequestsAsync(string? status)
        {
            var query = _context.LeaveRequests
                .Include(l => l.Employee)
                .Include(l => l.Approver)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                query = query.Where(l => l.Status == status.Trim().ToUpper());
            }

            return await query
                .OrderByDescending(l => l.StartDate)
                .Select(l => new LeaveRequestResponseDto
                {
                    Id = l.Id,
                    EmployeeId = l.EmployeeId,
                    EmployeeCode = l.Employee != null ? l.Employee.EmployeeCode : string.Empty,
                    FullName = l.Employee != null ? l.Employee.FullName : string.Empty,
                    Department = l.Employee != null ? (l.Employee.Department ?? string.Empty) : string.Empty,
                    LeaveType = l.LeaveType,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    TotalDays = l.TotalDays,
                    Reason = l.Reason,
                    Status = l.Status,
                    ApproverId = l.ApproverId,
                    ApproverName = l.Approver != null ? l.Approver.Username : null,
                    ApprovedAt = l.ApprovedAt,
                    Note = l.Note
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string Message, LeaveRequestResponseDto? Data)> CreateLeaveRequestAsync(CreateLeaveRequestDto dto)
        {
            var employee = await _context.Employees.FindAsync(dto.EmployeeId);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên tương ứng!", null);
            }

            if (dto.StartDate.Date > dto.EndDate.Date)
            {
                return (false, "Ngày bắt đầu nghỉ không thể lớn hơn ngày kết thúc!", null);
            }

            var leaveRequest = new LeaveRequest
            {
                EmployeeId = dto.EmployeeId,
                LeaveType = string.IsNullOrWhiteSpace(dto.LeaveType) ? "ANNUAL" : dto.LeaveType.Trim().ToUpper(),
                StartDate = dto.StartDate.Date,
                EndDate = dto.EndDate.Date,
                TotalDays = dto.TotalDays <= 0 ? 1 : dto.TotalDays,
                Reason = dto.Reason.Trim(),
                Status = "PENDING"
            };

            _context.LeaveRequests.Add(leaveRequest);
            await _context.SaveChangesAsync();

            return (true, "Gửi đơn xin nghỉ phép thành công!", new LeaveRequestResponseDto
            {
                Id = leaveRequest.Id,
                EmployeeId = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FullName = employee.FullName,
                Department = employee.Department ?? string.Empty,
                LeaveType = leaveRequest.LeaveType,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                TotalDays = leaveRequest.TotalDays,
                Reason = leaveRequest.Reason,
                Status = leaveRequest.Status
            });
        }

        public async Task<(bool Success, string Message, LeaveRequestResponseDto? Data)> UpdateLeaveStatusAsync(int id, UpdateLeaveStatusDto dto, int? approverId)
        {
            var leaveRequest = await _context.LeaveRequests
                .Include(l => l.Employee)
                .Include(l => l.Approver)
                .FirstOrDefaultAsync(l => l.Id == id);

            if (leaveRequest == null)
            {
                return (false, "Không tìm thấy đơn xin nghỉ phép!", null);
            }

            var normalizedStatus = dto.Status.Trim().ToUpper();
            if (normalizedStatus != "APPROVED" && normalizedStatus != "REJECTED")
            {
                return (false, "Trạng thái phê duyệt không hợp lệ! Chỉ chấp nhận APPROVED hoặc REJECTED.", null);
            }

            leaveRequest.Status = normalizedStatus;
            leaveRequest.ApproverId = approverId;
            leaveRequest.ApprovedAt = DateTime.Now;
            leaveRequest.Note = dto.Note;

            await _context.SaveChangesAsync();

            return (true, $"Đã cập nhật trạng thái đơn nghỉ phép thành {normalizedStatus}.", new LeaveRequestResponseDto
            {
                Id = leaveRequest.Id,
                EmployeeId = leaveRequest.EmployeeId,
                EmployeeCode = leaveRequest.Employee?.EmployeeCode ?? string.Empty,
                FullName = leaveRequest.Employee?.FullName ?? string.Empty,
                Department = leaveRequest.Employee?.Department ?? string.Empty,
                LeaveType = leaveRequest.LeaveType,
                StartDate = leaveRequest.StartDate,
                EndDate = leaveRequest.EndDate,
                TotalDays = leaveRequest.TotalDays,
                Reason = leaveRequest.Reason,
                Status = leaveRequest.Status,
                ApproverId = leaveRequest.ApproverId,
                ApprovedAt = leaveRequest.ApprovedAt,
                Note = leaveRequest.Note
            });
        }
    }
}

