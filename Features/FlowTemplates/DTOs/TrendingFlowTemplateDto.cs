namespace WorkspaceAPIs.DTOs
{
    /// <summary>
    /// DTO for the FlowTemplate entity.
    /// </summary>
    public class TrendingFlowTemplateDto
    {
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
        /// Gets or sets a flag indicating whether the user record is disabled.
        /// </summary>
        /// <remarks>
        /// Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
        /// </remarks>
        public bool? IsDisabled { get; set; }

        /// <summary>
        /// Gets or sets the username of the user who created the user record. 
        /// This property is intended for use in responses only and should not be included in requests.
        /// </summary>
        public string? CreatedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the user record was created. 
        /// This property is intended for use in responses only and should not be included in requests.
        /// </summary>
        public DateTimeOffset? CreatedOn { get; set; }

        /// <summary>
        /// Gets or sets the username of the user who last modified the user record.
        /// This property is intended for use in responses only and should not be included in requests.
        /// </summary>
        public string? LastModifiedBy { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the user record was last modified. 
        /// This property is intended for use in responses only and should not be included in requests.
        /// </summary>
        public DateTimeOffset? LastModifiedOn { get; set; }


    }
}
