using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;

namespace NfcAttendance.Api.Services
{
    public class ReportExportService
    {
        private readonly NfcAttendanceDbContext _context;

        public ReportExportService(NfcAttendanceDbContext context)
        {
            _context = context;
        }

        public async Task<DashboardSummaryDto> GetDashboardSummaryAsync()
        {
            var today = DateTime.Today;

            var totalEmployees = await _context.Employees.CountAsync(e => e.Status == "ACTIVE");

            var attendedToday = await _context.Attendances
                .Where(a => a.Date == today)
                .Select(a => a.EmployeeId)
                .Distinct()
                .CountAsync();

            var lateToday = await _context.Attendances
                .Where(a => a.Date == today && (a.LateMinutes > 0 || a.Status == "LATE"))
                .Select(a => a.EmployeeId)
                .Distinct()
                .CountAsync();

            var onLeaveToday = await _context.LeaveRequests
                .Where(l => l.Status == "APPROVED" && l.StartDate <= today && l.EndDate >= today)
                .Select(l => l.EmployeeId)
                .Distinct()
                .CountAsync();

            return new DashboardSummaryDto
            {
                TotalEmployees = totalEmployees,
                AttendedToday = attendedToday,
                LateToday = lateToday,
                OnLeaveToday = onLeaveToday
            };
        }

        public async Task<byte[]> ExportExcelAsync(int month, int year)
        {
            var fromDate = new DateTime(year, month, 1);
            var toDate = fromDate.AddMonths(1).AddDays(-1);

            var attendances = await _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.Date >= fromDate && a.Date <= toDate)
                .OrderBy(a => a.Date)
                .ThenBy(a => a.Employee!.EmployeeCode)
                .ToListAsync();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add($"Thang_{month}_{year}");

            // Tiêu đề bảng
            worksheet.Cell(1, 1).Value = $"BẢNG CHẤM CÔNG THÁNG {month}/{year}";
            worksheet.Cell(1, 1).Style.Font.Bold = true;
            worksheet.Cell(1, 1).Style.Font.FontSize = 16;
            worksheet.Range(1, 1, 1, 9).Merge().Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

            // Header các cột
            var headers = new[]
            {
                "STT", "Mã NV", "Họ và Tên", "Phòng Ban", "Ngày", "Giờ Vào", "Giờ Ra", "Đi Trễ (Phút)", "Tổng Giờ Làm (Giờ)"
            };

            for (int i = 0; i < headers.Length; i++)
            {
                var cell = worksheet.Cell(3, i + 1);
                cell.Value = headers[i];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromArgb(51, 122, 183);
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }

            int row = 4;
            int stt = 1;
            foreach (var a in attendances)
            {
                worksheet.Cell(row, 1).Value = stt++;
                worksheet.Cell(row, 2).Value = a.Employee?.EmployeeCode ?? string.Empty;
                worksheet.Cell(row, 3).Value = a.Employee?.FullName ?? string.Empty;
                worksheet.Cell(row, 4).Value = a.Employee?.Department ?? string.Empty;
                worksheet.Cell(row, 5).Value = a.Date.ToString("dd/MM/yyyy");
                worksheet.Cell(row, 6).Value = a.CheckIn.ToString("HH:mm:ss");
                worksheet.Cell(row, 7).Value = a.CheckOut.HasValue ? a.CheckOut.Value.ToString("HH:mm:ss") : "--:--";
                worksheet.Cell(row, 8).Value = a.LateMinutes;
                worksheet.Cell(row, 9).Value = Math.Round((double)a.TotalWorkingMinutes / 60.0, 2);

                row++;
            }

            worksheet.Columns().AdjustToContents();

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public async Task<byte[]> ExportPdfAsync(int month, int year)
        {
            var fromDate = new DateTime(year, month, 1);
            var toDate = fromDate.AddMonths(1).AddDays(-1);

            var attendances = await _context.Attendances
                .Include(a => a.Employee)
                .Where(a => a.Date >= fromDate && a.Date <= toDate)
                .OrderBy(a => a.Date)
                .ToListAsync();

            var totalRecords = attendances.Count;
            var totalLate = attendances.Count(a => a.LateMinutes > 0);
            var totalMinutes = attendances.Sum(a => a.TotalWorkingMinutes);

            // Xây dựng nội dung tài liệu PDF dạng chuẩn PDF-1.4
            var sb = new StringBuilder();
            sb.AppendLine("BT /F1 18 Tf 50 780 Td (BANG TONG HOP CHAM CONG THANG " + month + "/" + year + ") Tj ET");
            sb.AppendLine("BT /F1 12 Tf 50 750 Td (He thong: NFC Attendance System) Tj ET");
            sb.AppendLine($"BT /F1 12 Tf 50 730 Td (Ngay xuat: {DateTime.Now:dd/MM/yyyy HH:mm:ss}) Tj ET");
            sb.AppendLine($"BT /F1 12 Tf 50 700 Td (Tong so luot cham cong: {totalRecords}) Tj ET");
            sb.AppendLine($"BT /F1 12 Tf 50 680 Td (So luot di tre: {totalLate}) Tj ET");
            sb.AppendLine($"BT /F1 12 Tf 50 660 Td (Tong thoi gian lam viec: {Math.Round((double)totalMinutes / 60.0, 1)} gio) Tj ET");

            sb.AppendLine("BT /F1 10 Tf 50 620 Td (-----------------------------------------------------------------------------------------) Tj ET");
            sb.AppendLine("BT /F1 10 Tf 50 600 Td (Ma NV      Ho va Ten               Ngay         Vao       Ra        Tre(p)  Tong gio) Tj ET");
            sb.AppendLine("BT /F1 10 Tf 50 590 Td (-----------------------------------------------------------------------------------------) Tj ET");

            int y = 570;
            int count = 0;
            foreach (var item in attendances.Take(25))
            {
                var empCode = (item.Employee?.EmployeeCode ?? "").PadRight(10);
                var name = (item.Employee?.FullName ?? "").PadRight(24);
                if (name.Length > 24) name = name.Substring(0, 24);
                var date = item.Date.ToString("dd/MM/yyyy").PadRight(13);
                var checkIn = item.CheckIn.ToString("HH:mm").PadRight(10);
                var checkOut = (item.CheckOut.HasValue ? item.CheckOut.Value.ToString("HH:mm") : "--:--").PadRight(10);
                var late = item.LateMinutes.ToString().PadRight(8);
                var hours = Math.Round((double)item.TotalWorkingMinutes / 60.0, 1).ToString();

                var line = $"{empCode}{name}{date}{checkIn}{checkOut}{late}{hours}";
                sb.AppendLine($"BT /F1 9 Tf 50 {y} Td ({EscapePdf(line)}) Tj ET");
                y -= 18;
                count++;
                if (y < 60) break;
            }

            if (attendances.Count > 25)
            {
                sb.AppendLine($"BT /F1 9 Tf 50 {y} Td (... va con {attendances.Count - 25} ban ghi khac ...) Tj ET");
            }

            return GeneratePdfBinary(sb.ToString());
        }

        private static string EscapePdf(string input)
        {
            return input.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
        }

        private static byte[] GeneratePdfBinary(string streamContent)
        {
            var contentBytes = Encoding.ASCII.GetBytes(streamContent);
            using var ms = new MemoryStream();
            using var writer = new StreamWriter(ms, Encoding.ASCII);

            writer.Write("%PDF-1.4\n");
            writer.Flush();

            long offset1 = ms.Position;
            writer.Write("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
            writer.Flush();

            long offset2 = ms.Position;
            writer.Write("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n");
            writer.Flush();

            long offset3 = ms.Position;
            writer.Write("3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n");
            writer.Flush();

            long offset4 = ms.Position;
            writer.Write($"4 0 obj\n<< /Length {contentBytes.Length} >>\nstream\n");
            writer.Flush();
            ms.Write(contentBytes, 0, contentBytes.Length);
            writer.Write("\nendstream\nendobj\n");
            writer.Flush();

            long offset5 = ms.Position;
            writer.Write("5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n");
            writer.Flush();

            long xrefOffset = ms.Position;
            writer.Write("xref\n0 6\n0000000000 65535 f \n");
            writer.Write($"{offset1:D10} 00000 n \n");
            writer.Write($"{offset2:D10} 00000 n \n");
            writer.Write($"{offset3:D10} 00000 n \n");
            writer.Write($"{offset4:D10} 00000 n \n");
            writer.Write($"{offset5:D10} 00000 n \n");
            writer.Write($"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xrefOffset}\n%%EOF");
            writer.Flush();

            return ms.ToArray();
        }
    }
}

