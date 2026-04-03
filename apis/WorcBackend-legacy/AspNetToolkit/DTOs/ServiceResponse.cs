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
    public static ServiceResponse<T> Create(T? data = default, int statusCode = 400, string message = "Something went wrong")
    {
        return new ServiceResponse<T>
        {
            Data = data,
            StatusCode = statusCode,
            Message = message
        };
    }

    /// <summary>
    /// Creates a successful response instance.
    /// </summary>
    public static ServiceResponse<T> Success(T? data, string message = "Success", int statusCode = 200)
    {
        return Create(data, statusCode, message);
    }

    /// <summary>
    /// Creates a failure response instance.
    /// </summary>
    public static ServiceResponse<T> Failure(string message = "Something went wrong", int statusCode = 400, T? data = default)
    {
        return Create(data, statusCode, message);
    }

    /// <summary>
    /// Updates the current response instance and returns it for fluent usage.
    /// </summary>
    public ServiceResponse<T> Update(int statusCode, string message, T? data = default)
    {
        StatusCode = statusCode;
        Message = message;
        Data = data;
        return this;
    }
}