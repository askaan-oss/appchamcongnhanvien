-- Script SQL khởi tạo tài khoản quản trị trong Database Nhom12_CT4
-- Mật khẩu: 123123 (mã hóa chuẩn BCrypt)

USE [Nhom12_CT4];
GO

-- 1. Tài khoản ADMIN (admin / 123123)
IF EXISTS (SELECT 1 FROM [Users] WHERE [Username] = 'admin')
BEGIN
    UPDATE [Users]
    SET [PasswordHash] = '$2a$11$N.Z441U6y7I4QjA1Q8eFauG27u9qj1m9BwI9J1m5m0N6d2rY9d7uO',
        [Role] = 'ADMIN',
        [IsActive] = 1,
        [UpdatedAt] = GETDATE()
    WHERE [Username] = 'admin';
    PRINT 'Đã cập nhật mật khẩu 123123 cho tài khoản admin.';
END
ELSE
BEGIN
    INSERT INTO [Users] ([Username], [PasswordHash], [Role], [IsActive], [CreatedAt])
    VALUES ('admin', '$2a$11$N.Z441U6y7I4QjA1Q8eFauG27u9qj1m9BwI9J1m5m0N6d2rY9d7uO', 'ADMIN', 1, GETDATE());
    PRINT 'Đã tạo mới tài khoản admin (mật khẩu: 123123).';
END
GO

-- 2. Tài khoản HR phụ trợ (hr / 123123)
IF EXISTS (SELECT 1 FROM [Users] WHERE [Username] = 'hr')
BEGIN
    UPDATE [Users]
    SET [PasswordHash] = '$2a$11$N.Z441U6y7I4QjA1Q8eFauG27u9qj1m9BwI9J1m5m0N6d2rY9d7uO',
        [Role] = 'HR',
        [IsActive] = 1,
        [UpdatedAt] = GETDATE()
    WHERE [Username] = 'hr';
    PRINT 'Đã cập nhật mật khẩu 123123 cho tài khoản hr.';
END
ELSE
BEGIN
    INSERT INTO [Users] ([Username], [PasswordHash], [Role], [IsActive], [CreatedAt])
    VALUES ('hr', '$2a$11$N.Z441U6y7I4QjA1Q8eFauG27u9qj1m9BwI9J1m5m0N6d2rY9d7uO', 'HR', 1, GETDATE());
    PRINT 'Đã tạo mới tài khoản hr (mật khẩu: 123123).';
END
GO

