using WorkspaceAPIs.Features.CloudConnectors;
using WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;
using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

/// <summary>
/// Executes a custom tool operation server-side after authorizing the caller
/// against the tool and its credential.
/// </summary>
public class CustomToolConnectorService : ICustomToolConnectorService
{
    private readonly ILogger<CustomToolConnectorService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICloudConnectorsVaultService _cloudConnectorsVaultService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceShareService _resourceShareService;
    private readonly Guid _currentUserId;

    public CustomToolConnectorService(
        ILogger<CustomToolConnectorService> logger,
        IUnitOfWork unitOfWork,
        IHttpClientFactory httpClientFactory,
        ICloudConnectorsVaultService cloudConnectorsVaultService,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _httpClientFactory = httpClientFactory;
        _cloudConnectorsVaultService = cloudConnectorsVaultService;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
        _currentUserId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(CloudConnectorReqDto request)
    {
        var serviceResponse = new ServiceResponse<CloudConnectorResDto>
        {
            Data = new CloudConnectorResDto
            {
                Response = null,
                Provider = request.Provider,
                Action = request.Action
            },
            StatusCode = 400
        };

        try
        {
            var (tool, operationId) = await CustomToolActionHelpers.ResolveToolAsync(
                _unitOfWork.ToolRepo, _currentTenantService, request.Action);
            if (tool is null)
            {
                serviceResponse.Message = $"Custom tool for action '{request.Action}' was not found.";
                return serviceResponse;
            }

            if (!tool.IsActive || tool.IsDisabled)
            {
                serviceResponse.Message = $"Custom tool '{tool.Name}' is not active.";
                return serviceResponse;
            }

            if (!await CustomToolAccessHelpers.CanUseToolAsync(_resourceShareService, _currentUserId, tool))
            {
                serviceResponse.StatusCode = 403;
                serviceResponse.Message = $"You do not have permission to use custom tool '{tool.Name}'.";
                return serviceResponse;
            }

            var operations = ToolOperationHelpers.ExtractOperations(tool.ParsedSchema, tool.IsVerified);
            var operation = operations.FirstOrDefault(o =>
                string.Equals(o.OperationId, operationId, StringComparison.OrdinalIgnoreCase));

            if (operation is null)
            {
                serviceResponse.Message = $"Operation '{operationId}' was not found on custom tool '{tool.Name}'.";
                return serviceResponse;
            }

            if (!operation.IsVerified)
            {
                serviceResponse.Message = $"Operation '{operationId}' on custom tool '{tool.Name}' is unverified. Test it before invoking.";
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(operation.Method) || string.IsNullOrWhiteSpace(operation.Path))
            {
                serviceResponse.Message = $"Operation '{operationId}' has no HTTP method or path defined.";
                return serviceResponse;
            }

            if (!CustomToolUrlHelpers.TryCreateBaseUri(tool.BaseUrl, out var baseUri))
            {
                serviceResponse.Message = $"Custom tool '{tool.Name}' has an invalid base URL. Only http/https are supported.";
                return serviceResponse;
            }

            if (!await CustomToolUrlHelpers.IsPublicHostAsync(baseUri))
            {
                serviceResponse.Message = $"Custom tool '{tool.Name}' has a base URL that resolves to a non-public address.";
                return serviceResponse;
            }

            var sections = CustomToolPayloadSections.From(request.Payload);

            var credentialHeaders = new Dictionary<string, string>();
            var requestHeaders = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
            string? credentialQuery = null;
            var hasCredential = !string.IsNullOrWhiteSpace(request.CredentialName) || !string.IsNullOrWhiteSpace(tool.CredentialName);
            if (hasCredential)
            {
                var credentialName = string.IsNullOrWhiteSpace(request.CredentialName)
                    ? tool.CredentialName!
                    : request.CredentialName;

                var auth = await CustomToolCredentialHelpers.ResolveAuthenticationAsync(
                    _cloudConnectorsVaultService, credentialName);
                if (!auth.IsSuccess)
                {
                    serviceResponse.Message = auth.ErrorMessage;
                    return serviceResponse;
                }

                credentialHeaders = auth.Headers;
                credentialQuery = auth.Query;
            }

            var (requestUrl, remainingPayload) = CustomToolRequestHelpers.BuildRequestUrl(
                baseUri, operation, sections, credentialQuery);
            CustomToolRequestHelpers.BuildRequestHeaders(operation, sections, requestHeaders, credentialHeaders);
            var (content, contentType) = CustomToolRequestHelpers.BuildRequestContent(operation, sections, remainingPayload);

            var (statusCode, responseText, responseError) = await CustomToolTransportHelpers.SendAsync(
                _httpClientFactory, _logger, operation.Method, requestUrl, requestHeaders, content, contentType);
            if (responseError is not null)
            {
                serviceResponse.Message = responseError;
                return serviceResponse;
            }

            serviceResponse.Data.Response = CustomToolRequestHelpers.ParseResponseBody(responseText);
            serviceResponse.StatusCode = statusCode >= 200 && statusCode < 300 ? 200 : 502;
            serviceResponse.Message = statusCode >= 200 && statusCode < 300
                ? "Custom tool invoked successfully."
                : $"Upstream API responded with status code {statusCode}.";
            _logger.LogInformation(
                "Custom tool '{ToolName}' operation '{OperationId}' invoked with upstream status {StatusCode}.",
                tool.Name, operationId, statusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking custom tool action {Action}.", request.Action);
            serviceResponse.StatusCode = 500;
            serviceResponse.Message = "An unexpected error occurred while invoking the custom tool.";
        }

        return serviceResponse;
    }
}
