namespace AccountsAPIs.Services;

public class EmailCampaignService : IEmailCampaignService
{
    private readonly ILogger<EmailCampaignService> _logger;
    private readonly IUnitOfWork _unitOfWork;

    public EmailCampaignService(
        ILogger<EmailCampaignService> logger,
        IUnitOfWork unitOfWork)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Inserts a new email campaign-recipient mapping.
    public async Task<ServiceResponse<bool>> InsertEmailCampaignAsync(EmailCampaignDto emailCampaignDto)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to submit email campaign request. Please try again"
        };

        try
        {
            emailCampaignDto = TrimDtoStringPropsUtil.TrimDtoStringProps(emailCampaignDto);

            var newEmailCampaign = emailCampaignDto.Adapt<EmailCampaign>();
            await _unitOfWork.EmailCampaignRepo.InsertAsync(newEmailCampaign);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new EmailCampaign record");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email campaign request submitted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }
}
