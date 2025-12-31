using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AccountsAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCOLAAndTenantTypeToPlanPricings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanPricings_Tenants_TenantId",
                table: "PlanPricings");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "PlanPricings",
                type: "uuid",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uuid");

            migrationBuilder.AddColumn<double>(
                name: "COLA",
                table: "PlanPricings",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "TenantType",
                table: "PlanPricings",
                type: "text",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPricings_Tenants_TenantId",
                table: "PlanPricings",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PlanPricings_Tenants_TenantId",
                table: "PlanPricings");

            migrationBuilder.DropColumn(
                name: "COLA",
                table: "PlanPricings");

            migrationBuilder.DropColumn(
                name: "TenantType",
                table: "PlanPricings");

            migrationBuilder.AlterColumn<Guid>(
                name: "TenantId",
                table: "PlanPricings",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uuid",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PlanPricings_Tenants_TenantId",
                table: "PlanPricings",
                column: "TenantId",
                principalTable: "Tenants",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
