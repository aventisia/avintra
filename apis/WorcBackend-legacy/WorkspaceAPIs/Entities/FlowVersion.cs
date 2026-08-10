namespace WorkspaceAPIs.Entities;

public class FlowVersion : BaseEntity, IMustHaveTenant
{
    /// <summary>
    /// Gets or sets the tenant record's primary key for global filter (multi tenancy architecture).
    /// </summary>
    public Guid TenantId { get; set; }

    /// <summary>
    /// Gets or sets the ID of the space this flow version belongs to.
    /// Null indicates the flow version is in the default "Central" space (shared across the tenant).
    /// </summary>
    public Guid? SpaceId { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version is in locked state.
    /// </summary>
    public bool IsLocked { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version is in draft state.
    /// </summary>
    public bool IsDraft { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been published.
    /// </summary>
    public bool IsPublished { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the version has been archived.
    /// </summary>
    public bool IsArchived { get; set; }

    /// <summary>
    /// Gets or sets the flow's nodes, edges, and viewport JSON data in string format. The default value will be an empty object.
    /// </summary>
    public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

    /// <summary>
    /// Gets or sets the FlowVariablesObject.
    /// This property contains a JSON string that includes the name, value, and datatype of each variable.
    /// </summary>
    public string? FlowVariablesObject { get; set; }

    /// <summary>
    /// Gets or sets the InputOutputObject, which is a JSON string that defines the input and output data for the flow.
    /// </summary>
    public string? InputOutputObject { get; set; }

    /// <summary>
    /// Gets or sets the execution configuration for the flow version as a JSON string.
    /// </summary>
    public JsonDocument? Settings { get; set; }

    /// <summary>
    /// Gets or sets the ID of the flow to which the flow version belongs.
    /// </summary>
    public required Guid FlowId { get; set; }

    /// <summary>
    /// Gets or sets the flow record associated with a flow version record
    /// </summary>
    [ForeignKey("FlowId")]
    public virtual Flow? Flow { get; set; }

    /// <summary>
    /// Gets or sets the version number of a flow version record
    /// </summary>
    public int VersionNumber { get; set; }

    /// <summary>
    /// Gets or sets a value indicating whether the flow version is accessible to all users within the tenant.
    /// </summary>
    public bool IsTenantWideAccess { get; set; }

    /// <summary>
    /// Gets or sets the supported platforms for the flow version as a comma-separated string.
    /// </summary>
    public string? SupportedPlatform { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between machine flow and flow versions.
    /// </summary>
    public virtual ICollection<Machine_FlowVersion> FlowVersionMachines { get; set; } = new List<Machine_FlowVersion>();

    /// <summary>
    /// Configures the many-to-many relationship between queue transactions and flow versions.
    /// </summary>
    public virtual ICollection<QueueTransaction>? QueueTransactions { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between jobs and flow versions.
    /// </summary>
    public virtual ICollection<Job>? Jobs { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between queue and flow versions.
    /// </summary>
    public virtual ICollection<QueueFlowVersion>? QueueFlowVersions { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between trigger and flow versions.
    /// </summary>
    public virtual ICollection<TimeTriggersFlowVersion>? TriggerFlowVersions { get; set; }

    /// <summary>
    /// Configures the many-to-many relationship between flow version history and flow versions.
    /// </summary>
    public virtual ICollection<FlowVersionHistory> FlowVersionHistories { get; set; } = new List<FlowVersionHistory>();

    /// <summary>
    /// Configures the many-to-many relationship between user and flow versions.
    /// </summary>
    public virtual ICollection<FlowVersionUser>? FlowVersionUsers { get; set; } = new List<FlowVersionUser>();

    /// <summary>
    /// Configures the many-to-many relationship between conversation and flow versions.
    /// </summary>
    public virtual ICollection<Conversation> Conversations { get; set; } = new List<Conversation>();
}