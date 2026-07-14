namespace AccountsAPIs.Services;

public interface IEmailCampaignService
{
    /// <summary>
    /// Fetches email campaign records with optional filters.
    /// </summary>
    /// <param name="startDate">Optional start date for created-on filtering.</param>
    /// <param name="endDate">Optional end date for created-on filtering.</param>
    /// <param name="campaignID">Optional campaign ID to filter by.</param>
    /// <returns>The task result contains the filtered list of email campaign records.</returns>
    Task<ServiceResponse<IEnumerable<EmailCampaignDto>>> GetEmailCampaignsAsync(
        DateTimeOffset? startDate,
        DateTimeOffset? endDate,
        string? campaignID);

    /// <summary>
    /// Inserts a new email campaign-recipient mapping.
    /// </summary>
    /// <param name="emailCampaignDto">The data for the new email campaign record.</param>
    /// <returns>The task result contains the service response indicating whether the insertion was successful.</returns>
    Task<ServiceResponse<bool>> InsertEmailCampaignAsync(EmailCampaignDto emailCampaignDto);
}
