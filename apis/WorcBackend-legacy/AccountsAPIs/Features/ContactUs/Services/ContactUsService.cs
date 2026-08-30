namespace AccountsAPIs.Services;

public class ContactUsService : IContactUsService
{
    private readonly ILogger<ContactUsService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IEmailService _emailService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly string _userName;

    public ContactUsService(
        ILogger<ContactUsService> logger,
        IUnitOfWork unitOfWork,
        IEmailService emailService,
        EnvironmentConfig environmentConfig,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userName
        _userName = httpContextAccessor.HttpContext?.User?.FindFirstValue("uname") ?? "Unknown";

        _logger = logger;
        _unitOfWork = unitOfWork;
        _emailService = emailService;
        _environmentConfig = environmentConfig;
    }

    // Retrieves a specific contact us record by its ID.
    public async Task<ServiceResponse<ContactUsDto>> GetContactUsAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ContactUsDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get ContactUs record
            var contactUs = await _unitOfWork.ContactUsRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // ContactUs record doesn't exist
            if (contactUs == null)
            {
                serviceResponse.Message = "ContactUs record does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = contactUs.Adapt<ContactUsDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ContactUs record retrieved successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of contact us records.
    public async Task<ServiceResponse<IEnumerable<ContactUsDto>>> GetContactUsListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<ContactUsDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get ContactUs records
            var contactUsList = await _unitOfWork.ContactUsRepo
                                        .GetByConditionAsync(w => true) //PEDNING: Update condition
                                        .ToListAsync();

            // Task successful
            serviceResponse.Data = contactUsList.Adapt<IEnumerable<ContactUsDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ContactUs records retrieved successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new contact us record. Since contact us form is public we are not returning the inserted ContactUs record in the response.
    public async Task<ServiceResponse<bool>> InsertContactUsAsync(ContactUsDto contactUsDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to submit contact request. Please try again"
        };

        try
        {
            // Trim dto' string props
            contactUsDto = TrimDtoStringPropsUtil.TrimDtoStringProps(contactUsDto);

            // Insert ContactUs record
            var newContactUs = contactUsDto.Adapt<ContactUs>();
            await _unitOfWork.ContactUsRepo.InsertAsync(newContactUs);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Failed to send VerificationCode email
            if (!await _emailService.SendEmailUsingTemplate(
                EmailTypesEnum.ContactUsRequest,
                _environmentConfig.SalesEmails,
                new Dictionary<string, string>()
                {
                    {"{{userFullName}}", contactUsDto.Name },
                    {"{{userEmail}}", contactUsDto.Email },
                    {"{{userPhone}}", string.IsNullOrEmpty(contactUsDto.Phone) ? "Not Available" : contactUsDto.Phone },
                    {"{{userMessage}}", contactUsDto.Message }
                }))
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Request submitted successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing contact us record.
    public async Task<ServiceResponse<ContactUsDto>> UpdateContactUsAsync(ContactUsDto contactUsDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ContactUsDto>
        {
            Data = null,
            Message = "Failed to update ContactUs record. Please try again"
        };

        try
        {
            // Validate ContactUs record existence
            var contactUs = await _unitOfWork.ContactUsRepo
                                        .GetByConditionAsync(w => w.Id == contactUsDto.Id)
                                        .SingleOrDefaultAsync();

            // ContactUs record does not exist
            if (contactUs == null)
            {
                serviceResponse.Message = "ContactUs record does not exist";
                return serviceResponse;
            }

            // Trim dto' string props
            contactUsDto = TrimDtoStringPropsUtil.TrimDtoStringProps(contactUsDto);

            // Update ContactUs record - Auto mapping is not required
            // TODO: contactUs.IsReviewed = contactUsDto.IsReviewed ?? contactUs.IsReviewed;
            // TODO: contactUs.ReviewerRemarks = contactUsDto.ReviewerRemarks ?? contactUs.ReviewerRemarks;
            // TODO: contactUs.IsDisabled = contactUsDto.IsDisabled ?? contactUs.IsDisabled;
            // TODO: contactUs.ReviewedOn = DateTimeOffset.UtcNow;
            // TODO: contactUs.ModifiedBy = _userName;
            // TODO: contactUs.ModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.ContactUsRepo.Update(contactUs);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = contactUs.Adapt<ContactUsDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ContactUs record updated successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a contact us record by its ID.
    public async Task<ServiceResponse<bool>> DeleteContactUsAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete ContactUs record. Please try again"
        };

        try
        {
            // Validate ContactUs record existence
            var contactUs = await _unitOfWork.ContactUsRepo
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // ContactUs record does not exist
            if (contactUs == null)
            {
                serviceResponse.Message = "ContactUs record does not exist";
                return serviceResponse;
            }

            // Delete ContactUs record
            _unitOfWork.ContactUsRepo.Delete(contactUs);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ContactUs record deleted successfully";
        }
        catch (Exception ex)
        {
            return serviceResponse;
        }

        return serviceResponse;
    }

}