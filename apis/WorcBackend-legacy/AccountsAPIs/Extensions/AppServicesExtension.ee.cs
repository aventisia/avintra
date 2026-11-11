namespace AccountsAPIs.Extensions;

public static partial class AppServicesExtension
{
    /// <summary>
    /// Registers the Razorpay client and configuration in the dependency injection container.
    /// </summary>
    /// <param name="services">The collection of services to register.</param>
    /// <param name="config">The configuration provider used to retrieve Razorpay settings.</param>
    /// <param name="tenantType">The tenant type (e.g., Commercial, Enterprise) to determine if Razorpay should be enabled.</param>
    public static void AddRazorpayClient(this IServiceCollection services, IConfiguration config)
    {
        var environmentConfig = Guard.Against.Null(config.GetSection("EnvironmentConfig").Get<EnvironmentConfig>(), message: "EnvironmentConfig cannot be null");
        var onPremTenantType = environmentConfig.OnPremTenantType ?? "Enterprise";

        // Check if the tenant type is Commercial, as Razorpay integration is only needed for Commercial tenants
        if (onPremTenantType == OnPremTenantTypesEnum.Commercial.ToString())
        {
            // Retrieve the Razorpay configuration section from the configuration provider
            var razorpayKeyId = environmentConfig.RazorpayKeyId;
            var razorpayKeySecret = environmentConfig.RazorpayKeySecret;

            // Check if Razorpay KeyId and KeySecret are configured correctly
            if (string.IsNullOrEmpty(razorpayKeyId) || string.IsNullOrEmpty(razorpayKeySecret))
            {
                throw new InvalidOperationException("Razorpay KeyId and KeySecret must be configured.");
            }

            services.AddSingleton<Razorpay.Api.RazorpayClient>(provider =>
                new Razorpay.Api.RazorpayClient(razorpayKeyId, razorpayKeySecret));
        }
        else
        {
            // Register null RazorpayClient for non-Commercial tenants to satisfy DI requirements
            services.AddSingleton<Razorpay.Api.RazorpayClient>(provider => null!);
        }
    }
}
