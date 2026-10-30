using System;

namespace NfcAttendance.Api.Entities
{
    public class LeaveRequest
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string LeaveType { get; set; } = "ANNUAL"; // ANNUAL, SICK, UNPAID
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalDays { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
        public int? ApproverId { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? Note { get; set; }

        public virtual Employee? Employee { get; set; }
        public virtual User? Approver { get; set; }
    }
}

