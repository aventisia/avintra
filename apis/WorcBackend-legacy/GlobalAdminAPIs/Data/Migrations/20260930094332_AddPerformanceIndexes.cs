using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GlobalAdminAPIs.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Indexes backing the list and statistics endpoints:
            //   ga_OnPremTenants(CreatedOn)
            //     -> GET /onprem-tenant/list                 (ORDER BY CreatedOn DESC)
            //   ga_OnPremInstances(OnPremTenantId, DeployedOn)
            //     -> GET /onprem/instance/{id}/list          (WHERE OnPremTenantId = @id ORDER BY DeployedOn DESC)
            //   ga_OnPremInstanceData(OnPremInstanceId, ValidatedOn) INCLUDE (ExecutionTime, ExecutedJobs)
            //     -> GET /onprem/instance-data/{id}/list
            //        (WHERE OnPremInstanceId = @id AND ValidatedOn >= @start AND ValidatedOn < @end
            //         ORDER BY ValidatedOn DESC)
            //     -> the statistics endpoints, whose SUMs read only ExecutionTime/ExecutedJobs
            //
            // The composite indexes also cover the existing single-column foreign-key indexes, so
            // those are dropped below. Because ga_OnPremInstanceData can hold billions of rows,
            // every index is built/dropped CONCURRENTLY so the table stays readable and writable
            // while the migration runs. CONCURRENTLY cannot run inside a transaction, hence
            // suppressTransaction: true on every statement.
            migrationBuilder.Sql(
                "DROP INDEX CONCURRENTLY IF EXISTS \"IX_ga_OnPremInstances_OnPremTenantId\";",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "DROP INDEX CONCURRENTLY IF EXISTS \"IX_ga_OnPremInstanceData_OnPremInstanceId\";",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS \"IX_ga_OnPremTenants_CreatedOn\" " +
                "ON \"ga_OnPremTenants\" (\"CreatedOn\");",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS \"IX_ga_OnPremInstances_OnPremTenantId_DeployedOn\" " +
                "ON \"ga_OnPremInstances\" (\"OnPremTenantId\", \"DeployedOn\");",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS \"IX_ga_OnPremInstanceData_OnPremInstanceId_ValidatedOn\" " +
                "ON \"ga_OnPremInstanceData\" (\"OnPremInstanceId\", \"ValidatedOn\") " +
                "INCLUDE (\"ExecutionTime\", \"ExecutedJobs\");",
                suppressTransaction: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "DROP INDEX CONCURRENTLY IF EXISTS \"IX_ga_OnPremInstanceData_OnPremInstanceId_ValidatedOn\";",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "DROP INDEX CONCURRENTLY IF EXISTS \"IX_ga_OnPremInstances_OnPremTenantId_DeployedOn\";",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "DROP INDEX CONCURRENTLY IF EXISTS \"IX_ga_OnPremTenants_CreatedOn\";",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS \"IX_ga_OnPremInstances_OnPremTenantId\" " +
                "ON \"ga_OnPremInstances\" (\"OnPremTenantId\");",
                suppressTransaction: true);

            migrationBuilder.Sql(
                "CREATE INDEX CONCURRENTLY IF NOT EXISTS \"IX_ga_OnPremInstanceData_OnPremInstanceId\" " +
                "ON \"ga_OnPremInstanceData\" (\"OnPremInstanceId\");",
                suppressTransaction: true);
        }
    }
}
