using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSourceJobIdToJobs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "SourceJobId",
                table: "run_Jobs",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            // IMPORTANT NOTE: existing rows all get the empty default above; point each at
            // itself before the unique index lands, or databases with 2+ jobs fail here.
            migrationBuilder.Sql(@"UPDATE ""run_Jobs"" SET ""SourceJobId"" = ""Id"" WHERE ""SourceJobId"" = '00000000-0000-0000-0000-000000000000'");

            migrationBuilder.CreateIndex(
                name: "IX_run_Jobs_SourceJobId_RetryCount",
                table: "run_Jobs",
                columns: new[] { "SourceJobId", "RetryCount" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_run_Jobs_SourceJobId_RetryCount",
                table: "run_Jobs");

            migrationBuilder.DropColumn(
                name: "SourceJobId",
                table: "run_Jobs");
        }
    }
}
