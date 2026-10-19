using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolVerificationService : IToolVerificationService
{
    private const string LlmPipelineClientName = "LLMPipeline";
    private const string TestEndpointPath = "api/custom-tools/test";

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolVerificationService> _logger;
    private readonly IResourceShareService _resourceShareService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;

    public ToolVerificationService(
        IUnitOfWork unitOfWork,
        ILogger<ToolVerificationService> logger,
        IResourceShareService resourceShareService,
        IHttpClientFactory httpClientFactory,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceShareService = resourceShareService;
        _httpClientFactory = httpClientFactory;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    public async Task<ServiceResponse<TestToolResponseDto>> TestToolAsync(
        Guid toolId,
        TestToolDto testToolDto,
        string accessToken)
    {
        var serviceResponse = ServiceResponse<TestToolResponseDto>.Create("Failed to test tool.", 500);

        try
        {
            var currentUserId = _currentTenantService.CurrentUserId;

            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<TestToolResponseDto>(
                tool.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "tool");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, _) = await _resourceShareService.GetResourceAccessAsync(
                currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canEdit)
            {
                return serviceResponse.Update("You do not have permission to test this tool.", 403);
            }

            var credentialName = testToolDto.CredentialName ?? tool.CredentialName;

            var testPayload = new
            {
                baseUrl = tool.BaseUrl,
                operationId = testToolDto.OperationId,
                parameters = testToolDto.Parameters,
                credentialName,
                openApiSpec = tool.OpenApiSpec,
            };

            var requestJson = System.Text.Json.JsonSerializer.Serialize(testPayload);
            var requestContent = new StringContent(requestJson, Encoding.UTF8, "application/json");

            var llmPipelineClient = _httpClientFactory.CreateClient(LlmPipelineClientName);
            if (llmPipelineClient.BaseAddress is null)
            {
                _logger.LogError("The LLMPipeline HTTP client has no base address; EnvironmentConfig:AppBaseUrl is not configured.");
                return serviceResponse.Update("The tool test service is not configured.", 500);
            }

            if (!string.IsNullOrWhiteSpace(accessToken))
            {
                llmPipelineClient.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", accessToken.Trim());
            }

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            var llmResponse = await llmPipelineClient.PostAsync(TestEndpointPath, requestContent);
            stopwatch.Stop();

            var responseBody = await llmResponse.Content.ReadAsStringAsync();

            var parsedResult = llmResponse.IsSuccessStatusCode
                ? TryDeserializeTestResult(responseBody)
                : null;

            var testResult = parsedResult ?? new TestToolResponseDto
            {
                Success = false,
                StatusCode = (int)llmResponse.StatusCode,
                Body = ParseResponseBody(responseBody),
                DurationMs = stopwatch.Elapsed.TotalMilliseconds,
            };

            var isOperationVerified = parsedResult is not null && parsedResult.StatusCode is >= 200 and < 300;
            tool.ParsedSchema = ToolOperationHelpers.SetOperationVerification(
                tool.ParsedSchema,
                testToolDto.OperationId,
                isOperationVerified,
                tool.IsVerified);
            tool.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(tool.ParsedSchema, tool.IsVerified);
            tool.LastModifiedByUserId = currentUserId;
            tool.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.ToolRepo.Update(tool);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save verification state for tool {ToolId}.", toolId);
                return serviceResponse.Update("Failed to save the tool verification state.", 500);
            }

            return serviceResponse.Update(
                testResult.Success ? "Tool test completed successfully." : "Tool test failed.",
                200,
                testResult);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to test tool {ToolId}.", toolId);
        }

        return serviceResponse;
    }

    private TestToolResponseDto? TryDeserializeTestResult(string responseBody)
    {
        try
        {
            return System.Text.Json.JsonSerializer.Deserialize<TestToolResponseDto>(responseBody, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception parseEx)
        {
            _logger.LogWarning(parseEx, "Failed to parse LLM pipeline test response body as JSON.");
            return null;
        }
    }

    private static JsonElement? ParseResponseBody(string responseBody)
    {
        try
        {
            using var document = JsonDocument.Parse(responseBody);
            return document.RootElement.Clone();
        }
        catch (System.Text.Json.JsonException)
        {
            return System.Text.Json.JsonSerializer.SerializeToElement(responseBody);
        }
    }
}
