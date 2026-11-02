namespace GlobalAdminAPIs.Middleware;

public class ApiException
{
    public ApiException(
        int statusCode,
        string message,
        string details)
    {
        StatusCode = statusCode;
        Message = message;
        Details = details;
    }
    public int StatusCode { get; set; }
    public string Message { get; set; }
    public string Details { get; set; }
}

public class ExceptionMiddleware
{
    private readonly RequestDelegate _requestDelegate;
    private readonly IHostEnvironment _hostEnvironment;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(
        RequestDelegate requestDelegate,
        IHostEnvironment hostEnvironment,
        ILogger<ExceptionMiddleware> logger)
    {
        _requestDelegate = requestDelegate;
        _hostEnvironment = hostEnvironment;
        _logger = logger;
    }
    public async Task InvokeAsync(HttpContext httpContext)
    {
        try
        {
            await _requestDelegate(httpContext);
        }
        catch (Exception ex)
        {
            var stackTrace = ex.StackTrace != null ? ex.StackTrace : string.Empty;

            _logger.LogError(ex, ex.Message);
            httpContext.Response.ContentType = "application/json";
            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            var response = _hostEnvironment.IsDevelopment()
                    ? new ApiException(httpContext.Response.StatusCode, ex.Message, stackTrace)
                    : new ApiException(httpContext.Response.StatusCode, "Internal Server Error", string.Empty);
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            var json = System.Text.Json.JsonSerializer.Serialize(response, options);
            await httpContext.Response.WriteAsync(json);
        }
    }
}
