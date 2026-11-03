using System;
using System.Collections.Generic;
using System.Linq;

namespace NfcAttendance.Api.DTOs
{
    public class CreateEmployeeDto
    {
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? PhoneNumber 
        { 
            get => Phone; 
            set { if (!string.IsNullOrEmpty(value)) Phone = value; } 
        }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? AvatarUrl { get; set; }
        public string? QrCode { get; set; }
    }

    public class UpdateEmployeeDto
    {
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? PhoneNumber 
        { 
            get => Phone; 
            set { if (!string.IsNullOrEmpty(value)) Phone = value; } 
        }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? AvatarUrl { get; set; }
        public string? QrCode { get; set; }
        public string Status { get; set; } = "ACTIVE";
    }

    public class NfcCardDetailDto
    {
        public string CardUid { get; set; } = string.Empty;
        public string Uid => CardUid;
        public string Status { get; set; } = "ACTIVE";
        public string CardType { get; set; } = "NTAG215";
    }

    public class EmployeeResponseDto
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? PhoneNumber => Phone;
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? AvatarUrl { get; set; }
        public string? QrCode { get; set; }
        public string Status { get; set; } = "ACTIVE";
        public DateTime CreatedAt { get; set; }
        public List<string> NfcCardUids { get; set; } = new List<string>();
        public List<NfcCardDetailDto> NfcCards => NfcCardUids.Select(u => new NfcCardDetailDto { CardUid = u }).ToList();
    }

    public class AssignQrDto
    {
        public string? QrCode { get; set; } // Nếu để trống/null, hệ thống tự sinh mã QR bảo mật
    }

    public class EmployeeFilterDto
    {
        public string? Search { get; set; }
        public string? Department { get; set; }
        public int PageIndex { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    }
}
