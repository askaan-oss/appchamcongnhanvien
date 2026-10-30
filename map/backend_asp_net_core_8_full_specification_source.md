# TÀI LIỆU TOÀN DIỆN & FULL CODE TẦNG 1: BACKEND (ASP.NET CORE 8 WEB API)

> **Dự án**: Hệ thống Chấm công NFC Kiosk Doanh nghiệp (NFC Attendance System)  
> **Nền tảng**: .NET 8 (C#) + Entity Framework Core 8 + Microsoft SQL Server + SignalR  
> **Mục tiêu**: Cung cấp toàn bộ mã nguồn không cắt xén, cấu hình, cấu trúc thư mục và hướng dẫn khởi chạy phục vụ đồ án.

---

## 1. CÂY THƯ MỤC DỰ ÁN BACKEND

```text
backend/
└── NfcAttendance.Api/
    ├── Controllers/
    │   ├── AttendanceController.cs
    │   └── AuthController.cs
    ├── Data/
    │   ├── DbInitializer.cs
    │   └── NfcAttendanceDbContext.cs
    ├── DTOs/
    │   ├── AttendanceDtos.cs
    │   └── AuthDtos.cs
    ├── Entities/
    │   ├── Attendance.cs
    │   ├── Employee.cs
    │   ├── EmployeeShift.cs
    │   ├── KioskDevice.cs
    │   ├── LeaveRequest.cs
    │   ├── NfcCard.cs
    │   ├── Shift.cs
    │   └── User.cs
    ├── Hubs/
    │   └── AttendanceHub.cs
    ├── Services/
    │   ├── AttendanceService.cs
    │   └── AuthService.cs
    ├── appsettings.json
    ├── NfcAttendance.Api.csproj
    └── Program.cs
```

---

## 2. FILE CẤU HÌNH DỰ ÁN & THƯ VIỆN NUGET

### File: `backend/NfcAttendance.Api/NfcAttendance.Api.csproj`
```xml
<Project Sdk="Microsoft.NET.Sdk.Web">

  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="BCrypt.Net-Next" Version="4.0.3" />
    <PackageReference Include="ClosedXML" Version="0.102.2" />
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Microsoft.EntityFrameworkCore.SqlServer" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0">
      <IncludeAssets>runtime; build; native; contentfiles; analyzers; buildtransitive</IncludeAssets>
      <PrivateAssets>all</PrivateAssets>
    </PackageReference>
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
  </ItemGroup>

</Project>
```

---

### File: `backend/NfcAttendance.Api/appsettings.json`
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=NfcAttendanceDb;User Id=sa;Password=YourStrongPassword!;TrustServerCertificate=True;MultipleActiveResultSets=True;"
  },
  "JwtSettings": {
    "Secret": "Chuoi_Khoa_Bi_Mat_JWT_Nfc_Attendance_2026_Toi_Thieu_32_Ky_Tu!",
    "Issuer": "NfcAttendanceApi",
    "Audience": "NfcAttendanceClients",
    "ExpiryDays": 7
  }
}
```

---

## 3. CÁC THỰC THỂ CƠ SỞ DỮ LIỆU (ENTITIES)

### File: `backend/NfcAttendance.Api/Entities/User.cs`
```csharp
using System;

namespace NfcAttendance.Api.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "ADMIN"; // ADMIN, HR, KIOSK
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? UpdatedAt { get; set; }
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/Employee.cs`
```csharp
using System;
using System.Collections.Generic;

namespace NfcAttendance.Api.Entities
{
    public class Employee
    {
        public int Id { get; set; }
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Department { get; set; }
        public string? Position { get; set; }
        public string? AvatarUrl { get; set; }
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, INACTIVE
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<NfcCard> NfcCards { get; set; } = new List<NfcCard>();
        public virtual ICollection<Attendance> Attendances { get; set; } = new List<Attendance>();
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/NfcCard.cs`
```csharp
using System;

namespace NfcAttendance.Api.Entities
{
    public class NfcCard
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string Uid { get; set; } = string.Empty;
        public string CardType { get; set; } = "NTAG215";
        public bool IsProtected { get; set; } = true;
        public string Status { get; set; } = "ACTIVE"; // ACTIVE, LOCKED
        public DateTime AssignedAt { get; set; } = DateTime.Now;

        public virtual Employee? Employee { get; set; }
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/Shift.cs`
```csharp
using System;

namespace NfcAttendance.Api.Entities
{
    public class Shift
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public TimeSpan BreakStart { get; set; }
        public TimeSpan BreakEnd { get; set; }
        public int GraceMinutes { get; set; } = 15; // Số phút cho phép trễ không bị phạt
        public bool IsActive { get; set; } = true;
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/EmployeeShift.cs`
```csharp
using System;

namespace NfcAttendance.Api.Entities
{
    public class EmployeeShift
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int ShiftId { get; set; }
        public byte DayOfWeek { get; set; } // 0: Chủ Nhật, 1: Thứ 2, ..., 6: Thứ 7
        public DateTime EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

        public virtual Employee? Employee { get; set; }
        public virtual Shift? Shift { get; set; }
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/Attendance.cs`
```csharp
using System;

namespace NfcAttendance.Api.Entities
{
    public class Attendance
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public int? ShiftId { get; set; }
        public DateTime Date { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime? CheckOut { get; set; }
        public int LateMinutes { get; set; } = 0;
        public int EarlyMinutes { get; set; } = 0;
        public int OvertimeMinutes { get; set; } = 0;
        public int TotalWorkingMinutes { get; set; } = 0;
        public string Status { get; set; } = "WORKING"; // WORKING, COMPLETED, LATE, EARLY
        public string CheckInMethod { get; set; } = "NFC"; // NFC, QR, MANUAL
        public string? DeviceId { get; set; }

        public virtual Employee? Employee { get; set; }
        public virtual Shift? Shift { get; set; }
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/LeaveRequest.cs`
```csharp
using System;

namespace NfcAttendance.Api.Entities
{
    public class LeaveRequest
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string LeaveType { get; set; } = "ANNUAL"; // ANNUAL, SICK, UNPAID
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal TotalDays { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string Status { get; set; } = "PENDING"; // PENDING, APPROVED, REJECTED
        public int? ApproverId { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? Note { get; set; }

        public virtual Employee? Employee { get; set; }
        public virtual User? Approver { get; set; }
    }
}
```

### File: `backend/NfcAttendance.Api/Entities/KioskDevice.cs`
```csharp
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
```

---

## 4. TẦNG TRUY XUẤT CƠ SỞ DỮ LIỆU (DATA)

### File: `backend/NfcAttendance.Api/Data/NfcAttendanceDbContext.cs`
```csharp
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Entities;

namespace NfcAttendance.Api.Data
{
    public class NfcAttendanceDbContext : DbContext
    {
        public NfcAttendanceDbContext(DbContextOptions<NfcAttendanceDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<NfcCard> NfcCards => Set<NfcCard>();
        public DbSet<Shift> Shifts => Set<Shift>();
        public DbSet<EmployeeShift> EmployeeShifts => Set<EmployeeShift>();
        public DbSet<Attendance> Attendances => Set<Attendance>();
        public DbSet<LeaveRequest> LeaveRequests => Set<LeaveRequest>();
        public DbSet<KioskDevice> KioskDevices => Set<KioskDevice>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Cấu hình bảng Users
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasIndex(u => u.Username).IsUnique();
                entity.Property(u => u.Username).HasMaxLength(50).IsRequired();
                entity.Property(u => u.Role).HasMaxLength(20).IsRequired();
            });

            // Cấu hình bảng Employees
            modelBuilder.Entity<Employee>(entity =>
            {
                entity.HasIndex(e => e.EmployeeCode).IsUnique();
                entity.Property(e => e.EmployeeCode).HasMaxLength(50).IsRequired();
                entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
            });

            // Cấu hình bảng NfcCards
            modelBuilder.Entity<NfcCard>(entity =>
            {
                entity.HasIndex(c => c.Uid).IsUnique();
                entity.Property(c => c.Uid).HasMaxLength(50).IsRequired();
                entity.HasOne(c => c.Employee)
                      .WithMany(e => e.NfcCards)
                      .HasForeignKey(c => c.EmployeeId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Cấu hình bảng Attendances và Indexes tối ưu tra cứu
            modelBuilder.Entity<Attendance>(entity =>
            {
                entity.HasIndex(a => new { a.EmployeeId, a.Date }).HasDatabaseName("IX_Attendances_Employee_Date");
                entity.HasIndex(a => a.Date).HasDatabaseName("IX_Attendances_Date");
                entity.Property(a => a.Date).HasColumnType("date");
                entity.Property(a => a.CheckIn).HasColumnType("datetime2");
                entity.Property(a => a.CheckOut).HasColumnType("datetime2");
            });

            // Cấu hình bảng Shifts
            modelBuilder.Entity<Shift>(entity =>
            {
                entity.Property(s => s.StartTime).HasColumnType("time(0)");
                entity.Property(s => s.EndTime).HasColumnType("time(0)");
                entity.Property(s => s.BreakStart).HasColumnType("time(0)");
                entity.Property(s => s.BreakEnd).HasColumnType("time(0)");
            });

            // Cấu hình bảng LeaveRequests
            modelBuilder.Entity<LeaveRequest>(entity =>
            {
                entity.Property(l => l.TotalDays).HasColumnType("decimal(4,1)");
                entity.Property(l => l.StartDate).HasColumnType("date");
                entity.Property(l => l.EndDate).HasColumnType("date");
            });
        }
    }
}
```

### File: `backend/NfcAttendance.Api/Data/DbInitializer.cs`
```csharp
using System;
using System.Linq;
using NfcAttendance.Api.Entities;

namespace NfcAttendance.Api.Data
{
    public static class DbInitializer
    {
        public static void Initialize(NfcAttendanceDbContext context)
        {
            context.Database.EnsureCreated();

            // 1. Tạo tài khoản Admin mặc định (mật khẩu: Admin@123)
            if (!context.Users.Any(u => u.Username == "admin"))
            {
                context.Users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    Role = "ADMIN",
                    IsActive = true,
                    CreatedAt = DateTime.Now
                });
            }

            // 2. Tạo ca làm việc hành chính chuẩn mẫu
            if (!context.Shifts.Any())
            {
                context.Shifts.Add(new Shift
                {
                    Name = "Ca Hành Chính",
                    StartTime = new TimeSpan(8, 0, 0),
                    EndTime = new TimeSpan(17, 30, 0),
                    BreakStart = new TimeSpan(12, 0, 0),
                    BreakEnd = new TimeSpan(13, 30, 0),
                    GraceMinutes = 15,
                    IsActive = true
                });
            }

            // 3. Tạo nhân viên mẫu để test ngay trên Kiosk/Swagger
            if (!context.Employees.Any())
            {
                var sampleEmployee = new Employee
                {
                    EmployeeCode = "NV001",
                    FullName = "Nguyễn Văn A",
                    Department = "Phòng Kỹ thuật",
                    Position = "Kỹ sư phần mềm",
                    Status = "ACTIVE",
                    CreatedAt = DateTime.Now
                };
                context.Employees.Add(sampleEmployee);
                context.SaveChanges();

                // Gán thẻ NFC mẫu cho nhân viên NV001
                context.NfcCards.Add(new NfcCard
                {
                    EmployeeId = sampleEmployee.Id,
                    Uid = "04A1B2C3D4E5F6",
                    CardType = "NTAG215",
                    IsProtected = true,
                    Status = "ACTIVE",
                    AssignedAt = DateTime.Now
                });
            }

            context.SaveChanges();
        }
    }
}
```

---

## 5. ĐỐI TƯỢNG TRUYỀN TẢI DỮ LIỆU (DTOS)

### File: `backend/NfcAttendance.Api/DTOs/AuthDtos.cs`
```csharp
namespace NfcAttendance.Api.DTOs
{
    public class LoginRequestDto
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
```

### File: `backend/NfcAttendance.Api/DTOs/AttendanceDtos.cs`
```csharp
using System;
using System.Collections.Generic;

namespace NfcAttendance.Api.DTOs
{
    public class TapAttendanceRequestDto
    {
        public string? CardUid { get; set; }
        public string? QrPayload { get; set; }
        public string CheckInMethod { get; set; } = "NFC"; // NFC hoặc QR
        public string DeviceId { get; set; } = string.Empty;
        public DateTime? Timestamp { get; set; }
    }

    public class TapAttendanceResponseDto
    {
        public bool Success { get; set; }
        public string Action { get; set; } = string.Empty; // CHECK_IN hoặc CHECK_OUT
        public string EmployeeCode { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
        public DateTime Timestamp { get; set; }
        public string Status { get; set; } = string.Empty; // ON_TIME, LATE, EARLY, OVERTIME, COMPLETED
        public string Message { get; set; } = string.Empty;
    }

    public class SyncOfflineRequestDto
    {
        public string DeviceId { get; set; } = string.Empty;
        public List<TapAttendanceRequestDto> Records { get; set; } = new List<TapAttendanceRequestDto>();
    }

    public class SyncOfflineResponseDto
    {
        public bool Success { get; set; }
        public int SyncedCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
```

---

## 6. SIGNALR REALTIME HUB

### File: `backend/NfcAttendance.Api/Hubs/AttendanceHub.cs`
```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace NfcAttendance.Api.Hubs
{
    public class AttendanceHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }
    }
}
```

---

## 7. TẦNG NGHIỆP VỤ (SERVICES)

### File: `backend/NfcAttendance.Api/Services/AuthService.cs`
```csharp
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;

namespace NfcAttendance.Api.Services
{
    public class AuthService
    {
        private readonly NfcAttendanceDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(NfcAttendanceDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username && u.IsActive);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                return new LoginResponseDto { Success = false, Message = "Tài khoản hoặc mật khẩu không chính xác!" };
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(Convert.ToDouble(_configuration["JwtSettings:ExpiryDays"] ?? "7")),
                Issuer = _configuration["JwtSettings:Issuer"],
                Audience = _configuration["JwtSettings:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);

            return new LoginResponseDto
            {
                Success = true,
                Message = "Đăng nhập thành công!",
                Token = tokenHandler.WriteToken(token),
                Username = user.Username,
                Role = user.Role
            };
        }
    }
}
```

### File: `backend/NfcAttendance.Api/Services/AttendanceService.cs`
```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Entities;
using NfcAttendance.Api.Hubs;

namespace NfcAttendance.Api.Services
{
    public class AttendanceService
    {
        private readonly NfcAttendanceDbContext _context;
        private readonly IHubContext<AttendanceHub> _hubContext;

        public AttendanceService(NfcAttendanceDbContext context, IHubContext<AttendanceHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<TapAttendanceResponseDto> ProcessTapAsync(TapAttendanceRequestDto request)
        {
            DateTime scanTime = request.Timestamp ?? DateTime.Now;
            DateTime today = scanTime.Date;

            // 1. Tìm nhân viên thông qua Thẻ NFC UID hoặc Mã QR
            Employee? employee = null;
            if (!string.IsNullOrEmpty(request.CardUid))
            {
                var card = await _context.NfcCards.Include(c => c.Employee)
                    .FirstOrDefaultAsync(c => c.Uid == request.CardUid && c.Status == "ACTIVE");
                employee = card?.Employee;
            }
            else if (!string.IsNullOrEmpty(request.QrPayload))
            {
                employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.EmployeeCode == request.QrPayload && e.Status == "ACTIVE");
            }

            if (employee == null)
            {
                return new TapAttendanceResponseDto
                {
                    Success = false,
                    Message = "Thẻ hoặc mã QR không hợp lệ trong hệ thống!"
                };
            }

            // 2. Tìm ca làm việc mặc định
            var shift = await _context.Shifts.FirstOrDefaultAsync(s => s.IsActive);
            if (shift == null)
            {
                return new TapAttendanceResponseDto { Success = false, Message = "Chưa thiết lập ca làm việc trong hệ thống!" };
            }

            // 3. Kiểm tra xem hôm nay nhân viên đã có bản ghi chấm công chưa
            var attendance = await _context.Attendances
                .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == today);

            TapAttendanceResponseDto response;

            if (attendance == null)
            {
                // ========== LUỒNG CHECK-IN ==========
                TimeSpan currentScanTimeOfDay = scanTime.TimeOfDay;
                TimeSpan lateThreshold = shift.StartTime.Add(TimeSpan.FromMinutes(shift.GraceMinutes));

                int lateMinutes = 0;
                string status = "ON_TIME";
                string message = "Check-in thành công (Đúng giờ)";

                if (currentScanTimeOfDay > lateThreshold)
                {
                    lateMinutes = (int)(currentScanTimeOfDay - shift.StartTime).TotalMinutes;
                    status = "LATE";
                    message = $"Check-in thành công (Đi trễ {lateMinutes} phút)";
                }

                attendance = new Attendance
                {
                    EmployeeId = employee.Id,
                    ShiftId = shift.Id,
                    Date = today,
                    CheckIn = scanTime,
                    LateMinutes = lateMinutes,
                    Status = status,
                    CheckInMethod = request.CheckInMethod,
                    DeviceId = request.DeviceId
                };

                _context.Attendances.Add(attendance);
                await _context.SaveChangesAsync();

                response = new TapAttendanceResponseDto
                {
                    Success = true,
                    Action = "CHECK_IN",
                    EmployeeCode = employee.EmployeeCode,
                    FullName = employee.FullName,
                    Department = employee.Department ?? "Chưa gán",
                    AvatarUrl = employee.AvatarUrl,
                    Timestamp = scanTime,
                    Status = status,
                    Message = message
                };
            }
            else
            {
                // ========== LUỒNG CHECK-OUT ==========
                attendance.CheckOut = scanTime;

                // Tính về sớm (EarlyMinutes)
                int earlyMinutes = 0;
                if (scanTime.TimeOfDay < shift.EndTime)
                {
                    earlyMinutes = (int)(shift.EndTime - scanTime.TimeOfDay).TotalMinutes;
                }

                // Tính tăng ca (OvertimeMinutes)
                int overtimeMinutes = 0;
                if (scanTime.TimeOfDay > shift.EndTime)
                {
                    overtimeMinutes = (int)(scanTime.TimeOfDay - shift.EndTime).TotalMinutes;
                }

                // Tính tổng phút làm việc thực tế (trừ giờ nghỉ trưa)
                TimeSpan breakDuration = shift.BreakEnd - shift.BreakStart;
                int totalMinutes = (int)(attendance.CheckOut.Value - attendance.CheckIn).TotalMinutes;
                totalMinutes = Math.Max(0, totalMinutes - (int)breakDuration.TotalMinutes);

                attendance.EarlyMinutes = earlyMinutes;
                attendance.OvertimeMinutes = overtimeMinutes;
                attendance.TotalWorkingMinutes = totalMinutes;
                attendance.Status = "COMPLETED";

                await _context.SaveChangesAsync();

                response = new TapAttendanceResponseDto
                {
                    Success = true,
                    Action = "CHECK_OUT",
                    EmployeeCode = employee.EmployeeCode,
                    FullName = employee.FullName,
                    Department = employee.Department ?? "Chưa gán",
                    AvatarUrl = employee.AvatarUrl,
                    Timestamp = scanTime,
                    Status = earlyMinutes > 0 ? "EARLY" : (overtimeMinutes > 0 ? "OVERTIME" : "COMPLETED"),
                    Message = $"Check-out thành công (Tổng làm việc: {totalMinutes / 60}h{totalMinutes % 60}p)"
                };
            }

            // 4. BẮN DỮ LIỆU REALTIME LÊN WEB ADMIN QUA SIGNALR
            await _hubContext.Clients.All.SendAsync("ReceiveAttendanceEvent", response);

            return response;
        }

        public async Task<SyncOfflineResponseDto> ProcessSyncOfflineAsync(SyncOfflineRequestDto request)
        {
            int count = 0;
            foreach (var record in request.Records)
            {
                record.DeviceId = request.DeviceId;
                var result = await ProcessTapAsync(record);
                if (result.Success) count++;
            }

            return new SyncOfflineResponseDto
            {
                Success = true,
                SyncedCount = count,
                Message = $"Đồng bộ thành công {count}/{request.Records.Count} bản ghi."
            };
        }
    }
}
```

---

## 8. TẦNG ĐIỀU KHIỂN (CONTROLLERS)

### File: `backend/NfcAttendance.Api/Controllers/AuthController.cs`
```csharp
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }
    }
}
```

### File: `backend/NfcAttendance.Api/Controllers/AttendanceController.cs`
```csharp
using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.DTOs;
using NfcAttendance.Api.Services;

namespace NfcAttendance.Api.Controllers
{
    [ApiController]
    [Route("api/v1/attendance")]
    public class AttendanceController : ControllerBase
    {
        private readonly AttendanceService _attendanceService;
        private readonly NfcAttendanceDbContext _context;

        public AttendanceController(AttendanceService attendanceService, NfcAttendanceDbContext context)
        {
            _attendanceService = attendanceService;
            _context = context;
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> TapAttendance([FromBody] TapAttendanceRequestDto request)
        {
            var result = await _attendanceService.ProcessTapAsync(request);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpPost("sync-offline")]
        public async Task<IActionResult> SyncOffline([FromBody] SyncOfflineRequestDto request)
        {
            var result = await _attendanceService.ProcessSyncOfflineAsync(request);
            return Ok(result);
        }

        [HttpGet("today")]
        public async Task<IActionResult> GetTodayAttendance()
        {
            var today = DateTime.Today;
            var list = await _context.Attendances
                .Include(a => a.Employee)
                .Include(a => a.Shift)
                .Where(a => a.Date == today)
                .OrderByDescending(a => a.CheckIn)
                .Select(a => new
                {
                    a.Id,
                    EmployeeCode = a.Employee!.EmployeeCode,
                    FullName = a.Employee.FullName,
                    Department = a.Employee.Department,
                    CheckIn = a.CheckIn.ToString("HH:mm:ss"),
                    CheckOut = a.CheckOut.HasValue ? a.CheckOut.Value.ToString("HH:mm:ss") : "--:--",
                    a.LateMinutes,
                    a.EarlyMinutes,
                    a.TotalWorkingMinutes,
                    a.Status,
                    a.CheckInMethod
                })
                .ToListAsync();

            return Ok(list);
        }
    }
}
```

---

## 9. KHỞI TẠO PIPELINE & CẤU HÌNH HỆ THỐNG

### File: `backend/NfcAttendance.Api/Program.cs`
```csharp
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using NfcAttendance.Api.Data;
using NfcAttendance.Api.Hubs;
using NfcAttendance.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database SQL Server
builder.Services.AddDbContext<NfcAttendanceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Đăng ký các Service nghiệp vụ
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AttendanceService>();

// 3. Đăng ký SignalR Realtime
builder.Services.AddSignalR();

// 4. Cấu hình JWT Bearer Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"]!;
var key = Encoding.UTF8.GetBytes(jwtSecret);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"]
    };
});

// 5. Cấu hình CORS mở để Frontend ReactJS và Mobile Flutter gọi được
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// 6. Cấu hình Swagger hỗ trợ nhập JWT Bearer Token
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "NFC Attendance API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token theo định dạng: Bearer {token}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 7. Tự động kiểm tra và tạo Database + Seed Data khi khởi động
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<NfcAttendanceDbContext>();
    DbInitializer.Initialize(context);
}

// 8. Cấu hình Middleware Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Endpoint cho kết nối SignalR
app.MapHub<AttendanceHub>("/hubs/attendance");

app.Run();
```

---

## 10. HƯỚNG DẪN KHỞI CHẠY VÀ KIỂM THỬ

1. **Chuẩn bị Database**:
   - Đảm bảo dịch vụ SQL Server đang chạy trên máy (cổng mặc định `1433`).
   - Sửa lại mật khẩu tài khoản `sa` trong `appsettings.json`.

2. **Chạy ứng dụng Backend**:
   - Mở terminal tại thư mục `backend/NfcAttendance.Api`.
   - Chạy lệnh:
     ```bash
     dotnet run
     ```
   - Ứng dụng sẽ tự động kích hoạt `DbInitializer.Initialize(context)`: tạo Database `NfcAttendanceDb`, tạo tài khoản admin và nạp dữ liệu mẫu ban đầu.

3. **Kiểm thử trên Swagger UI**:
   - Mở trình duyệt truy cập: `http://localhost:5000/swagger`
   - Test **Đăng nhập**: Gọi `POST /api/v1/auth/login` với body:
     ```json
     {
       "username": "admin",
       "password": "Admin@123"
     }
     ```
   - Test **Quẹt thẻ Kiosk**: Gọi `POST /api/v1/attendance/check-in` với body thẻ mẫu:
     ```json
     {
       "cardUid": "04A1B2C3D4E5F6",
       "checkInMethod": "NFC",
       "deviceId": "KIOSK_01"
     }
     ```
   - Kiểm tra kết quả hiển thị thông tin nhân viên Nguyễn Văn A và trạng thái Check-in.