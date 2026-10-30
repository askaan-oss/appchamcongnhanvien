using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NfcAttendance.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "QrCode",
                table: "Employees",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_QrCode",
                table: "Employees",
                column: "QrCode",
                unique: true,
                filter: "[QrCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_QrCode",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "QrCode",
                table: "Employees");
        }
    }
}
