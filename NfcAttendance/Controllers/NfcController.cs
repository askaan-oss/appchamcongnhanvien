using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/nfc")]
    public class NfcController : ControllerBase
    {
        private readonly NfcSecurityService _nfcService;

        public NfcController(NfcSecurityService nfcService)
        {
            _nfcService = nfcService;
        }

        /// <summary>
        /// 8. Gán thẻ NFC UID cho nhân viên
        /// </summary>
        [HttpPost("assign")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> AssignNfc([FromBody] AssignNfcDto dto)
        {
            var (success, message) = await _nfcService.AssignNfcAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message });
        }

        /// <summary>
        /// 9. Thu hồi hoặc khóa thẻ NFC khi mất thẻ
        /// </summary>
        [HttpPost("revoke")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> RevokeNfc([FromBody] RevokeNfcDto dto)
        {
            var (success, message) = await _nfcService.RevokeNfcAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message });
        }

        /// <summary>
        /// 10. Xác thực thẻ NFC bảo mật NTAG215
        /// </summary>
        [HttpPost("verify")]
        public async Task<IActionResult> VerifyNfc([FromBody] VerifyNfcDto dto)
        {
            var result = await _nfcService.VerifyNfcAsync(dto);
            if (!result.IsValid)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}

