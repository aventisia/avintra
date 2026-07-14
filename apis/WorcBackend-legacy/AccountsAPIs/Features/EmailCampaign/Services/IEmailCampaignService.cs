namespace AccountsAPIs.Services;

public interface IEmailCampaignService
{
    /// <summary>
    /// Inserts a new email campaign-recipient mapping.
    /// </summary>
    /// <param name="emailCampaignDto">The data for the new email campaign record.</param>
    /// <returns>The task result contains the service response indicating whether the insertion was successful.</returns>
    Task<ServiceResponse<bool>> InsertEmailCampaignAsync(EmailCampaignDto emailCampaignDto);
}
