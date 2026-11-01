namespace GlobalAdminAPIs.Data;

public class GlobalAdminDbContext : DbContext
{
    // Constructor to pass options (required for dependency injection)
    public GlobalAdminDbContext(DbContextOptions<GlobalAdminDbContext> options)
        : base(options)
    {
    }


    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<OnPremTenant>().Property(e => e.Type).HasConversion(new EnumToStringConverter<OnPremTenantTypesEnum>());
        builder.Entity<OnPremInstance>().Property(e => e.Type).HasConversion(new EnumToStringConverter<OnPremInstanceTypesEnum>());
        builder.Entity<OnPremInstanceData>().Property(e => e.ValidatedBy).HasConversion(new EnumToStringConverter<ValidationSourceTypesEnum>());

        // ---------------------------------------------------------------------------------
        // Performance indexes for the paginated list endpoints.
        //
        // These composite indexes match the filters and ORDER BY clauses used by the list
        // queries, so PostgreSQL can satisfy them with an index scan instead of sorting or
        // scanning the whole table. This is what keeps the endpoints responsive as the
        // instance-data table grows to millions/billions of rows.
        // ---------------------------------------------------------------------------------

        // Supports GET /onprem-tenant/list (ORDER BY CreatedOn DESC).
        builder.Entity<OnPremTenant>()
            .HasIndex(e => e.CreatedOn);

        // Supports GET /onprem/instance/{onPremTenantId}/list
        // (WHERE OnPremTenantId = @id ORDER BY DeployedOn DESC).
        builder.Entity<OnPremInstance>()
            .HasIndex(e => new { e.OnPremTenantId, e.DeployedOn });

        // Supports GET /onprem/instance-data/{tenantInstanceId}/list
        // (WHERE OnPremInstanceId = @id AND ValidatedOn >= @start AND ValidatedOn < @end
        //  ORDER BY ValidatedOn DESC).
        //
        // The same index also backs the statistics endpoints, whose aggregate queries read only
        // ExecutionTime and ExecutedJobs over a single instance. Including those columns lets
        // PostgreSQL answer the SUM with an index-only scan instead of fetching the heap row for
        // every row, which matters once the table holds millions/billions of rows.
        builder.Entity<OnPremInstanceData>()
            .HasIndex(e => new { e.OnPremInstanceId, e.ValidatedOn })
            .IncludeProperties(e => new { e.ExecutionTime, e.ExecutedJobs });

        // IMPORTANT NOTE: the service rejects a duplicate instance name per tenant before writing,
        // but only this unique index closes the race between two concurrent inserts.
        builder.Entity<OnPremInstance>()
            .HasIndex(e => new { e.OnPremTenantId, e.Name })
            .IsUnique();
    }

    // Define DbSet properties for your entities (tables in the database)
    public DbSet<OnPremTenant> OnPremTenants { get; set; }
    public DbSet<OnPremInstance> OnPremInstances { get; set; }
    public DbSet<OnPremInstanceData> OnPremInstanceData { get; set; }

    // Add more DbSet properties for other entities if necessary
}