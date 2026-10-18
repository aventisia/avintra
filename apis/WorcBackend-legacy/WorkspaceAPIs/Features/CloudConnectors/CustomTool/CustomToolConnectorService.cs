using WorkspaceAPIs.Features.CloudConnectors;
using WorkspaceAPIs.Features.CloudConnectors.CustomTool.Helpers;
using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Features.CloudConnectors.CustomTool;

/// <summary>
/// Executes a custom tool operation server-side after authorizing the caller against the tool and its credential.
/// </summary>
public class CustomToolConnectorService : ICustomToolConnectorService
{
    private readonly ILogger<CustomToolConnectorService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICloudConnectorsVaultCredentialService _cloudConnectorsVaultCredentialService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IResourceShareService _resourceShareService;

    public CustomToolConnectorService(
        ILogger<CustomToolConnectorService> logger,
        IUnitOfWork unitOfWork,
        IHttpClientFactory httpClientFactory,
        ICloudConnectorsVaultCredentialService cloudConnectorsVaultCredentialService,
        ICurrentTenantService currentTenantService,
        IResourceShareService resourceShareService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _httpClientFactory = httpClientFactory;
        _cloudConnectorsVaultCredentialService = cloudConnectorsVaultCredentialService;
        _currentTenantService = currentTenantService;
        _resourceShareService = resourceShareService;
    }

    public async Task<ServiceResponse<CloudConnectorResDto>> InvokeAsync(
        CloudConnectorReqDto request,
        CancellationToken cancellationToken = default)
    {
        var serviceResponse = ServiceResponse<CloudConnectorResDto>.Create(
            "Failed to invoke the custom tool.",
            500,
            new CloudConnectorResDto
            {
                Provider = request.Provider,
                Action = request.Action,
            });

        try
        {
            var currentUserId = _currentTenantService.CurrentUserId;

            var (tool, operationId) = await CustomToolActionHelpers.ResolveToolAsync(
                _unitOfWork.ToolRepo, _currentTenantService, request.Action);
            if (tool is null)
            {
                return serviceResponse.Update(
                    $"Custom tool for action '{request.Action}' was not found.",
                    404);
            }

            if (!tool.IsActive || tool.IsDisabled)
            {
                return serviceResponse.Update($"Custom tool '{tool.Name}' is not active.", 400);
            }

            if (!await CustomToolAccessHelpers.CanUseToolAsync(_resourceShareService, currentUserId, tool))
            {
                return serviceResponse.Update(
                    $"You do not have permission to use custom tool '{tool.Name}'.",
                    403);
            }

            var operations = ToolOperationHelpers.ExtractOperations(tool.ParsedSchema, tool.IsVerified);
            var operation = operations.FirstOrDefault(o =>
                string.Equals(o.OperationId, operationId, StringComparison.OrdinalIgnoreCase));

            if (operation is null)
            {
                return serviceResponse.Update(
                    $"Operation '{operationId}' was not found on custom tool '{tool.Name}'.",
                    404);
            }

            if (!operation.IsVerified)
            {
                return serviceResponse.Update(
                    $"Operation '{operationId}' on custom tool '{tool.Name}' is unverified. Test it before invoking.",
                    400);
            }

            if (string.IsNullOrWhiteSpace(operation.Method) || string.IsNullOrWhiteSpace(operation.Path))
            {
                return serviceResponse.Update(
                    $"Operation '{operationId}' has no HTTP method or path defined.",
                    400);
            }

            if (!CustomToolUrlHelpers.TryCreateBaseUri(tool.BaseUrl, out var baseUri))
            {
                return serviceResponse.Update(
                    $"Custom tool '{tool.Name}' has an invalid base URL. Only http/https are supported.",
                    404);
            }

            if (!await CustomToolUrlHelpers.IsPublicHostAsync(baseUri, cancellationToken))
            {
                return serviceResponse.Update(
                    $"Custom tool '{tool.Name}' has a base URL that resolves to a non-public address.",
                    400);
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
                    _cloudConnectorsVaultCredentialService, credentialName);
                if (!auth.IsSuccess)
                {
                    return serviceResponse.Update(auth.ErrorMessage, 400);
                }

                credentialHeaders = auth.Headers;
                credentialQuery = auth.Query;
            }

            var (requestUrl, remainingPayload, requestError) = CustomToolRequestHelpers.BuildRequestUrl(
                baseUri, operation, sections, credentialQuery);
            if (requestError is not null || requestUrl is null)
            {
                return serviceResponse.Update(
                    requestError ?? "The custom tool request URL could not be built.",
                    400);
            }

            CustomToolRequestHelpers.BuildRequestHeaders(operation, sections, requestHeaders, credentialHeaders);
            var (content, contentType) = CustomToolRequestHelpers.BuildRequestContent(operation, sections, remainingPayload);

            var (statusCode, responseText, responseError) = await CustomToolTransportHelpers.SendAsync(
                _httpClientFactory, _logger, operation.Method, requestUrl, requestHeaders, content, contentType);
            if (responseError is not null)
            {
                return serviceResponse.Update(responseError, statusCode >= 400 ? statusCode : 502);
            }

            var isUpstreamSuccess = statusCode >= 200 && statusCode < 300;
            var responseData = new CloudConnectorResDto
            {
                Response = CustomToolRequestHelpers.ParseResponseBody(responseText),
                Provider = request.Provider,
                Action = request.Action,
            };
            serviceResponse = serviceResponse.Update(
                isUpstreamSuccess
                    ? "Custom tool invoked successfully."
                    : $"Upstream API responded with status code {statusCode}.",
                isUpstreamSuccess ? 200 : 502,
                responseData);
            _logger.LogInformation(
                "Custom tool '{ToolName}' operation '{OperationId}' invoked with upstream status {StatusCode}.",
                tool.Name, operationId, statusCode);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while invoking custom tool action {Action}.", request.Action);
            serviceResponse = serviceResponse.Update(
                "An unexpected error occurred while invoking the custom tool.",
                500);
        }

        return serviceResponse;
    }
}
