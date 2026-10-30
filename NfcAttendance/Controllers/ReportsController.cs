using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/reports")]
    [Authorize(Roles = "ADMIN,HR")]
    public class ReportsController : ControllerBase
    {
        private readonly ReportExportService _reportService;

        public ReportsController(ReportExportService reportService)
        {
            _reportService = reportService;
        }

        /// <summary>
        /// 25. Thống kê tổng quan Dashboard (Tổng NV, Đang làm, Đi trễ, Nghỉ phép)
        /// </summary>
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var summary = await _reportService.GetDashboardSummaryAsync();
            return Ok(new { success = true, data = summary });
        }

        /// <summary>
        /// 26. Xuất bảng công chi tiết ra file Excel (.xlsx)
        /// </summary>
        [HttpGet("export/excel")]
        public async Task<IActionResult> ExportExcel([FromQuery] int? month, [FromQuery] int? year)
        {
            int targetMonth = month ?? DateTime.Now.Month;
            int targetYear = year ?? DateTime.Now.Year;

            var bytes = await _reportService.ExportExcelAsync(targetMonth, targetYear);
            var fileName = $"BangCong_Thang_{targetMonth}_{targetYear}.xlsx";
            return File(bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", fileName);
        }

        /// <summary>
        /// 27. Xuất bảng tổng hợp chấm công ra file PDF (.pdf)
        /// </summary>
        [HttpGet("export/pdf")]
        public async Task<IActionResult> ExportPdf([FromQuery] int? month, [FromQuery] int? year)
        {
            int targetMonth = month ?? DateTime.Now.Month;
            int targetYear = year ?? DateTime.Now.Year;

            var bytes = await _reportService.ExportPdfAsync(targetMonth, targetYear);
            var fileName = $"BaoCao_ChamCong_Thang_{targetMonth}_{targetYear}.pdf";
            return File(bytes, "application/pdf", fileName);
        }
    }
}

