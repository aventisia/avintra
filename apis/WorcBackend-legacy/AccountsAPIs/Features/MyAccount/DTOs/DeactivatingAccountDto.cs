namespace AccountsAPIs.DTOs;

public class DeactivationStatusDto
{
    /// <summary>
    /// shows the status of the is account in deactivation
    /// </summary>
    [Required]
    public required bool Deactivating { get; set; }

    /// <summary>
    /// shows the time left in deactivation. usualy 10 days
    /// </summary>
    public required DateTime TimeRemains { get; set; }

}