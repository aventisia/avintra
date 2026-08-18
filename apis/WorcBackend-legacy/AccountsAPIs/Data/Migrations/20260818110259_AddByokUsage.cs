using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddByokUsage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ByokUsages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    UsedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ServiceType = table.Column<string>(type: "text", nullable: false),
                    ConsumedUnit = table.Column<double>(type: "double precision", nullable: false),
                    UnitType = table.Column<string>(type: "text", nullable: true),
                    CredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    CredentialName = table.Column<string>(type: "text", nullable: true),
                    RefType = table.Column<string>(type: "text", nullable: true),
                    Action = table.Column<string>(type: "text", nullable: true),
                    RefId = table.Column<Guid>(type: "uuid", nullable: true),
                    RefName = table.Column<string>(type: "text", nullable: true),
                    UsedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    TriggeredByAgent = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ByokUsages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ByokUsages_AspNetUsers_UsedByUserId",
                        column: x => x.UsedByUserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_ByokUsages_UsedByUserId",
                table: "ByokUsages",
                column: "UsedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ByokUsages");
        }
    }
}
