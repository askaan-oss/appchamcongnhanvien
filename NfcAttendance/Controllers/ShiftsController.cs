using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/shifts")]
    [Authorize]
    public class ShiftsController : ControllerBase
    {
        private readonly ShiftService _shiftService;

        public ShiftsController(ShiftService shiftService)
        {
            _shiftService = shiftService;
        }

        /// <summary>
        /// 11. Danh sách ca làm việc đang hoạt động
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetShifts()
        {
            var shifts = await _shiftService.GetAllShiftsAsync();
            return Ok(new { success = true, data = shifts });
        }

        /// <summary>
        /// 12. Tạo ca làm việc mới
        /// </summary>
        [HttpPost]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> CreateShift([FromBody] CreateShiftDto dto)
        {
            var (success, message, data) = await _shiftService.CreateShiftAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }

        /// <summary>
        /// 13. Cập nhật ca làm việc
        /// </summary>
        [HttpPut("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> UpdateShift(int id, [FromBody] UpdateShiftDto dto)
        {
            var (success, message, data) = await _shiftService.UpdateShiftAsync(id, dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }

        /// <summary>
        /// 14. Xóa ca làm việc (ngừng kích hoạt)
        /// </summary>
        [HttpDelete("{id}")]
        [Authorize(Roles = "ADMIN")]
        public async Task<IActionResult> DeleteShift(int id)
        {
            var (success, message) = await _shiftService.DeleteShiftAsync(id);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message });
        }

        /// <summary>
        /// 15. Phân ca làm việc theo tuần cho nhân sự
        /// </summary>
        [HttpPost("assign")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> AssignShift([FromBody] AssignShiftDto dto)
        {
            var (success, message, data) = await _shiftService.AssignShiftAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }
    }
}

