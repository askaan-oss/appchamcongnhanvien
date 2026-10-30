using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/leave-requests")]
    public class LeaveRequestsController : ControllerBase
    {
        private readonly LeaveRequestService _leaveService;

        public LeaveRequestsController(LeaveRequestService leaveService)
        {
            _leaveService = leaveService;
        }

        /// <summary>
        /// 22. Danh sách đơn nghỉ phép (hỗ trợ lọc theo trạng thái: PENDING, APPROVED, REJECTED)
        /// </summary>
        [HttpGet]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> GetLeaveRequests([FromQuery] string? status)
        {
            var list = await _leaveService.GetLeaveRequestsAsync(status);
            return Ok(new { success = true, data = list });
        }

        /// <summary>
        /// 23. Gửi đơn xin nghỉ phép
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateLeaveRequest([FromBody] CreateLeaveRequestDto dto)
        {
            var (success, message, data) = await _leaveService.CreateLeaveRequestAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }

        /// <summary>
        /// 24. Phê duyệt hoặc từ chối đơn nghỉ phép
        /// </summary>
        [HttpPatch("{id}/status")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> UpdateLeaveStatus(int id, [FromBody] UpdateLeaveStatusDto dto)
        {
            int? approverId = null;
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(userIdClaim, out int uid))
            {
                approverId = uid;
            }

            var (success, message, data) = await _leaveService.UpdateLeaveStatusAsync(id, dto, approverId);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }
    }
}

