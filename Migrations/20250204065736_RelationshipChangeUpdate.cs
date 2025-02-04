using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MLModelBuilderAPIs.Migrations
{
    /// <inheritdoc />
    public partial class RelationshipChangeUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DataFields_ModelBuilderUser_CreatedByUserId",
                table: "DataFields");

            migrationBuilder.DropForeignKey(
                name: "FK_DataFields_ModelBuilderUser_LastModifiedByUserId",
                table: "DataFields");

            migrationBuilder.DropForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_CreatedByUserId",
                table: "UploadedDocs");

            migrationBuilder.DropForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_LastModifiedByUserId",
                table: "UploadedDocs");

            migrationBuilder.AddForeignKey(
                name: "FK_DataFields_ModelBuilderUser_CreatedByUserId",
                table: "DataFields",
                column: "CreatedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DataFields_ModelBuilderUser_LastModifiedByUserId",
                table: "DataFields",
                column: "LastModifiedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_CreatedByUserId",
                table: "UploadedDocs",
                column: "CreatedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_LastModifiedByUserId",
                table: "UploadedDocs",
                column: "LastModifiedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DataFields_ModelBuilderUser_CreatedByUserId",
                table: "DataFields");

            migrationBuilder.DropForeignKey(
                name: "FK_DataFields_ModelBuilderUser_LastModifiedByUserId",
                table: "DataFields");

            migrationBuilder.DropForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_CreatedByUserId",
                table: "UploadedDocs");

            migrationBuilder.DropForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_LastModifiedByUserId",
                table: "UploadedDocs");

            migrationBuilder.AddForeignKey(
                name: "FK_DataFields_ModelBuilderUser_CreatedByUserId",
                table: "DataFields",
                column: "CreatedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DataFields_ModelBuilderUser_LastModifiedByUserId",
                table: "DataFields",
                column: "LastModifiedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_CreatedByUserId",
                table: "UploadedDocs",
                column: "CreatedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UploadedDocs_ModelBuilderUser_LastModifiedByUserId",
                table: "UploadedDocs",
                column: "LastModifiedByUserId",
                principalTable: "ModelBuilderUser",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
