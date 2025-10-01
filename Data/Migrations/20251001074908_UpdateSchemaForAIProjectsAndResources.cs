using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSchemaForAIProjectsAndResources : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversationalModels_MLModels_MLModelId",
                table: "ConversationalModels");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversationHistories_MLModels_MLModelId",
                table: "ConversationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_MLModels_MLModelId",
                table: "ExtractedData");

            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_ModelTasks_ModelTaskId",
                table: "ExtractedData");

            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_UploadedDocs_DocId",
                table: "ExtractedData");

            migrationBuilder.DropForeignKey(
                name: "FK_GenerativeModels_MLModels_MLModelId",
                table: "GenerativeModels");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledModels_MLModels_MLModelId",
                table: "ScheduledModels");

            migrationBuilder.DropTable(
                name: "MLModelUsers");

            migrationBuilder.DropTable(
                name: "MLModelVersions");

            migrationBuilder.DropTable(
                name: "ModelAPIKeys");

            migrationBuilder.DropTable(
                name: "ModelTasks");

            migrationBuilder.DropTable(
                name: "UploadedDocs");

            migrationBuilder.DropTable(
                name: "MLModels");

            migrationBuilder.DropIndex(
                name: "IX_GenerativeModels_MLModelId",
                table: "GenerativeModels");

            migrationBuilder.DropIndex(
                name: "IX_ConversationalModels_MLModelId",
                table: "ConversationalModels");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "ExtractedData");

            migrationBuilder.RenameColumn(
                name: "ModelTaskId",
                table: "ExtractedData",
                newName: "VersionTaskId");

            migrationBuilder.RenameColumn(
                name: "MLModelId",
                table: "ExtractedData",
                newName: "VersionResourceId");

            migrationBuilder.RenameColumn(
                name: "DocId",
                table: "ExtractedData",
                newName: "AIProjectVersionId");

            migrationBuilder.RenameIndex(
                name: "IX_ExtractedData_ModelTaskId",
                table: "ExtractedData",
                newName: "IX_ExtractedData_VersionTaskId");

            migrationBuilder.RenameIndex(
                name: "IX_ExtractedData_MLModelId",
                table: "ExtractedData",
                newName: "IX_ExtractedData_VersionResourceId");

            migrationBuilder.RenameIndex(
                name: "IX_ExtractedData_DocId",
                table: "ExtractedData",
                newName: "IX_ExtractedData_AIProjectVersionId");

            migrationBuilder.RenameColumn(
                name: "MLModelId",
                table: "ConversationHistories",
                newName: "AIProjectId");

            migrationBuilder.RenameIndex(
                name: "IX_ConversationHistories_MLModelId",
                table: "ConversationHistories",
                newName: "IX_ConversationHistories_AIProjectId");

            migrationBuilder.CreateTable(
                name: "as_AIProjects",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Type = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_as_AIProjects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_as_AIProjects_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_as_AIProjects_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "as_AIProjectUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AIProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessType = table.Column<string>(type: "text", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_as_AIProjectUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_as_AIProjectUsers_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectUsers_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectUsers_ModelBuilderUser_UserId",
                        column: x => x.UserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectUsers_as_AIProjects_AIProjectId",
                        column: x => x.AIProjectId,
                        principalTable: "as_AIProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "as_AIProjectVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AIProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false),
                    BusinessContext = table.Column<string>(type: "character varying(5000)", maxLength: 5000, nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    PublishedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    ArchivedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    Accuracy = table.Column<decimal>(type: "numeric", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_as_AIProjectVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_as_AIProjectVersions_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectVersions_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectVersions_as_AIProjects_AIProjectId",
                        column: x => x.AIProjectId,
                        principalTable: "as_AIProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "as_AIProjectVersionApiKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    ApiKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    AIProjectVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_as_AIProjectVersionApiKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_as_AIProjectVersionApiKeys_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectVersionApiKeys_ModelBuilderUser_LastModifiedByU~",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_AIProjectVersionApiKeys_as_AIProjectVersions_AIProjectVe~",
                        column: x => x.AIProjectVersionId,
                        principalTable: "as_AIProjectVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "as_VersionResources",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Extension = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: true),
                    Path = table.Column<string>(type: "text", nullable: false),
                    IsLocal = table.Column<bool>(type: "boolean", nullable: false),
                    IsSetupTest = table.Column<bool>(type: "boolean", nullable: false),
                    AIProjectVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ResourceText = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_as_VersionResources", x => x.Id);
                    table.ForeignKey(
                        name: "FK_as_VersionResources_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_as_VersionResources_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_as_VersionResources_as_AIProjectVersions_AIProjectVersionId",
                        column: x => x.AIProjectVersionId,
                        principalTable: "as_AIProjectVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "as_VersionTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    AIProjectId = table.Column<Guid>(type: "uuid", nullable: false),
                    AIProjectVersionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    IsBYOKEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    CloudLLMCredentialId = table.Column<Guid>(type: "uuid", nullable: true),
                    LLM = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Temperature = table.Column<double>(type: "double precision", nullable: false),
                    SystemPrompt = table.Column<string>(type: "text", nullable: false),
                    SetupObject = table.Column<string>(type: "text", nullable: true),
                    GeneratedPrompt = table.Column<string>(type: "text", nullable: true),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_as_VersionTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_as_VersionTasks_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_VersionTasks_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_VersionTasks_as_AIProjectVersions_AIProjectVersionId",
                        column: x => x.AIProjectVersionId,
                        principalTable: "as_AIProjectVersions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_as_VersionTasks_as_AIProjects_AIProjectId",
                        column: x => x.AIProjectId,
                        principalTable: "as_AIProjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GenerativeModels_MLModelId",
                table: "GenerativeModels",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_ConversationalModels_MLModelId",
                table: "ConversationalModels",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjects_CreatedByUserId",
                table: "as_AIProjects",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjects_LastModifiedByUserId",
                table: "as_AIProjects",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjects_Name_CreatedByUserId",
                table: "as_AIProjects",
                columns: new[] { "Name", "CreatedByUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectUsers_AIProjectId",
                table: "as_AIProjectUsers",
                column: "AIProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectUsers_CreatedByUserId",
                table: "as_AIProjectUsers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectUsers_LastModifiedByUserId",
                table: "as_AIProjectUsers",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectUsers_UserId",
                table: "as_AIProjectUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectVersionApiKeys_AIProjectVersionId",
                table: "as_AIProjectVersionApiKeys",
                column: "AIProjectVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectVersionApiKeys_CreatedByUserId",
                table: "as_AIProjectVersionApiKeys",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectVersionApiKeys_LastModifiedByUserId",
                table: "as_AIProjectVersionApiKeys",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectVersions_AIProjectId",
                table: "as_AIProjectVersions",
                column: "AIProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectVersions_CreatedByUserId",
                table: "as_AIProjectVersions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_AIProjectVersions_LastModifiedByUserId",
                table: "as_AIProjectVersions",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionResources_AIProjectVersionId",
                table: "as_VersionResources",
                column: "AIProjectVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionResources_CreatedByUserId",
                table: "as_VersionResources",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionResources_LastModifiedByUserId",
                table: "as_VersionResources",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionTasks_AIProjectId",
                table: "as_VersionTasks",
                column: "AIProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionTasks_AIProjectVersionId",
                table: "as_VersionTasks",
                column: "AIProjectVersionId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionTasks_CreatedByUserId",
                table: "as_VersionTasks",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_as_VersionTasks_LastModifiedByUserId",
                table: "as_VersionTasks",
                column: "LastModifiedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationalModels_as_AIProjects_MLModelId",
                table: "ConversationalModels",
                column: "MLModelId",
                principalTable: "as_AIProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationHistories_as_AIProjects_AIProjectId",
                table: "ConversationHistories",
                column: "AIProjectId",
                principalTable: "as_AIProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_as_AIProjectVersions_AIProjectVersionId",
                table: "ExtractedData",
                column: "AIProjectVersionId",
                principalTable: "as_AIProjectVersions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_as_VersionResources_VersionResourceId",
                table: "ExtractedData",
                column: "VersionResourceId",
                principalTable: "as_VersionResources",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_as_VersionTasks_VersionTaskId",
                table: "ExtractedData",
                column: "VersionTaskId",
                principalTable: "as_VersionTasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_GenerativeModels_as_AIProjects_MLModelId",
                table: "GenerativeModels",
                column: "MLModelId",
                principalTable: "as_AIProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledModels_as_AIProjects_MLModelId",
                table: "ScheduledModels",
                column: "MLModelId",
                principalTable: "as_AIProjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversationalModels_as_AIProjects_MLModelId",
                table: "ConversationalModels");

            migrationBuilder.DropForeignKey(
                name: "FK_ConversationHistories_as_AIProjects_AIProjectId",
                table: "ConversationHistories");

            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_as_AIProjectVersions_AIProjectVersionId",
                table: "ExtractedData");

            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_as_VersionResources_VersionResourceId",
                table: "ExtractedData");

            migrationBuilder.DropForeignKey(
                name: "FK_ExtractedData_as_VersionTasks_VersionTaskId",
                table: "ExtractedData");

            migrationBuilder.DropForeignKey(
                name: "FK_GenerativeModels_as_AIProjects_MLModelId",
                table: "GenerativeModels");

            migrationBuilder.DropForeignKey(
                name: "FK_ScheduledModels_as_AIProjects_MLModelId",
                table: "ScheduledModels");

            migrationBuilder.DropTable(
                name: "as_AIProjectUsers");

            migrationBuilder.DropTable(
                name: "as_AIProjectVersionApiKeys");

            migrationBuilder.DropTable(
                name: "as_VersionResources");

            migrationBuilder.DropTable(
                name: "as_VersionTasks");

            migrationBuilder.DropTable(
                name: "as_AIProjectVersions");

            migrationBuilder.DropTable(
                name: "as_AIProjects");

            migrationBuilder.DropIndex(
                name: "IX_GenerativeModels_MLModelId",
                table: "GenerativeModels");

            migrationBuilder.DropIndex(
                name: "IX_ConversationalModels_MLModelId",
                table: "ConversationalModels");

            migrationBuilder.RenameColumn(
                name: "VersionTaskId",
                table: "ExtractedData",
                newName: "ModelTaskId");

            migrationBuilder.RenameColumn(
                name: "VersionResourceId",
                table: "ExtractedData",
                newName: "MLModelId");

            migrationBuilder.RenameColumn(
                name: "AIProjectVersionId",
                table: "ExtractedData",
                newName: "DocId");

            migrationBuilder.RenameIndex(
                name: "IX_ExtractedData_VersionTaskId",
                table: "ExtractedData",
                newName: "IX_ExtractedData_ModelTaskId");

            migrationBuilder.RenameIndex(
                name: "IX_ExtractedData_VersionResourceId",
                table: "ExtractedData",
                newName: "IX_ExtractedData_MLModelId");

            migrationBuilder.RenameIndex(
                name: "IX_ExtractedData_AIProjectVersionId",
                table: "ExtractedData",
                newName: "IX_ExtractedData_DocId");

            migrationBuilder.RenameColumn(
                name: "AIProjectId",
                table: "ConversationHistories",
                newName: "MLModelId");

            migrationBuilder.RenameIndex(
                name: "IX_ConversationHistories_AIProjectId",
                table: "ConversationHistories",
                newName: "IX_ConversationHistories_MLModelId");

            migrationBuilder.AddColumn<string>(
                name: "Type",
                table: "ExtractedData",
                type: "text",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "MLModels",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Accuracy = table.Column<decimal>(type: "numeric", nullable: true),
                    BusinessContext = table.Column<string>(type: "text", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    GeneratedPrompt = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    LLM = table.Column<string>(type: "text", nullable: true),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    PublishedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    SetupObject = table.Column<string>(type: "text", nullable: true),
                    SetupStatus = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    TrainedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: true),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MLModels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MLModels_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MLModels_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MLModelUsers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    AccessType = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MLModelUsers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MLModelUsers_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MLModelUsers_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MLModelUsers_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MLModelUsers_ModelBuilderUser_UserId",
                        column: x => x.UserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "MLModelVersions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    IsArchived = table.Column<bool>(type: "boolean", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    IsDraft = table.Column<bool>(type: "boolean", nullable: false),
                    IsLocked = table.Column<bool>(type: "boolean", nullable: false),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    PublishedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false),
                    VersionNumber = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MLModelVersions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MLModelVersions_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MLModelVersions_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MLModelVersions_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelAPIKeys",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApiKey = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelAPIKeys", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelAPIKeys_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelAPIKeys_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelAPIKeys_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ModelTasks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    ConfigurationType = table.Column<string>(type: "text", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    GeneratedPrompt = table.Column<string>(type: "text", nullable: true),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LLM = table.Column<string>(type: "text", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    NodePrompt = table.Column<string>(type: "text", nullable: false),
                    SecretKey = table.Column<string>(type: "text", nullable: true),
                    SetupObject = table.Column<string>(type: "text", nullable: true),
                    Temperature = table.Column<double>(type: "double precision", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ModelTasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ModelTasks_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelTasks_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ModelTasks_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UploadedDocs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FineTuningLogId = table.Column<Guid>(type: "uuid", nullable: true),
                    LastModifiedByUserId = table.Column<Guid>(type: "uuid", nullable: false),
                    MLModelId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Extension = table.Column<string>(type: "text", nullable: false),
                    IsDisabled = table.Column<bool>(type: "boolean", nullable: false),
                    LastModifiedOn = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                    Name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Path = table.Column<string>(type: "text", nullable: false),
                    Size = table.Column<long>(type: "bigint", nullable: false),
                    Stage = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    xmin = table.Column<uint>(type: "xid", rowVersion: true, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UploadedDocs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UploadedDocs_FineTuningLogs_FineTuningLogId",
                        column: x => x.FineTuningLogId,
                        principalTable: "FineTuningLogs",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_UploadedDocs_MLModels_MLModelId",
                        column: x => x.MLModelId,
                        principalTable: "MLModels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UploadedDocs_ModelBuilderUser_CreatedByUserId",
                        column: x => x.CreatedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UploadedDocs_ModelBuilderUser_LastModifiedByUserId",
                        column: x => x.LastModifiedByUserId,
                        principalTable: "ModelBuilderUser",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GenerativeModels_MLModelId",
                table: "GenerativeModels",
                column: "MLModelId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConversationalModels_MLModelId",
                table: "ConversationalModels",
                column: "MLModelId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MLModels_CreatedByUserId",
                table: "MLModels",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModels_LastModifiedByUserId",
                table: "MLModels",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModels_Name_CreatedByUserId",
                table: "MLModels",
                columns: new[] { "Name", "CreatedByUserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MLModelUsers_CreatedByUserId",
                table: "MLModelUsers",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModelUsers_LastModifiedByUserId",
                table: "MLModelUsers",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModelUsers_MLModelId",
                table: "MLModelUsers",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModelUsers_UserId",
                table: "MLModelUsers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModelVersions_CreatedByUserId",
                table: "MLModelVersions",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModelVersions_LastModifiedByUserId",
                table: "MLModelVersions",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_MLModelVersions_MLModelId",
                table: "MLModelVersions",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelAPIKeys_CreatedByUserId",
                table: "ModelAPIKeys",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelAPIKeys_LastModifiedByUserId",
                table: "ModelAPIKeys",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelAPIKeys_MLModelId",
                table: "ModelAPIKeys",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTasks_CreatedByUserId",
                table: "ModelTasks",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTasks_LastModifiedByUserId",
                table: "ModelTasks",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_ModelTasks_MLModelId",
                table: "ModelTasks",
                column: "MLModelId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocs_CreatedByUserId",
                table: "UploadedDocs",
                column: "CreatedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocs_FineTuningLogId",
                table: "UploadedDocs",
                column: "FineTuningLogId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocs_LastModifiedByUserId",
                table: "UploadedDocs",
                column: "LastModifiedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_UploadedDocs_MLModelId",
                table: "UploadedDocs",
                column: "MLModelId");

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationalModels_MLModels_MLModelId",
                table: "ConversationalModels",
                column: "MLModelId",
                principalTable: "MLModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationHistories_MLModels_MLModelId",
                table: "ConversationHistories",
                column: "MLModelId",
                principalTable: "MLModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_MLModels_MLModelId",
                table: "ExtractedData",
                column: "MLModelId",
                principalTable: "MLModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_ModelTasks_ModelTaskId",
                table: "ExtractedData",
                column: "ModelTaskId",
                principalTable: "ModelTasks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ExtractedData_UploadedDocs_DocId",
                table: "ExtractedData",
                column: "DocId",
                principalTable: "UploadedDocs",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_GenerativeModels_MLModels_MLModelId",
                table: "GenerativeModels",
                column: "MLModelId",
                principalTable: "MLModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ScheduledModels_MLModels_MLModelId",
                table: "ScheduledModels",
                column: "MLModelId",
                principalTable: "MLModels",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
