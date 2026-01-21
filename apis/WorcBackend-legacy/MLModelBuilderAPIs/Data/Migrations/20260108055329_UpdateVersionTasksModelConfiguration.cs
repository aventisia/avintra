using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVersionTasksModelConfiguration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "LLM",
                table: "as_VersionTasks",
                newName: "Model");

            migrationBuilder.RenameColumn(
                name: "CloudLLMCredentialId",
                table: "as_VersionTasks",
                newName: "CredentialId");

            migrationBuilder.AddColumn<bool>(
                name: "IsJsonOutput",
                table: "as_VersionTasks",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "MaxOutputToken",
                table: "as_VersionTasks",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Provider",
                table: "as_VersionTasks",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "TopP",
                table: "as_VersionTasks",
                type: "double precision",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsJsonOutput",
                table: "as_VersionTasks");

            migrationBuilder.DropColumn(
                name: "MaxOutputToken",
                table: "as_VersionTasks");

            migrationBuilder.DropColumn(
                name: "Provider",
                table: "as_VersionTasks");

            migrationBuilder.DropColumn(
                name: "TopP",
                table: "as_VersionTasks");

            migrationBuilder.RenameColumn(
                name: "Model",
                table: "as_VersionTasks",
                newName: "LLM");

            migrationBuilder.RenameColumn(
                name: "CredentialId",
                table: "as_VersionTasks",
                newName: "CloudLLMCredentialId");
        }
    }
}
