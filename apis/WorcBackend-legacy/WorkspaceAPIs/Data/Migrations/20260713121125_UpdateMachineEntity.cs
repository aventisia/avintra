using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateMachineEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Machine_WorkspaceUsers_CreatedByUserId",
                table: "Machine");

            migrationBuilder.DropForeignKey(
                name: "FK_Machine_WorkspaceUsers_LastModifiedByUserId",
                table: "Machine");

            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_Machine_MachineId",
                table: "worc_Jobs");

            migrationBuilder.DropTable(
                name: "MachineFlow");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Machine",
                table: "Machine");

            migrationBuilder.RenameTable(
                name: "Machine",
                newName: "Machines");

            migrationBuilder.RenameColumn(
                name: "OSId",
                table: "Machines",
                newName: "OsID");

            migrationBuilder.RenameColumn(
                name: "IPAddress",
                table: "Machines",
                newName: "IpAddress");

            migrationBuilder.RenameColumn(
                name: "Type",
                table: "Machines",
                newName: "OperatingSystem");

            migrationBuilder.RenameIndex(
                name: "IX_Machine_LastModifiedByUserId",
                table: "Machines",
                newName: "IX_Machines_LastModifiedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Machine_CreatedByUserId",
                table: "Machines",
                newName: "IX_Machines_CreatedByUserId");

            migrationBuilder.AlterColumn<string>(
                name: "OsID",
                table: "Machines",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AlterColumn<string>(
                name: "Hostname",
                table: "Machines",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<string>(
                name: "Username",
                table: "Machines",
                type: "character varying(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Machines",
                table: "Machines",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "Machine_FlowVersion",
                columns: table => new
                {
                    MachineId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Machine_FlowVersion", x => new { x.MachineId, x.FlowVersionId });
                    table.ForeignKey(
                        name: "FK_Machine_FlowVersion_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Machine_FlowVersion_Machines_MachineId",
                        column: x => x.MachineId,
                        principalTable: "Machines",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Machines_Name",
                table: "Machines",
                column: "Name",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Machine_FlowVersion_FlowVersionId",
                table: "Machine_FlowVersion",
                column: "FlowVersionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Machines_WorkspaceUsers_CreatedByUserId",
                table: "Machines",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Machines_WorkspaceUsers_LastModifiedByUserId",
                table: "Machines",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_Machines_MachineId",
                table: "worc_Jobs",
                column: "MachineId",
                principalTable: "Machines",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Machines_WorkspaceUsers_CreatedByUserId",
                table: "Machines");

            migrationBuilder.DropForeignKey(
                name: "FK_Machines_WorkspaceUsers_LastModifiedByUserId",
                table: "Machines");

            migrationBuilder.DropForeignKey(
                name: "FK_worc_Jobs_Machines_MachineId",
                table: "worc_Jobs");

            migrationBuilder.DropTable(
                name: "Machine_FlowVersion");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Machines",
                table: "Machines");

            migrationBuilder.DropIndex(
                name: "IX_Machines_Name",
                table: "Machines");

            migrationBuilder.DropColumn(
                name: "Username",
                table: "Machines");

            migrationBuilder.RenameTable(
                name: "Machines",
                newName: "Machine");

            migrationBuilder.RenameColumn(
                name: "OsID",
                table: "Machine",
                newName: "OSId");

            migrationBuilder.RenameColumn(
                name: "IpAddress",
                table: "Machine",
                newName: "IPAddress");

            migrationBuilder.RenameColumn(
                name: "OperatingSystem",
                table: "Machine",
                newName: "Type");

            migrationBuilder.RenameIndex(
                name: "IX_Machines_LastModifiedByUserId",
                table: "Machine",
                newName: "IX_Machine_LastModifiedByUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Machines_CreatedByUserId",
                table: "Machine",
                newName: "IX_Machine_CreatedByUserId");

            migrationBuilder.AlterColumn<string>(
                name: "OSId",
                table: "Machine",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Hostname",
                table: "Machine",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(255)",
                oldMaxLength: 255);

            migrationBuilder.AddPrimaryKey(
                name: "PK_Machine",
                table: "Machine",
                column: "Id");

            migrationBuilder.CreateTable(
                name: "MachineFlow",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MachineId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MachineFlow", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MachineFlow_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MachineFlow_Machine_MachineId",
                        column: x => x.MachineId,
                        principalTable: "Machine",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MachineFlow_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MachineFlow_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MachineFlow_CreatedByUserId",
                table: "MachineFlow",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MachineFlow_FlowVersionId",
                table: "MachineFlow",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_MachineFlow_LastModifiedByUserId",
                table: "MachineFlow",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MachineFlow_MachineId",
                table: "MachineFlow",
                column: "MachineId");

            migrationBuilder.AddForeignKey(
                name: "FK_Machine_WorkspaceUsers_CreatedByUserId",
                table: "Machine",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Machine_WorkspaceUsers_LastModifiedByUserId",
                table: "Machine",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_worc_Jobs_Machine_MachineId",
                table: "worc_Jobs",
                column: "MachineId",
                principalTable: "Machine",
                principalColumn: "Id");
        }
    }
}
