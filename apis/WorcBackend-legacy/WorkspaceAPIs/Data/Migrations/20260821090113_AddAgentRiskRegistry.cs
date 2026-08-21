using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentRiskRegistry : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "worc_AgentRiskRegistry",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SpaceId = table.Column<Guid>(type: "uuid", nullable: true),
                    FlowVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    FlowId = table.Column<Guid>(type: "uuid", nullable: false),
                    AgentName = table.Column<string>(type: "text", nullable: true),
                    AgentType = table.Column<string>(type: "text", nullable: true),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    IsConsumerFacing = table.Column<bool>(type: "boolean", nullable: false),
                    IntendedUse = table.Column<string>(type: "text", nullable: true),
                    BusinessProcesses = table.Column<string>(type: "text", nullable: true),
                    ScopeScore = table.Column<int>(type: "integer", nullable: false),
                    DataSensitivityScore = table.Column<int>(type: "integer", nullable: false),
                    DependencyComplexityScore = table.Column<int>(type: "integer", nullable: false),
                    SupervisoryImpactScore = table.Column<int>(type: "integer", nullable: false),
                    CompositeTier = table.Column<string>(type: "text", nullable: false),
                    TierJustification = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    LastValidationDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    NextReviewDate = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    ValidatorUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    AiModelsJson = table.Column<string>(type: "text", nullable: true),
                    ThirdPartyToolsJson = table.Column<string>(type: "text", nullable: true),
                    SkillsJson = table.Column<string>(type: "text", nullable: true),
                    KnowledgeBasesJson = table.Column<string>(type: "text", nullable: true),
                    RisksJson = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_worc_AgentRiskRegistry", x => x.Id);
                    table.ForeignKey(
                        name: "FK_worc_AgentRiskRegistry_WorkspaceUsers_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_worc_AgentRiskRegistry_WorkspaceUsers_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "WorkspaceUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_worc_AgentRiskRegistry_CreatedByUserId",
                table: "worc_AgentRiskRegistry",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_worc_AgentRiskRegistry_FlowVersionId",
                table: "worc_AgentRiskRegistry",
                column: "FlowVersionId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_worc_AgentRiskRegistry_LastModifiedByUserId",
                table: "worc_AgentRiskRegistry",
                column: "LastModifiedByUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "worc_AgentRiskRegistry");
        }
    }
}
