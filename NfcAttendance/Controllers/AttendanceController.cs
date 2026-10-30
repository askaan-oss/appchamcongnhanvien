using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/attendance")]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendanceService;

        public AttendanceController(AttendanceService attendanceService)
        {
            _attendanceService = attendanceService;
        }

        /// <summary>
        /// 16. Ghi nhận vào ca (Check-In)
        /// </summary>
        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] TapAttendanceRequestDto request)
        {
            var result = await _attendanceService.ProcessCheckInAsync(request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// 17. Ghi nhận ra ca (Check-Out)
        /// </summary>
        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut([FromBody] TapAttendanceRequestDto request)
        {
            var result = await _attendanceService.ProcessCheckOutAsync(request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        /// <summary>
        /// 18. Giám sát dữ liệu hôm nay (Today Monitor)
        /// </summary>
        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAttendance()
        {
            var list = await _attendanceService.GetTodayAttendanceAsync();
            return Ok(new { success = true, data = list });
        }

        /// <summary>
        /// 19. Xem lịch sử chấm công có bộ lọc
        /// </summary>
        [HttpGet("history")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> GetAttendanceHistory([FromQuery] AttendanceHistoryFilterDto filter)
        {
            var list = await _attendanceService.GetAttendanceHistoryAsync(filter);
            return Ok(new { success = true, data = list });
        }

        /// <summary>
        /// 20. Điều chỉnh công thủ công khi nhân viên quên quẹt thẻ
        /// </summary>
        [HttpPost("manual")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> AdjustManual([FromBody] ManualAttendanceDto dto)
        {
            var (success, message) = await _attendanceService.AdjustAttendanceManualAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message });
        }

        /// <summary>
        /// 21. Tiếp nhận gói chấm công ngoại tuyến (Sync Offline)
        /// </summary>
        [HttpPost("sync-offline")]
        public async Task<IActionResult> SyncOffline([FromBody] SyncOfflineRequestDto request)
        {
            var result = await _attendanceService.ProcessSyncOfflineAsync(request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
