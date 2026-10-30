using System;

namespace NfcAttendance.Api.Entities
{
    public class EmployeeShift
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int ShiftId { get; set; }
        public byte DayOfWeek { get; set; } // 0: Chủ Nhật, 1: Thứ 2, ..., 6: Thứ 7
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

        public virtual Employee? Employee { get; set; }
        public virtual Shift? Shift { get; set; }
    }
}

