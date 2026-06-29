namespace WorkspaceAPIs.Data
{
    /// <summary>
    /// WorkspaceInternalDbContext is the database context used for internal processing in the workspace application.
    /// 
    /// This DbContext manages entities related to internal operations such as job processing, machine management, 
    /// time triggers, and other workspace-related activities. These entities are **not exposed via API** but are kept 
    /// for internal use or future functionality.
    /// 
    /// Enum configurations are applied to certain properties to store enums as readable strings in the database.
    /// These configurations ensure better readability and querying of enum values.
    /// </summary>
    public class WorkspaceInternalDbContext : DbContext
    {
        public WorkspaceInternalDbContext(DbContextOptions<WorkspaceInternalDbContext> options)
            : base(options) { }

        // Override OnModelCreating to configure entity properties and relationships
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Enum configurations to store enums as strings in the database for easy readability
            modelBuilder.Entity<Flow>().Property(e => e.Type).HasConversion(new EnumToStringConverter<FlowTypesEnum>());
            modelBuilder.Entity<Machine>().Property(e => e.Type).HasConversion(new EnumToStringConverter<MachineTypeEnum>());
            modelBuilder.Entity<Machine>().Property(e => e.Status).HasConversion(new EnumToStringConverter<MachineStatusTypeEnum>());
            modelBuilder.Entity<Machine>().Property(e => e.Environment).HasConversion(new EnumToStringConverter<EnvironmentTypesEnum>());
            modelBuilder.Entity<TimeTrigger>().Property(e => e.Frequency).HasConversion(new EnumToStringConverter<TriggerFrequencyTypesEnum>());
            modelBuilder.Entity<Trigger>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
            modelBuilder.Entity<Job>().Property(e => e.Status).HasConversion(new EnumToStringConverter<JobStatusTypesEnum>());
            modelBuilder.Entity<Job>().Property(e => e.Priority).HasConversion(new EnumToStringConverter<JobPriorityTypesEnum>());
            modelBuilder.Entity<Job>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
            modelBuilder.Entity<Trigger>().Property(e => e.TriggerType).HasConversion(new EnumToStringConverter<TriggerTypesEnum>());
        }

        // The following DbSets represent entities used for internal processing in the application
        // These entities are **NOT EXPOSED in the API** but are for internal use or potential future API integrations.

        public DbSet<Flow> Flows { get; set; }
        public DbSet<FlowVersion> FlowVersions { get; set; }
        public DbSet<FlowVersionHistory> FlowVersionHistories { get; set; }
        public DbSet<Machine> Machine { get; set; }
        public DbSet<MachineFlow> MachineFlow { get; set; }
        public DbSet<Job> Jobs { get; set; }
        public DbSet<TimeTrigger> TimeTriggers { get; set; }
        public DbSet<TimeTriggersFlowVersion> TimeTriggersFlowVersions { get; set; }
        public DbSet<Trigger> Triggers { get; set; }
        public DbSet<TriggerFlowVersion> TriggerFlowVersions { get; set; }

        // They may be kept for future use or internal logic that does not require API access.
        // public DbSet<WorkspaceUser> Users { get; set; }  
        // public DbSet<ProjectTemplate> ProjectTemplates { get; set; }
        // public DbSet<TemplateResource> TemplateResources { get; set; }
    }
}
