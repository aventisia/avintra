namespace WorkspaceAPIs.Entities
{
    /// <summary>
    /// Represents an entity that stores flow template data.
    /// </summary>
    public class FlowTemplate : BaseEntity
    {
        /// <summary>
        /// Gets or sets the primary key of the FlowTemplate record.
        /// </summary>
        [Key]
        public Guid TemplateId { get; set; }

        /// <summary>
        /// Gets or sets the name of the flow template. Max-255 characters.
        /// </summary>
        [MaxLength(255)]
        public required string Name { get; set; }

        /// <summary>
        /// Gets or sets the description of the flow template. Max-500 characters.
        /// </summary>
        [MaxLength(500)]
        public string? Description { get; set; }

        /// <summary>
        /// Gets or sets the flow template's nodes, edges, and viewport JSON data in string format.
        /// The default value will be an empty object.
        /// </summary>
        public string? ReactFlowObject { get; set; } = "{\"nodes\":[],\"edges\":[],\"viewport\":{\"x\":0,\"y\":0,\"zoom\":1}}";

        /// <summary>
        /// Gets or sets the category of the flow template (e.g., Workflow, Automation, etc.).
        /// </summary>
        [MaxLength(100)]
        public string? Category { get; set; }

        /// <summary>
        /// Gets or sets the number of times this template has been used to create flows.
        /// This will be used to track trending templates.
        /// </summary>
        public int UsagesCount { get; set; }

        /// <summary>
        /// Gets or sets the list of Flows that are based on this template 
        /// </summary>
        public virtual ICollection<Flow>? Flows { get; set; } 
      
    }
}

