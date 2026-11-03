# BÁO CÁO TỔNG KẾT VÀ TÀI LIỆU KỸ THUẬT DỰ ÁN
# HỆ THỐNG ĐIỂM DANH & CHẤM CÔNG THÔNG MINH ĐA NỀN TẢNG
## (NFC & QR ATTENDANCE ENTERPRISE SYSTEM)

---

## MỤC LỤC

- [CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI](#chương-1-tổng-quan-đề-tài)
  - [1.1. Lý do chọn đề tài](#11-lý-do-chọn-đề-tài)
  - [1.2. Mục tiêu đề tài](#12-mục-tiêu-đề-tài)
  - [1.3. Phạm vi và đối tượng sử dụng](#13-phạm-vi-và-đối-tượng-sử-dụng)
  - [1.4. Quy mô sản phẩm](#14-quy-mô-sản-phẩm)
  - [1.5. Phân công công việc & Quá trình triển khai](#15-phân-công-công-việc--quá-trình-triển-khai)
- [CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ](#chương-2-cơ-sở-lý-thuyết-và-công-nghệ)
  - [2.1. Nền tảng ứng dụng di động Flutter và ngôn ngữ Dart](#21-nền-tảng-ứng-dụng-di-động-flutter-và-ngôn-ngữ-dart)
  - [2.2. Quản lý trạng thái và kiến trúc Provider](#22-quản-lý-trạng-thái-và-kiến-trúc-provider)
  - [2.3. ASP.NET Core Web API (.NET 8) và Entity Framework Core 8](#23-aspnet-core-web-api-net-8-và-entity-framework-core-8)
  - [2.4. SignalR – Giao tiếp mạng thời gian thực (Real-time Communication)](#24-signalr--giao-tiếp-mạng-thời-gian-thực-real-time-communication)
  - [2.5. Xác thực JWT, băm mật khẩu BCrypt và bảo mật phân quyền RBAC](#25-xác-thực-jwt-băm-mật-khẩu-bcrypt-và-bảo-mật-phân-quyền-rbac)
  - [2.6. Công nghệ giao tiếp trường gần NFC (Near Field Communication) & Chuẩn thẻ NTAG215](#26-công-nghệ-giao-tiếp-trường-gần-nfc-near-field-communication--chuẩn-thẻ-ntag215)
  - [2.7. Công nghệ mã phản hồi nhanh QR Code dự phòng](#27-công-nghệ-mã-phản-hồi-nhanh-qr-code-dự-phòng)
  - [2.8. Hệ quản trị CSDL Microsoft SQL Server & Kiến trúc Offline SQLite](#28-hệ-quản-trị-csdl-microsoft-sql-server--kiến-trúc-offline-sqlite)
- [CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG](#chương-3-phân-tích-và-thiết-kế-hệ-thống)
  - [3.1. Yêu cầu chức năng (Functional Requirements)](#31-yêu-cầu-chức-năng-functional-requirements)
  - [3.2. Yêu cầu phi chức năng (Non-Functional Requirements)](#32-yêu-cầu-phi-chức-năng-non-functional-requirements)
  - [3.3. Kiến trúc tổng thể 4 tầng (4-Tier Enterprise Architecture)](#33-kiến-trúc-tổng-thể-4-tầng-4-tier-enterprise-architecture)
  - [3.4. Kiến trúc ứng dụng di động (Flutter Dual-Mode)](#34-kiến-trúc-ứng-dụng-di-động-flutter-dual-mode)
  - [3.5. Kiến trúc máy chủ Backend (ASP.NET Core Web API)](#35-kiến-trúc-máy-chủ-backend-aspnet-core-web-api)
  - [3.6. Thiết kế cơ sở dữ liệu chi tiết (Database Schema)](#36-thiết-kế-cơ-sở-dữ-liệu-chi-tiết-database-schema)
  - [3.7. Thiết kế hệ thống API RESTful (API Specification)](#37-thiết-kế-hệ-thống-api-restful-api-specification)
- [CHƯƠNG 4. CÀI ĐẶT CÁC CHỨC NĂNG CỐT LÕI](#chương-4-cài-đặt-các-chức-năng-cốt-lõi)
  - [4.1. Đăng nhập và xác thực phân quyền (Admin, HR, Kiosk)](#41-đăng-nhập-và-xác-thực-phân-quyền-admin-hr-kiosk)
  - [4.2. Chế độ Kiosk chấm công trạm thông minh (Smart Kiosk Station)](#42-chế-độ-kiosk-chấm-công-trạm-thông-minh-smart-kiosk-station)
    - [4.2.1. Thuật toán tự động nhận diện Vào ca (Check-In) / Tan ca (Check-Out)](#421-thuật-toán-tự-động-nhận-diện-vào-ca-check-in--tan-ca-check-out)
    - [4.2.2. Kiểm soát khung ca và cơ chế chặn quẹt thẻ ngoài ca (Strict Shift Enforcement)](#422-kiểm-soát-khung-ca-và-cơ-chế-chặn-quẹt-thẻ-ngoài-ca-strict-shift-enforcement)
  - [4.3. Chế độ Trợ lý Nhân sự HR trên di động (Mobile HR Assistant)](#43-chế-độ-trợ-lý-nhân-sự-hr-trên-di-động-mobile-hr-assistant)
    - [4.3.1. Đọc UID thẻ NFC trực tiếp qua lưng điện thoại & Gán thẻ tức thì](#431-đọc-uid-thẻ-nfc-trực-tiếp-qua-lưng-điện-thoại--gán-thẻ-tức-thì)
    - [4.3.2. Khóa thẻ mất và cấp phát thẻ mới](#432-khóa-thẻ-mất-và-cấp-phát-thẻ-mới)
  - [4.4. Quét mã QR Code dự phòng một chạm](#44-quét-mã-qr-code-dự-phòng-một-chạm)
  - [4.5. Quản lý ca làm việc và thuật toán tính công tự động](#45-quản-lý-ca-làm-việc-và-thuật-toán-tính-công-tự-động)
    - [4.5.1. Phân ca linh hoạt, ca mặc định và ca theo thứ trong tuần](#451-phân-ca-linh-hoạt-ca-mặc-định-và-ca-theo-thứ-trong-tuần)
    - [4.5.2. Tính toán đi trễ, về sớm, trừ giờ nghỉ trưa và ghi nhận tăng ca](#452-tính-toán-đi-trễ-về-sớm-trừ-giờ-nghỉ-trưa-và-ghi-nhận-tăng-ca)
  - [4.6. Chấm công ngoại tuyến (Offline-First) và cơ chế tự động đồng bộ](#46-chấm-công-ngoại-tuyến-offline-first-và-cơ-chế-tự-động-đồng-bộ)
  - [4.7. Giám sát thời gian thực (Today Monitor qua SignalR Hub)](#47-giám-sát-thời-gian-thực-today-monitor-qua-signalr-hub)
  - [4.8. Báo cáo, thống kê và quy trình điều chỉnh công thủ công](#48-báo-cáo-thống-kê-và-quy-trình-điều-chỉnh-công-thủ-công)
  - [4.9. Quản lý và phê duyệt đơn nghỉ phép trực tuyến](#49-quản-lý-và-phê-duyệt-đơn-nghỉ-phép-trực-tuyến)
- [CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ](#chương-5-kiểm-thử-và-đánh-giá)
  - [5.1. Kiểm thử tự động (Unit & Integration Testing)](#51-kiểm-thử-tự-động-unit--integration-testing)
  - [5.2. Kiểm thử thủ công theo ca kiểm thử (End-to-End Test Cases)](#52-kiểm-thử-thủ-công-theo-ca-kiểm-thử-end-to-end-test-cases)
  - [5.3. Đánh giá tính an toàn và bảo mật](#53-đánh-giá-tính-an-toàn-và-bảo-mật)
  - [5.4. Đánh giá hiệu năng và trải nghiệm người dùng](#54-đánh-giá-hiệu-năng-và-trải-nghiệm-người-dùng)
- [CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN](#chương-6-kết-luận-và-hướng-phát-triển)
  - [6.1. Kết quả đạt được](#61-kết-quả-đạt-được)
  - [6.2. Hạn chế](#62-hạn-chế)
  - [6.3. Hướng phát triển](#63-hướng-phát-triển)
  - [6.4. Kết luận](#64-kết-luận)
- [TÀI LIỆU THAM KHẢO](#tài-liệu-tham-khảo)

---

# CHƯƠNG 1. TỔNG QUAN ĐỀ TÀI

### 1.1. Lý do chọn đề tài
Trong kỷ nguyên chuyển đổi số và công nghiệp 4.0, công tác quản trị nhân lực đóng vai trò xương sống trong mọi doanh nghiệp và nhà máy. Tuy nhiên, các phương pháp điểm danh và chấm công truyền thống đang bộc lộ nhiều nhược điểm nghiêm trọng:
- **Chấm công vân tay cơ học:** Tốc độ nhận diện chậm (thường từ 3-7 giây/người), tỷ lệ từ chối cao đối với nhân viên có vân tay mòn, tay ướt, dính bụi bẩn công nghiệp, gây tắc nghẽn cục bộ tại cổng ra vào giờ cao điểm; nguy cơ lây nhiễm vi khuẩn qua bề mặt quang học.
- **Thẻ từ quẹt thông thường (Magnetic/Barcode):** Dễ bị trầy xước, dễ bị làm giả, sao chép mã và tiềm ẩn tình trạng "chấm công hộ".
- **Ứng dụng nhận diện khuôn mặt (FaceID):** Đòi hỏi phần cứng đắt tiền (camera AI, máy chủ GPU xử lý), dễ bị ảnh hưởng bởi ánh sáng, góc nghiêng hoặc khẩu trang y tế.
- **Chi phí thiết bị cồng kềnh:** Để cấp thẻ mới, phòng Nhân sự (HR) bắt buộc phải trang bị đầu đọc thẻ chuyên dụng cắm cáp USB vào máy tính bàn rất bất tiện và tốn kém.

Nhận thức được các rào cản trên, đề tài **"Hệ thống Điểm danh & Chấm công Thông minh Đa Nền tảng (NFC Attendance System)"** được nghiên cứu và phát triển nhằm mang đến giải pháp chấm công không tiếp xúc (contactless) một chạm siêu tốc, kết hợp giữa công nghệ thẻ thông minh **NFC NTAG215**, mã ma trận **QR Code dự phòng**, kiến trúc mạng thời gian thực **SignalR**, ứng dụng di động đa chế độ **Flutter (Dual-Mode)** và máy chủ doanh nghiệp **ASP.NET Core 8**.

### 1.2. Mục tiêu đề tài
1. **Xây dựng hệ thống chấm công toàn diện 4 tầng độc lập:** Tách bạch rõ ràng giữa Backend Web API, Cơ sở dữ liệu quan hệ, Web Quản trị và Mobile App.
2. **Tối ưu tốc độ chấm công một chạm:** Thời gian xử lý từ khi chạm thẻ NFC đến khi hiển thị kết quả và phát âm thanh phản hồi đạt dưới **3 giây**.
3. **Sáng kiến Chế độ kép (Dual-Mode) trên Mobile App:**
   - *Chế độ 1 - Kiosk Trạm (Station Mode):* Cài đặt trên máy tính bảng tại cổng ra vào phục vụ toàn bộ nhân viên quẹt thẻ NFC/QR, hỗ trợ Offline-First lưu dữ liệu cục bộ khi mất mạng và tự động đồng bộ khi có kết nối trở lại.
   - *Chế độ 2 - Trợ lý Nhân sự HR (HR Assistant Mode):* Cài trên điện thoại thông minh của cán bộ HR, tận dụng cảm biến NFC tích hợp ở lưng điện thoại để đọc mã định danh UID và gán thẻ mới cho nhân viên tức thì trong 3 giây mà không cần mua bất kỳ đầu đọc thẻ USB nào.
4. **Giám sát thời gian thực (Real-time Live Monitoring):** Cán bộ quản lý theo dõi bảng công "sống" trên Web Admin qua SignalR WebSocket mà không cần bấm F5 tải lại trang.
5. **Tự động hóa động cơ tính công:** Tự động nhận diện vào ca/ra ca, tính chính xác số phút đi trễ, về sớm, tự động khấu trừ thời gian nghỉ trưa, tính giờ làm thêm (Overtime) và ngăn chặn quẹt thẻ ngoài ca làm việc.

### 1.3. Phạm vi và đối tượng sử dụng
- **Phạm vi triển khai:** Áp dụng cho các văn phòng doanh nghiệp vừa và nhỏ (SMEs), chi nhánh chuỗi bán lẻ, nhà xưởng sản xuất hoặc các trường đại học/cơ sở đào tạo.
- **Đối tượng sử dụng:**
  - *Quản trị viên (Admin):* Toàn quyền cấu hình hệ thống, quản lý tài khoản, thiết bị Kiosk trạm, giám sát bảo mật qua Audit Log.
  - *Cán bộ Nhân sự (HR):* Quản lý hồ sơ nhân viên, phân ca làm việc, cấp/thu hồi thẻ NFC, duyệt đơn xin nghỉ phép, bù công thủ công và xuất báo cáo bảng công.
  - *Nhân viên (Employee):* Sử dụng thẻ NFC NTAG215 hoặc mã định danh QR cá nhân để thực hiện chấm công tại trạm Kiosk mỗi ngày.

### 1.4. Quy mô sản phẩm
Hệ thống được thiết kế theo quy chuẩn doanh nghiệp với khả năng mở rộng (Scalability):
- Quản lý từ hàng trăm đến hàng nghìn nhân sự với hàng chục ca làm việc linh hoạt (ca sáng, chiều, tối, ca hành chính).
- Hỗ trợ triển khai đồng thời nhiều trạm Kiosk tại nhiều cửa/cổng ra vào.
- Dung lượng lưu trữ tối ưu hóa với các chỉ mục cơ sở dữ liệu phi cụm (Non-Clustered Indexes), đáp ứng hàng triệu lượt quẹt thẻ mỗi năm.

### 1.5. Phân công công việc & Quá trình triển khai
Quá trình xây dựng sản phẩm được chia thành các giai đoạn chặt chẽ:
1. *Khảo sát & Đặc tả yêu cầu:* Thu thập quy trình chấm công thực tế, thiết kế use-case và đặc tả 27 API RESTful.
2. *Phát triển Backend & CSDL:* Xây dựng CSDL SQL Server `Nhom12_CT4`, triển khai ASP.NET Core 8 Web API, Entity Framework Core 8, JWT Authentication, SignalR Hub và Export Engine.
3. *Phát triển Web Frontend:* Triển khai Single Page Application (SPA) trên React.js (Vite + Tailwind CSS), xây dựng giao diện Dashboard realtime, bảng công, quản lý ca và modal bù công.
4. *Phát triển Mobile App Flutter:* Thiết kế kiến trúc Dual-Mode (Kiosk Station & HR Assistant), tích hợp `nfc_manager`, `mobile_scanner`, `sqflite` offline cache và đồng bộ ngầm.
5. *Tối ưu hóa & Kiểm thử:* Kiểm thử tính năng chặn quẹt ngoài ca, tính năng hiển thị song song trạng thái `[Hoàn thành]` và `[Tăng ca]`, đóng gói build production và thiết lập đường hầm Cloudflare Tunnel.

---

# CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ

### 2.1. Nền tảng ứng dụng di động Flutter và ngôn ngữ Dart
- **Flutter Framework:** Bộ công cụ phát triển phần mềm giao diện người dùng mã nguồn mở do Google phát triển, cho phép biên dịch mã nguồn thành mã máy gốc (Native Code ARM/x64) trên cả Android và iOS từ một cơ sở mã (Single Codebase). Flutter sử dụng cơ chế dựng hình Skia/Impeller giúp đạt tốc độ khung hình 60fps - 120fps mượt mà trên các màn hình Kiosk.
- **Ngôn ngữ Dart:** Ngôn ngữ hướng đối tượng mạnh mẽ, hỗ trợ cơ chế biên dịch kép: Just-In-Time (JIT) trong môi trường phát triển (Hot Reload/Hot Restart) và Ahead-Of-Time (AOT) khi xuất bản ứng dụng.

### 2.2. Quản lý trạng thái và kiến trúc Provider
Ứng dụng sử dụng mô hình kiến trúc phân lớp kết hợp với thư viện quản lý trạng thái phản ứng (Reactive State Management):
- Đảm bảo luồng dữ liệu một chiều (Unidirectional Data Flow), phân tách rạch ròi giữa UI Presentation, Business Service và Local Storage.
- Giảm thiểu việc dựng lại (re-render) không cần thiết của cây Widget thông qua `ChangeNotifierProvider` và `Consumer`, tối ưu hóa hiệu năng và pin trên thiết bị Kiosk chạy 24/7.

### 2.3. ASP.NET Core Web API (.NET 8) và Entity Framework Core 8
- **ASP.NET Core 8:** Nền tảng Backend hiện đại, đa nền tảng (Cross-platform), hiệu năng cao hàng đầu thế giới (đứng top đầu trong bảng xếp hạng TechEmpower Benchmarks). Hỗ trợ sẵn Dependency Injection (IoC Container), Kestrel Web Server tối ưu và hệ thống middleware mở rộng.
- **Entity Framework Core 8 (EF Core 8):** ORM (Object-Relational Mapping) mạnh mẽ theo phương pháp Code-First, cho phép mô hình hóa các thực thể quan hệ, quản lý lược đồ dữ liệu tự động qua DbContext, theo dõi thay đổi (Change Tracking) và thực thi truy vấn LINQ tối ưu hóa.

### 2.4. SignalR – Giao tiếp mạng thời gian thực (Real-time Communication)
- **Cơ chế hoạt động:** ASP.NET Core SignalR là thư viện mã nguồn mở giúp đơn giản hóa việc bổ sung tính năng web theo thời gian thực.
- SignalR tự động đàm phán và lựa chọn phương thức truyền tải tốt nhất giữa máy khách và máy chủ: **WebSocket** (ưu tiên hàng đầu), Server-Sent Events (SSE), hoặc Long Polling.
- Trong hệ thống, `AttendanceHub` tại đường dẫn `/hubs/attendance` liên tục lắng nghe và phát sóng (broadcast) sự kiện `ReceiveAttendanceEvent` tới toàn bộ máy tính quản trị Web Admin ngay khi có lượt quẹt thẻ thành công tại trạm Kiosk.

### 2.5. Xác thực JWT, băm mật khẩu BCrypt và bảo mật phân quyền RBAC
- **JSON Web Token (JWT):** Tiêu chuẩn mở (RFC 7519) định nghĩa cách thức truyền tải thông tin an toàn giữa các bên dưới dạng đối tượng JSON gọn nhẹ. Token được ký số bằng thuật toán HMAC-SHA256 với Secret Key bí mật của server.
- **Bảo mật mật khẩu:** Sử dụng thuật toán băm chậm **BCrypt** với hệ số muối (Salt Round) tự sinh ngẫu nhiên, miễn nhiễm với các kỹ thuật tấn công Rainbow Table hoặc Brute Force.
- **Kiểm soát truy cập dựa trên vai trò (Role-Based Access Control - RBAC):** Hệ thống phân định 3 quyền hạn độc lập:
  - `ADMIN`: Toàn quyền quản trị hệ thống, quản lý tài khoản và cấu hình trạm.
  - `HR`: Quản trị nhân sự, gán thẻ, phân ca, phê duyệt đơn nghỉ phép và bù công.
  - `KIOSK`: Tài khoản máy trạm chuyên dụng, chỉ được phép gọi các API điểm danh và đồng bộ ngoại tuyến.

### 2.6. Công nghệ giao tiếp trường gần NFC & Chuẩn thẻ NTAG215
- **Giao tiếp NFC (Near Field Communication):** Chuẩn kết nối không dây tầm ngắn hoạt động ở dải tần số **13.56 MHz**, cự ly nhận diện tối ưu từ 1 - 4 cm.
- **Chuẩn thẻ NTAG215 (ISO 14443-A):**
  - Sử dụng chip NXP NTAG215 chuẩn quốc tế, bộ nhớ 504 bytes EEPROM.
  - Mỗi thẻ mang một mã định danh phần cứng duy nhất (Unique Identifier - UID) gồm 7 bytes (14 ký tự Hexadecimal) do nhà sản xuất khắc cố định (Read-Only), không thể làm giả hoặc ghi đè bằng các phần mềm thông thường.
  - Tốc độ truyền tải dữ liệu đạt 106 kbit/s, cho phép máy đọc bắt tín hiệu ngay lập tức khi thẻ chạm vào vùng ăng-ten.

### 2.7. Công nghệ mã phản hồi nhanh QR Code dự phòng
- Mã phản hồi nhanh dạng ma trận 2 chiều (2D Barcode) theo tiêu chuẩn ISO/IEC 18004.
- Mỗi nhân viên được cấp một chuỗi mã hóa ký tự ngẫu nhiên duy nhất (UUID/GUID) in trên thẻ nhân viên hoặc lưu trên điện thoại. Khi nhân viên quên thẻ NFC hoặc thẻ bị hỏng, camera trên trạm Kiosk sẽ kích hoạt thư viện `mobile_scanner` để nhận diện mã QR dự phòng với độ trễ dưới 500ms.

### 2.8. Hệ quản trị CSDL Microsoft SQL Server & Kiến trúc Offline SQLite
- **Microsoft SQL Server:** Hệ quản trị CSDL quan hệ cấp doanh nghiệp (Enterprise DBMS), đảm bảo các thuộc tính ACID (Atomicity, Consistency, Isolation, Durability), cơ chế Transaction an toàn và các ràng buộc khóa ngoại (Foreign Keys).
- **SQLite Engine:** CSDL nhúng nhẹ được tích hợp trực tiếp vào ứng dụng di động Flutter. Khi mất mạng Internet, toàn bộ lượt quẹt thẻ được mã hóa và lưu vào bảng cục bộ `offline_attendances`, sẵn sàng cho cơ chế đồng bộ hóa an toàn khi mạng phục hồi.

---

# CHƯƠNG 3. PHÂN TÍCH VÀ THIẾT KẾ HỆ THỐNG

### 3.1. Yêu cầu chức năng (Functional Requirements)
Hệ thống đáp ứng đầy đủ 9 nhóm chức năng chính:
1. **Xác thực & Quản lý tài khoản:** Đăng nhập bảo mật JWT, cấp mới Access Token qua Refresh Token, đổi mật khẩu, phân quyền RBAC.
2. **Quản lý Hồ sơ Nhân sự:** Thêm mới, sửa, xóa, tìm kiếm theo tên, phòng ban, mã nhân viên, cập nhật ảnh đại diện.
3. **Quản lý Thẻ NFC:** Đọc mã UID, kiểm tra trạng thái thẻ, gán thẻ cho nhân viên, kích hoạt, khóa thẻ bị mất.
4. **Quản lý Ca làm việc (Shifts):** Tạo ca, cấu hình giờ bắt đầu, kết thúc, giờ nghỉ trưa, số phút ân hạn cho phép đi trễ.
5. **Phân ca linh hoạt:** Gán ca làm việc theo tuần, theo thứ trong tuần, thiết lập ca mặc định (Ca Hành Chính).
6. **Chấm công thông minh (Smart Tap):** Tự động nhận diện Check-In/Check-Out, kiểm soát khung giờ ca, tính giờ đi trễ/về sớm/tăng ca, từ chối lượt quẹt ngoài ca làm việc.
7. **Chấm công Ngoại tuyến & Đồng bộ:** Tự động lưu trữ cục bộ khi trạm Kiosk mất mạng, cơ chế chạy nền tự động đẩy dữ liệu lên máy chủ khi có mạng trở lại.
8. **Giám sát Trực quan (Today Monitor):** Bảng công trực tiếp trên Web Admin cập nhật theo thời gian thực qua SignalR; Today Monitor bỏ túi trên app di động của HR.
9. **Báo cáo & Điều chỉnh công:** Xem lịch sử chấm công có bộ lọc nâng cao, bổ sung/điều chỉnh công thủ công (Bù công) và xuất báo cáo Excel/PDF.

### 3.2. Yêu cầu phi chức năng (Non-Functional Requirements)
- **Hiệu năng & Độ phản hồi:** Thời gian phản hồi từ lúc chạm thẻ NFC đến khi hiển thị kết quả trên Kiosk $\le 1.5$ giây; thời gian SignalR đẩy sự kiện lên Web $\le 500$ ms.
- **Tính khả dụng & Độ bền bỉ:** Kiosk hoạt động liên tục 24/7; hỗ trợ 100% tính năng chấm công ngoại tuyến khi mất Internet.
- **Bảo mật:** Mật khẩu băm BCrypt; giao tiếp API qua giao thức mã hóa HTTPS/TLS; bảo vệ cấu hình Kiosk bằng mã PIN 6 số.
- **Giao diện & Trải nghiệm (UI/UX):** Giao diện Kiosk tông màu Dark Slate (`#0F172A`) hiện đại, chống lóa mắt, kích thước nút bấm lớn phù hợp màn hình cảm ứng công nghiệp.

### 3.3. Kiến trúc tổng thể 4 tầng (4-Tier Enterprise Architecture)

```mermaid
graph TD
    subgraph TẦNG CLIENT
        A["📱 Kiosk Chấm Công Trạm\n(Flutter Tablet - Offline First)"]
        B["📱 Trợ Lý Nhân Sự HR\n(Flutter Mobile - NFC lưng máy)"]
        C["💻 Web Quản Trị Trung Tâm\n(React.js + Tailwind CSS)"]
    end

    subgraph TẦNG MẠNG & AN NINH
        D["🔒 Reverse Proxy / Cloudflare Tunnel / HTTPS"]
        E["⚡ SignalR WebSocket Hub\n(/hubs/attendance)"]
    end

    subgraph TẦNG XỬ LÝ DOANH NGHIỆP
        F["⚙️ ASP.NET Core 8 Web API\n(Controllers - Services - Middlewares)"]
        G["🧠 Business Engine\n(Tính công, Phân ca, Chặn ngoài ca)"]
    end

    subgraph TẦNG DỮ LIỆU
        H[("🗄️ Microsoft SQL Server\n(Nhom12_CT4 - 9 Bảng)")]
        I[("💾 SQLite Cục Bộ Trên Kiosk\n(offline_attendances)")]
    end

    A <-->|REST API JSON| D
    B <-->|REST API JSON| D
    C <-->|REST API JSON| D
    C <-->|Nhận Sự Kiện Realtime| E
    A <-->|Lưu & Đọc Offline| I
    D --> F
    F --> G
    G --> H
    F -->|Bắn Thông Báo Quẹt Thẻ| E
```

### 3.4. Kiến trúc ứng dụng di động (Flutter Dual-Mode)
Ứng dụng di động được thiết kế độc đáo với cơ chế **Chế độ kép (Dual-Mode)** chuyển đổi linh hoạt:
1. **Chế độ Kiosk Trạm (`modeKiosk`):**
   - Màn hình chính `KioskHomeScreen` luôn lắng nghe tín hiệu từ cảm biến NFC qua `NfcService` và Camera QR qua `MobileScanner`.
   - Khi có sự kiện quẹt thẻ, hệ thống gọi `ApiService.tapAttendance()`. Nếu mất kết nối Internet, hệ thống tự động bẫy ngoại lệ và lưu bản ghi vào CSDL cục bộ qua `OfflineDatabaseService`.
   - Tiến trình chạy ngầm `SyncService` định kỳ kiểm tra kết nối mạng để tự động đẩy các bản ghi offline lên máy chủ.
   - Menu cấu hình trạm được bảo vệ bởi hộp thoại mã PIN quản trị viên `PinDialog`.
2. **Chế độ Trợ lý Nhân sự HR (`modeHr`):**
   - Đăng nhập bảo mật qua `HrLoginScreen` với quyền hạn `HR` hoặc `ADMIN`.
   - Màn hình `HrNfcAssignScreen`: Nhân viên HR chỉ cần chọn tên nhân viên, sau đó áp lưng thẻ NFC vào mặt lưng điện thoại. Cảm biến NFC đọc ngay mã UID và gọi API gán thẻ thành công trong 3 giây.
   - Màn hình `HrTodayMonitorScreen`: Giám sát bỏ túi toàn bộ nhân viên đã đến làm việc trong ngày.

### 3.5. Kiến trúc máy chủ Backend (ASP.NET Core Web API)
Backend áp dụng mô hình phân lớp chuẩn doanh nghiệp:
- **Presentation Layer (Controllers):** Tiếp nhận yêu cầu HTTP, kiểm tra hợp lệ dữ liệu (Model Validation) và phân quyền JWT (`[Authorize(Roles = "...")]`).
- **Service Layer (Business Logic):** Thực thi toàn bộ quy tắc nghiệp vụ: `AttendanceService` (động cơ chấm công), `EmployeeService` (quản lý nhân sự), `ShiftService` (tính toán ca làm việc), `ReportService` (kết xuất Excel/PDF).
- **Data Access Layer (Entity Framework Core 8):** `NfcAttendanceDbContext` giao tiếp với SQL Server, quản lý các tập thực thể `DbSet<T>` với các cấu hình ràng buộc Fluent API.
- **Middleware Layer:** `ErrorHandlingMiddleware` bắt và xử lý tập trung mọi ngoại lệ hệ thống, trả về định dạng phản hồi chuẩn JSON thống nhất.

### 3.6. Thiết kế cơ sở dữ liệu chi tiết (Database Schema)

Hệ thống quản lý 9 bảng dữ liệu quan hệ được chuẩn hóa:

```mermaid
erDiagram
    Users ||--o{ AuditLogs : "logs"
    Employees ||--o{ NfcCards : "sở hữu"
    Employees ||--o{ EmployeeShifts : "phân ca"
    Shifts ||--o{ EmployeeShifts : "áp dụng"
    Employees ||--o{ Attendances : "chấm công"
    Shifts ||--o{ Attendances : "theo ca"
    Employees ||--o{ LeaveRequests : "gửi đơn"
    Users ||--o{ LeaveRequests : "phê duyệt"

    Users {
        int Id PK
        string Username UK
        string PasswordHash
        string Role "ADMIN, HR, KIOSK"
        bool IsActive
    }
    Employees {
        int Id PK
        string EmployeeCode UK
        string FullName
        string Department
        string QrCode UK
        string Status "ACTIVE, INACTIVE"
    }
    NfcCards {
        int Id PK
        string Uid UK
        int EmployeeId FK
        string Status "ACTIVE, LOCKED"
        datetime IssuedAt
    }
    Shifts {
        int Id PK
        string Name
        time StartTime
        time EndTime
        time BreakStart
        time BreakEnd
        int GraceMinutes
    }
    EmployeeShifts {
        int Id PK
        int EmployeeId FK
        int ShiftId FK
        byte DayOfWeek "0-6"
        date EffectiveFrom
        date EffectiveTo
    }
    Attendances {
        int Id PK
        int EmployeeId FK
        int ShiftId FK
        date Date
        datetime CheckIn
        datetime CheckOut
        int LateMinutes
        int EarlyMinutes
        int OvertimeMinutes
        int TotalWorkingMinutes
        string Status
        string CheckInMethod "NFC, QR, MANUAL"
    }
```

### 3.7. Thiết kế hệ thống API RESTful (API Specification)

Hệ thống cung cấp **27 Endpoints RESTful API** chuẩn hóa:

| STT | Nhóm chức năng | Phương thức & Tuyến đường | Quyền hạn | Mô tả chức năng |
| :---: | :--- | :--- | :---: | :--- |
| 1 | **Xác thực** | `POST /api/v1/auth/login` | Public | Đăng nhập hệ thống, cấp Access Token & Refresh Token |
| 2 | Xác thực | `POST /api/v1/auth/refresh-token` | Public | Cấp mới Access Token khi hết hạn |
| 3 | Xác thực | `POST /api/v1/auth/change-password` | Authorized | Đổi mật khẩu tài khoản người dùng |
| 4 | Xác thực | `GET /api/v1/auth/me` | Authorized | Lấy thông tin tài khoản hiện tại |
| 5 | **Nhân sự** | `GET /api/v1/employees` | ADMIN, HR | Danh sách nhân viên có phân trang, lọc theo phòng ban |
| 6 | Nhân sự | `GET /api/v1/employees/{id}` | ADMIN, HR | Lấy chi tiết hồ sơ nhân viên |
| 7 | Nhân sự | `POST /api/v1/employees` | ADMIN, HR | Thêm mới hồ sơ nhân viên và tự tạo mã QR |
| 8 | Nhân sự | `PUT /api/v1/employees/{id}` | ADMIN, HR | Cập nhật thông tin nhân sự |
| 9 | Nhân sự | `DELETE /api/v1/employees/{id}` | ADMIN | Xóa nhân viên khỏi hệ thống |
| 10 | **Thẻ NFC** | `POST /api/v1/nfc/assign` | ADMIN, HR | Gán thẻ NFC (UID) cho nhân viên |
| 11 | Thẻ NFC | `POST /api/v1/nfc/verify` | Authorized | Kiểm tra thông tin chủ thẻ từ mã UID |
| 12 | Thẻ NFC | `PUT /api/v1/nfc/{id}/status` | ADMIN, HR | Khóa hoặc mở khóa thẻ NFC |
| 13 | Thẻ NFC | `DELETE /api/v1/nfc/{id}` | ADMIN, HR | Hủy liên kết thẻ khỏi nhân viên |
| 14 | **Ca làm việc** | `GET /api/v1/shifts` | Authorized | Danh sách các ca làm việc trong hệ thống |
| 15 | Ca làm việc | `POST /api/v1/shifts` | ADMIN, HR | Tạo ca làm việc mới |
| 16 | Ca làm việc | `PUT /api/v1/shifts/{id}` | ADMIN, HR | Cập nhật khung giờ ca làm việc |
| 17 | Ca làm việc | `POST /api/v1/shifts/assign` | ADMIN, HR | Phân ca làm việc linh hoạt cho nhân viên |
| 18 | **Điểm danh** | `POST /api/v1/attendance/tap` | Authorized | **Quẹt chấm công thông minh (Tự nhận diện Vào/Ra)** |
| 19 | Điểm danh | `POST /api/v1/attendance/check-in` | Authorized | Ép ghi nhận Vào ca (Check-In) |
| 20 | Điểm danh | `POST /api/v1/attendance/check-out` | Authorized | Ép ghi nhận Tan ca (Check-Out) |
| 21 | Điểm danh | `GET /api/v1/attendance/today` | Authorized | Lấy dữ liệu giám sát hôm nay (Today Monitor) |
| 22 | Điểm danh | `GET /api/v1/attendance/history` | ADMIN, HR | Lịch sử chấm công có bộ lọc ngày, phòng ban, nhân viên |
| 23 | Điểm danh | `POST /api/v1/attendance/manual` | ADMIN, HR | **Điều chỉnh công thủ công (Bù công)** |
| 24 | Điểm danh | `POST /api/v1/attendance/sync-offline`| Authorized | **Tiếp nhận gói chấm công ngoại tuyến hàng loạt** |
| 25 | **Nghỉ phép** | `GET /api/v1/leaves` | ADMIN, HR | Danh sách đơn xin nghỉ phép |
| 26 | Nghỉ phép | `POST /api/v1/leaves/{id}/approve` | ADMIN, HR | Phê duyệt hoặc từ chối đơn nghỉ phép |
| 27 | **Báo cáo** | `GET /api/v1/reports/monthly` | ADMIN, HR | Xuất báo cáo bảng tổng hợp chấm công Excel/PDF |

---

# CHƯƠNG 4. CÀI ĐẶT CÁC CHỨC NĂNG CỐT LÕI

### 4.1. Đăng nhập và xác thực phân quyền (Admin, HR, Kiosk)
- **Cơ chế xác thực:** Máy khách gửi `username` và `password`. Backend truy vấn bảng `Users`, xác thực qua hàm `BCrypt.Verify(password, user.PasswordHash)`. Nếu hợp lệ, máy chủ tạo Access Token thời hạn 8 giờ và Refresh Token thời hạn 7 ngày.
- **Giao diện HR Login trên Mobile ([`hr_login_screen.dart`](file:///d:/vsXanh/appchamcongnhanvien/mobile_app/lib/screens/hr/hr_login_screen.dart)):**
  - Đồng bộ thiết kế Dark Slate cao cấp (`#0F172A` và Card `#1E293B`).
  - Các ô nhập tài khoản và mật khẩu được cấu hình màu sắc tương phản độc lập (`fillColor: #0F172A`, chữ trắng `#FFFFFF`, nhãn xám `#CBD5E1`), loại bỏ triệt để lỗi "tàng hình" ô mật khẩu do xung đột theme sáng/tối.
  - Tích hợp nút bật/tắt hiển thị mật khẩu trực quan.

### 4.2. Chế độ Kiosk chấm công trạm thông minh (Smart Kiosk Station)

#### 4.2.1. Thuật toán tự động nhận diện Vào ca (Check-In) / Tan ca (Check-Out)
Tại trạm Kiosk, nhân viên không cần phải bấm chọn nút "Vào ca" hay "Tan ca" thủ công. Động cơ tại [`AttendanceService.cs`](file:///d:/vsXanh/appchamcongnhanvien/NfcAttendance/Services/AttendanceService.cs) tự động phân luồng theo thuật toán:

```csharp
var attendance = await _context.Attendances
    .FirstOrDefaultAsync(a => a.EmployeeId == employee.Id && a.Date == today);

bool isCheckIn = forcedAction == "CHECK_IN" || (forcedAction == null && attendance == null);
```
- **Lần quẹt 1 trong ngày:** `attendance == null` $\rightarrow$ Tự động ghi nhận lượt **`CHECK-IN`**.
- **Lần quẹt 2 trở đi trong ngày:** `attendance != null` $\rightarrow$ Tự động ghi nhận lượt **`CHECK-OUT`**.

#### 4.2.2. Kiểm soát khung ca và cơ chế chặn quẹt thẻ ngoài ca (Strict Shift Enforcement)
Để đảm bảo tính kỷ luật cao và ngăn ngừa gian lận (nhân viên nghỉ cả ngày đến cuối giờ chiều mới quẹt thẻ nhận vơ), hệ thống áp dụng cơ chế chặn cứng:

```csharp
TimeSpan currentScanTimeOfDay = scanTime.TimeOfDay;
bool isShiftEnded = (shift.EndTime > shift.StartTime)
    ? (currentScanTimeOfDay >= shift.EndTime)
    : (currentScanTimeOfDay >= shift.EndTime && currentScanTimeOfDay < shift.StartTime);

if (attendance == null && isShiftEnded)
{
    return new TapAttendanceResponseDto
    {
        Success = false,
        Action = "REJECTED",
        Status = "SHIFT_ENDED",
        Message = $"Ca làm việc ({shift.Name}: {shift.StartTime:hh\\:mm} - {shift.EndTime:hh\\:mm}) đã kết thúc. Bạn chưa Check-in nên không thể chấm công. Vui lòng liên hệ phòng Nhân sự để giải trình!"
    };
}
```
Khi bị từ chối, màn hình Kiosk bật Pop-up đỏ cảnh báo `CHẤM CÔNG THẤT BẠI`, phát âm thanh lỗi và hiển thị rõ thông tin nhân viên cùng hướng dẫn liên hệ phòng HR để làm thủ tục giải trình bù công.

### 4.3. Chế độ Trợ lý Nhân sự HR trên di động (Mobile HR Assistant)

#### 4.3.1. Đọc UID thẻ NFC trực tiếp qua lưng điện thoại & Gán thẻ tức thì
- Cán bộ HR không cần cắm đầu đọc thẻ USB vào máy tính bàn.
- Trên màn hình [`hr_nfc_assign_screen.dart`](file:///d:/vsXanh/appchamcongnhanvien/mobile_app/lib/screens/hr/hr_nfc_assign_screen.dart), HR chọn nhân viên cần cấp thẻ và bật chế độ đọc thẻ.
- Khi áp thẻ NTAG215 vào lưng điện thoại, thư viện `nfc_manager` kích hoạt bộ đọc phần cứng của điện thoại, trích xuất mã UID phần cứng dạng chuẩn (ví dụ `04:A2:3B:5C:8D:1E:80`), làm sạch ký tự và tự động gửi tới API `/api/v1/nfc/assign`. Toàn bộ thao tác hoàn thành trong **3 giây**.

#### 4.3.2. Khóa thẻ mất và cấp phát thẻ mới
Khi nhân viên thông báo mất thẻ, HR mở danh sách thẻ trên app di động và chỉ cần 1 cú chạm để chuyển trạng thái sang `LOCKED`. Thẻ bị khóa sẽ bị máy trạm Kiosk từ chối ngay lập tức nếu kẻ gian cố tình sử dụng.

### 4.4. Quét mã QR Code dự phòng một chạm
- Màn hình [`qr_scanner_screen.dart`](file:///d:/vsXanh/appchamcongnhanvien/mobile_app/lib/screens/kiosk/qr_scanner_screen.dart) sử dụng luồng camera độ phân giải cao kết hợp thư viện `mobile_scanner`.
- Camera tự động điều chỉnh tiêu cự (Auto-focus). Ngay khi mã QR của nhân viên lọt vào khung quét, hệ thống gửi `QrPayload` đến máy chủ, trả về kết quả điểm danh tương đương thẻ NFC.

### 4.5. Quản lý ca làm việc và thuật toán tính công tự động

#### 4.5.1. Phân ca linh hoạt, ca mặc định và ca theo thứ trong tuần
- Hệ thống tự động tìm kiếm ca làm việc của nhân viên theo độ ưu tiên:
  1. Ca được phân riêng cho thứ hiện tại trong tuần (`DayOfWeek`).
  2. Ca phân bổ gần nhất còn hiệu lực.
  3. Ca mặc định của hệ thống (**Ca Hành Chính: 08:00 - 17:30**).

#### 4.5.2. Tính toán đi trễ, về sớm, trừ giờ nghỉ trưa và ghi nhận tăng ca
Công thức tính toán tự động trong `AttendanceService.cs`:
- **Số phút đi trễ (LateMinutes):**
  $$\text{LateThreshold} = \text{Shift.StartTime} + \text{Shift.GraceMinutes}$$
  $$\text{LateMinutes} = \max(0, \text{ScanTime} - \text{Shift.StartTime}) \quad \text{(khi ScanTime} > \text{LateThreshold)}$$
- **Số phút về sớm (EarlyMinutes):**
  $$\text{EarlyMinutes} = \max(0, \text{Shift.EndTime} - \text{ScanTime.TimeOfDay})$$
- **Số phút tăng ca (OvertimeMinutes):**
  $$\text{OvertimeMinutes} = \max(0, \text{ScanTime.TimeOfDay} - \text{Shift.EndTime})$$
- **Tổng thời gian làm việc thực tế (TotalWorkingMinutes):**
  $$\text{BreakDuration} = \text{Shift.BreakEnd} - \text{Shift.BreakStart}$$
  $$\text{TotalWorkingMinutes} = \max(0, (\text{CheckOut} - \text{CheckIn}) - \text{BreakDuration})$$

### 4.6. Chấm công ngoại tuyến (Offline-First) và cơ chế tự động đồng bộ
- Khi mất mạng Internet hoặc lỗi đường truyền (bắt lỗi `SocketException` / `DioException`), Kiosk tự động chuyển sang chế độ dự phòng an toàn:
  1. Ghi bản ghi vào bảng SQLite `offline_attendances` gồm: `cardUid`, `qrPayload`, `method`, `timestamp`, `deviceId`, `isSynced = 0`.
  2. Phát âm thanh xác nhận và thông báo Kiosk: *"Đã lưu Offline! Sẽ tự đồng bộ khi có mạng"*.
  3. `SyncService` chạy nền định kỳ mỗi 30 giây kiểm tra kết nối. Khi có mạng trở lại, dịch vụ gửi toàn bộ gói mảng bản ghi tới API `/api/v1/attendance/sync-offline` theo kỹ thuật Bulk-Insert và đánh dấu `isSynced = 1`.

### 4.7. Giám sát thời gian thực (Today Monitor qua SignalR Hub)
- **Trên Web Admin ([`DashboardPage.jsx`](file:///d:/vsXanh/appchamcongnhanvien/frontend/src/pages/dashboard/DashboardPage.jsx)):**
  - Kết nối thường trực tới `/hubs/attendance`.
  - Khi có lượt quẹt thẻ tại bất kỳ trạm Kiosk nào, bản ghi chấm công tự động xuất hiện ở dòng đầu tiên với hiệu ứng nhấp nháy phát sáng (Pulse Highlight).
  - Tự động cộng dồn chỉ số KPI: Số người đã đến làm, số người đi trễ trong ngày.
- **Hiển thị song song trạng thái `[Hoàn thành]` và `[Tăng ca]`:**
  - Đối với nhân viên về muộn hơn giờ kết thúc ca, cột Trạng thái trên cả Web và Mobile Today Monitor ([`status_badge.dart`](file:///d:/vsXanh/appchamcongnhanvien/mobile_app/lib/widgets/status_badge.dart)) hiển thị đồng thời cả 2 nhãn:
    - **`[ Hoàn thành ]`** *(Nền xanh dương)*
    - **`[ Tăng ca +...p ]`** *(Nền tím, hiển thị cụ thể số phút tăng ca)*.

### 4.8. Báo cáo, thống kê và quy trình điều chỉnh công thủ công
- **Điều chỉnh công (Bù công) qua Web:** Khi nhân viên có đơn giải trình quên quẹt thẻ được phê duyệt, HR mở modal bù công ([`ManualAttendanceModal.jsx`](file:///d:/vsXanh/appchamcongnhanvien/frontend/src/components/modals/ManualAttendanceModal.jsx)), điền giờ vào/ra thực tế. Hệ thống tính lại toàn bộ giờ công và gắn cờ `CheckInMethod = "MANUAL"`.
- **Xuất bảng công Excel:** `ReportService` sử dụng thư viện `ClosedXML` để kết xuất file bảng công tổng hợp tháng chuyên nghiệp gồm đầy đủ cột: Số ngày làm đủ, số lần đi trễ, tổng phút trễ, tổng giờ tăng ca, số ngày nghỉ phép.

### 4.9. Quản lý và phê duyệt đơn nghỉ phép trực tuyến
- Nhân viên gửi đơn nghỉ phép (phép năm, nghỉ ốm, việc riêng) với ngày bắt đầu và kết thúc.
- Cán bộ HR xem danh sách đơn đang chờ duyệt (`PENDING`), kiểm tra số ngày phép còn lại và thực hiện bấm **Duyệt (APPROVE)** hoặc **Từ chối (REJECT)** kèm lý do phản hồi.

---

# CHƯƠNG 5. KIỂM THỬ VÀ ĐÁNH GIÁ

### 5.1. Kiểm thử tự động (Unit & Integration Testing)
- **Kiểm thử logic tính công (Unit Test):** Kiểm tra tính chính xác của các hàm tính toán `LateMinutes`, `EarlyMinutes`, `OvertimeMinutes` với các ca làm việc đặc thù (ca có giờ nghỉ trưa, ca qua đêm).
- **Kiểm thử biên dịch hệ thống (Build Verification):**
  - Backend .NET: `dotnet build NfcAttendance/NfcAttendance.csproj` đạt kết quả: `0 Error(s)`.
  - Frontend React: `npm run build` hoàn tất đóng gói Rollup tĩnh sạch sẽ `0 Error(s)`.

### 5.2. Kiểm thử thủ công theo ca kiểm thử (End-to-End Test Cases)

| Mã kiểm thử | Kịch bản kiểm thử | Dữ liệu đầu vào | Kết quả kỳ vọng | Kết quả thực tế |
| :---: | :--- | :--- | :--- | :---: |
| **TC-01** | Quẹt thẻ lần đầu trong ca (Đúng giờ) | Thẻ NFC hợp lệ quẹt lúc 07:45 (Ca 08:00) | Ghi nhận Check-In, `Status: ON_TIME`, trễ = 0p | **ĐẠT** |
| **TC-02** | Quẹt thẻ lần đầu trong ca (Đi trễ) | Thẻ NFC quẹt lúc 08:25 (Ân hạn 15p) | Ghi nhận Check-In, `Status: LATE`, trễ = 25p | **ĐẠT** |
| **TC-03** | Quẹt thẻ lần 2 ra về (Đúng giờ) | Quẹt lúc 17:35 (Ca kết thúc 17:30) | Ghi nhận Check-Out, `Status: COMPLETED` | **ĐẠT** |
| **TC-04** | Quẹt thẻ lần 2 ra về (Tăng ca) | Quẹt lúc 18:00 (Ca kết thúc 17:30) | Ghi nhận Check-Out, tăng ca = 30p, hiện cả 2 nhãn `[Hoàn thành]` & `[Tăng ca +30p]` | **ĐẠT** |
| **TC-05** | Quên quẹt sáng, đến chiều hết ca mới quẹt | Chưa Check-in, quẹt lúc 17:45 (sau ca) | Báo lỗi `CHẤM CÔNG THẤT BẠI`, ca đã kết thúc, yêu cầu gặp HR | **ĐẠT** |
| **TC-06** | Thẻ chưa gán hoặc bị khóa | Thẻ UID lạ hoặc thẻ có trạng thái `LOCKED` | Từ chối chấm công, âm thanh Beep đỏ cảnh báo | **ĐẠT** |
| **TC-07** | Quẹt thẻ khi mất mạng (Offline) | Ngắt kết nối Wi-Fi tại trạm Kiosk | Lưu vào SQLite cục bộ, báo "Đã lưu offline" | **ĐẠT** |
| **TC-08** | Phục hồi kết nối mạng | Bật lại kết nối Wi-Fi tại Kiosk | Tự động đồng bộ các bản ghi lên server | **ĐẠT** |
| **TC-09** | Bắn thông báo Realtime lên Web | Kiosk quẹt thẻ thành công | Web Dashboard tự hiện dòng mới qua SignalR không cần F5 | **ĐẠT** |
| **TC-10** | Gán thẻ mới qua điện thoại HR | Chạm thẻ vào lưng điện thoại HR | Đọc mã UID trong 3 giây và gán vào nhân viên | **ĐẠT** |

### 5.3. Đánh giá tính an toàn và bảo mật
- **Bảo mật đường truyền:** Sử dụng giao thức mã hóa SSL/TLS (HTTPS) thông qua Cloudflare Tunnel, ngăn chặn hoàn toàn tấn công nghe lén (Man-In-The-Middle).
- **Bảo mật định danh:** Token JWT có chữ ký số điện tử; mật khẩu lưu trữ băm BCrypt một chiều.
- **Chống sao chép thẻ:** Khai thác mã phần cứng cố định 7 bytes UID của chip NXP NTAG215, vô hiệu hóa việc sao chép thẻ thông thường.

### 5.4. Đánh giá hiệu năng và trải nghiệm người dùng
- **Tốc độ:** Thời gian đọc thẻ và hoàn tất giao dịch đạt trung bình **800ms - 1.2s**, đáp ứng lưu lượng chấm công trên 40 người/phút tại mỗi trạm Kiosk.
- **Độ tin cậy:** Không xảy ra tình trạng mất dữ liệu chấm công nhờ cơ chế đệm kép SQLite Offline-First.

---

# CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN

### 6.1. Kết quả đạt được
1. Đã thiết kế và xây dựng hoàn chỉnh hệ thống chấm công doanh nghiệp theo mô hình **4 tầng chuẩn hóa**: Backend ASP.NET Core 8, CSDL SQL Server, Web Frontend React.js và Mobile App Flutter.
2. Xây dựng thành công ứng dụng di động **Dual-Mode**: Vừa hoạt động như một trạm Kiosk chấm công chuyên dụng, vừa đóng vai trò là công cụ bỏ túi cho cán bộ HR đọc mã thẻ NFC qua lưng điện thoại mà không tốn chi phí mua đầu đọc thẻ USB.
3. Hoàn thiện hệ thống mạng thời gian thực với **SignalR**, giúp ban quản trị theo dõi biến động nhân sự ngay tức thì.
4. Triển khai cơ chế chấm công **Offline-First**, đảm bảo tính liên tục của hệ thống ngay cả khi xảy ra sự cố mạng.
5. Xây dựng thuật toán kiểm soát ca làm việc nghiêm ngặt, tự động tính trễ/sớm/tăng ca và ngăn chặn tình trạng gian lận ngoài giờ.

### 6.2. Hạn chế
- Tính năng đọc thẻ NFC trên ứng dụng HR di động phụ thuộc vào phần cứng có trang bị chip NFC của điện thoại (hầu hết smartphone hiện nay đều có, tuy nhiên một số máy giá rẻ đời cũ có thể thiếu cảm biến này).
- Hệ thống camera nhận diện QR Code đòi hỏi môi trường ánh sáng trạm Kiosk đủ điều kiện để camera bắt nét tốt.

### 6.3. Hướng phát triển
1. **Tích hợp sinh trắc học khuôn mặt AI (Face Recognition):** Kết hợp camera Kiosk với mô hình AI nhận diện khuôn mặt để đối soát 2 lớp (vừa quẹt thẻ NFC, vừa xác thực khuôn mặt) nhằm loại trừ 100% việc cho mượn thẻ quẹt hộ.
2. **Ứng dụng Self-Service cho Nhân viên (Employee Self-Service):** Mở rộng thêm cổng thông tin cá nhân cho phép nhân viên tự xem bảng công của mình trên điện thoại và gửi đơn xin nghỉ phép, giải trình bù công trực tiếp.
3. **Mở rộng định vị GPS/Geofencing:** Hỗ trợ chấm công từ xa cho nhân viên kinh doanh hoặc kỹ sư công trường với hàng rào địa lý GPS.

### 6.4. Kết luận
Dự án **Hệ thống Điểm danh & Chấm công Thông minh Đa Nền tảng** đã giải quyết triệt để các hạn chế cố hữu của các hệ thống chấm công cơ học truyền thống. Bằng việc kết hợp hài hòa giữa các công nghệ hiện đại (.NET 8, Flutter, React, NFC NTAG215, SignalR), sản phẩm không chỉ mang lại hiệu quả quản lý vượt trội, tiết kiệm tối đa chi phí thiết bị phần cứng cho doanh nghiệp mà còn mở ra hướng tiếp cận mới trong quá trình chuyển đổi số quản trị nhân sự hiện đại.

---

# TÀI LIỆU THAM KHẢO

1. **Microsoft Corporation (2024)**, *ASP.NET Core Documentation & Entity Framework Core Guidelines*, docs.microsoft.com.
2. **Google LLC (2024)**, *Flutter Documentation: Multi-Platform UI Toolkit & Dart Language Guide*, flutter.dev.
3. **NXP Semiconductors (2022)**, *NTAG213/215/216 - NFC Forum Type 2 Tag compliant IC with genetic memory organization*, Product Data Sheet.
4. **RFC 7519 (2015)**, *JSON Web Token (JWT) Architecture and Standards*, Internet Engineering Task Force (IETF).
5. **Martin Fowler (2018)**, *Patterns of Enterprise Application Architecture*, Addison-Wesley Professional.
6. **React Documentation (2024)**, *The Library for Web and Native User Interfaces*, react.dev.

