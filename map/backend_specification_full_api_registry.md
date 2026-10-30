 TÀI LIỆU KỸ THUẬT CHI TIẾT TẦNG BACKEND (ASP.NET CORE 8 WEB API)

> **Mã tài liệu**: `zy.md`  
> **Hệ thống**: NFC Attendance System (Hệ thống Chấm công NFC Kiosk Doanh nghiệp)  
> **Nền tảng**: .NET 8 (C#) | Microsoft SQL Server | SignalR | Entity Framework Core 8  
> **Quy chuẩn**: Giữ nguyên toàn bộ 100% chức năng đã được quy định, không thêm, không bớt.

---

## 1. CẤU TRÚC CÂY THƯ MỤC CHUẨN ĐỒ ÁN (BACKEND)

```text
backend/
│
└── src/
    └── NfcAttendance.Api/
        │
        ├── Controllers/
        │   ├── AttendanceController.cs
        │   ├── AuthController.cs
        │   ├── EmployeesController.cs
        │   ├── LeaveRequestsController.cs
        │   ├── NfcController.cs
        │   ├── ReportsController.cs
        │   └── ShiftsController.cs
        │
        ├── Data/
        │   ├── DbInitializer.cs
        │   └── NfcAttendanceDbContext.cs
        │
        ├── DTOs/
        │   ├── AttendanceDtos.cs
        │   ├── AuthDtos.cs
        │   ├── EmployeeDtos.cs
        │   ├── LeaveDtos.cs
        │   ├── NfcDtos.cs
        │   ├── ReportDtos.cs
        │   └── ShiftDtos.cs
        │
        ├── Entities/
        │   ├── Attendance.cs
        │   ├── AuditLog.cs
        │   ├── Employee.cs
        │   ├── EmployeeShift.cs
        │   ├── KioskDevice.cs
        │   ├── LeaveRequest.cs
        │   ├── NfcCard.cs
        │   ├── Shift.cs
        │   └── User.cs
        │
        ├── Hubs/
        │   └── AttendanceHub.cs
        │
        ├── Middlewares/
        │   └── ErrorHandlingMiddleware.cs
        │
        ├── Services/
        │   ├── AttendanceService.cs
        │   ├── AuthService.cs
        │   ├── EmployeeService.cs
        │   ├── LeaveRequestService.cs
        │   ├── NfcSecurityService.cs
        │   ├── ReportExportService.cs
        │   └── ShiftService.cs
        │
        ├── appsettings.json
        ├── appsettings.Development.json
        ├── NfcAttendance.Api.csproj
        └── Program.cs
```

---

## 2. CHI TIẾT CHỨC NĂNG TỪNG FILE TRONG BACKEND

### A. Thư mục `Controllers/` (Tiếp nhận HTTP Request & Điều hướng)
1. **`AuthController.cs`**: Tiếp nhận các yêu cầu xác thực tài khoản: Đăng nhập hệ thống (`login`), cấp lại JWT (`refresh`), và lấy hồ sơ tài khoản hiện hành (`me`).
2. **`AttendanceController.cs`**: Tiếp nhận lượt quẹt thẻ Check-In / Check-Out từ Kiosk (NFC hoặc QR), cung cấp dữ liệu màn hình Today Monitor, lịch sử chấm công có lọc, điều chỉnh công thủ công và nhận gói đồng bộ offline.
3. **`EmployeesController.cs`**: Tiếp nhận các thao tác quản lý hồ sơ nhân viên: Danh sách phân trang/tìm kiếm, tạo mới, cập nhật thông tin và vô hiệu hóa tài khoản.
4. **`NfcController.cs`**: Tiếp nhận các thao tác liên quan trực tiếp đến thẻ NFC: Gán thẻ NTAG215 UID cho nhân viên, thu hồi/khóa thẻ và xác thực thẻ bảo mật (kiểm tra password/pack).
5. **`ShiftsController.cs`**: Tiếp nhận cấu hình danh mục ca làm việc (giờ vào/ra, giờ nghỉ, phút ân hạn) và thiết lập phân ca làm việc theo tuần cho nhân sự.
6. **`LeaveRequestsController.cs`**: Tiếp nhận luồng xử lý đơn nghỉ phép: Gửi đơn, xem danh sách đơn theo trạng thái (chờ duyệt, đã duyệt, từ chối) và duyệt/từ chối đơn.
7. **`ReportsController.cs`**: Cung cấp số liệu thống kê tổng hợp phục vụ biểu đồ Dashboard, trích xuất và tải file Excel bảng công chi tiết (`.xlsx`) cùng file tổng hợp PDF.

---

### B. Thư mục `Data/` (Quản lý CSDL & Khởi tạo)
1. **`NfcAttendanceDbContext.cs`**: Kế thừa `DbContext` của Entity Framework Core, ánh xạ 9 thực thể (Entities) thành các bảng trong Microsoft SQL Server, cấu hình quan hệ khóa ngoại (1-N, N-N), kiểu dữ liệu SQL (TIME, DATE, DATETIME2, DECIMAL) và tạo chỉ mục (Non-Clustered Indexes) tối ưu truy vấn.
2. **`DbInitializer.cs`**: Tự động kiểm tra và khởi tạo dữ liệu mồi (Seed Data) khi server chạy lần đầu: Tạo tài khoản quản trị mặc định (`admin`), cấu hình ca hành chính chuẩn và nhân viên kèm thẻ mẫu.

---

### C. Thư mục `Entities/` (Mô hình Bảng CSDL - C# Classes)
1. **`User.cs`**: Bảng `Users` - Tài khoản quản trị và thiết bị (`Username`, `PasswordHash`, `Role`: ADMIN/HR/KIOSK, `IsActive`).
2. **`Employee.cs`**: Bảng `Employees` - Hồ sơ nhân sự (`EmployeeCode`, `FullName`, `Phone`, `Email`, `Department`, `Position`, `Status`).
3. **`NfcCard.cs`**: Bảng `NfcCards` - Thẻ NFC NTAG215 gán cho nhân sự (`Uid`, `CardType`, `IsProtected`, `Status`).
4. **`Shift.cs`**: Bảng `Shifts` - Danh mục ca làm việc (`StartTime`, `EndTime`, `BreakStart`, `BreakEnd`, `GraceMinutes`).
5. **`EmployeeShift.cs`**: Bảng `EmployeeShifts` - Phân ca làm theo thứ trong tuần (`DayOfWeek`, `EffectiveFrom`, `EffectiveTo`).
6. **`Attendance.cs`**: Bảng `Attendances` - Bản ghi chấm công (`Date`, `CheckIn`, `CheckOut`, `LateMinutes`, `EarlyMinutes`, `OvertimeMinutes`, `TotalWorkingMinutes`, `Status`, `CheckInMethod`, `DeviceId`).
7. **`LeaveRequest.cs`**: Bảng `LeaveRequests` - Đơn xin nghỉ phép (`LeaveType`, `StartDate`, `EndDate`, `TotalDays`, `Reason`, `Status`, `ApproverId`, `ApprovedAt`, `Note`).
8. **`KioskDevice.cs`**: Bảng `KioskDevices` - Quản lý máy chấm công trạm (`DeviceId`, `DeviceName`, `IpAddress`, `LastOnlineAt`, `IsActive`).
9. **`AuditLog.cs`**: Bảng `AuditLogs` - Nhật ký an toàn và kiểm toán hệ thống (`Action`, `Details`, `IpAddress`, `CreatedAt`).

---

### D. Thư mục `DTOs/` (Data Transfer Objects)
1. **`AuthDtos.cs`**: Các model dữ liệu đăng nhập (`LoginRequestDto`, `LoginResponseDto`, `RefreshTokenDto`).
2. **`AttendanceDtos.cs`**: Model quẹt thẻ Kiosk (`CheckInRequestDto`), dữ liệu phản hồi nhanh 3 giây (`CheckInResponseDto`), gói đồng bộ (`SyncOfflineRequestDto`) và lịch sử chấm công.
3. **`EmployeeDtos.cs`**: DTO thêm mới (`CreateEmployeeDto`), chỉnh sửa (`UpdateEmployeeDto`) và phản hồi thông tin nhân sự.
4. **`NfcDtos.cs`**: DTO gán thẻ (`AssignNfcDto`), thu hồi thẻ và xác thực thẻ bảo mật.
5. **`ShiftDtos.cs`**: DTO khai báo ca làm (`ShiftDto`) và phân ca tuần (`AssignShiftDto`).
6. **`LeaveDtos.cs`**: DTO gửi đơn nghỉ (`CreateLeaveRequestDto`) và duyệt đơn (`UpdateLeaveStatusDto`).
7. **`ReportDtos.cs`**: DTO tổng hợp chỉ số Dashboard và cấu hình xuất báo cáo.

---

### E. Thư mục `Services/` (Tầng Xử lý Nghiệp vụ Logic Cốt Lõi)
1. **`AuthService.cs`**: Kiểm tra mật khẩu băm BCrypt, sinh chuỗi JWT Bearer Token, kiểm tra quyền truy cập Role-Based.
2. **`AttendanceService.cs`**: Động cơ chấm công chính: Nhận diện ca làm, tính số phút đi trễ (`LateMinutes`), về sớm (`EarlyMinutes`), tăng ca (`OvertimeMinutes`), tính tổng thời gian làm việc thực tế (`TotalWorkingMinutes`), xử lý lưu trữ an toàn trong Transaction và kích hoạt SignalR broadcast.
3. **`EmployeeService.cs`**: Xử lý logic nghiệp vụ nhân viên, kiểm tra trùng mã NV, ràng buộc quan hệ thẻ.
4. **`NfcSecurityService.cs`**: Xử lý xác thực bảo mật thẻ NTAG215 (mã hóa PWD/PACK chống làm giả thẻ).
5. **`ShiftService.cs`**: Logic quản lý ca, đối chiếu lịch phân ca theo tuần của từng nhân viên.
6. **`LeaveRequestService.cs`**: Luồng xử lý đơn nghỉ, tính toán tổng số ngày nghỉ và cập nhật trạng thái phê duyệt.
7. **`ReportExportService.cs`**: Xử lý đọc CSDL và tạo file Excel (.xlsx) qua thư viện ClosedXML/EPPlus cùng định dạng tài liệu PDF qua QuestPDF.

---

### F. Thư mục `Hubs/`, `Middlewares/` & Cấu hình Gốc
1. **`Hubs/AttendanceHub.cs`**: Kênh WebSockets của SignalR, chịu trách nhiệm bắn sự kiện quẹt thẻ tức thì từ Backend tới giao diện Web Admin Today Monitor.
2. **`Middlewares/ErrorHandlingMiddleware.cs`**: Bộ bắt lỗi toàn cục (Global Exception Handler), đóng gói lỗi dưới chuẩn JSON an toàn, ngăn lộ thông tin nhạy cảm.
3. **`appsettings.json`**: Lưu trữ chuỗi kết nối SQL Server (`DefaultConnection`), cấu hình JWT Token (`Secret`, `Issuer`, `Audience`), cấu hình bảo mật NFC và danh sách CORS cho React Web.
4. **`Program.cs`**: Điểm khởi động ứng dụng: Thiết lập DI Container, nạp Entity Framework, cấu hình JWT Authentication, CORS, Swagger UI và định tuyến kết nối SignalR Hub.

---

## 3. DANH SÁCH CHI TIẾT TẤT CẢ CÁC ENDPOINT API (BACKEND API REGISTRY)

Toàn bộ hệ thống giao tiếp qua chuẩn **RESTful JSON** với tiền tố chuẩn `/api/v1`:

```
┌──────┬────────────────────────────────────────────────────────────────────────────────────────┐
│ NHÓM │ DANH SÁCH CÁC ENDPOINT ĐƯỢC QUY ĐỊNH CHUẨN                                             │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  A   │ 1. POST   /api/v1/auth/login                                                           │
│      │ 2. POST   /api/v1/auth/refresh                                                         │
│      │ 3. GET    /api/v1/auth/me                                                              │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  B   │ 4. GET    /api/v1/employees                                                            │
│      │ 5. POST   /api/v1/employees                                                            │
│      │ 6. PUT    /api/v1/employees/{id}                                                       │
│      │ 7. DELETE /api/v1/employees/{id}                                                       │
│      │ 8. POST   /api/v1/nfc/assign                                                           │
│      │ 9. POST   /api/v1/nfc/revoke                                                           │
│      │ 10. POST  /api/v1/nfc/verify                                                           │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  C   │ 11. GET   /api/v1/shifts                                                               │
│      │ 12. POST  /api/v1/shifts                                                               │
│      │ 13. PUT   /api/v1/shifts/{id}                                                          │
│      │ 14. DELETE/api/v1/shifts/{id}                                                          │
│      │ 15. POST  /api/v1/shifts/assign                                                        │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  D   │ 16. POST  /api/v1/attendance/check-in                                                  │
│      │ 17. POST  /api/v1/attendance/check-out                                                 │
│      │ 18. GET   /api/v1/attendance/today                                                     │
│      │ 19. GET   /api/v1/attendance/history                                                   │
│      │ 20. POST  /api/v1/attendance/manual                                                    │
│      │ 21. POST  /api/v1/attendance/sync-offline                                              │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  E   │ 22. GET   /api/v1/leave-requests                                                       │
│      │ 23. POST  /api/v1/leave-requests                                                       │
│      │ 24. PATCH /api/v1/leave-requests/{id}/status                                           │
├──────┼────────────────────────────────────────────────────────────────────────────────────────┤
│  F   │ 25. GET   /api/v1/reports/summary                                                      │
│      │ 26. GET   /api/v1/reports/export/excel                                                 │
│      │ 27. GET   /api/v1/reports/export/pdf                                                   │
└──────┴────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### A. Nhóm Xác thực & Phân quyền (`/api/v1/auth`)

#### 1. Đăng nhập hệ thống
* **Endpoint**: `POST /api/v1/auth/login`
* **Mục đích**: Xác thực Admin, HR hoặc máy Kiosk; trả về JWT Bearer Token.
* **Quyền truy cập**: Public.
* **Request Body**:
```json
{
  "username": "admin",
  "password": "Admin@123"
}
```
* **Response Body (200 OK)**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "username": "admin",
  "role": "ADMIN",
  "message": "Đăng nhập thành công!"
}
```

#### 2. Cấp lại Token
* **Endpoint**: `POST /api/v1/auth/refresh`
* **Mục đích**: Làm mới chuỗi JWT đã hết hạn bằng token refresh hợp lệ.
* **Quyền truy cập**: Public.

#### 3. Lấy thông tin tài khoản hiện hành
* **Endpoint**: `GET /api/v1/auth/me`
* **Mục đích**: Trả về thông tin danh tính và vai trò của tài khoản đang đăng nhập từ Header Token.
* **Quyền truy cập**: Yêu cầu Bearer Token (`ADMIN`, `HR`, `KIOSK`).

---

### B. Nhóm Quản lý Nhân sự & Thẻ NFC (`/api/v1/employees` & `/api/v1/nfc`)

#### 4. Danh sách nhân viên
* **Endpoint**: `GET /api/v1/employees`
* **Mục đích**: Lấy danh sách nhân viên; hỗ trợ phân trang (`pageIndex`, `pageSize`) và lọc theo phòng ban (`department`), tìm kiếm từ khóa (`search`).
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 5. Thêm nhân viên mới
* **Endpoint**: `POST /api/v1/employees`
* **Mục đích**: Tạo mới hồ sơ nhân sự vào hệ thống.
* **Request Body**:
```json
{
  "employeeCode": "NV002",
  "fullName": "Trần Thị B",
  "phone": "0987654321",
  "email": "b.tran@company.com",
  "department": "Phòng Kế toán",
  "position": "Chuyên viên kế toán"
}
```

#### 6. Chỉnh sửa hồ sơ nhân viên
* **Endpoint**: `PUT /api/v1/employees/{id}`
* **Mục đích**: Cập nhật thông tin nhân viên theo ID.
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 7. Vô hiệu hóa nhân viên
* **Endpoint**: `DELETE /api/v1/employees/{id}`
* **Mục đích**: Chuyển trạng thái nhân sự thành `INACTIVE`.
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 8. Gán thẻ NFC cho nhân viên
* **Endpoint**: `POST /api/v1/nfc/assign`
* **Mục đích**: Liên kết mã UID của thẻ NTAG215 với một nhân viên cụ thể.
* **Request Body**:
```json
{
  "employeeId": 1,
  "uid": "04A1B2C3D4E5F6",
  "cardType": "NTAG215"
}
```

#### 9. Thu hồi hoặc khóa thẻ NFC
* **Endpoint**: `POST /api/v1/nfc/revoke`
* **Mục đích**: Chuyển trạng thái thẻ sang `LOCKED` khi nhân viên báo mất thẻ.
* **Request Body**:
```json
{
  "cardUid": "04A1B2C3D4E5F6",
  "reason": "Mất thẻ"
}
```

#### 10. Xác thực thẻ NFC bảo mật
* **Endpoint**: `POST /api/v1/nfc/verify`
* **Mục đích**: Kiểm tra thẻ NTAG215 hợp lệ, chống sao chép giả mạo thẻ qua đối chiếu khóa mật khẩu PWD/PACK.
* **Quyền truy cập**: `KIOSK`, `ADMIN`.

---

### C. Nhóm Ca làm việc & Phân ca (`/api/v1/shifts`)

#### 11. Danh sách ca làm việc
* **Endpoint**: `GET /api/v1/shifts`
* **Mục đích**: Lấy toàn bộ danh mục các ca làm việc đang hoạt động.
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 12. Tạo ca làm việc mới
* **Endpoint**: `POST /api/v1/shifts`
* **Mục đích**: Khai báo ca làm mới.
* **Request Body**:
```json
{
  "name": "Ca Sáng",
  "startTime": "06:00:00",
  "endTime": "14:00:00",
  "breakStart": "11:30:00",
  "breakEnd": "12:30:00",
  "graceMinutes": 10
}
```

#### 13. Cập nhật ca làm việc
* **Endpoint**: `PUT /api/v1/shifts/{id}`
* **Mục đích**: Cập nhật lại khung giờ và số phút cho phép đi trễ của ca.
* **Quyền truy cập**: `ADMIN`.

#### 14. Xóa ca làm việc
* **Endpoint**: `DELETE /api/v1/shifts/{id}`
* **Mục đích**: Ngừng kích hoạt một ca làm việc.
* **Quyền truy cập**: `ADMIN`.

#### 15. Phân ca làm việc theo tuần
* **Endpoint**: `POST /api/v1/shifts/assign`
* **Mục đích**: Thiết lập lịch làm việc tuần cho nhân viên theo các thứ.
* **Request Body**:
```json
{
  "employeeId": 1,
  "shiftId": 1,
  "dayOfWeek": 1,
  "effectiveFrom": "2026-11-01"
}
```

---

### D. Nhóm Chấm công & Xử lý Kiosk (`/api/v1/attendance`)

#### 16. Ghi nhận vào ca (Check-In)
* **Endpoint**: `POST /api/v1/attendance/check-in`
* **Mục đích**: Tiếp nhận quẹt thẻ NFC UID hoặc mã QR. Tự động nhận diện ca, tính `LateMinutes`. Phát sự kiện SignalR tới Web Admin Today Monitor.
* **Request Body**:
```json
{
  "cardUid": "04A1B2C3D4E5F6",
  "qrPayload": null,
  "checkInMethod": "NFC",
  "deviceId": "KIOSK_GATE_01",
  "timestamp": "2026-10-30T08:05:00"
}
```
* **Response Body (200 OK)**:
```json
{
  "success": true,
  "action": "CHECK_IN",
  "employeeCode": "NV001",
  "fullName": "Nguyễn Văn A",
  "department": "Phòng Kỹ thuật",
  "avatarUrl": null,
  "timestamp": "2026-10-30T08:05:00",
  "status": "ON_TIME",
  "message": "Check-in thành công (Đúng giờ)"
}
```

#### 17. Ghi nhận ra ca (Check-Out)
* **Endpoint**: `POST /api/v1/attendance/check-out`
* **Mục đích**: Ghi nhận giờ về. Tự tính `EarlyMinutes`, `OvertimeMinutes` và `TotalWorkingMinutes` (đã trừ giờ nghỉ trưa).
* **Quyền truy cập**: `KIOSK`, `ADMIN`.

#### 18. Giám sát dữ liệu hôm nay (Today Monitor)
* **Endpoint**: `GET /api/v1/attendance/today`
* **Mục đích**: Trả về toàn bộ danh sách nhân viên đã check-in/check-out trong ngày hôm nay phục vụ hiển thị trên Web.
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 19. Xem lịch sử chấm công
* **Endpoint**: `GET /api/v1/attendance/history`
* **Mục đích**: Tra cứu lịch sử có bộ lọc theo khoảng ngày (`fromDate`, `toDate`), phòng ban (`department`) hoặc ID nhân viên (`employeeId`).
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 20. Điều chỉnh công thủ công
* **Endpoint**: `POST /api/v1/attendance/manual`
* **Mục đích**: Cho phép Admin/HR sửa giờ vào/ra khi nhân viên quên quẹt thẻ.
* **Request Body**:
```json
{
  "employeeId": 1,
  "date": "2026-10-30",
  "checkIn": "2026-10-30T08:00:00",
  "checkOut": "2026-10-30T17:30:00",
  "status": "COMPLETED"
}
```

#### 21. Tiếp nhận gói chấm công ngoại tuyến (Sync Offline)
* **Endpoint**: `POST /api/v1/attendance/sync-offline`
* **Mục đích**: Nhận gói chấm công offline từ Kiosk khi có mạng lại; chạy Bulk Insert an toàn trong một SQL Transaction.
* **Request Body**:
```json
{
  "deviceId": "KIOSK_GATE_01",
  "records": [
    {
      "cardUid": "04A1B2C3D4E5F6",
      "checkInMethod": "NFC",
      "timestamp": "2026-10-30T07:55:00"
    }
  ]
}
```

---

### E. Nhóm Đơn nghỉ phép (`/api/v1/leave-requests`)

#### 22. Danh sách đơn nghỉ phép
* **Endpoint**: `GET /api/v1/leave-requests`
* **Mục đích**: Lấy danh sách đơn nghỉ; lọc theo trạng thái (`PENDING`, `APPROVED`, `REJECTED`).
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 23. Gửi đơn xin nghỉ phép
* **Endpoint**: `POST /api/v1/leave-requests`
* **Mục đích**: Tạo đơn xin nghỉ phép mới (nghỉ phép năm, nghỉ ốm, việc riêng).
* **Request Body**:
```json
{
  "employeeId": 1,
  "leaveType": "ANNUAL",
  "startDate": "2026-11-05",
  "endDate": "2026-11-06",
  "totalDays": 2.0,
  "reason": "Giải quyết việc cá nhân"
}
```

#### 24. Phê duyệt hoặc từ chối đơn
* **Endpoint**: `PATCH /api/v1/leave-requests/{id}/status`
* **Mục đích**: Cập nhật trạng thái duyệt đơn (`APPROVED` hoặc `REJECTED`) kèm ghi chú của người duyệt.
* **Request Body**:
```json
{
  "status": "APPROVED",
  "note": "Đồng ý phê duyệt nghỉ 2 ngày."
}
```

---

### F. Nhóm Báo cáo & Thống kê (`/api/v1/reports`)

#### 25. Thống kê tổng quan Dashboard
* **Endpoint**: `GET /api/v1/reports/summary`
* **Mục đích**: Trả về 4 số liệu trọng tâm: Tổng nhân viên, Đang làm việc hôm nay, Đi trễ hôm nay, Nghỉ phép hôm nay.
* **Response Body (200 OK)**:
```json
{
  "totalEmployees": 45,
  "attendedToday": 38,
  "lateToday": 3,
  "onLeaveToday": 2
}
```

#### 26. Xuất bảng công chi tiết ra file Excel (.xlsx)
* **Endpoint**: `GET /api/v1/reports/export/excel?month=10&year=2026`
* **Mục đích**: Xử lý dữ liệu bảng công cả tháng và xuất file Excel dạng nhị phân (`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`) sử dụng ClosedXML / EPPlus.
* **Quyền truy cập**: `ADMIN`, `HR`.

#### 27. Xuất bảng tổng hợp chấm công ra file PDF
* **Endpoint**: `GET /api/v1/reports/export/pdf?month=10&year=2026`
* **Mục đích**: Xuất file PDF tổng hợp ngày công sử dụng QuestPDF.
* **Quyền truy cập**: `ADMIN`, `HR`.

---

## 4. KẾT NỐI REALTIME SIGNALR HUB

* **Hub Endpoint**: `/hubs/attendance`
* **Sự kiện phát**: `ReceiveAttendanceEvent`
* **Payload nhận được trên Web ReactJS**:
```json
{
  "success": true,
  "action": "CHECK_IN",
  "employeeCode": "NV001",
  "fullName": "Nguyễn Văn A",
  "department": "Phòng Kỹ thuật",
  "timestamp": "2026-10-30T08:05:00",
  "status": "ON_TIME",
  "message": "Check-in thành công (Đúng giờ)"
}
```
* **Mục đích**: Đẩy dữ liệu trực tiếp khi Kiosk quét thẻ thành công tới màn hình Web Today Monitor mà không cần người dùng nhấn F5 tải lại trang.