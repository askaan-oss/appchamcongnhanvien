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
        public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

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
                entity.HasIndex(e => e.QrCode).IsUnique().HasFilter("[QrCode] IS NOT NULL");
                entity.Property(e => e.EmployeeCode).HasMaxLength(50).IsRequired();
                entity.Property(e => e.FullName).HasMaxLength(150).IsRequired();
                entity.Property(e => e.QrCode).HasMaxLength(100);
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

            // Cấu hình bảng AuditLogs
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.Property(a => a.Action).HasMaxLength(100).IsRequired();
                entity.Property(a => a.Details).HasMaxLength(1000);
            });
        }
    }
}
