using System;

namespace NfcAttendance.Api.DTOs
{
    public class AssignNfcDto
    {
        public int EmployeeId { get; set; }
        public string Uid { get; set; } = string.Empty;
        public string CardType { get; set; } = "NTAG215";
    }

    public class RevokeNfcDto
    {
        public string CardUid { get; set; } = string.Empty;
        public string? Reason { get; set; }
    }

    public class VerifyNfcDto
    {
        public string CardUid { get; set; } = string.Empty;
        public string? Password { get; set; }
        public string? Pack { get; set; }
    }

    public class VerifyNfcResponseDto
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? EmployeeCode { get; set; }
        public string? FullName { get; set; }
        public string? CardStatus { get; set; }
    }
}

