using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddSupportTicketEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_CreatedByUserId",
                table: "ws_Tools");

            migrationBuilder.DropForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId",
                table: "ws_Tools");

            migrationBuilder.CreateTable(
                name: "ws_Ticket",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TicketNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    RequestType = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    RequiredBy = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    AgentRefId = table.Column<Guid>(type: "uuid", nullable: true),
                    AgentName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ChangeSummary = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ChangeReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    ExpectedBehavior = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    RequestedTimeline = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Complexity = table.Column<string>(type: "text", nullable: true),
                    EstimatedEffortHours = table.Column<int>(type: "integer", nullable: true),
                    EstimatedCompletionDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    IsBillable = table.Column<bool>(type: "boolean", nullable: true),
                    RequiresCustomerApproval = table.Column<bool>(type: "boolean", nullable: true),
                    RiskLevel = table.Column<string>(type: "text", nullable: true),
                    Dependencies = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    TriageRemarks = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_Ticket", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_Ticket_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ws_Ticket_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ws_TicketAttachment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    FilePath = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    FileSize = table.Column<long>(type: "bigint", nullable: false),
                    Extension = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: true),
                    UploadedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_TicketAttachment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_TicketAttachment_ws_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalTable: "ws_Ticket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ws_TicketComment",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Message = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    IsEdited = table.Column<bool>(type: "boolean", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_TicketComment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_TicketComment_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ws_TicketComment_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ws_TicketComment_ws_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalTable: "ws_Ticket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ws_TicketHistory",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    FieldName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    OldValue = table.Column<string>(type: "text", nullable: true),
                    NewValue = table.Column<string>(type: "text", nullable: true),
                    ChangedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    ChangedByName = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    ChangedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TicketId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ws_TicketHistory", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ws_TicketHistory_ws_Ticket_TicketId",
                        column: x => x.TicketId,
                        principalTable: "ws_Ticket",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ws_Ticket_CreatedByUserId",
                table: "ws_Ticket",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_Ticket_LastModifiedByUserId",
                table: "ws_Ticket",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_Ticket_TicketNumber",
                table: "ws_Ticket",
                column: "TicketNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ws_TicketAttachment_TicketId",
                table: "ws_TicketAttachment",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_TicketComment_CreatedByUserId",
                table: "ws_TicketComment",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_TicketComment_LastModifiedByUserId",
                table: "ws_TicketComment",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_TicketComment_TicketId",
                table: "ws_TicketComment",
                column: "TicketId");

            migrationBuilder.CreateIndex(
                name: "IX_ws_TicketHistory_TicketId",
                table: "ws_TicketHistory",
                column: "TicketId");

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_CreatedByUserId",
                table: "ws_Tools",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId",
                table: "ws_Tools",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_CreatedByUserId",
                table: "ws_Tools");

            migrationBuilder.DropForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId",
                table: "ws_Tools");

            migrationBuilder.DropTable(
                name: "ws_TicketAttachment");

            migrationBuilder.DropTable(
                name: "ws_TicketComment");

            migrationBuilder.DropTable(
                name: "ws_TicketHistory");

            migrationBuilder.DropTable(
                name: "ws_Ticket");

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_CreatedByUserId",
                table: "ws_Tools",
                column: "CreatedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ws_Tools_WorkspaceUsers_LastModifiedByUserId",
                table: "ws_Tools",
                column: "LastModifiedByUserId",
                principalTable: "WorkspaceUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
