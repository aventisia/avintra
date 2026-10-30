namespace GlobalAdminAPIs.Controllers;

public class BaseApiController : ControllerBase
{
    public BaseApiController()
    {

    }

    /// <summary>
    /// Helper method for returning appropriate HTTP status codes based on the service response.
    /// </summary>
    /// <typeparam name="T">The type of the data in the service response.</typeparam>
    /// <param name="serviceResponse">The service response object.</param>
    /// <returns>An <see cref="ActionResult"/> representing the HTTP response.</returns>
    public ActionResult ResultHelper<T>(ServiceResponse<T> serviceResponse)
    {
        switch (serviceResponse.StatusCode)
        {
            case 400:
                return BadRequest(serviceResponse.Message);
            case 401:
                return Unauthorized(serviceResponse.Message);
            case 409:
                return Conflict(serviceResponse.Message);
            default:
                return Ok(serviceResponse);
        }
    }
}