using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Spends360.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddUserLastLoginColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;
                ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip character varying(45);
                ALTER TABLE users ADD COLUMN IF NOT EXISTS otp character varying(6);
                ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at timestamp with time zone;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "last_login_at",
                table: "users");

            migrationBuilder.DropColumn(
                name: "last_login_ip",
                table: "users");
        }
    }
}
