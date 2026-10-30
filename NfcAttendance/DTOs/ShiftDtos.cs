using System;

namespace NfcAttendance.Api.DTOs
{
    public class ShiftDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string StartTime { get; set; } = string.Empty; // "08:00:00"
        public string EndTime { get; set; } = string.Empty;   // "17:30:00"
        public string BreakStart { get; set; } = string.Empty;
        public string BreakEnd { get; set; } = string.Empty;
        public int GraceMinutes { get; set; }
        public bool IsActive { get; set; }
    }

    public class CreateShiftDto
    {
        public string Name { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan BreakStart { get; set; }
        public TimeSpan BreakEnd { get; set; }
        public int GraceMinutes { get; set; } = 15;
    }

    public class UpdateShiftDto
    {
        public string Name { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan BreakStart { get; set; }
        public TimeSpan BreakEnd { get; set; }
        public int GraceMinutes { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class AssignShiftDto
    {
        public int EmployeeId { get; set; }
        public int ShiftId { get; set; }
        public byte DayOfWeek { get; set; } // 0: Sunday, 1: Monday, ...
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }

    public class EmployeeShiftResponseDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public int ShiftId { get; set; }
        public string ShiftName { get; set; } = string.Empty;
        public byte DayOfWeek { get; set; }
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}

