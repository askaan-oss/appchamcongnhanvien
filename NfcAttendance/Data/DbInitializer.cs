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

            // 1. Khởi tạo & Cập nhật tài khoản Admin theo map/account.txt (admin / 123123)
            var adminUser = context.Users.FirstOrDefault(u => u.Username == "admin");
            if (adminUser == null)
            {
                context.Users.Add(new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123123"),
                    Role = "ADMIN",
                    IsActive = true,
                    CreatedAt = DateTime.Now
                });
            }
            else
            {
                adminUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123123");
                adminUser.Role = "ADMIN";
                adminUser.IsActive = true;
                adminUser.UpdatedAt = DateTime.Now;
            }

            // Tạo/Cập nhật thêm tài khoản HR hỗ trợ (hr / 123123)
            var hrUser = context.Users.FirstOrDefault(u => u.Username == "hr");
            if (hrUser == null)
            {
                context.Users.Add(new User
                {
                    Username = "hr",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("123123"),
                    Role = "HR",
                    IsActive = true,
                    CreatedAt = DateTime.Now
                });
            }
            else
            {
                hrUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123123");
                hrUser.Role = "HR";
                hrUser.IsActive = true;
                hrUser.UpdatedAt = DateTime.Now;
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
                    QrCode = "QR_NV001_A1B2C3D4",
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

            // 4. Dọn dẹp các thẻ có UID rỗng nếu từng bị lưu lỗi
            var invalidCards = context.NfcCards.Where(c => string.IsNullOrWhiteSpace(c.Uid)).ToList();
            if (invalidCards.Any())
            {
                context.NfcCards.RemoveRange(invalidCards);
            }

            context.SaveChanges();
        }
    }
}

