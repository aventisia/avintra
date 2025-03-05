using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddQueueAndQueueTransactionEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Queues",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Queues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Queues_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Queues_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QueueTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    PayloadData = table.Column<string>(type: "text", nullable: true),
                    QueueId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QueueTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QueueTransactions_FlowVersions_FlowVersionId",
                        column: x => x.FlowVersionId,
                        principalTable: "FlowVersions",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_QueueTransactions_Queues_QueueId",
                        column: x => x.QueueId,
                        principalTable: "Queues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QueueTransactions_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QueueTransactions_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Queues_CreatedByUserId",
                table: "Queues",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Queues_LastModifiedByUserId",
                table: "Queues",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_CreatedByUserId",
                table: "QueueTransactions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_FlowVersionId",
                table: "QueueTransactions",
                column: "FlowVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_LastModifiedByUserId",
                table: "QueueTransactions",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_QueueTransactions_QueueId",
                table: "QueueTransactions",
                column: "QueueId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "QueueTransactions");

            migrationBuilder.DropTable(
                name: "Queues");
        }
    }
}
