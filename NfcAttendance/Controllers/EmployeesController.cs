using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/employees")]
    [Authorize]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _employeeService;

        public EmployeesController(EmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        /// <summary>
        /// 4. Danh sách nhân viên (hỗ trợ phân trang, lọc phòng ban, tìm kiếm từ khóa)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetEmployees([FromQuery] EmployeeFilterDto filter)
        {
            var result = await _employeeService.GetEmployeesAsync(filter);
            return Ok(new { success = true, data = result });
        }

        /// <summary>
        /// Lấy chi tiết nhân viên theo ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetEmployeeById(int id)
        {
            var employee = await _employeeService.GetEmployeeByIdAsync(id);
            if (employee == null)
            {
                return NotFound(new { success = false, message = "Không tìm thấy nhân viên!" });
            }
            return Ok(new { success = true, data = employee });
        }

        /// <summary>
        /// 5. Thêm nhân viên mới vào hệ thống
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateEmployee([FromBody] CreateEmployeeDto dto)
        {
            var (success, message, data) = await _employeeService.CreateEmployeeAsync(dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }

        /// <summary>
        /// 6. Chỉnh sửa hồ sơ nhân viên
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateEmployee(int id, [FromBody] UpdateEmployeeDto dto)
        {
            var (success, message, data) = await _employeeService.UpdateEmployeeAsync(id, dto);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }

        /// <summary>
        /// 7. Vô hiệu hóa nhân viên (chuyển trạng thái INACTIVE)
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteEmployee(int id)
        {
            var (success, message) = await _employeeService.DeleteEmployeeAsync(id);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message });
        }

        /// <summary>
        /// Gán hoặc tự động cấp mã QR mới cho nhân viên
        /// </summary>
        [HttpPost("{id}/qr")]
        [Authorize(Roles = "ADMIN,HR")]
        public async Task<IActionResult> AssignQrCode(int id, [FromBody] AssignQrDto? dto)
        {
            var (success, message, data) = await _employeeService.AssignOrGenerateQrCodeAsync(id, dto?.QrCode);
            if (!success)
            {
                return BadRequest(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }

        /// <summary>
        /// Lấy thông tin mã QR của nhân viên
        /// </summary>
        [HttpGet("{id}/qr")]
        public async Task<IActionResult> GetQrCode(int id)
        {
            var (success, message, data) = await _employeeService.GetQrCodeAsync(id);
            if (!success)
            {
                return NotFound(new { success = false, message });
            }
            return Ok(new { success = true, message, data });
        }
    }
}

