namespace GlobalAdminAPIs.Attributes;

/// <summary>
/// Attribute that validates API key authentication for incoming HTTP requests.
/// This attribute can be applied to either controllers or individual actions.
/// Specifically for on-premise (self-hosted) environments, validating both Tenant Id and Instance Key.
/// </summary>
[AttributeUsage(AttributeTargets.Class | AttributeTargets.Method)]
public class TenantAuthAttribute : Attribute, IAsyncActionFilter
{
    /// <summary>
    /// Intercepts the action execution to validate the provided API key from the request headers.
    /// If the API key is missing or invalid, the request will be rejected with a 401 Unauthorized status.
    /// </summary>
    /// <param name="context">The context for the executing action, which contains request data and services.</param>
    /// <param name="next">Delegate to execute the next action or middleware in the pipeline.</param>
    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        // Attempt to retrieve the Tenant Id and Instance Key from the request headers
        if (!context.HttpContext.Request.Headers.TryGetValue("X-OnPrem-Tenant-Id", out var tenantIdHeader) ||
            !context.HttpContext.Request.Headers.TryGetValue("X-OnPrem-Instance-Key", out var instanceKeyHeader))
        {
            // If either header is missing, return 401 Unauthorized with a message
            context.Result = new UnauthorizedObjectResult("Authentication failed: Missing 'X-OnPrem-Tenant-Id' or 'X-OnPrem-Instance-Key'. Both headers are required.");
            return;
        }

        bool sendEmailOnFailure = false;

        // Default GUID to use in case of invalid Tenant or Instance Id
        Guid tenantId = Guid.TryParse(tenantIdHeader, out var parsedTenantId) ? parsedTenantId : Guid.Empty;
        Guid instanceId = Guid.TryParse(instanceKeyHeader, out var parsedInstanceId) ? parsedInstanceId : Guid.Empty;

        // Check if either Tenant Id or Instance Key is invalid
        if (tenantId == Guid.Empty || instanceId == Guid.Empty)
        {
            context.Result = new UnauthorizedObjectResult("Authentication failed: Invalid 'X-OnPrem-Tenant-Id' or 'X-OnPrem-Instance-Key'.");
            sendEmailOnFailure = true;
        }

        // Retrieve the DbContext from the service provider to query the database
        var dbContext = context.HttpContext.RequestServices.GetRequiredService<GlobalAdminDbContext>();

        // Check if the Tenant Id exists in the database
        var tenant = await dbContext.OnPremTenants
            .Where(w => w.Id == tenantId)
            .AsNoTracking()
            .SingleOrDefaultAsync();

        if (tenant == null)
        {
            // Return 401 Unauthorized if no matching tenant found
            context.Result = new UnauthorizedObjectResult("Authentication failed: No matching tenant found for the provided 'X-OnPrem-Tenant-Id'.");
            sendEmailOnFailure = true;
        }

        // Check if the Instance Key exists in the database
        var instance = await dbContext.OnPremInstances
            .Where(w => w.Id == instanceId)
            .AsNoTracking()
            .SingleOrDefaultAsync();

        if (instance == null)
        {
            // Return 401 Unauthorized if no matching instance found
            context.Result = new UnauthorizedObjectResult("Authentication failed: No matching instance found for the provided 'X-OnPrem-Instance-Key'.");
            sendEmailOnFailure = true;
        }

        if (instance != null && instance.OnPremTenantId != tenantId)
        {
            context.Result = new UnauthorizedObjectResult("Authentication failed: Tenant and instance do not match.");
            sendEmailOnFailure = true;
        }

        if (sendEmailOnFailure)
        {
            string tenantName = tenant != null ? tenant.Name : "Unknown";
            string instanceName = instance != null ? instance.Name : "Unknown";
            var emailType = EmailTypesEnum.InvalidRequest;  // Example email type

            var emailService = context.HttpContext.RequestServices.GetRequiredService<IEmailService>();
            var appDefaultConfig = context.HttpContext.RequestServices.GetRequiredService<AppDefaultConfig>();
            var emailRateLimiterService = context.HttpContext.RequestServices.GetRequiredService<IEmailRateLimiterService>();

            // Use the utility method to check if the email can be sent to this IP for the given email type
            if (emailRateLimiterService.CanSendEmail(emailType))
            {
                // Attempting to send a "Invalid request" email
                await emailService.SendEmailUsingTemplate(
                    emailType,
                    appDefaultConfig.FirstAdminUserEmail,
                    new Dictionary<string, string>()
                    {
                        { "{{TenantName}}", tenantName},
                        { "{{InstanceName}}", instanceName}
                    },
                    null,
                    null);

                // Update the email type
                emailRateLimiterService.UpdateEmailTimestamp(emailType);
            }
        }

        if (sendEmailOnFailure)
        {
            return;
        }

        // Retrieve ICurrentOnPremTenantService from DI container
        var tenantService = context.HttpContext.RequestServices.GetRequiredService<ICurrentOnPremTenantService>();

        // Set the CurrentTenantId and CurrentInstanceId using the ICurrentOnPremTenantService
        tenantService.CurrentOnPremTenantId = tenantId;
        tenantService.CurrentOnPremInstanceId = instanceId;

        // If the API key is valid and the instance is active, allow the request to proceed
        await next();
    }
}