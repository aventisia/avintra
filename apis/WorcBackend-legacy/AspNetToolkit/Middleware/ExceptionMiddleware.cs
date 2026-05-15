namespace AspNetToolkit.Middleware;

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
            _logger.LogError(ex, ex.Message);
            httpContext.Response.ContentType = "text/plain";
            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;

            var message = _hostEnvironment.IsDevelopment()
                ? ex.Message
                : "Internal Server Error";

            await httpContext.Response.WriteAsync(message);
        }
    }
}
