using System;

namespace NfcAttendance.Api.Entities
{
    public class Attendance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int? ShiftId { get; set; }
        public DateTime Date { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public int LateMinutes { get; set; } = 0;
        public int EarlyMinutes { get; set; } = 0;
        public int OvertimeMinutes { get; set; } = 0;
        public int TotalWorkingMinutes { get; set; } = 0;
        public string Status { get; set; } = "WORKING"; // WORKING, COMPLETED, LATE, EARLY
        public string CheckInMethod { get; set; } = "NFC"; // NFC, QR, MANUAL
        public string? DeviceId { get; set; }

        public virtual Employee? Employee { get; set; }
        public virtual Shift? Shift { get; set; }
    }
}

