namespace AspNetToolkit.Controllers;

public class BaseApiController : ControllerBase
{
    public BaseApiController()
    {

    }

    /// <summary>
    /// Helper method for returning appropriate HTTP status codes based on the service response.
    /// Success responses (2xx) return ServiceResponse format.
    /// Error responses return HTTP status code with plain text body.
    /// </summary>
    /// <typeparam name="T">The type of the data in the service response.</typeparam>
    /// <param name="serviceResponse">The service response object.</param>
    /// <returns>An <see cref="ActionResult"/> representing the HTTP response.</returns>
    public ActionResult ResultHelper<T>(ServiceResponse<T> serviceResponse)
    {
        // If success (2xx range), return ServiceResponse JSON
        if (serviceResponse.StatusCode >= 200 && serviceResponse.StatusCode < 300)
            return StatusCode(serviceResponse.StatusCode, serviceResponse);

        // If error (4xx, 5xx), return plain text message
        return PlainTextError(serviceResponse.StatusCode, serviceResponse.Message);
    }

    /// <summary>
    /// Returns a plain text error response with the given status code and message.
    /// </summary>
    public ActionResult PlainTextError(int statusCode, string? message)
    {
        return new ContentResult
        {
            StatusCode = statusCode,
            Content = message ?? "Something went wrong",
            ContentType = "text/plain"
        };
    }
}