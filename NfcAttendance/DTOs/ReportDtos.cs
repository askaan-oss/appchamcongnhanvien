using System;

namespace NfcAttendance.Api.DTOs
{
    public class DashboardSummaryDto
    {
        public int TotalEmployees { get; set; }
        public int AttendedToday { get; set; }
        public int LateToday { get; set; }
        public int OnLeaveToday { get; set; }
    }

    public class ReportExportFilterDto
    {
        public int Month { get; set; } = DateTime.Now.Month;
        public int Year { get; set; } = DateTime.Now.Year;
        public string? Department { get; set; }
    }
}

