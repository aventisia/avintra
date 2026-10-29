namespace AccountsAPIs.DTOs
{
    /// <summary>
    /// Represents the available credit summary, including the total available credits, 
    /// monthly credit details, and a generated summary string.
    /// </summary>
    public class AvailableCreditDto
    {
        /// <summary>
        /// Gets or sets the total available credits.
        /// </summary>
        public double AvailableCredits { get; set; }
    }

    /// <summary>
    /// Represents the available credit summary, including the total available credits, 
    /// monthly credit details, and a generated summary string.
    /// </summary>
    public class AvailableCreditSummaryDto
    {
        /// <summary>
        /// Gets or sets the total available credits.
        /// </summary>
        public double AvailableCredits { get; set; }

        /// <summary>
        /// Gets or sets the list of monthly credit details for each month.
        /// </summary>
        public List<MonthlyCreditDetailsDto> MonthlyCredits { get; set; } = new List<MonthlyCreditDetailsDto>();
    }

    /// <summary>
    /// Represents the credit details for a specific month, including available credits 
    /// and the expiration date for those credits.
    /// </summary>
    public class MonthlyCreditDetailsDto
    {
        /// <summary>
        /// Gets or sets the available credits for that specific month.
        /// </summary>
        public double AvailableCredits { get; set; }

        /// <summary>
        /// Gets or sets the current status of the credit (e.g., available, used, or expired).
        /// </summary>
        public CreditStatusesEnum Status { get; set; }

        /// <summary>
        /// Gets or sets the expiration date for the credits of that month.
        /// </summary>
        public DateTimeOffset ExpiredOn { get; set; }
    }
}
