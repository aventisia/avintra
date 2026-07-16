namespace AspNetToolkit.DTOs;

/// <summary>
/// Represents the response from an API service.
/// </summary>
/// <typeparam name="T">The type of the response data.</typeparam>
public class ServiceResponse<T>
{
    /// <summary>
    /// Gets or sets the API response data object.
    /// </summary>
    public T? Data { get; set; }

    /// <summary>
    /// Gets or sets the API response status code.
    /// </summary>
    public int StatusCode { get; set; } = 400;

    /// <summary>
    /// Gets or sets the API response execution's result message.
    /// </summary>
    /// <remarks>
    /// The maximum length of the message is 255 characters.
    /// </remarks>
    [StringLength(255, MinimumLength = 1)]
    public string? Message { get; set; } = "Something went wrong";

    /// <summary>
    /// Creates a new response instance with the given values.
    /// </summary>
    public static ServiceResponse<T> Create(string message, int statusCode, T? data = default)
    {
        return new ServiceResponse<T>
        {
            Data = data,
            StatusCode = statusCode,
            Message = message
        };
    }

    /// <summary>
    /// Updates the current response instance and returns it for fluent usage.
    /// </summary>
    public ServiceResponse<T> Update(string? message, int statusCode, T? data = default)
    {
        StatusCode = statusCode;
        Message = message;
        Data = data;
        return this;
    }
}