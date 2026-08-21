using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAgentRiskApprovalAndIssues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApprovalJson",
                table: "worc_AgentRiskRegistry",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "IssuesJson",
                table: "worc_AgentRiskRegistry",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApprovalJson",
                table: "worc_AgentRiskRegistry");

            migrationBuilder.DropColumn(
                name: "IssuesJson",
                table: "worc_AgentRiskRegistry");
        }
    }
}
