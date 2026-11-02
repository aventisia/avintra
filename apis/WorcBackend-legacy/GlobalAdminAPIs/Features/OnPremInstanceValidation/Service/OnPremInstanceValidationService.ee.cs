namespace GlobalAdminAPIs.Services;

public class OnPremInstanceValidationService : IOnPremInstanceValidationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentOnPremTenantService _currentOnPremTenantService;
    private readonly ILogger<OnPremInstanceValidationService> _logger;
    private readonly IEmailService _emailService;
    private readonly IEmailRateLimiterService _emailRateLimiterService;

    public OnPremInstanceValidationService(
        ILogger<OnPremInstanceValidationService> logger,
        IUnitOfWork unitOfWork,
        ICurrentOnPremTenantService currentOnPremTenantService,
        IEmailService emailService,
        IEmailRateLimiterService emailRateLimiterService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentOnPremTenantService = currentOnPremTenantService;
        _emailService = emailService;
        _emailRateLimiterService = emailRateLimiterService;
    }

    // Retrieves metadata information for the on-premise tenant and instance asynchronously.
    public async Task<ServiceResponse<OnPremDeploymentMetaDataDto>> GetOnPremInstanceMetadataAsync()
    {
        var serviceResponse = new ServiceResponse<OnPremDeploymentMetaDataDto>
        {
            Data = null,
            Message = "Failed to get on-prem instance metadata. Please try again."
        };

        try
        {
            // Get tenant record
            var onPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Id == _currentOnPremTenantService.CurrentOnPremTenantId)
                .FirstOrDefaultAsync();

            // Tenant not found
            if (onPremTenant == null)
            {
                _logger.LogWarning("OnPrem tenant not found. TenantId: {TenantId}", _currentOnPremTenantService.CurrentOnPremTenantId);
                serviceResponse.Message = "On-prem tenant not found.";
                return serviceResponse;
            }

            // Get instance record
            var onPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Id == _currentOnPremTenantService.CurrentOnPremInstanceId)
                .FirstOrDefaultAsync();

            // Instance not found
            if (onPremInstance == null)
            {
                _logger.LogWarning("OnPrem instance not found. InstanceId: {InstanceId}", _currentOnPremTenantService.CurrentOnPremInstanceId);
                serviceResponse.Message = "On-prem instance not found.";
                return serviceResponse;
            }

            // Create a metadata DTO
            var metadataDto = new OnPremDeploymentMetaDataDto
            {
                TenantType = onPremTenant.Type.ToString(),
                InstanceType = onPremInstance.Type.ToString(),
                TenantName = onPremTenant.Name,
                ContractStart = onPremTenant.ContractStartDate.DateTime,
                ContractEnd = onPremTenant.ContractRenewalDate.DateTime,
                ExecutionTimeAllowed = onPremTenant.ExecutionTimeAllowed,
                ExecutionDisabled = onPremTenant.IsExecutionDisabled,
                LoginDisabled = onPremTenant.IsLoginDisabled,
                SsoAllowed = onPremTenant.IsSsoAllowed,
                BrandingAllowed = onPremTenant.IsBrandingAllowed
            };

            // Set the service response data
            serviceResponse.Data = metadataDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "On-prem instance metadata retrieved successfully.";

            _logger.LogInformation($"Successfully retrieved on-prem instance metadata for instance {_currentOnPremTenantService.CurrentOnPremInstanceId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving on-prem instance metadata.");
        }

        return serviceResponse;
    }

    // Validates the on-prem instance and saves the validation record.
    public async Task<ServiceResponse<OnPremInstanceResponseDto>> ValidateAndSaveInstanceAsync(OnPremInstanceRequestDto onPremInstanceRequestDto)
    {
        var serviceResponse = new ServiceResponse<OnPremInstanceResponseDto>
        {
            Data = null,
            Message = "Failed to insert OnPremInstanceValidation. Please try again."
        };

        try
        {
            // Indicates if the validation process has failed
            bool hasValidationFailed = false;

            // Validate that the on-prem instance exists for the current tenant
            var onPremInstance = await _unitOfWork.OnPremInstanceRepo
                .GetByConditionAsync(w => w.Id == _currentOnPremTenantService.CurrentOnPremInstanceId)
                .SingleOrDefaultAsync();

            if (onPremInstance == null)
            {
                _logger.LogWarning("OnPrem instance not found. TenantId: {TenantId}, InstanceId: {InstanceId}", _currentOnPremTenantService.CurrentOnPremTenantId, _currentOnPremTenantService.CurrentOnPremInstanceId);
                serviceResponse.Message = "On-prem instance not found.";
                return serviceResponse;
            }

            // Validate that the tenant associated with the instance exists
            var onPremTenant = await _unitOfWork.OnPremTenantRepo
                .GetByConditionAsync(w => w.Id == onPremInstance.OnPremTenantId)
                .SingleOrDefaultAsync();

            if (onPremTenant == null)
            {
                _logger.LogWarning("OnPrem tenant not found for InstanceId: {InstanceId}", onPremInstance.Id);
                serviceResponse.Message = "On-prem tenant not found.";
                return serviceResponse;
            }

            // Get the current date and time in UTC (Coordinated Universal Time)
            var currentUtcDate = DateTimeOffset.UtcNow.Date;
            var sevenDaysAgo = currentUtcDate.AddDays(-7); // 7 days ago

            Enum.TryParse(onPremInstanceRequestDto.Source, true, out ValidationSourceTypesEnum sourceTypesEnum);

            // Fetch all existing validation records for the last 7 days
            var last7DaysData = await _unitOfWork.OnPremInstanceDataRepo
                .GetByConditionAsync(w =>
                    w.ValidatedOn.Date >= sevenDaysAgo &&
                    w.ValidatedOn.Date <= currentUtcDate &&
                    w.OnPremInstanceId == _currentOnPremTenantService.CurrentOnPremInstanceId)
                .ToListAsync();

            // Initialize separate lists for records that need to be updated and inserted
            var needToBeUpdated = new List<OnPremInstanceData>();
            var needToBeInserted = new List<OnPremInstanceData>();

            // Get the most recent validation date from the last 7 days, if any.
            DateTimeOffset? lastValidatedDate = last7DaysData.OrderByDescending(o => o.ValidatedOn).FirstOrDefault()?.ValidatedOn.Date;

            // Initialize total execution time
            double totalExecutionTime = 0;

            // Loop through the provided usage data for the last 7 days
            foreach (var data in onPremInstanceRequestDto.Last7DayUsages)
            {
                // Check if the OnPremInstanceValidation already exists for this day
                var existingValidation = last7DaysData
                    .FirstOrDefault(w => w.ValidatedOn.Date == data.Date && w.OnPremInstanceId == _currentOnPremTenantService.CurrentOnPremInstanceId);

                if (existingValidation != null)
                {
                    // Skip if the last validated date is the same as the data date
                    if (lastValidatedDate == data.Date)
                        continue;

                    // Update the total execution time by considering the difference from the previous validation record
                    totalExecutionTime += data.TotalExecutionTime - existingValidation.ExecutionTime;

                    // Update the existing validation record
                    existingValidation.ValidatedBy = sourceTypesEnum;
                    existingValidation.ValidatedOn = data.Date;
                    existingValidation.PublishedAgents = data.PublishedAgents;
                    existingValidation.Users = data.Users;
                    existingValidation.ExecutedJobs = data.JobsExecuted;
                    existingValidation.ExecutionTime = data.TotalExecutionTime;

                    // Add the updated record to the updates list
                    needToBeUpdated.Add(existingValidation);
                }
                else
                {
                    // If there is no existing validation for this day, add its execution time to the total
                    totalExecutionTime += data.TotalExecutionTime;

                    // Create a new OnPremInstanceValidation record for this day
                    var newValidation = new OnPremInstanceData
                    {
                        OnPremInstanceId = _currentOnPremTenantService.CurrentOnPremInstanceId,
                        ValidatedBy = sourceTypesEnum,
                        ValidatedOn = data.Date,
                        PublishedAgents = data.PublishedAgents,
                        Users = data.Users,
                        ExecutedJobs = data.JobsExecuted,
                        ExecutionTime = data.TotalExecutionTime,
                    };

                    // Add the new record to the inserts list
                    needToBeInserted.Add(newValidation);
                }
            }

            // Save all the updates and inserts
            if (needToBeUpdated.Any())
            {
                // Update the existing records
                _unitOfWork.OnPremInstanceDataRepo.Update(needToBeUpdated);
            }

            if (needToBeInserted.Any())
            {
                // Insert the new records
                await _unitOfWork.OnPremInstanceDataRepo.InsertAsync(needToBeInserted);
            }

            // Check if the current date is greater than the ContractStartDate (i.e., the contract has started)
            if (DateTimeOffset.UtcNow.Date < onPremTenant.ContractStartDate.Date)
            {
                hasValidationFailed = true;
            }

            // Check if the current date is greater than the ContractRenewalDate (i.e., the contract has expired)
            if (DateTimeOffset.UtcNow.Date > onPremTenant.ContractRenewalDate.Date)
            {
                EmailTypesEnum emailType = EmailTypesEnum.ContractExpiration;

                // Use the utility method to check if the email can be sent to this IP for the given email type
                if (_emailRateLimiterService.CanSendEmail(emailType))
                {
                    // Try sending a "Contract Expiration" notification email
                    if (!await _emailService.SendEmailUsingTemplate(
                        emailType,
                        onPremTenant.TenantEmails,
                        new Dictionary<string, string>()
                        {
                            { "{{ContractExpirationDate}}", onPremTenant.ContractRenewalDate.Date.ToString("MM/dd/yyyy") }
                        },
                        onPremTenant.OurEmails,
                        null)
                    )
                    {
                        _logger.LogError($"Failed to send 'Contract Expiration' notification email to {onPremTenant.TenantEmails}. " + $"Request type: {EmailTypesEnum.ContractExpiration}.");
                    }

                    // Update the email type
                    _emailRateLimiterService.UpdateEmailTimestamp(emailType);
                }
            }

            // Set DeployedOn if it's null (using null-coalescing assignment)
            onPremInstance.DeployedOn ??= DateTimeOffset.UtcNow;

            // Update PlatformVersion if provided in the request DTO
            if (!string.IsNullOrEmpty(onPremInstanceRequestDto.PlatformVersion))
            {
                onPremInstance.PlatformVersion = onPremInstanceRequestDto.PlatformVersion;
            }

            // Update LastValidatedOn and NoOfInvalidCheck based on validation result
            if (hasValidationFailed)
            {
                onPremInstance.NoOfInvalidCheck++;
            }
            else
            {
                onPremInstance.LastValidatedOn = DateTimeOffset.UtcNow;
                onPremInstance.NoOfInvalidCheck = 0;
            }

            // Mark the entity for update
            _unitOfWork.OnPremInstanceRepo.Update(onPremInstance);

            // Deduct consumed execution time from the tenant's allowed execution time
            onPremTenant.AvailableExecutionTime -= totalExecutionTime;
            _unitOfWork.OnPremTenantRepo.Update(onPremTenant);

            // Persist the instance data, instance and tenant changes in a single save
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save OnPremInstance validation results.");
                return serviceResponse;
            }

            // Create a response DTO
            var responseDto = new OnPremInstanceResponseDto
            {
                ValidatedOn = DateTimeOffset.UtcNow,
                Tenant = new OnPremInstanceTenantDto
                {
                    TenantId = onPremTenant.Id,
                    Name = onPremTenant.Name,
                    Type = onPremTenant.Type
                },
                Contract = new OnPremInstanceContractDto
                {
                    ContractStartDate = onPremTenant.ContractStartDate,
                    ContractRenewalDate = onPremTenant.ContractRenewalDate
                },
                Enforcement = new OnPremInstanceEnforcementDto
                {
                    NoOfInvalidCheck = onPremInstance.NoOfInvalidCheck,
                    ExecutionTimeAllowed = onPremTenant.ExecutionTimeAllowed,
                    IsLoginDisabled = onPremTenant.IsLoginDisabled,
                    IsExecutionDisabled = onPremTenant.IsExecutionDisabled,
                    IsSsoAllowed = onPremTenant.IsSsoAllowed,
                    IsBrandingAllowed = onPremTenant.IsBrandingAllowed
                }
            };

            if (
                (onPremTenant.IsExecutionDisabled || onPremTenant.IsLoginDisabled || hasValidationFailed)
                && !string.IsNullOrEmpty(onPremTenant.TenantEmails))
            {
                EmailTypesEnum typesEnum = EmailTypesEnum.ValidationCheckFailed;

                // Use the utility method to check if the email can be sent to this IP for the given email type
                if (_emailRateLimiterService.CanSendEmail(typesEnum))
                {
                    // Attempting to send a "Validation Failed" email
                    if (!await _emailService.SendEmailUsingTemplate(
                        typesEnum,
                        onPremTenant.TenantEmails,
                        new Dictionary<string, string>()
                        {
                            { "{{TenantName}}", onPremTenant.Name }
                        },
                        onPremTenant.OurEmails,
                        null)
                    )
                    {
                        // Log an error if the email failed to send
                        _logger.LogError($"Failed to send 'Validation Failed' notification email to {onPremTenant.TenantEmails}. " +
                            $"Request type: {typesEnum}.");
                    }

                    // Update the email type
                    _emailRateLimiterService.UpdateEmailTimestamp(typesEnum);
                }
            }

            // Set the service response data
            serviceResponse.Data = responseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "OnPremInstanceValidation inserted successfully.";

            _logger.LogInformation($"Successfully validated and saved OnPremInstanceValidation for instance {_currentOnPremTenantService.CurrentOnPremInstanceId}.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while validating and saving OnPremInstanceValidation.");
        }

        return serviceResponse;
    }
}