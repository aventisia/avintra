namespace AccountsAPIs.DTOs
{
    /// <summary>
    /// DTO for updating only the features of a plan.
    /// </summary>
    public class PlanFeaturesDto
    {
        /// <summary>
        /// Gets or sets the unique identifier of the plan to be updated.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Gets or sets the features of the plan. Max-1000 characters.
        /// </summary>
        [MaxLength(1000)]
        public string? Features { get; set; }
    }
}
