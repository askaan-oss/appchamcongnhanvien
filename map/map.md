# LỘ TRÌNH TÁCH VÀ TÁI CẤU TRÚC HỆ THỐNG NFC ATTENDANCE

> **Mục tiêu**: Tách toàn bộ kiến trúc nguyên khối SQLite trên ứng dụng di động hiện tại thành mô hình **4 tầng độc lập chuẩn hóa**:
> 1. **TẦNG BACKEND (ASP.NET Core Web API - .NET 8 / C#)**: Đã hoàn thiện 100% làm chuẩn mực trung tâm (`NfcAttendance`), cung cấp toàn bộ 27 RESTful APIs, phân quyền JWT Bearer, động cơ tính công (trễ/sớm/tăng ca/giờ làm), đẩy sự kiện SignalR Realtime (`/hubs/attendance`) và quản lý an toàn thẻ NFC NTAG215.
> 2. **TẦNG CƠ SỞ DỮ LIỆU (Microsoft SQL Server)**: Cơ sở dữ liệu quan hệ doanh nghiệp tập trung `Nhom12_CT4` tại máy chủ `HIRVY\SQLEXPRESS`, quản lý 9 bảng chuẩn hóa với tính toàn vẹn dữ liệu ACID và chỉ mục tối ưu truy vấn.
> 3. **TẦNG MOBILE APP (Flutter / Dart)**: Ứng dụng di động chuyên dụng làm **Máy chấm công Kiosk** (Station Mode) đặt cố định tại trạm cửa/văn phòng, hoạt động hoàn toàn qua RESTful API kết nối Backend, tối ưu cho quét thẻ NFC (NTAG215 chống sao chép) và quét mã QR chấm công, có hỗ trợ Offline Local Cache và tự động đồng bộ hàng loạt qua giao dịch SQL.
> 4. **TẦNG FRONTEND WEB (React.js)**: Ứng dụng web dành cho Ban quản trị / HR quản lý nhân sự, cấu hình ca làm việc, duyệt đơn nghỉ phép, giám sát chấm công thời gian thực (Today Monitor qua SignalR) và xuất báo cáo bảng công Excel/PDF.

---

## 1. MÔ HÌNH KIẾN TRÚC HỆ THỐNG 4 TẦNG

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG CLIENT GIAO DIỆN                           │
│                                                                        │
│   ┌────────────────────────────────┐  ┌─────────────────────────────┐  │
│   │    TẦNG FRONTEND WEB           │  │      TẦNG MOBILE APP        │  │
│   │       (React.js)               │  │      (Flutter / Dart)       │  │
│   │ - Bảng điều khiển (Dashboard)  │  │ - Máy Kiosk Chấm công trạm  │  │
│   │ - Quản lý Nhân sự, Ca làm việc │  │ - Quẹt thẻ NFC (NTAG215)    │  │
│   │ - Quản lý & Duyệt đơn nghỉ phép│  │ - Quét mã QR chấm công      │  │
│   │ - Giám sát Realtime (SignalR)  │  │ - Phản hồi âm thanh/hình ảnh│  │
│   │ - Xuất báo cáo Excel / PDF     │  │ - Offline Local Cache/Sync  │  │
│   └───────────────┬────────────────┘  └──────────────┬──────────────┘  │
└───────────────────┼──────────────────────────────────┼─────────────────┘
                    │   HTTPS / RESTful API / SignalR  │
                    ▼                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│       TẦNG BACKEND CHUẨN (ASP.NET Core Web API - .NET 8 / C#)          │
│       Dự án chuẩn: NfcAttendance (27 Endpoints RESTful API)            │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ - Controllers: Auth, Employees, Nfc, Shifts, Attendance, Leaves, │  │
│  │   Reports (27 Endpoints chuẩn hoá RESTful JSON /api/v1)          │  │
│  │ - SignalR Hub: AttendanceHub (/hubs/attendance) bắn realtime     │  │
│  │ - Middlewares: ErrorHandlingMiddleware (Global Exception Handler)│  │
│  │ - Authentication & RBAC: JWT Bearer (ADMIN, HR, KIOSK) + Refresh │  │
│  │ - Business Engine: Nhận diện ca, tính đi trễ/về sớm/tăng ca      │  │
│  │ - Attendance Engine: Quẹt NFC, QR code, Bulk Insert Offline      │  │
│  │ - Leave Workflow: Quy trình gửi và phê duyệt đơn nghỉ phép       │  │
│  │ - Export Service: Xuất báo cáo Excel (ClosedXML), PDF chuẩn      │  │
│  │ - Entity Framework Core 8: NfcAttendanceDbContext Code-First     │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│               TẦNG CƠ SỞ DỮ LIỆU (Microsoft SQL Server)                │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ - Instance: HIRVY\SQLEXPRESS                                     │  │
│  │ - Database: Nhom12_CT4                                           │  │
│  │ - 9 Bảng: Users, Employees, NfcCards, Shifts, EmployeeShifts,    │  │
│  │   Attendances, LeaveRequests, KioskDevices, AuditLogs            │  │
│  │ - Ràng buộc toàn vẹn khóa ngoại (FKs) & SQL Transactions an toàn │  │
│  │ - Non-Clustered Indexes: (EmployeeId, Date), (Date), (Uid)       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. QUY CHUẨN CÔNG NGHỆ TỪNG TẦNG

| Phân tầng | Công nghệ chuẩn hóa | Vai trò và Nhiệm vụ | Trạng thái |
| :--- | :--- | :--- | :---: |
| **TẦNG BACKEND** | **ASP.NET Core Web API (.NET 8 C#)** | Khung nền tảng backend doanh nghiệp mạnh mẽ (`NfcAttendance`); EF Core 8 quản lý dữ liệu; tích hợp sẵn DI, JWT Bearer Token, Swagger UI, Global Error Middleware và SignalR realtime push. | **ĐÃ HOÀN THÀNH 100% (27 API)** |
| **TẦNG CƠ SỞ DỮ LIỆU** | **Microsoft SQL Server (MS SQL)** | Cơ sở dữ liệu `Nhom12_CT4` trên `HIRVY\SQLEXPRESS`; đảm bảo tính toàn vẹn giao dịch (ACID); DbInitializer tự động tạo bảng và nạp dữ liệu mồi chuẩn khi khởi động. | **SẴN SÀNG KẾT NỐI** |
| **TẦNG FRONTEND WEB** | **React.js (Vite + Tailwind)** | Single Page Application (SPA); quản lý biểu đồ Dashboard, DataTable nhân sự/ca làm, duyệt đơn nghỉ phép, kết nối SignalR nhận thông báo quẹt thẻ trực tiếp và tải file Excel/PDF. | Đang triển khai |
| **TẦNG MOBILE APP** | **Flutter / Dart** | Thiết bị Kiosk chấm công chuyên dụng đặt tại văn phòng/xưởng; giao tiếp 100% qua 27 RESTful API; điều khiển phần cứng NFC NTAG215 và Camera QR Code; duy trì cơ chế Offline-First khi mất mạng. | Đang triển khai |

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU TRÊN SQL SERVER (`Nhom12_CT4`)

Cấu trúc 9 bảng dữ liệu được cấu hình và khởi tạo tự động trong [`NfcAttendanceDbContext.cs`](file:///d:/vsXanh/appchamcongnhanvien/NfcAttendance/Data/NfcAttendanceDbContext.cs):

1. **`Users`**: Tài khoản quản trị và thiết bị:
   - `Id` (INT IDENTITY, PK), `Username` (NVARCHAR(50), Unique, Not Null), `PasswordHash` (NVARCHAR(256), Not Null), `Role` (NVARCHAR(20), Not Null: `ADMIN`, `HR`, `KIOSK`), `IsActive` (BIT, Default 1), `RefreshToken` (NVARCHAR(MAX) NULL), `RefreshTokenExpiryTime` (DATETIME2 NULL), `CreatedAt` (DATETIME2), `UpdatedAt` (DATETIME2 NULL).
2. **`Employees`**: Hồ sơ nhân sự:
   - `Id` (INT IDENTITY, PK), `EmployeeCode` (NVARCHAR(50), Unique, Not Null), `FullName` (NVARCHAR(150), Not Null), `Phone` (NVARCHAR(20) NULL), `Email` (NVARCHAR(100) NULL), `Department` (NVARCHAR(100) NULL), `Position` (NVARCHAR(100) NULL), `AvatarUrl` (NVARCHAR(MAX) NULL), `QrCode` (NVARCHAR(100) Unique Filtered NULL), `Status` (NVARCHAR(20), Default 'ACTIVE'), `CreatedAt` (DATETIME2).
3. **`NfcCards`**: Quản lý thẻ NFC gán cho nhân sự:
   - `Id` (INT IDENTITY, PK), `EmployeeId` (INT, FK -> Employees, Cascade Delete), `Uid` (NVARCHAR(50), Unique, Not Null), `CardType` (NVARCHAR(50), Default 'NTAG215'), `IsProtected` (BIT, Default 1), `Status` (NVARCHAR(20), Default 'ACTIVE'), `AssignedAt` (DATETIME2).
4. **`Shifts`**: Danh mục ca làm việc:
   - `Id` (INT IDENTITY, PK), `Name` (NVARCHAR(100), Not Null), `StartTime` (TIME(0), Not Null), `EndTime` (TIME(0), Not Null), `BreakStart` (TIME(0), Not Null), `BreakEnd` (TIME(0), Not Null), `GraceMinutes` (INT, Default 15), `IsActive` (BIT, Default 1).
5. **`EmployeeShifts`**: Lịch phân ca tuần cho nhân sự:
   - `Id` (INT IDENTITY, PK), `EmployeeId` (INT, FK -> Employees), `ShiftId` (INT, FK -> Shifts), `DayOfWeek` (TINYINT: 0=CN, 1=T2..6=T7), `EffectiveFrom` (DATE), `EffectiveTo` (DATE NULL).
6. **`Attendances`**: Lịch sử và dữ liệu chấm công:
   - `Id` (INT IDENTITY, PK), `EmployeeId` (INT, FK -> Employees), `ShiftId` (INT NULL, FK -> Shifts), `Date` (DATE, Not Null), `CheckIn` (DATETIME2, Not Null), `CheckOut` (DATETIME2 NULL), `LateMinutes` (INT, Default 0), `EarlyMinutes` (INT, Default 0), `OvertimeMinutes` (INT, Default 0), `TotalWorkingMinutes` (INT, Default 0), `Status` (NVARCHAR(20), Default 'WORKING'), `CheckInMethod` (NVARCHAR(20), Default 'NFC'), `DeviceId` (NVARCHAR(100) NULL).
   - *Index*: `IX_Attendances_Employee_Date` trên `(EmployeeId, Date)`.
   - *Index*: `IX_Attendances_Date` trên `(Date)`.
7. **`LeaveRequests`**: Quản lý đơn xin nghỉ phép:
   - `Id` (INT IDENTITY, PK), `EmployeeId` (INT, FK -> Employees), `LeaveType` (NVARCHAR(50), Default 'ANNUAL'), `StartDate` (DATE, Not Null), `EndDate` (DATE, Not Null), `TotalDays` (DECIMAL(4,1), Not Null), `Reason` (NVARCHAR(500), Not Null), `Status` (NVARCHAR(20), Default 'PENDING'), `ApproverId` (INT NULL, FK -> Users), `ApprovedAt` (DATETIME2 NULL), `Note` (NVARCHAR(500) NULL).
8. **`KioskDevices`**: Danh mục máy trạm chấm công Kiosk:
   - `Id` (INT IDENTITY, PK), `DeviceId` (NVARCHAR(100), Unique, Not Null), `DeviceName` (NVARCHAR(100), Not Null), `IpAddress` (NVARCHAR(50) NULL), `LastOnlineAt` (DATETIME2 NULL), `IsActive` (BIT, Default 1).
9. **`AuditLogs`**: Nhật ký an toàn và kiểm toán hệ thống:
   - `Id` (INT IDENTITY, PK), `Action` (NVARCHAR(100), Not Null), `Details` (NVARCHAR(1000) NULL), `IpAddress` (NVARCHAR(50) NULL), `CreatedAt` (DATETIME2).

---

## 4. BẢNG ĐẶC TẢ TẦNG BACKEND (29 ENDPOINTS RESTFUL API)

Toàn bộ 29 endpoints đã được hiện thực đầy đủ tại project [`NfcAttendance`](file:///d:/vsXanh/appchamcongnhanvien/NfcAttendance/NfcAttendance.csproj), kiểm thử chi tiết trong tài liệu [`map/check.md`](file:///d:/vsXanh/appchamcongnhanvien/map/check.md):

```
┌──────┬────────────────────────────────────────────────────────────────────────────────────────┐
│ NHÓM │ DANH SÁCH 29 ENDPOINTS CHUẨN (/api/v1)                                                 │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  A   │ 1. POST   /api/v1/auth/login                                                           │
│      │ 2. POST   /api/v1/auth/refresh                                                         │
│      │ 3. GET    /api/v1/auth/me                                                              │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  B   │ 4. GET    /api/v1/employees                                                            │
│      │ 5. POST   /api/v1/employees                                                            │
│      │ 6. PUT    /api/v1/employees/{id}                                                       │
│      │ 7. DELETE /api/v1/employees/{id}                                                       │
│      │ 8. POST   /api/v1/employees/{id}/qr                                                    │
│      │ 9. GET    /api/v1/employees/{id}/qr                                                    │
│      │ 10. POST  /api/v1/nfc/assign                                                           │
│      │ 11. POST  /api/v1/nfc/revoke                                                           │
│      │ 12. POST  /api/v1/nfc/verify                                                           │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  C   │ 13. GET   /api/v1/shifts                                                               │
│      │ 14. POST  /api/v1/shifts                                                               │
│      │ 15. PUT   /api/v1/shifts/{id}                                                          │
│      │ 16. DELETE/api/v1/shifts/{id}                                                          │
│      │ 17. POST  /api/v1/shifts/assign                                                        │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  D   │ 18. POST  /api/v1/attendance/check-in                                                  │
│      │ 19. POST  /api/v1/attendance/check-out                                                 │
│      │ 20. GET   /api/v1/attendance/today                                                     │
│      │ 21. GET   /api/v1/attendance/history                                                   │
│      │ 22. POST  /api/v1/attendance/manual                                                    │
│      │ 23. POST  /api/v1/attendance/sync-offline                                              │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  E   │ 24. GET   /api/v1/leave-requests                                                       │
│      │ 25. POST  /api/v1/leave-requests                                                       │
│      │ 26. PATCH /api/v1/leave-requests/{id}/status                                           │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  F   │ 27. GET   /api/v1/reports/summary                                                      │
│      │ 28. GET   /api/v1/reports/export/excel                                                 │
│      │ 29. GET   /api/v1/reports/export/pdf                                                   │
└──────┴────────────────────────────────────────────────────────────────────────────────────────┘
```

- **Kênh Realtime SignalR**: Hub Endpoint `/hubs/attendance` phát sự kiện `ReceiveAttendanceEvent` chứa dữ liệu quẹt thẻ tức thì cho Web Admin Today Monitor.

---

## 5. CẤU HÌNH BIẾN MÔI TRƯỜNG & KẾT NỐI HỆ THỐNG

### A. TẦNG BACKEND (`NfcAttendance/appsettings.json`)
Cấu hình chuẩn đang chạy tại dự án:

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
    "DefaultConnection": "Server=HIRVY\\SQLEXPRESS;Database=Nhom12_CT4;Trusted_Connection=True;TrustServerCertificate=True"
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

### B. TẦNG FRONTEND WEB (`frontend/.env`)
Cấu hình kết nối tới ASP.NET Core Web API (sử dụng tiền tố `VITE_` chuẩn Vite):

```env
# URL API Backend ASP.NET Core
VITE_API_BASE_URL=http://localhost:5000/api/v1

# URL SignalR Hub nhận dữ liệu quẹt thẻ Realtime
VITE_SIGNALR_HUB_URL=http://localhost:5000/hubs/attendance

# Thời gian timeout gọi API (milliseconds)
VITE_API_TIMEOUT=15000
```

---

### C. TẦNG MOBILE APP KIOSK (Flutter / Dart) (`mobile/.env`)
Cấu hình biến môi trường cho máy chấm công Kiosk (quản lý qua thư viện `flutter_dotenv`):

```env
# URL API Backend ASP.NET Core cho máy Kiosk
# Khi chạy Android Emulator: http://10.0.2.2:5000/api/v1
# Khi chạy máy thật qua WiFi LAN: http://192.168.1.100:5000/api/v1
API_BASE_URL=http://192.168.1.100:5000/api/v1

# Mã định danh trạm Kiosk mặc định
DEFAULT_DEVICE_ID=KIOSK_GATE_01

# Tên trạm Kiosk hiển thị
DEFAULT_DEVICE_NAME=Cổng Chính

# Timeout kết nối API (milliseconds)
CONNECT_TIMEOUT=10000
RECEIVE_TIMEOUT=15000
```

File cấu hình Dart tương ứng (`mobile/lib/config/app_config.dart`):

```dart
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get apiBaseUrl => dotenv.env['API_BASE_URL'] ?? 'http://192.168.1.100:5000/api/v1';
  static String get defaultDeviceId => dotenv.env['DEFAULT_DEVICE_ID'] ?? 'KIOSK_GATE_01';
  static String get defaultDeviceName => dotenv.env['DEFAULT_DEVICE_NAME'] ?? 'Cổng Chính';
  static int get connectTimeoutMs => int.tryParse(dotenv.env['CONNECT_TIMEOUT'] ?? '10000') ?? 10000;
  static int get receiveTimeoutMs => int.tryParse(dotenv.env['RECEIVE_TIMEOUT'] ?? '15000') ?? 15000;
}
```

---

## 6. LỘ TRÌNH THỰC HIỆN TỪNG BƯỚC (STEP-BY-STEP ROADMAP)

### GIAI ĐOẠN 1: THIẾT LẬP SQL SERVER & XÂY DỰNG ASP.NET CORE WEB API
- [x] **1.1. Cấu hình Microsoft SQL Server & DbInitializer**:
  - [x] Cấu hình chuỗi kết nối chuẩn tới `Server=HIRVY\SQLEXPRESS;Database=Nhom12_CT4`.
  - [x] Viết `DbInitializer.cs` tự động `EnsureCreated()`, khởi tạo tài khoản quản trị `admin` (`Admin@123`), ca làm mẫu và nhân viên mẫu NV001 gán thẻ NFC `04A1B2C3D4E5F6`.
- [x] **1.2. Khởi tạo & Cấu hình Dự án ASP.NET Core Web API (.NET 8)**:
  - [x] Dự án `NfcAttendance.csproj` với RootNamespace `NfcAttendance.Api`.
  - [x] Cài đặt các thư viện NuGet: `Microsoft.EntityFrameworkCore.SqlServer`, `Microsoft.EntityFrameworkCore.Tools`, `Microsoft.AspNetCore.Authentication.JwtBearer`, `ClosedXML`, `BCrypt.Net-Next`, `Swashbuckle.AspNetCore`.
- [x] **1.3. Cài đặt tầng Data & Entity Framework Core**:
  - [x] Xây dựng đầy đủ 9 thực thể C# (`User`, `Employee`, `NfcCard`, `Shift`, `EmployeeShift`, `Attendance`, `LeaveRequest`, `KioskDevice`, `AuditLog`).
  - [x] Cấu hình `NfcAttendanceDbContext.cs` với Fluent API, kiểu dữ liệu SQL Server (date, datetime2, time, decimal) và non-clustered indexes.
- [x] **1.4. Lập trình Logic Nghiệp vụ & Dịch vụ (Services)**:
  - [x] Dịch vụ xác thực JWT + Refresh Token (`AuthService.cs`).
  - [x] Dịch vụ chấm công `AttendanceService.cs`: Tự động nhận diện ca làm, tính `LateMinutes`, `EarlyMinutes`, `OvertimeMinutes`, trừ giờ nghỉ trưa, phát sự kiện realtime SignalR và thực thi Transaction Bulk Sync offline an toàn.
  - [x] Dịch vụ bảo mật thẻ NFC (`NfcSecurityService.cs`): Gán thẻ, khóa thẻ, xác thực NTAG215 và ghi `AuditLog`.
  - [x] Dịch vụ hồ sơ nhân viên (`EmployeeService.cs`), ca làm (`ShiftService.cs`), nghỉ phép (`LeaveRequestService.cs`).
  - [x] Dịch vụ báo cáo (`ReportExportService.cs`): Thống kê Dashboard, xuất file Excel (`.xlsx`) và xuất file PDF chuẩn.
- [x] **1.5. Xây dựng 27 Controllers & Kiểm thử Swagger**:
  - [x] Hoàn thiện toàn bộ 7 Controllers: `AuthController`, `EmployeesController`, `NfcController`, `ShiftsController`, `AttendanceController`, `LeaveRequestsController`, `ReportsController`.
  - [x] Đăng ký `ErrorHandlingMiddleware.cs`, JWT Bearer trong Swagger UI, CORS mở `AllowAll` và SignalR Hub tại `/hubs/attendance`.
  - [x] Biên dịch thành công: 0 Warning, 0 Error. Tạo tài liệu kiểm tra chuẩn [`map/check.md`](file:///d:/vsXanh/appchamcongnhanvien/map/check.md).

---

### GIAI ĐOẠN 2: PHÁT TRIỂN TẦNG FRONTEND WEB (React.js)
- [ ] **2.1. Khởi tạo dự án React.js & Cấu hình Biến môi trường**:
  - Cài đặt React.js (Vite + React Router + Axios / TanStack Query + Tailwind CSS).
  - Tạo file `frontend/.env` lưu các biến: `VITE_API_BASE_URL`, `VITE_SIGNALR_HUB_URL`, `VITE_API_TIMEOUT`.
  - Cài đặt `@microsoft/signalr` kết nối tới `/hubs/attendance`.
  - Xây dựng Axios Interceptor tự động đính kèm `Authorization: Bearer {token}`.
- [ ] **2.2. Giao diện Đăng nhập & Layout Quản trị**:
  - Màn hình đăng nhập qua API `POST /api/v1/auth/login`.
  - Sidebar điều hướng, Header hiển thị hồ sơ từ `GET /api/v1/auth/me`.
- [ ] **2.3. Màn hình Dashboard & Giám sát Realtime (Today Monitor)**:
  - 4 Card KPI lấy từ `GET /api/v1/reports/summary`.
  - Bảng Today Monitor lấy từ `GET /api/v1/attendance/today`, tự động chèn dòng mới khi nhận sự kiện `ReceiveAttendanceEvent` từ SignalR.
- [ ] **2.4. Màn hình Quản lý Nhân sự & Thẻ NFC**:
  - Tích hợp các API `/api/v1/employees` và `/api/v1/nfc`.
- [ ] **2.5. Màn hình Ca làm việc & Phân ca tuần**:
  - Tích hợp các API `/api/v1/shifts`.
- [ ] **2.6. Màn hình Quản lý & Phê duyệt Đơn nghỉ phép**:
  - Tích hợp các API `/api/v1/leave-requests`.
- [ ] **2.7. Màn hình Báo cáo & Xuất file**:
  - Gọi tải file Excel từ `GET /api/v1/reports/export/excel` và file PDF từ `GET /api/v1/reports/export/pdf`.

---

### GIAI ĐOẠN 3: TÁI CẤU TRÚC TẦNG MOBILE APP (Flutter / Dart) - KIOSK CHUYÊN DỤNG
- [ ] **3.1. Chuyển đổi tầng Dữ liệu (Data Layer) & Tích hợp .env**:
  - Cài đặt thư viện `flutter_dotenv` nạp biến môi trường từ file `mobile/.env` (`API_BASE_URL`, `DEFAULT_DEVICE_ID`, `CONNECT_TIMEOUT`, `RECEIVE_TIMEOUT`).
  - Xây dựng lớp cấu hình `AppConfig` đọc trực tiếp từ `dotenv.env`.
  - Tạo `api_service.dart` gọi API `POST /api/v1/attendance/check-in` và `POST /api/v1/attendance/check-out`.
  - Chuyển SQLite cục bộ thành kho đệm Offline Cache khi mất mạng.
- [ ] **3.2. Tinh gọn Giao diện Chuyên dụng Kiosk Chấm công (Station UI)**:
  - Loại bỏ các màn hình cá nhân không cần thiết.
  - Màn hình chờ quẹt thẻ NFC toàn màn hình: Phản hồi âm thanh *"Bíp"*, hiển thị ảnh đại diện, họ tên, giờ quẹt, trạng thái trong 3 giây.
  - Quét mã QR chấm công tích hợp camera.
  - Màn hình cài đặt máy trạm Kiosk (Device ID, URL Server Backend).
- [ ] **3.3. Tối ưu Cơ chế Offline-First & Tự động đồng bộ**:
  - Khi mất mạng: Lưu trữ vào SQLite nội bộ (`isSynced = 0`).
  - Khi có mạng: Tự động gửi gói `POST /api/v1/attendance/sync-offline` lên Backend và cập nhật `isSynced = 1`.
- [ ] **3.4. Giữ vững tính năng Bảo mật thẻ NFC NTAG215**:
  - Gọi API `POST /api/v1/nfc/verify` để xác thực thẻ trước khi ghi nhận.

---

### GIAI ĐOẠN 4: KIỂM THỬ TÍCH HỢP TOÀN HỆ THỐNG
- [ ] **4.1. Kiểm thử luồng trực tuyến (Online Flow)**:
  - Thẻ NFC quẹt tại Kiosk Mobile -> Backend ASP.NET Core tính công -> SignalR bắn realtime -> Frontend Web hiển thị ngay lập tức.
- [ ] **4.2. Kiểm thử luồng ngoại tuyến (Offline Flow)**:
  - Ngắt kết nối mạng Kiosk -> Quẹt thẻ -> Bật lại mạng -> Kiosk tự động đồng bộ qua API `sync-offline` an toàn.

---

### GIAI ĐOẠN 5: ĐÓNG GÓI VÀ TRIỂN KHAI (DEPLOYMENT)
- [ ] **5.1. Docker hóa**:
  - Dockerfile cho Backend ASP.NET Core Web API.
  - docker-compose phối hợp SQL Server, Backend và Web Frontend.
- [ ] **5.2. Build Mobile Kiosk APK**:
  - Xuất bản file cài đặt APK cho máy tính bảng Kiosk tại trạm chấm công.

---

## 7. CẤU TRÚC THƯ MỤC THỰC TẾ CỦA DỰ ÁN

```
appchamcongnhanvien/
├── NfcAttendance/                          # TẦNG BACKEND CHUẨN (ASP.NET Core Web API .NET 8)
│   ├── Controllers/                        # 7 Controllers tiếp nhận 27 Endpoint RESTful API
│   │   ├── AttendanceController.cs         # Chấm công, Today Monitor, History, Manual, Sync-Offline
│   │   ├── AuthController.cs               # Đăng nhập, Refresh Token, Thông tin cá nhân Me
│   │   ├── EmployeesController.cs          # Quản lý hồ sơ nhân sự, phân trang, lọc, xóa mềm
│   │   ├── LeaveRequestsController.cs      # Danh sách đơn nghỉ, gửi đơn, phê duyệt đơn
│   │   ├── NfcController.cs                # Gán thẻ NTAG215 UID, thu hồi thẻ, xác thực thẻ
│   │   ├── ReportsController.cs            # Thống kê Dashboard, xuất file Excel (.xlsx), PDF
│   │   └── ShiftsController.cs             # Quản lý ca làm việc, phân ca tuần theo thứ
│   │
│   ├── Data/                               # Tầng Dữ liệu Entity Framework Core 8
│   │   ├── DbInitializer.cs                # Khởi tạo tự động & Nạp dữ liệu mẫu ban đầu
│   │   └── NfcAttendanceDbContext.cs       # DbContext ánh xạ 9 bảng & cấu hình Indexes tối ưu
│   │
│   ├── DTOs/                               # Data Transfer Objects
│   │   ├── AttendanceDtos.cs               # Model quẹt thẻ, phản hồi Kiosk 3s, gói đồng bộ offline
│   │   ├── AuthDtos.cs                     # Model Login, Token, RefreshToken, UserProfile
│   │   ├── EmployeeDtos.cs                 # Model nhân viên, phân trang PagedResult
│   │   ├── LeaveDtos.cs                    # Model đơn xin phép và duyệt phép
│   │   ├── NfcDtos.cs                      # Model gán thẻ, thu hồi, xác thực bảo mật NTAG215
│   │   ├── ReportDtos.cs                   # Model thống kê KPI Dashboard, lọc báo cáo
│   │   └── ShiftDtos.cs                    # Model ca làm việc và phân ca theo tuần
│   │
│   ├── Entities/                           # 9 Thực thể Bảng CSDL Microsoft SQL Server
│   │   ├── Attendance.cs                   # Bảng Attendances (Chấm công vào/ra, trễ, sớm, tăng ca)
│   │   ├── AuditLog.cs                     # Bảng AuditLogs (Nhật ký thao tác hệ thống)
│   │   ├── Employee.cs                     # Bảng Employees (Hồ sơ nhân viên)
│   │   ├── EmployeeShift.cs                # Bảng EmployeeShifts (Lịch phân ca tuần)
│   │   ├── KioskDevice.cs                  # Bảng KioskDevices (Máy trạm chấm công)
│   │   ├── LeaveRequest.cs                 # Bảng LeaveRequests (Đơn xin nghỉ phép)
│   │   ├── NfcCard.cs                      # Bảng NfcCards (Thẻ NTAG215 gán nhân sự)
│   │   ├── Shift.cs                        # Bảng Shifts (Danh mục ca làm việc)
│   │   └── User.cs                         # Bảng Users (Tài khoản quản trị & RefreshToken)
│   │
│   ├── Hubs/                               # SignalR Realtime Hub
│   │   └── AttendanceHub.cs                # Kênh phát WebSocket /hubs/attendance
│   │
│   ├── Middlewares/                        # Bộ lọc & Middleware
│   │   └── ErrorHandlingMiddleware.cs      # Bắt ngoại lệ toàn cục Global Exception Handler
│   │
│   ├── Services/                           # Tầng Xử lý Nghiệp vụ Logic Cốt Lõi
│   │   ├── AttendanceService.cs            # Động cơ chấm công, tính giờ, SignalR & Transaction Sync
│   │   ├── AuthService.cs                  # Xác thực BCrypt, JWT Token, Refresh Token
│   │   ├── EmployeeService.cs              # Nghiệp vụ nhân viên, phân trang, tìm kiếm
│   │   ├── LeaveRequestService.cs          # Quy trình nộp và duyệt đơn nghỉ phép
│   │   ├── NfcSecurityService.cs           # Nghiệp vụ bảo mật thẻ NTAG215 & ghi AuditLog
│   │   ├── ReportExportService.cs          # Tổng hợp chỉ số Dashboard, sinh Excel & PDF
│   │   └── ShiftService.cs                 # Nghiệp vụ ca làm việc và phân ca theo tuần
│   │
│   ├── appsettings.json                    # Cấu hình SQL Server Nhom12_CT4, JWT Secret
│   ├── appsettings.Development.json        # Cấu hình môi trường phát triển
│   ├── NfcAttendance.csproj                # File cấu hình .NET 8 và các thư viện NuGet
│   └── Program.cs                          # Khởi tạo WebApplication, DI, Pipeline, CORS, SignalR
│
├── frontend/                               # TẦNG FRONTEND WEB (React.js - Dự kiến phát triển)
│   ├── src/
│   │   ├── components/                     # Sidebar, Navbar, Modal, Chart, DataTable
│   │   ├── pages/                          # Dashboard, Employees, Shifts, Leaves, Reports, TodayMonitor
│   │   ├── services/                       # Axios ApiClient, SignalRService (kết nối AttendanceHub)
│   │   └── App.jsx
│   ├── .env                                # File cấu hình biến môi trường Frontend (Vite)
│   ├── .env.example                        # File mẫu biến môi trường Frontend
│   ├── Dockerfile
│   └── package.json
│
├── mobile/                                 # TẦNG MOBILE APP (Flutter / Dart - Kiosk Chuyên dụng)
│   ├── assets/
│   │   └── .env                            # File nạp runtime assets cho flutter_dotenv
│   ├── lib/
│   │   ├── config/                         # AppConfig.dart đọc biến từ dotenv
│   │   ├── models/                         # Attendance, Shift, KioskConfig
│   │   ├── screens/                        # KioskAttendanceScreen (NFC), KioskQrScanScreen, KioskSettings
│   │   ├── services/                       # ApiService (REST), NfcSecurityService, OfflineSyncService
│   │   └── main.dart
│   ├── .env                                # File cấu hình biến môi trường Mobile Kiosk
│   ├── .env.example                        # File mẫu biến môi trường Mobile Kiosk
│   └── pubspec.yaml
│
└── map/                                    # TÀI LIỆU HỆ THỐNG
    ├── backend_asp_net_core_8_full_specification_source.md # Tài liệu mã nguồn đặc tả tầng 1
    ├── backend_specification_full_api_registry.md          # Đặc tả 27 API Registry
    ├── check.md                            # Tài liệu kiểm tra 27 API & Sơ đồ luồng hoạt động
    └── map.md                              # Lộ trình & Kiến trúc tổng thể hệ thống (File này)
```

---
*Tài liệu này là chuẩn mực kiến trúc thống nhất của toàn bộ hệ thống NFC Attendance, lấy dự án Backend ASP.NET Core 8 `NfcAttendance` làm tiêu chuẩn kỹ thuật cốt lõi.*
