using System;
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
using NfcAttendance.Api.Middlewares;
using NfcAttendance.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình Database SQL Server
builder.Services.AddDbContext<NfcAttendanceDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Đăng ký toàn bộ các Service nghiệp vụ
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<AttendanceService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddScoped<NfcSecurityService>();
builder.Services.AddScoped<ShiftService>();
builder.Services.AddScoped<LeaveRequestService>();
builder.Services.AddScoped<ReportExportService>();

// 3. Đăng ký SignalR Realtime
builder.Services.AddSignalR();

// 4. Cấu hình JWT Bearer Authentication
var jwtSecret = builder.Configuration["JwtSettings:Secret"] ?? "Chuoi_Khoa_Bi_Mat_JWT_Nfc_Attendance_2026_Toi_Thieu_32_Ky_Tu!";
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
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ClockSkew = TimeSpan.Zero
    };
});

// 5. Cấu hình CORS mở để Frontend ReactJS và Mobile kết nối
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
    c.SwaggerDoc("v1", new OpenApiInfo 
    { 
        Title = "NFC Attendance API - Full Registry (27 Endpoints)", 
        Version = "v1",
        Description = "Hệ thống Quản lý Chấm công NFC Kiosk Doanh nghiệp - Tầng Backend ASP.NET Core 8"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập token JWT theo định dạng: Bearer {token}",
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
app.UseMiddleware<ErrorHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "NFC Attendance API v1");
    });
}

app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
// Endpoint cho kết nối SignalR
app.MapHub<AttendanceHub>("/hubs/attendance");

app.Run();
