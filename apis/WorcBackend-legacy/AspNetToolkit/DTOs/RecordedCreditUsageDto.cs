namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the calculated credit usage that was recorded for a specific service type.
/// </summary>
public class RecordedCreditUsageDto
{
    /// <summary>
    /// Gets or sets the type of service for which the credits were used.
    /// </summary>
    public CreditServicesEnum ServiceType { get; set; }

    /// <summary>
    /// Gets or sets the number of credits that were consumed for the service type.
    /// </summary>
    public double CreditsUsed { get; set; }
}
