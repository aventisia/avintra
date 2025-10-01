namespace MLModelBuilderAPIs.Services;

public interface IGenerativeModelService
{
    /// <summary>
    /// Retrieves the setup configuration for a generative model associated with a specific AI project.
    /// </summary>
    /// <param name="aiProjectId">The unique identifier of the AI project.</param>
    /// <param name="aiProjectVersionId">The optional version ID of the AI project. If not provided, the latest version will be used.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a <see cref="GenerativeModelDto"/> 
    /// with the setup details of the specified AI project.
    /// </returns>
    Task<ServiceResponse<GenerativeModelDto>> GetSetupByAIProjectIdAsync(Guid aiProjectId, Guid? aiProjectVersionId);

    /// <summary>
    /// Updates the configuration for an generative model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the generative model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<GenerativeModelDto>> UpdateSetupAsync(GenerativeModelDto modelSetupDto);

    /// <summary>
    /// Updates the configuration of a generative model setup and executes the model with the new configuration.
    /// Optionally associates the execution with a specific conversation using the provided conversation ID.
    /// </summary>
    /// <param name="modelSetupDto">The new configuration to be applied to the generative model.</param>
    /// <param name="conversationId">An optional identifier for the conversation to associate with the model execution.</param>
    /// <returns>A task representing the asynchronous operation. It returns a service response containing the details of the conversation history after execution.</returns>
    Task<ServiceResponse<ConversationHistoryDto>> UpdateAndExecuteAsync(GenerativeModelDto modelSetupDto, Guid? conversationId);
}