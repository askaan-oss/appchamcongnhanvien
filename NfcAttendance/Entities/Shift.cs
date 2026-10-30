using System;

namespace NfcAttendance.Api.Entities
{
    public class Shift
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan BreakStart { get; set; }
        public TimeSpan BreakEnd { get; set; }
        public int GraceMinutes { get; set; } = 15; // Số phút cho phép trễ không bị phạt
        public bool IsActive { get; set; } = true;
    }
}

