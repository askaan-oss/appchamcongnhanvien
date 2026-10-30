using System;
using System.Collections.Generic;

namespace NfcAttendance.Api.Entities
{
    public class Employee
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? AvatarUrl { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<NfcCard> NfcCards { get; set; } = new List<NfcCard>();
        public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    }
}

