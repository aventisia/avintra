namespace MLModelBuilderAPIs.Services;

/// <summary>
/// Defines operations for managing sentiment analysis configurations associated with machine learning models.
/// </summary>
public interface ISentimentAnalyticsService
{
    /// <summary>
    /// Updates the sentiment analysis configuration for an existing machine learning model.
    /// Applies changes from the provided <paramref name="sentimentAnalyticDto"/> and returns the updated configuration.
    /// </summary>
    /// <param name="sentimentAnalyticDto">The DTO containing updated sentiment analysis setup details.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a service response 
    /// with the updated sentiment analysis configuration.
    /// </returns>
    Task<ServiceResponse<SentimentAnalyticDto>> UpdateSentimentAnalyticsSetupAsync(SentimentAnalyticDto sentimentAnalyticDto);

    /// <summary>
    /// Retrieves the sentiment analysis configuration for a specified machine learning model.
    /// </summary>
    /// <param name="mlModelId">The unique identifier of the machine learning model.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a service response 
    /// with the sentiment analysis configuration associated with the given model ID.
    /// </returns>
    Task<ServiceResponse<SentimentAnalyticDto>> GetSentimentAnalyticsSetupByMLModelIdAsync(Guid mlModelId);
}
