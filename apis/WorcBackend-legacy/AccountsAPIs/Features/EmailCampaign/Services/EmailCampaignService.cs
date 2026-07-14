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

    // Retrieves email campaign records using optional campaign and date-range filters.
    public async Task<ServiceResponse<IEnumerable<EmailCampaignDto>>> GetEmailCampaignsAsync(
        DateTimeOffset? startDate,
        DateTimeOffset? endDate,
        string? campaignID)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<EmailCampaignDto>>
        {
            Data = null,
            StatusCode = 400,
            Message = "Failed to fetch email campaign records. Please try again"
        };

        try
        {
            if (startDate.HasValue && endDate.HasValue && startDate.Value > endDate.Value)
            {
                serviceResponse.Message = "StartDate cannot be greater than EndDate";
                return serviceResponse;
            }

            // Initialize the base query.
            var query = _unitOfWork.EmailCampaignRepo
                .GetByConditionAsync(w => true)
                .OrderByDescending(o => o.CreatedOn)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(campaignID))
            {
                var normalizedCampaignID = campaignID.Trim();
                query = query.Where(w => w.CampaignID == normalizedCampaignID);
            }

            if (startDate.HasValue)
            {
                query = query.Where(w => w.CreatedOn >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(w => w.CreatedOn <= endDate.Value);
            }

            var emailCampaignRecords = await query.ToListAsync();

            serviceResponse.Data = emailCampaignRecords.Adapt<IEnumerable<EmailCampaignDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email campaign records fetched successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
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
