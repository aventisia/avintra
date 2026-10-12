using WorkspaceAPIs.Features.Tools.Helpers;

namespace WorkspaceAPIs.Services;

public class ToolVerificationService : IToolVerificationService
{
    private const string LlmPipelineClientName = "LLMPipeline";

    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ToolVerificationService> _logger;
    private readonly IResourceShareService _resourceShareService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ICurrentTenantService _currentTenantService;

    public ToolVerificationService(
        IUnitOfWork unitOfWork,
        ILogger<ToolVerificationService> logger,
        IResourceShareService resourceShareService,
        IHttpClientFactory httpClientFactory,
        ICurrentTenantService currentTenantService)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _resourceShareService = resourceShareService;
        _httpClientFactory = httpClientFactory;
        _currentTenantService = currentTenantService;
    }

    public async Task<ServiceResponse<TestToolResponseDto>> TestToolAsync(
        Guid toolId,
        TestToolDto testToolDto,
        string accessToken)
    {
        var serviceResponse = new ServiceResponse<TestToolResponseDto>
        {
            Message = "Failed to test tool."
        };

        try
        {
            var currentUserId = _currentTenantService.CurrentUserId;

            var tool = await _unitOfWork.ToolRepo
                .GetByConditionAsync(w => w.Id == toolId)
                .SingleOrDefaultAsync();

            if (tool == null)
            {
                return serviceResponse.Update("Tool not found.", 404);
            }

            var (canView, _) = await _resourceShareService.GetResourceAccessAsync(
                currentUserId,
                tool.Id,
                ResourceTypeEnum.Tool,
                tool.CreatedByUserId ?? Guid.Empty,
                tool.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                });

            if (!canView)
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
            llmPipelineClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", accessToken);

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            var llmResponse = await llmPipelineClient.PostAsync("api/custom-tools/test", requestContent);
            stopwatch.Stop();

            var responseBody = await llmResponse.Content.ReadAsStringAsync();

            TestToolResponseDto? testResult = null;
            if (llmResponse.IsSuccessStatusCode)
            {
                try
                {
                    testResult = System.Text.Json.JsonSerializer.Deserialize<TestToolResponseDto>(responseBody, new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    });
                }
                catch (Exception parseEx)
                {
                    _logger.LogWarning(parseEx, "Failed to parse LLM pipeline test response body as JSON.");
                }
            }

            testResult ??= new TestToolResponseDto
            {
                Success = llmResponse.IsSuccessStatusCode,
                StatusCode = (int)llmResponse.StatusCode,
                Body = ParseResponseBody(responseBody),
                DurationMs = stopwatch.Elapsed.TotalMilliseconds,
            };

            var isOperationVerified = testResult.StatusCode == 200;
            tool.ParsedSchema = ToolOperationHelpers.SetOperationVerification(
                tool.ParsedSchema,
                testToolDto.OperationId,
                isOperationVerified);
            tool.IsVerified = ToolOperationHelpers.AreAllOperationsVerified(tool.ParsedSchema, tool.IsVerified);
            tool.LastModifiedByUserId = currentUserId;
            tool.LastModifiedOn = DateTimeOffset.UtcNow;
            _unitOfWork.ToolRepo.Update(tool);
            await _unitOfWork.SaveAsync();

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

    private static JsonElement? ParseResponseBody(string responseBody)
    {
        try
        {
            return JsonDocument.Parse(responseBody).RootElement.Clone();
        }
        catch (System.Text.Json.JsonException)
        {
            return System.Text.Json.JsonSerializer.SerializeToElement(responseBody);
        }
    }
}
