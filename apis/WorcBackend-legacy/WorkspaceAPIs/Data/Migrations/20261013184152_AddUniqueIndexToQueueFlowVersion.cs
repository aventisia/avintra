using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WorkspaceAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueIndexToQueueFlowVersion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_QueueFlowVersion_QueueId",
                table: "QueueFlowVersion");

            migrationBuilder.CreateIndex(
                name: "IX_QueueFlowVersion_QueueId_FlowVersionId",
                table: "QueueFlowVersion",
                columns: new[] { "QueueId", "FlowVersionId" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_QueueFlowVersion_QueueId_FlowVersionId",
                table: "QueueFlowVersion");

            migrationBuilder.CreateIndex(
                name: "IX_QueueFlowVersion_QueueId",
                table: "QueueFlowVersion",
                column: "QueueId");
        }
    }
}
