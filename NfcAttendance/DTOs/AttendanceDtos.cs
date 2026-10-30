using System;
using System.Collections.Generic;

namespace NfcAttendance.Api.DTOs
{
    public class TapAttendanceRequestDto
    {
        public string? CardUid { get; set; }
        public string? QrPayload { get; set; }
        public string CheckInMethod { get; set; } = "NFC"; // NFC hoặc QR
        public string DeviceId { get; set; } = string.Empty;
        public DateTime? Timestamp { get; set; }
    }

    public class TapAttendanceResponseDto
    {
        public bool Success { get; set; }
        public string Action { get; set; } = string.Empty; // CHECK_IN hoặc CHECK_OUT
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = string.Empty; // ON_TIME, LATE, EARLY, OVERTIME, COMPLETED
        public string Message { get; set; } = string.Empty;
    }

    public class SyncOfflineRequestDto
    {
        public string DeviceId { get; set; } = string.Empty;
        public List<TapAttendanceRequestDto> Records { get; set; } = new List<TapAttendanceRequestDto>();
    }

    public class SyncOfflineResponseDto
    {
        public bool Success { get; set; }
        public int SyncedCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ManualAttendanceDto
    {
        public int EmployeeId { get; set; }
        public DateTime Date { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public string Status { get; set; } = "COMPLETED";
    }

    public class AttendanceHistoryFilterDto
    {
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public string? Department { get; set; }
        public int? EmployeeId { get; set; }
    }

    public class AttendanceHistoryDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string CheckIn { get; set; } = string.Empty;
        public string CheckOut { get; set; } = string.Empty;
        public int LateMinutes { get; set; }
        public int EarlyMinutes { get; set; }
        public int OvertimeMinutes { get; set; }
        public int TotalWorkingMinutes { get; set; }
        public string Status { get; set; } = string.Empty;
        public string CheckInMethod { get; set; } = "NFC";
        public string? DeviceId { get; set; }
    }
}
