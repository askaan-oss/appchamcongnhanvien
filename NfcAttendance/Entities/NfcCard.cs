using System;

namespace NfcAttendance.Api.Entities
{
    public class NfcCard
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string Uid { get; set; } = string.Empty;
        public string CardType { get; set; } = "NTAG215";
        public bool IsProtected { get; set; } = true;
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, LOCKED
        public DateTime AssignedAt { get; set; } = DateTime.Now;

        public virtual Employee? Employee { get; set; }
    }
}

