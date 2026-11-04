using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GlobalAdminAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ga_OnPremTenants",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    ExecutionTimeAllowed = table.Column<int>(type: "integer", nullable: false),
                    ContractStartDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ContractRenewalDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsExecutionDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsLoginDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    OurEmails = table.Column<string>(type: "text", nullable: true),
                    TenantEmails = table.Column<string>(type: "text", nullable: false),
                    CreatedByUser = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUser = table.Column<string>(type: "text", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    AvailableExecutionTime = table.Column<double>(type: "double precision", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ga_OnPremTenants", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ga_OnPremInstances",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: true),
                    PlatformVersion = table.Column<string>(type: "text", nullable: true),
                    DeployedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    LastValidatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    NoOfInvalidCheck = table.Column<int>(type: "integer", nullable: false),
                    CreatedByUser = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    OnPremTenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ga_OnPremInstances", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ga_OnPremInstances_ga_OnPremTenants_OnPremTenantId",
                        column: x => x.OnPremTenantId,
                        principalTable: "ga_OnPremTenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ga_OnPremInstanceData",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ValidatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    ValidatedBy = table.Column<string>(type: "text", nullable: false),
                    ExecutedJobs = table.Column<int>(type: "integer", nullable: false),
                    ExecutionTime = table.Column<double>(type: "double precision", nullable: false),
                    Users = table.Column<int>(type: "integer", nullable: false),
                    PublishedAgents = table.Column<int>(type: "integer", nullable: false),
                    OnPremInstanceId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ga_OnPremInstanceData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ga_OnPremInstanceData_ga_OnPremInstances_OnPremInstanceId",
                        column: x => x.OnPremInstanceId,
                        principalTable: "ga_OnPremInstances",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ga_OnPremInstanceData_OnPremInstanceId",
                table: "ga_OnPremInstanceData",
                column: "OnPremInstanceId");

            migrationBuilder.CreateIndex(
                name: "IX_ga_OnPremInstances_OnPremTenantId",
                table: "ga_OnPremInstances",
                column: "OnPremTenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ga_OnPremInstanceData");

            migrationBuilder.DropTable(
                name: "ga_OnPremInstances");

            migrationBuilder.DropTable(
                name: "ga_OnPremTenants");
        }
    }
}
