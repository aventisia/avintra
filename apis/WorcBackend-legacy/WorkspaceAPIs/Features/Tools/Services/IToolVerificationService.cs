namespace WorkspaceAPIs.Services;

/// <summary>
/// Provides playground verification of custom tool operations.
/// </summary>
public interface IToolVerificationService
{
    /// <summary>
    /// Tests a tool operation through the LLM pipeline and records the per-operation verification result.
    /// </summary>
    Task<ServiceResponse<TestToolResponseDto>> TestToolAsync(Guid toolId, TestToolDto testToolDto, string accessToken);
}
