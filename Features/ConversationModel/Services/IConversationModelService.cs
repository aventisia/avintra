namespace MLModelBuilderAPIs.Services;

public interface IConversationModelService
{
    /// <summary>
    /// Gets the model setup for a specific conversation model using its unique ML model ID.
    /// </summary>
    /// <param name="mlModelId">The unique ID of the ML model to fetch the setup for.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the model setup DTO for the specified ML model.</returns>
    Task<ServiceResponse<ConversationModelDto>> GetSetupByMLModelIdAsync(Guid mlModelId);

    /// <summary>
    /// Updates the configuration for an conversation model setup.
    /// </summary>
    /// <param name="modelSetupDto">The new setup configuration to be applied to the conversation model.</param>
    /// <returns>A task that represents the asynchronous operation. It returns the updated model setup DTO.</returns>
    Task<ServiceResponse<ConversationModelDto>> UpdateSetupAsync(ConversationModelDto modelSetupDto);

    /// <summary>
    /// Retrieves a list of available languages, each with associated voices. 
    /// This method returns the supported languages along with their corresponding voice options.
    /// </summary>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of AvailableLanguageDto objects, each representing a language with a list of voices.
    /// </returns>
    ServiceResponse<IEnumerable<AvailableLanguageDto>> GetLanguagesWithVoices();

    /// <summary>
    /// Retrieves a list of available Speech-to-Text services and their options.
    /// This method returns the Speech-to-Text services with descriptions of their process and capabilities.
    /// </summary>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of SpeechToTextOptionDto objects, each representing a Speech-to-Text service with its description.
    /// </returns>
    ServiceResponse<IEnumerable<SpeechToTextOptionDto>> GetAvailableSpeechToTextServices();

    /// <summary>
    /// Retrieves a list of available Text-to-Speech services and their options.
    /// This method returns the Text-to-Speech services along with descriptions of their process and capabilities.
    /// </summary>
    /// <returns>
    /// A ServiceResponse containing an IEnumerable of TextToSpeechOptionDto objects, each representing a Text-to-Speech service with its description.
    /// </returns>
    ServiceResponse<IEnumerable<TextToSpeechOptionDto>> GetAvailableTextToSpeechServices();
}