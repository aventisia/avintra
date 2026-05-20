using System.Net;
using System.Net.Http.Headers;
using System.Security;
using System.Text;
using NodeLibrary.HttpNodes.Enums;

namespace NodeLibrary.HttpNodes;

[DisplayName("Invoke Web Service"), Description("Invokes a web service (REST or SOAP) and returns the response text.")]
[NodeMetadata(icon: "/assets/HTTP.svg")]
public class InvokeWebServiceNode : BaseNode
{
    [DisplayName("Endpoint URL"), Description("The URL of the web service endpoint (e.g., https://api.example.com/data).")]
    public required InArgument<string> EndpointUrl { get; set; }

    [DisplayName("HTTP Method"), Description("The HTTP method to use: GET, POST, PUT, DELETE, etc.")]
    public InArgument<HttpMethodsEnum> HttpMethod { get; set; } = new InArgument<HttpMethodsEnum>(HttpMethodsEnum.GET);

    [DisplayName("Request Body"), Description("The request body to send in POST, PUT, etc. Leave empty for GET requests.")]
    public InArgument<string> RequestBody { get; set; } = new InArgument<string>();

    [DisplayName("Content Type"), Description("Specifies the content type for the request body (e.g., application/json, text/xml).")]
    public InArgument<string> ContentType { get; set; } = new InArgument<string>("application/json");

    [DisplayName("Accept Header"), Description("Specifies the content type expected in the response (e.g., application/json, text/xml).")]
    public InArgument<string> AcceptHeader { get; set; } = new InArgument<string>("application/json");

    [DisplayName("Authentication Type"), Description("Type of authentication to use: None, Basic, Bearer, etc.")]
    public InArgument<AuthenticationTypeEnum> AuthenticationType { get; set; } = new InArgument<AuthenticationTypeEnum>(AuthenticationTypeEnum.None);

    [DisplayName("Username"), Description("Username for basic authentication.")]
    [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
    public InArgument<string> Username { get; set; } = new InArgument<string>();

    [DisplayName("Password"), Description("Password for basic authentication.")]
    [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Basic)]
    public InArgument<SecureString> Password { get; set; } = new InArgument<SecureString>();

    [DisplayName("Bearer Token"), Description("Bearer token for OAuth authentication.")]
    [RenderIfCondition(nameof(AuthenticationType), AuthenticationTypeEnum.Bearer)]
    public InArgument<string> BearerToken { get; set; } = new InArgument<string>();

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the service to respond.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Use Default Credentials"), Description("If true, sends credentials of the current user with the request.")]
    public InArgument<bool> UseDefaultCredentials { get; set; } = new InArgument<bool>(false);

    [DisplayName("Ignore SSL Errors"), Description("If true, ignores SSL certificate validation errors.")]
    public InArgument<bool> IgnoreSslErrors { get; set; } = new InArgument<bool>(false);

    [DisplayName("Headers"), Description("Custom HTTP headers to include in the request.")]
    public InArgument<Dictionary<string, string>> Headers { get; set; } = new InArgument<Dictionary<string, string>>();

    [DisplayName("Result"), Description("Returns the raw response from the web service as a string.")]
    public OutArgument<string> Result { get; set; } = new OutArgument<string>();

    [DisplayName("Response Code"), Description("Returns the HTTP status code from the web service.")]
    public OutArgument<int> ResponseCode { get; set; } = new OutArgument<int>();

    [DisplayName("Response Headers"), Description("Returns the response headers from the web service.")]
    public OutArgument<Dictionary<string, string>> ResponseHeaders { get; set; } = new OutArgument<Dictionary<string, string>>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed successfully.";
        var responseContent = "";
        var responseCode = 0;
        var responseHeaders = new Dictionary<string, string>();

        try
        {
            var url = EndpointUrl.Get(context);
            var method = HttpMethod.Get(context);
            var body = RequestBody.Get(context);
            var contentType = ContentType.Get(context);
            var acceptType = AcceptHeader.Get(context);
            var timeout = TimeoutSeconds.Get(context);
            var useDefaultCreds = UseDefaultCredentials.Get(context);
            var ignoreSsl = IgnoreSslErrors.Get(context);
            var headers = Headers.Get(context);
            var authType = AuthenticationType.Get(context);
            var username = Username.Get(context);
            var password = ConvertSecureStringToString(Password.Get(context));
            var bearerToken = BearerToken.Get(context);

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("Endpoint URL must be specified.");

            var handler = new HttpClientHandler();

            if (useDefaultCreds)
                handler.UseDefaultCredentials = true;

            if (ignoreSsl)
                handler.ServerCertificateCustomValidationCallback = (_, _, _, _) => true;

            using var client = new HttpClient(handler);
            client.Timeout = TimeSpan.FromSeconds(timeout);
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

            status = response.IsSuccessStatusCode
                ? $"Successfully invoked {method} on {url}"
                : $"Web service returned error: {response.ReasonPhrase} ({responseCode})";

            Result.Set(context, responseContent);
            ResponseCode.Set(context, responseCode);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, responseContent);
            ResponseCode.Set(context, responseCode);
            ResponseHeaders.Set(context, responseHeaders);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error invoking web service: {ex.Message}");
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
