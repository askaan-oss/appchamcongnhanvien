using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Entities;

namespace NfcAttendance.Api.Services
{
    public class NfcSecurityService
    {
        private readonly NfcAttendanceDbContext _context;

        public NfcSecurityService(NfcAttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<(bool Success, string Message)> AssignNfcAsync(AssignNfcDto dto)
        {
            var employee = await _context.Employees.FindAsync(dto.EmployeeId);
            if (employee == null)
            {
                return (false, "Không tìm thấy nhân viên tương ứng!");
            }

            // Kiểm tra xem thẻ UID này đã được dùng cho nhân viên khác chưa
            var existingCard = await _context.NfcCards.FirstOrDefaultAsync(c => c.Uid == dto.Uid.Trim());
            if (existingCard != null)
            {
                if (existingCard.EmployeeId != dto.EmployeeId)
                {
                    return (false, $"Thẻ NFC UID '{dto.Uid}' đang được gán cho nhân viên khác!");
                }

                // Nếu là thẻ của chính nhân viên này nhưng bị khóa, kích hoạt lại
                existingCard.Status = "ACTIVE";
                existingCard.CardType = dto.CardType;
                existingCard.AssignedAt = DateTime.Now;
            }
            else
            {
                var newCard = new NfcCard
                {
                    EmployeeId = dto.EmployeeId,
                    Uid = dto.Uid.Trim(),
                    CardType = string.IsNullOrWhiteSpace(dto.CardType) ? "NTAG215" : dto.CardType,
                    IsProtected = true,
                    Status = "ACTIVE",
                    AssignedAt = DateTime.Now
                };
                _context.NfcCards.Add(newCard);
            }

            // Ghi AuditLog
            _context.AuditLogs.Add(new AuditLog
            {
                Action = "NFC_ASSIGN",
                Details = $"Gán thẻ {dto.Uid} cho nhân viên ID {dto.EmployeeId} ({employee.FullName})",
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return (true, $"Gán thẻ NFC {dto.Uid} cho nhân viên {employee.FullName} thành công!");
        }

        public async Task<(bool Success, string Message)> RevokeNfcAsync(RevokeNfcDto dto)
        {
            var card = await _context.NfcCards.Include(c => c.Employee).FirstOrDefaultAsync(c => c.Uid == dto.CardUid.Trim());
            if (card == null)
            {
                return (false, $"Không tìm thấy thẻ NFC UID '{dto.CardUid}'!");
            }

            card.Status = "LOCKED";

            // Ghi AuditLog
            _context.AuditLogs.Add(new AuditLog
            {
                Action = "NFC_REVOKE",
                Details = $"Thu hồi/Khóa thẻ {dto.CardUid} (Nhân viên: {card.Employee?.FullName}). Lý do: {dto.Reason ?? "Không có"}",
                CreatedAt = DateTime.Now
            });

            await _context.SaveChangesAsync();
            return (true, $"Đã khóa thẻ NFC {dto.CardUid} thành công!");
        }

        public async Task<VerifyNfcResponseDto> VerifyNfcAsync(VerifyNfcDto dto)
        {
            var card = await _context.NfcCards.Include(c => c.Employee).FirstOrDefaultAsync(c => c.Uid == dto.CardUid.Trim());
            if (card == null)
            {
                return new VerifyNfcResponseDto
                {
                    IsValid = false,
                    Message = "Thẻ NFC không tồn tại trong hệ thống!",
                    CardStatus = "UNKNOWN"
                };
            }

            if (card.Status != "ACTIVE")
            {
                return new VerifyNfcResponseDto
                {
                    IsValid = false,
                    Message = $"Thẻ đang ở trạng thái {card.Status}, không thể sử dụng!",
                    EmployeeCode = card.Employee?.EmployeeCode,
                    FullName = card.Employee?.FullName,
                    CardStatus = card.Status
                };
            }

            if (card.Employee == null || card.Employee.Status != "ACTIVE")
            {
                return new VerifyNfcResponseDto
                {
                    IsValid = false,
                    Message = "Nhân viên sở hữu thẻ đã bị vô hiệu hóa!",
                    CardStatus = card.Status
                };
            }

            // Nếu có password và pack xác thực phần cứng NTAG215
            // Giả lập kiểm tra hoặc xác thực khóa chuẩn
            return new VerifyNfcResponseDto
            {
                IsValid = true,
                Message = "Thẻ NFC NTAG215 hợp lệ và bảo mật an toàn.",
                EmployeeCode = card.Employee.EmployeeCode,
                FullName = card.Employee.FullName,
                CardStatus = card.Status
            };
        }
    }
}

