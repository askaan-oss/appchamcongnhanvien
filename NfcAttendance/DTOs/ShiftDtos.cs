using System;

namespace NfcAttendance.Api.DTOs
{
    public class ShiftDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string ShiftName => Name; // Hỗ trợ frontend đọc shiftName
        public string StartTime { get; set; } = string.Empty; // "08:00:00"
        public string EndTime { get; set; } = string.Empty;   // "17:30:00"
        public string BreakStart { get; set; } = string.Empty;
        public string BreakStartTime => BreakStart; // Hỗ trợ frontend đọc breakStartTime
        public string BreakEnd { get; set; } = string.Empty;
        public string BreakEndTime => BreakEnd; // Hỗ trợ frontend đọc breakEndTime
        public int GraceMinutes { get; set; }
        public bool IsActive { get; set; }
        public bool IsDefault { get; set; }
    }

    public class CreateShiftDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ShiftName 
        { 
            get => Name; 
            set { if (!string.IsNullOrEmpty(value)) Name = value; } 
        }

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public TimeSpan? BreakStart { get; set; }
        public TimeSpan? BreakStartTime 
        { 
            get => BreakStart; 
            set => BreakStart = value; 
        }

        public TimeSpan? BreakEnd { get; set; }
        public TimeSpan? BreakEndTime 
        { 
            get => BreakEnd; 
            set => BreakEnd = value; 
        }

        public int GraceMinutes { get; set; } = 15;
    }

    public class UpdateShiftDto
    {
        public string Name { get; set; } = string.Empty;
        public string? ShiftName 
        { 
            get => Name; 
            set { if (!string.IsNullOrEmpty(value)) Name = value; } 
        }

        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }

        public TimeSpan? BreakStart { get; set; }
        public TimeSpan? BreakStartTime 
        { 
            get => BreakStart; 
            set => BreakStart = value; 
        }

        public TimeSpan? BreakEnd { get; set; }
        public TimeSpan? BreakEndTime 
        { 
            get => BreakEnd; 
            set => BreakEnd = value; 
        }

        public int GraceMinutes { get; set; }
        public bool IsActive { get; set; } = true;
    }

    public class AssignShiftDto
    {
        public int EmployeeId { get; set; }
        public int ShiftId { get; set; }
        public byte? DayOfWeek { get; set; } // Hỗ trợ gán 1 ngày đơn lẻ
        public string? DaysOfWeek { get; set; } // Hỗ trợ dạng chuỗi "1,2,3,4,5"
        public List<int>? SelectedDays { get; set; } // Hỗ trợ mảng [1,2,3,4,5]
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
        public string DaysOfWeek { get; set; } = string.Empty;
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
    }
}
