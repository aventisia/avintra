using System.Net;
using NodeLibrary.HttpNodes.Enums;

namespace NodeLibrary.HttpNodes;

[DisplayName("HTTP Request"), Description("Sends an HTTP request to a RESTful web service and returns the response body, status code, and headers.")]
[NodeMetadata(icon: "/assets/HTTP.svg")]
public class InvokeWebServiceNode : BaseNode
{
    [DisplayName("Endpoint URL"), Description("The full URL of the web service endpoint. Must include the scheme (e.g., 'https://api.example.com/v1/users').")]
    public required InArgument<string> EndpointUrl { get; set; }

    [DisplayName("HTTP Method"), Description("The HTTP verb for the request. Defaults to GET.")]
    public InArgument<HttpMethodsEnum> HttpMethod { get; set; } = new InArgument<HttpMethodsEnum>(HttpMethodsEnum.GET);

    [DisplayName("Request Body"), Description("The body payload for POST, PUT, or PATCH requests. Ignored for GET and DELETE. Example: '{\"name\":\"John\",\"age\":30}'.")]
    public InArgument<string> RequestBody { get; set; } = new InArgument<string>();

    [DisplayName("Content Type"), Description("The MIME type of the request body. Defaults to 'application/json'. Common values: 'application/json', 'text/xml', 'application/x-www-form-urlencoded'.")]
    public InArgument<string> ContentType { get; set; } = new InArgument<string>("application/json");

    [DisplayName("Accept Header"), Description("The MIME type expected in the response. Defaults to 'application/json'. Common values: 'application/json', 'text/xml', 'text/plain'.")]
    public InArgument<string> AcceptHeader { get; set; } = new InArgument<string>("application/json");

    [DisplayName("Authentication Type"), Description("The authentication scheme to use. Set to 'None' for unauthenticated requests. Defaults to None.")]
    public InArgument<AuthenticationTypeEnum> AuthenticationType { get; set; } = new InArgument<AuthenticationTypeEnum>(AuthenticationTypeEnum.None);

    [DisplayName("Username"), Description("The username for HTTP Basic authentication. Required when Authentication Type is 'Basic'.")]
    [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
    public InArgument<string> Username { get; set; } = new InArgument<string>();

    [DisplayName("Password"), Description("The password for HTTP Basic authentication. Required when Authentication Type is 'Basic'.")]
    [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
    public InArgument<SecureString> Password { get; set; } = new InArgument<SecureString>();

    [DisplayName("Bearer Token"), Description("The OAuth 2.0 bearer token (without the 'Bearer ' prefix). Required when Authentication Type is 'Bearer'.")]
    [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Bearer)]
    public InArgument<string> BearerToken { get; set; } = new InArgument<string>();

    [DisplayName("Timeout (Seconds)"), Description("Maximum time in seconds to wait for the server to respond before aborting. Defaults to 60. Set to 0 for infinite timeout.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Use Default Credentials"), Description("When true, sends the current Windows user's credentials (NTLM/Kerberos) with the request. Defaults to false.")]
    public InArgument<bool> UseDefaultCredentials { get; set; } = new InArgument<bool>(false);

    [DisplayName("Ignore SSL Errors"), Description("When true, bypasses SSL/TLS certificate validation errors (e.g., self-signed certificates). Use only in development environments. Defaults to false.")]
    public InArgument<bool> IgnoreSslErrors { get; set; } = new InArgument<bool>(false);

    [DisplayName("Custom Headers"), Description("Additional HTTP headers to include in the request as key-value pairs. Example: { \"X-Api-Key\": \"abc123\", \"X-Correlation-Id\": \"uuid\" }.")]
    public InArgument<Dictionary<string, string>> Headers { get; set; } = new InArgument<Dictionary<string, string>>();

    [DisplayName("Response Body"), Description("The response from the web service. Returns a JsonNode if the response is valid JSON, otherwise returns the raw string.")]
    public OutArgument<object> Result { get; set; } = new OutArgument<object>();

    [DisplayName("Response Code"), Description("The HTTP status code returned by the server (e.g., 200 for OK, 404 for Not Found).")]
    public OutArgument<int> ResponseCode { get; set; } = new OutArgument<int>();

    [DisplayName("Response Headers"), Description("All response headers returned by the server as key-value pairs.")]
    public OutArgument<Dictionary<string, string>> ResponseHeaders { get; set; } = new OutArgument<Dictionary<string, string>>();

    protected override void Execute(INodeContext context)
    {
        var responseContent = "";
        var responseCode = 0;
        var responseHeaders = new Dictionary<string, string>();

        try
        {
            var url = EndpointUrl.Get(context);
            var method = HttpMethod.Get(context);
            var body = RequestBody.Get(context);
            var contentType = ContentType.Get(context) ?? "application/json";
            var acceptType = AcceptHeader.Get(context);
            var timeout = TimeoutSeconds.Get(context);
            var useDefaultCreds = UseDefaultCredentials.Get(context);
            var ignoreSsl = IgnoreSslErrors.Get(context);
            var headers = Headers.Get(context);
            var authType = AuthenticationType.Get(context);
            var username = Username.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));
            var bearerToken = BearerToken.Get(context);

            // Input validation
            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentNullException(nameof(EndpointUrl), "Endpoint URL must be specified.");

            if (!Uri.TryCreate(url, UriKind.Absolute, out var parsedUri) ||
                (parsedUri.Scheme != Uri.UriSchemeHttp && parsedUri.Scheme != Uri.UriSchemeHttps))
                throw new ArgumentException($"Endpoint URL must be a valid absolute HTTP or HTTPS URL. Received: '{url}'", nameof(EndpointUrl));

            if (timeout < 0)
                throw new ArgumentOutOfRangeException(nameof(TimeoutSeconds), "Timeout must be zero (infinite) or a positive number of seconds.");

            var handler = new HttpClientHandler();

            if (useDefaultCreds)
                handler.UseDefaultCredentials = true;

            if (ignoreSsl)
                handler.ServerCertificateCustomValidationCallback = (_, _, _, _) => true;

            using var client = new HttpClient(handler);
            client.Timeout = timeout == 0
                ? System.Threading.Timeout.InfiniteTimeSpan
                : TimeSpan.FromSeconds(timeout);
            client.DefaultRequestHeaders.Accept.Clear();

            if (!string.IsNullOrWhiteSpace(acceptType))
                client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue(acceptType));

            switch (authType)
            {
                case AuthenticationTypeEnum.Basic:
                    if (!string.IsNullOrWhiteSpace(username) && !string.IsNullOrWhiteSpace(password))
                    {
                        handler.PreAuthenticate = true;
                        handler.Credentials = new NetworkCredential(username, password);
                    }
                    break;
                case AuthenticationTypeEnum.Bearer:
                    if (!string.IsNullOrWhiteSpace(bearerToken))
                        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);
                    break;
            }

            if (headers != null)
                foreach (var header in headers)
                    client.DefaultRequestHeaders.TryAddWithoutValidation(header.Key, header.Value);

            HttpResponseMessage response = method switch
            {
                HttpMethodsEnum.GET => client.GetAsync(url).GetAwaiter().GetResult(),
                HttpMethodsEnum.POST => client.PostAsync(url, new StringContent(body ?? "", Encoding.UTF8, contentType)).GetAwaiter().GetResult(),
                HttpMethodsEnum.PUT => client.PutAsync(url, new StringContent(body ?? "", Encoding.UTF8, contentType)).GetAwaiter().GetResult(),
                HttpMethodsEnum.DELETE => client.DeleteAsync(url).GetAwaiter().GetResult(),
                HttpMethodsEnum.PATCH => client.SendAsync(new HttpRequestMessage(new System.Net.Http.HttpMethod("PATCH"), url)
                {
                    Content = new StringContent(body ?? "", Encoding.UTF8, contentType)
                }).GetAwaiter().GetResult(),
                _ => throw new ArgumentException($"Unsupported HTTP method: '{method}'")
            };

            responseCode = (int)response.StatusCode;

            foreach (var header in response.Headers)
                responseHeaders[header.Key] = string.Join(",", header.Value);

            if (response.Content != null)
            {
                foreach (var header in response.Content.Headers)
                    responseHeaders[header.Key] = string.Join(",", header.Value);

                responseContent = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();
            }

            var status = response.IsSuccessStatusCode
                ? $"Successfully invoked {method} on {url}"
                : $"Web service returned error: {response.ReasonPhrase} ({responseCode})";

            Result.Set(context, ParseResponseContent(responseContent));
            ResponseCode.Set(context, responseCode);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (TaskCanceledException)
        {
            Result.Set(context, responseContent);
            ResponseCode.Set(context, 0);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, "The request was cancelled or timed out before receiving a response.");
        }
        catch (HttpRequestException httpEx)
        {
            Result.Set(context, responseContent);
            ResponseCode.Set(context, responseCode);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"HTTP request failed: {httpEx.Message}");
        }
        catch (ArgumentException ex)
        {
            Result.Set(context, responseContent);
            ResponseCode.Set(context, responseCode);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Invalid configuration: {ex.Message}");
        }
        catch (Exception ex)
        {
            Result.Set(context, ParseResponseContent(responseContent));
            ResponseCode.Set(context, responseCode);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Unexpected error invoking web service: {ex.Message}");
        }
    }

    private static object ParseResponseContent(string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            return content;

        try
        {
            return JsonNode.Parse(content)!;
        }
        catch
        {
            return content;
        }
    }

    private static string? ConvertSecureStringToString(SecureString? secureString)
    {
        if (secureString == null) return null;
        var ptr = System.Runtime.InteropServices.Marshal.SecureStringToBSTR(secureString);
        try
        {
            return System.Runtime.InteropServices.Marshal.PtrToStringBSTR(ptr);
        }
        finally
        {
            System.Runtime.InteropServices.Marshal.ZeroFreeBSTR(ptr);
        }
    }
}
