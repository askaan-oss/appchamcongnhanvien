# HỆ THỐNG ĐIỂM DANH & CHẤM CÔNG THÔNG MINH ĐA NỀN TẢNG (NFC & QR ATTENDANCE)

> Hệ thống chấm công doanh nghiệp 4 tầng phân tán, kết hợp công nghệ giao tiếp trường gần NFC NTAG215, định danh mã ma trận QR Code dự phòng, kiến trúc ngoại tuyến Offline-First và mạng truyền thông thời gian thực SignalR WebSocket.

---

## 1. THÔNG TIN DỰ ÁN

* **Đề tài:** Hệ thống Điểm danh & Chấm công Nhân viên qua Thẻ NFC và Mã QR (NFC Attendance Enterprise System)
* **Đơn vị đào tạo:** Trường Đại học Công nghệ TP. HCM (HUTECH)
* **Ngành:** Công nghệ Thông tin
* **Môn học:** Lập trình trên thiết bị di động
* **Giảng viên hướng dẫn:** ThS. Nguyễn Mạnh Hùng
* **Nhóm thực hiện:** Nhóm 12 (Lớp: 23DTHC4 - Ca học: Chiều Thứ Tư)
  * **Nguyễn Trướng Quốc Huy** - MSSV: 2380600863
  * **Nguyễn Đình Kiên** - MSSV: 2380601126
  * **Nguyễn Trọng Khánh** - MSSV: 2380601035
  * **Trịnh Châu Hồng Phát** - MSSV: 2380601651
* **Cơ sở dữ liệu tập trung:** `Nhom12_CT4` (Microsoft SQL Server)

---

## 2. BỐI CẢNH & MỤC TIÊU KỸ THUẬT

### 2.1. Vấn đề giải quyết
Các hệ thống chấm công truyền thống bộc lộ nhiều hạn chế vận hành:
* **Vân tay cơ học:** Tốc độ nhận diện chậm ($3 - 7\text{s}$), tỷ lệ từ chối cao khi tay ướt, dính bẩn công nghiệp hoặc vân tay mòn; nguy cơ lây nhiễm vi khuẩn tại bề mặt tiếp xúc.
* **Thẻ từ quẹt thông thường (Magnetic/Barcode):** Dễ bị trầy xước, dễ sao chép mã và tiềm ẩn tình trạng chấm công hộ.
* **Nhận diện khuôn mặt (FaceID):** Đòi hỏi phần cứng đắt tiền (camera AI, máy chủ GPU), nhạy cảm với ánh sáng và góc nghiêng.
* **Chi phí thiết bị cồng kềnh:** Phòng Nhân sự (HR) phải mua đầu đọc thẻ chuyên dụng cắm cáp USB vào máy tính bàn để cấp thẻ mới.

### 2.2. Mục tiêu hệ thống
* **Tốc độ xử lý một chạm:** Thời gian xử lý từ khi chạm thẻ NFC đến khi hiển thị kết quả và phát âm thanh phản hồi đạt dưới $1.5\text{s}$.
* **Kiến trúc phân tầng chuẩn hóa (4-Tier Enterprise):** Phân tách độc lập giữa Backend API, CSDL SQL Server, Web Frontend và Mobile App.
* **Sáng kiến ứng dụng di động chế độ kép (Flutter Dual-Mode):**
  * *Chế độ Kiosk Trạm (Station Mode):* Đặt tại cửa ra vào, chạy trên máy tính bảng/điện thoại, hỗ trợ quẹt thẻ NFC/QR và hoạt động bền bỉ Offline-First khi mất kết nối mạng.
  * *Chế độ Trợ lý Nhân sự HR (Mobile HR Assistant):* Cài trên điện thoại cán bộ HR, tận dụng cảm biến NFC lưng máy để đọc mã định danh UID phần cứng và gán thẻ mới cho nhân viên trong $3\text{s}$ mà không cần mua đầu đọc thẻ USB.
* **Giám sát thời gian thực (Real-time Live Stream):** Cập nhật bảng công sống tức thì lên Web Admin qua SignalR WebSocket không cần tải lại trang.
* **Động cơ kiểm soát ca nghiêm ngặt (Strict Shift Enforcement):** Ngăn chặn gian lận quẹt thẻ sau khi ca kết thúc nếu chưa Check-In buổi sáng; tự động trừ thời gian nghỉ trưa và tính toán chính xác số phút trễ/sớm/tăng ca.

---

## 3. CÔNG NGHỆ SỬ DỤNG (TECH STACK)

| Phân hệ | Công nghệ / Nền tảng | Vai trò & Thư viện sử dụng |
| :--- | :--- | :--- |
| **Backend API** | ASP.NET Core Web API (.NET 8) | RESTful API, Controller-Service-Repository, ErrorHandlingMiddleware |
| **ORM & Data** | Entity Framework Core 8 | Code-First, DbContext, Migration, LINQ Queries |
| **Cơ sở dữ liệu** | Microsoft SQL Server | CSDL quan hệ chính `Nhom12_CT4` (9 bảng chuẩn 3NF, Non-Clustered Indexes) |
| **CSDL Cục bộ** | SQLite Engine (`sqflite`) | Lưu trữ bộ đệm chấm công ngoại tuyến trên thiết bị Kiosk |
| **Real-time Engine** | ASP.NET Core SignalR | WebSocket Hub (`/hubs/attendance`) phát sự kiện `ReceiveAttendanceEvent` |
| **Bảo mật & Định danh**| JWT Bearer + BCrypt | Access Token (8h), Refresh Token (7 ngày), Role-Based Access Control (RBAC) |
| **Mobile App** | Flutter Framework & Dart | Single Codebase (Android/iOS), kiến trúc Dual-Mode, Provider State Management |
| **Phần cứng & Ngoại vi**| NFC NTAG215 & QR Code | `nfc_manager` (đọc UID 7 bytes chip NXP), `mobile_scanner` (quét QR camera) |
| **Web Frontend** | React.js (Vite + Tailwind CSS) | Single Page Application (SPA), Dark Slate UI, Dashboard Realtime |
| **Báo cáo & Kết xuất** | ClosedXML (.xlsx) & PDF Export | Kết xuất bảng tổng hợp công tháng đa cột chuyên nghiệp |

---

## 4. KIẾN TRÚC HỆ THỐNG

### 4.1. Kiến trúc tổng thể 4 tầng (4-Tier Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        TẦNG CLIENT (TRÌNH DIỄN)                         │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────┐ │
│  │   Kiosk Chấm Công     │  │   Trợ Lý Nhân Sự HR   │  │  Web Admin  │ │
│  │ (Flutter Tablet -     │  │ (Flutter Mobile -     │  │  (React.js  │ │
│  │  Offline-First)       │  │  NFC Lưng Máy)        │  │  Tailwind)  │ │
│  └───────────┬───────────┘  └───────────┬───────────┘  └──────┬──────┘ │
└──────────────┼──────────────────────────┼─────────────────────┼────────┘
               │ (HTTP REST JSON)         │ (HTTP REST JSON)    │ (WebSocket SignalR)
               ▼                          ▼                     ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      TẦNG AN NINH & ĐỊNH TUYẾN MẠNG                     │
│               Reverse Proxy / HTTPS / SignalR Hub Routing              │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   TẦNG XỬ LÝ DOANH NGHIỆP (BACKEND)                    │
│   ASP.NET Core 8 Web API: 7 Controllers | 7 Services | Middleware      │
│   🧠 Business Engine:                                                  │
│      - Smart Tap Engine (Nhận diện Vào/Ra tự động)                     │
│      - Strict Shift Enforcement (Chặn gian lận ngoài ca)               │
│      - Auto Calculation (Trừ nghỉ trưa, tính trễ, sớm, tăng ca)        │
│      - Bulk Offline Sync Handler                                       │
└──────────────────┬─────────────────────────────────────────────────────┘
                   │
                   ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       TẦNG DỮ LIỆU (PERSISTENCE)                       │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────┐ │
│  │      Microsoft SQL Server       │   │    SQLite Cục Bộ (Kiosk)    │ │
│  │     (Database: Nhom12_CT4)      │   │   (offline_attendances)     │ │
│  └─────────────────────────────────┘   └─────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.2. Lược đồ Cơ sở Dữ liệu (Database Schema - 9 Bảng Quan Hệ)

1. **`Users`**: Tài khoản quản trị, đăng nhập và phân quyền (`ADMIN`, `HR`, `KIOSK`).
2. **`Employees`**: Hồ sơ nhân sự, mã nhân viên, phòng ban, trạng thái làm việc, chuỗi định danh mã QR.
3. **`NfcCards`**: Quản lý thẻ NFC vật lý, lưu trữ mã UID 7 bytes phần cứng, trạng thái (`ACTIVE`, `LOCKED`).
4. **`Shifts`**: Cấu hình ca làm việc tiêu chuẩn (giờ bắt đầu, giờ kết thúc, khung nghỉ trưa, phút ân hạn).
5. **`EmployeeShifts`**: Phân ca làm việc linh hoạt cho nhân sự theo từng thứ trong tuần (`DayOfWeek` 0 - 6).
6. **`Attendances`**: Dữ liệu quẹt thẻ thực tế (CheckIn, CheckOut, LateMinutes, EarlyMinutes, OvertimeMinutes, TotalWorkingMinutes, CheckInMethod, Status).
7. **`LeaveRequests`**: Quản lý đơn nghỉ phép (phép năm, nghỉ ốm, việc riêng) và trạng thái phê duyệt.
8. **`AuditLogs`**: Ghi vết kiểm toán bảo mật các thao tác quản trị trên hệ thống.
9. **`offline_attendances` (SQLite Cục Bộ Kiosk):** Bộ đệm dữ liệu tạm thời khi Kiosk mất mạng Internet (`isSynced = 0/1`).

---

## 5. DANH SÁCH 27 RESTFUL API ENDPOINTS (BACKEND SPECIFICATION)

### Phân hệ 1: Xác thực & Quản lý Phiên (Authentication)
* `POST /api/v1/auth/login`: Xác thực tài khoản bằng `BCrypt.Verify()`, cấp Access Token (8h) và Refresh Token (7 ngày).
* `POST /api/v1/auth/refresh`: Cấp mới Access Token khi hết hạn mà không cần đăng nhập lại.
* `POST /api/v1/auth/change-password`: Đổi mật khẩu tài khoản người dùng hiện hành.
* `GET /api/v1/auth/me`: Trích xuất thông tin người dùng từ JWT Claims.

### Phân hệ 2: Quản lý Nhân sự (Employees)
* `GET /api/v1/employees`: Danh sách nhân viên (hỗ trợ phân trang, lọc phòng ban, tìm kiếm theo tên/mã).
* `GET /api/v1/employees/{id}`: Chi tiết hồ sơ nhân viên kèm thông tin thẻ NFC và ca làm việc.
* `POST /api/v1/employees`: Thêm mới nhân sự, tự động sinh mã định danh QR Code duy nhất.
* `PUT /api/v1/employees/{id}`: Cập nhật thông tin hồ sơ nhân viên.
* `DELETE /api/v1/employees/{id}`: Xóa mềm nhân viên (chuyển trạng thái sang `INACTIVE`).
* `POST /api/v1/employees/{id}/qr`: Khởi tạo lại mã QR định danh cho nhân viên.
* `GET /api/v1/employees/{id}/qr`: Lấy chuỗi mã QR hiện tại của nhân viên để hiển thị hoặc in thẻ.

### Phân hệ 3: Quản lý Thẻ NFC (NFC Security)
* `POST /api/v1/nfc/assign`: Gán thẻ NTAG215 theo mã UID 7 bytes phần cứng cho nhân viên.
* `POST /api/v1/nfc/verify`: Kiểm tra tính hợp lệ và trạng thái kích hoạt của thẻ.
* `PUT /api/v1/nfc/{id}/status`: Khóa (`LOCKED`) hoặc kích hoạt lại thẻ NFC.
* `DELETE /api/v1/nfc/{id}`: Thu hồi và hủy liên kết thẻ khỏi hồ sơ nhân viên.

### Phân hệ 4: Ca làm việc & Phân ca (Shifts)
* `GET /api/v1/shifts`: Danh sách các ca làm việc đang kích hoạt trong hệ thống.
* `POST /api/v1/shifts`: Tạo mới ca làm việc (giờ bắt đầu, kết thúc, nghỉ trưa, ân hạn).
* `PUT /api/v1/shifts/{id}`: Điều chỉnh cấu hình khung giờ ca làm việc.
* `POST /api/v1/shifts/assign`: Phân ca làm việc cho nhân viên theo từng thứ trong tuần (`DayOfWeek`).

### Phân hệ 5: Điểm danh & Chấm công (Attendance Engine)
* `POST /api/v1/attendance/tap`: Quẹt chấm công thông minh 1 chạm (tự động phân luồng Vào/Ra, chặn ngoài ca).
* `POST /api/v1/attendance/check-in`: Ép ghi nhận Vào ca cưỡng bức trên trạm Kiosk.
* `POST /api/v1/attendance/check-out`: Ép ghi nhận Tan ca cưỡng bức trên trạm Kiosk.
* `GET /api/v1/attendance/today`: Giám sát danh sách điểm danh hôm nay (Today Monitor) phục vụ Web Admin và Mobile HR.
* `GET /api/v1/attendance/history`: Truy vấn lịch sử chấm công có bộ lọc ngày, phòng ban, nhân viên.
* `POST /api/v1/attendance/manual`: Điều chỉnh công thủ công (Bù công) có phê duyệt, gắn cờ `CheckInMethod = "MANUAL"`.
* `POST /api/v1/attendance/sync-offline`: Tiếp nhận mảng chấm công ngoại tuyến từ SQLite Kiosk (Bulk-Insert).

### Phân hệ 6: Quản lý Nghỉ phép (Leaves)
* `GET /api/v1/leaves`: Danh sách đơn xin nghỉ phép (hỗ trợ lọc `PENDING`, `APPROVED`, `REJECTED`).
* `POST /api/v1/leaves/{id}/approve`: Cán bộ HR/Admin duyệt hoặc từ chối đơn nghỉ phép kèm phản hồi.

### Phân hệ 7: Báo cáo & Kết xuất (Reporting)
* `GET /api/v1/reports/summary`: Thống kê các chỉ số KPI Dashboard ngày hôm nay.
* `GET /api/v1/reports/monthly`: Xuất báo cáo tổng hợp công tháng ra định dạng bảng tính Excel (`.xlsx`) qua ClosedXML và file PDF.

---

## 6. CÁC THUẬT TOÁN NGHIỆP VỤ NÒNG CỐT

### 6.1. Thuật toán phân luồng Vào ca / Tan ca tự động (Smart Tap Engine)
Tại trạm Kiosk, nhân viên chỉ cần chạm thẻ vào vùng đọc mà không cần bấm nút chọn loại quẹt:
* **Lần chạm 1 trong ngày** ($attendance == null$): Tự động ghi nhận lượt **`CHECK_IN`**.
* **Lần chạm 2 trở đi trong ngày** ($attendance \neq null$): Tự động ghi nhận lượt **`CHECK_OUT`** và kích hoạt bộ tính toán tổng thời gian làm việc.

### 6.2. Thuật toán kiểm soát khung ca nghiêm ngặt (Strict Shift Enforcement)
Ngăn chặn gian lận quẹt thẻ nhận vơ cuối ngày của nhân viên vắng mặt buổi sáng:
$$\text{Điều kiện chặn} = (attendance == null) \land (\text{ScanTime} \ge \text{Shift.EndTime})$$
* **Xử lý:** Backend từ chối bản ghi chấm công, trả về trạng thái `SHIFT_ENDED` và thông báo: *"Ca làm việc đã kết thúc. Bạn chưa Check-in nên không thể chấm công. Vui lòng liên hệ phòng Nhân sự để giải trình!"*. Kiosk bật Pop-up cảnh báo đỏ và phát tín hiệu Beep lỗi.

### 6.3. Công thức tính toán thời gian làm việc tự động
* **Số phút đi trễ (LateMinutes):**
  $$\text{LateThreshold} = \text{Shift.StartTime} + \text{Shift.GraceMinutes}$$
  $$\text{LateMinutes} = \max(0, \text{ScanTime} - \text{Shift.StartTime}) \quad \text{khi } \text{ScanTime} > \text{LateThreshold}$$
* **Số phút về sớm (EarlyMinutes):**
  $$\text{EarlyMinutes} = \max(0, \text{Shift.EndTime} - \text{ScanTime.TimeOfDay})$$
* **Số phút tăng ca (OvertimeMinutes):**
  $$\text{OvertimeMinutes} = \max(0, \text{ScanTime.TimeOfDay} - \text{Shift.EndTime})$$
* **Tổng thời gian làm việc thực tế (TotalWorkingMinutes):**
  $$\text{BreakDuration} = \text{Shift.BreakEnd} - \text{Shift.BreakStart}$$
  $$\text{TotalWorkingMinutes} = \max(0, (\text{CheckOut} - \text{CheckIn}) - \text{BreakDuration})$$

### 6.4. Cơ chế chấm công ngoại tuyến (Offline-First) & Tự động đồng bộ
1. Khi Kiosk gặp sự cố mất mạng (bắt ngoại lệ `SocketException`/`DioException`), dữ liệu quẹt thẻ lập tức được đóng gói và ghi vào bảng SQLite `offline_attendances` với trạng thái `isSynced = 0`.
2. Màn hình Kiosk hiển thị xác nhận: *"Đã lưu Offline! Sẽ tự đồng bộ khi có mạng"*.
3. Tiến trình nền `SyncService` chạy định kỳ 30 giây kiểm tra kết nối mạng. Khi phát hiện mạng khả dụng, service tự động gom mảng bản ghi gửi tới API `/api/v1/attendance/sync-offline` theo phương thức Bulk-Insert và cập nhật cờ `isSynced = 1`.

---

## 7. CẤU TRÚC THƯ MỤC NGUỒN (PROJECT STRUCTURE)

```text
├── NfcAttendance/                      # Phân hệ Backend ASP.NET Core 8 Web API
│   ├── Controllers/                    # 7 RESTful API Controllers
│   │   ├── AuthController.cs
│   │   ├── EmployeesController.cs
│   │   ├── NfcController.cs
│   │   ├── ShiftsController.cs
│   │   ├── AttendanceController.cs
│   │   ├── LeaveRequestsController.cs
│   │   └── ReportsController.cs
│   ├── Services/                       # 7 Business Services
│   │   ├── AuthService.cs
│   │   ├── EmployeeService.cs
│   │   ├── NfcSecurityService.cs
│   │   ├── ShiftService.cs
│   │   ├── AttendanceService.cs        # Smart Tap Engine & Strict Shift Enforcement
│   │   ├── LeaveRequestService.cs
│   │   └── ReportExportService.cs      # ClosedXML Engine
│   ├── Data/                           # Entity Framework Core 8 DbContext & DbInitializer
│   ├── Hubs/                           # SignalR Hub (AttendanceHub.cs)
│   ├── Middlewares/                    # ErrorHandlingMiddleware.cs
│   ├── Program.cs                      # Service Container, DI, CORS & Pipeline
│   └── appsettings.json                # Chuỗi kết nối CSDL và cấu hình JWT
│
├── mobile_app/                         # Phân hệ Mobile App Flutter Dual-Mode
│   ├── lib/
│   │   ├── main.dart                   # Khởi chạy ứng dụng & Thiết lập Provider
│   │   ├── models/                     # Data Models & DTOs
│   │   ├── providers/                  # Quản lý trạng thái (AuthState, AttendanceState)
│   │   ├── screens/
│   │   │   ├── kiosk/                  # Chế độ Trạm Kiosk
│   │   │   │   ├── kiosk_home_screen.dart
│   │   │   │   ├── qr_scanner_screen.dart
│   │   │   │   └── pin_dialog.dart
│   │   │   └── hr/                     # Chế độ Trợ lý Nhân sự HR
│   │   │       ├── hr_login_screen.dart
│   │   │       ├── hr_nfc_assign_screen.dart
│   │   │       └── hr_today_monitor_screen.dart
│   │   ├── services/                   # Dịch vụ phần cứng & mạng
│   │   │   ├── api_service.dart
│   │   │   ├── nfc_service.dart        # Tương tác thư viện nfc_manager
│   │   │   ├── offline_database_service.dart # Quản trị SQLite sqflite
│   │   │   └── sync_service.dart       # Tiến trình đồng bộ nền
│   │   └── widgets/                    # Thành phần giao diện (StatusBadge, TapDialog)
│   └── pubspec.yaml
│
└── frontend/                           # Phân hệ Web Quản trị React.js
    ├── src/
    │   ├── pages/
    │   │   ├── dashboard/              # Dashboard realtime qua SignalR
    │   │   ├── employees/              # Quản lý danh sách nhân sự & QR
    │   │   ├── shifts/                 # Quản lý ca & phân ca
    │   │   ├── attendance/             # Bảng công sống & lịch sử
    │   │   └── reports/                # Báo cáo thống kê & xuất Excel
    │   ├── components/
    │   │   └── modals/                 # ManualAttendanceModal.jsx (Bù công)
    │   └── services/                   # Axios API Client & SignalR Connection
    ├── package.json
    └── tailwind.config.js
```

---

## 8. HƯỚNG DẪN CÀI ĐẶT & CHẠY THỬ NGHIỆM (GETTING STARTED)

### 8.1. Yêu cầu môi trường tiền đề
* .NET SDK 8.0 trở lên.
* Microsoft SQL Server 2019/2022 (hoặc SQL Server Express).
* Flutter SDK (3.19+ trở lên) kèm Android Studio / Xcode.
* Node.js (phiên bản 18+ hoặc 20 LTS) kèm npm.
* Thiết bị Android thực tế có hỗ trợ cảm biến NFC phần cứng (để kiểm thử tính năng đọc thẻ lưng máy và quẹt thẻ trạm).

---

### 8.2. Cài đặt và Khởi chạy Backend API

1. Truy cập vào thư mục backend:
   ```bash
   cd NfcAttendance
   ```

2. Cấu hình chuỗi kết nối cơ sở dữ liệu trong file `appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=Nhom12_CT4;Trusted_Connection=True;TrustServerCertificate=True;"
     },
     "Jwt": {
       "Key": "SecretKeyBaoMatDuaVaoMoiTruongDoanhNghiepNhom12CT4NfcAttendanceKey2026",
       "Issuer": "NfcAttendanceBackend",
       "Audience": "NfcAttendanceClients"
     }
   }
   ```

3. Cài đặt thư viện và cập nhật lược đồ CSDL:
   ```bash
   dotnet restore
   dotnet ef database update
   ```
   *(Lưu ý: Hàm `DbInitializer.Initialize()` sẽ tự động kiểm tra và khởi tạo tài khoản mẫu kèm ca làm việc mặc định nếu CSDL mới tạo)*.

4. Khởi chạy máy chủ Web API:
   ```bash
   dotnet run
   ```
   * Endpoint Swagger: `http://localhost:5000/swagger` (hoặc cổng cấu hình tại máy bạn).
   * SignalR Hub Endpoint: `http://localhost:5000/hubs/attendance`.

---

### 8.3. Cài đặt và Khởi chạy Web Quản trị (Frontend React.js)

1. Truy cập thư mục frontend:
   ```bash
   cd frontend
   ```

2. Cài đặt các gói phụ thuộc:
   ```bash
   npm install
   ```

3. Khởi chạy môi trường phát triển:
   ```bash
   npm run dev
   ```
   * Truy cập giao diện quản trị tại: `http://localhost:5173`.

---

### 8.4. Cài đặt và Khởi chạy Ứng dụng Di động (Flutter Mobile App)

1. Truy cập thư mục ứng dụng di động:
   ```bash
   cd mobile_app
   ```

2. Tải toàn bộ thư viện dependencies:
   ```bash
   flutter pub get
   ```

3. Cấu hình địa chỉ IP máy chủ Backend trong cấu hình ứng dụng:
   * Nếu chạy trên thiết bị thật: Đổi địa chỉ `baseUrl` thành IP mạng LAN của máy tính đang chạy Backend (ví dụ `http://192.168.1.10:5000`).
   * Nếu chạy trên Android Emulator: Sử dụng `http://10.0.2.2:5000`.

4. Biên dịch và khởi chạy trên thiết bị Android:
   ```bash
   flutter run
   ```

---

## 9. TÀI KHOẢN MẪU & DỮ LIỆU ĐỊNH NẠP BAN ĐẦU

Sau khi thực thi `DbInitializer`, hệ thống nạp sẵn các tài khoản quản trị và dữ liệu mẫu sau:

| Tên đăng nhập | Mật khẩu mẫu | Quyền hạn (Role) | Mục đích sử dụng |
| :--- | :--- | :--- | :--- |
| `admin` | `123123` | `ADMIN` | Quản trị toàn hệ thống, quản lý thiết bị Kiosk, cấu hình trạm |
| `hr` | `123123` | `HR` | Quản trị nhân sự, gán thẻ NFC trên mobile, duyệt nghỉ phép, bù công |
| `kiosk01` | `123123` | `KIOSK` | Tài khoản dành riêng cho máy trạm đặt tại cổng ra vào |

* **Mã PIN quản trị trạm Kiosk:** `123456` (Dùng để mở khóa menu cấu hình trên màn hình Kiosk).
* **Ca làm việc mặc định:** `Ca Hành Chính` (Thời gian: `08:00 - 17:30`, Nghỉ trưa: `12:00 - 13:30`, Ân hạn đi trễ: `15 phút`).

---

## 10. MA TRẬN KIỂM TRẢ LUỒNG HOẠT ĐỘNG (END-TO-END FLOW AUDIT)

| Mã Luồng | Kịch bản kiểm thử | Phân hệ tham gia | Kết quả kỳ vọng | Đánh giá |
| :---: | :--- | :--- | :--- | :---: |
| **FLOW-01** | Cấp mới thẻ NFC | HR Mobile App $\rightarrow$ API $\rightarrow$ SQL | Áp thẻ NTAG215 vào lưng điện thoại, đọc UID 7 bytes và gán nhân viên trong 3s | **ĐẠT** |
| **FLOW-02** | Chấm công Vào ca đúng giờ | Kiosk $\rightarrow$ API $\rightarrow$ SignalR $\rightarrow$ Web | Quẹt thẻ lúc 07:45 (ca 08:00), Check-In `ON_TIME`, SignalR cập nhật Dashboard ngay | **ĐẠT** |
| **FLOW-03** | Chấm công Vào ca đi trễ | Kiosk $\rightarrow$ API $\rightarrow$ SignalR $\rightarrow$ Web | Quẹt thẻ lúc 08:25 (ân hạn 15p), Check-In `LATE`, trễ 25 phút, tăng bộ đếm trễ | **ĐẠT** |
| **FLOW-04** | Chấm công Tan ca & Tăng ca | Kiosk $\rightarrow$ API $\rightarrow$ SignalR $\rightarrow$ Web | Quẹt lần 2 lúc 18:30 (ca tan 17:30), trừ giờ nghỉ trưa, hiện 2 badge `[Hoàn thành]` & `[Tăng ca +60p]` | **ĐẠT** |
| **FLOW-05** | Chặn gian lận quẹt ngoài ca | Kiosk $\rightarrow$ Backend Engine | Chưa Check-in sáng, quẹt lúc 17:45; chặn mã `SHIFT_ENDED`, bật Pop-up đỏ và Beep lỗi | **ĐẠT** |
| **FLOW-06** | Quét QR Code dự phòng | Kiosk Camera $\rightarrow$ API $\rightarrow$ SQL | Quên thẻ NFC, đưa mã QR vào camera, nhận diện GUID $<500\text{ms}$, ghi nhận thành công | **ĐẠT** |
| **FLOW-07** | Chấm công khi mất mạng | Kiosk Flutter App $\rightarrow$ SQLite | Mất Internet, lưu đệm vào bảng SQLite `offline_attendances`, Kiosk báo *"Đã lưu Offline"* | **ĐẠT** |
| **FLOW-08** | Tự động đồng bộ ngầm | `SyncService` $\rightarrow$ Bulk Sync API | Có mạng trở lại, service quét bản ghi `isSynced = 0`, đẩy hàng loạt lên SQL Server | **ĐẠT** |
| **FLOW-09** | Bù công thủ công | Web Admin $\rightarrow$ Backend Service | Cán bộ HR mở modal bù công, nhập giờ thực tế, gán cờ `CheckInMethod = "MANUAL"` | **ĐẠT** |
| **FLOW-10** | Xuất báo cáo bảng công | Web Admin $\rightarrow$ ClosedXML Engine | Chọn tháng/năm, xuất file Excel `.xlsx` tổng hợp đầy đủ các cột công chuẩn kế toán | **ĐẠT** |

---

## 11. BẢN QUYỀN & GIẤY PHÉP

Dự án được xây dựng và sở hữu bởi **Nhóm 12 - Lớp 23DTHC4 (Khoa Công nghệ Thông tin, Đại học Công nghệ TP. HCM - HUTECH)** phục vụ mục đích nghiên cứu, học tập và nghiệm thu đề tài môn học *Lập trình trên thiết bị di động*.
