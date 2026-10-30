using System;

namespace NfcAttendance.Api.Entities
{
    public class KioskDevice
    {
        public int Id { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public string DeviceName { get; set; } = string.Empty;
        public string? IpAddress { get; set; }
        public DateTime? LastOnlineAt { get; set; }
        public bool IsActive { get; set; } = true;
    }
}

