using System.Xml.Linq;

namespace NodeLibrary.HttpNodes;

[DisplayName("Invoke SOAP Web Service"), Description("Invokes a specified method from a SOAP web service and returns the response.")]
[NodeMetadata(icon: "/assets/HTTP.svg")]
public class InvokeSoapWebServiceNode : BaseNode
{
    [DisplayName("Endpoint URL"), Description("The endpoint URL of the SOAP web service (e.g., http://example.com/Service.asmx).")]
    public required InArgument<string> EndpointUrl { get; set; }

    [DisplayName("Method Name"), Description("The name of the method to invoke on the SOAP service.")]
    public required InArgument<string> MethodName { get; set; }

    [DisplayName("Parameters"), Description("The parameters for the method as a Dictionary<string, object>.")]
    public required InArgument<Dictionary<string, object>> Parameters { get; set; }

    [DisplayName("Timeout Seconds"), Description("Maximum time in seconds to wait for the web service to respond.")]
    public InArgument<int> TimeoutSeconds { get; set; } = new InArgument<int>(60);

    [DisplayName("Use Custom Action Namespace"), Description("Enable this if the service requires a specific namespace for the SOAP action.")]
    public InArgument<bool> UseCustomActionNamespace { get; set; } = new InArgument<bool>(false);

    [DisplayName("Action Namespace"), Description("Optional namespace for the action (if required by the service).")]
    [RenderIfCondition(nameof(UseCustomActionNamespace), true)]
    public InArgument<string> ActionNamespace { get; set; } = new InArgument<string>();

    [DisplayName("Result"), Description("Returns the raw XML response from the SOAP service.")]
    public OutArgument<string> Result { get; set; } = new OutArgument<string>();

    protected override void Execute(INodeContext context)
    {
        var status = "Operation completed.";
        string? result = null;

        try
        {
            var url = EndpointUrl.Get(context);
            var method = MethodName.Get(context);
            var parameters = Parameters.Get(context);
            var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));
            var useCustomNs = UseCustomActionNamespace.Get(context);
            var actionNamespace = ActionNamespace.Get(context);

            if (string.IsNullOrWhiteSpace(url))
                throw new ArgumentException("Endpoint URL must be provided.");

            if (string.IsNullOrWhiteSpace(method))
                throw new ArgumentException("Method name must be provided.");

            if (parameters == null || parameters.Count == 0)
                throw new ArgumentException("At least one parameter is required.");

            XNamespace soapNs = "http://schemas.xmlsoap.org/soap/envelope/";
            XNamespace actionNs = useCustomNs && !string.IsNullOrEmpty(actionNamespace)
                ? actionNamespace
                : "http://tempuri.org/";

            var envelope = new XElement(soapNs + "Envelope",
                new XElement(soapNs + "Body",
                    new XElement(actionNs + method,
                        parameters.Select(p => new XElement(p.Key, p.Value.ToString()))
                    )
                )
            );

            var requestBody = envelope.ToString();

            using var handler = new HttpClientHandler();
            using var client = new HttpClient(handler) { Timeout = timeout };

            var request = new StringContent(requestBody, System.Text.Encoding.UTF8, "text/xml");

            string soapAction = $"\"{actionNs}{method}\"";
            request.Headers.TryAddWithoutValidation("SOAPAction", soapAction);

            var response = client.PostAsync(url, request).GetAwaiter().GetResult();
            result = response.Content.ReadAsStringAsync().GetAwaiter().GetResult();

            if (response.IsSuccessStatusCode)
            {
                status = $"Successfully invoked '{method}' on '{url}'.";
            }
            else
            {
                status = $"Failed to invoke '{method}': {response.ReasonPhrase}. Response: {result}";
            }

            Result.Set(context, result);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, status);
        }
        catch (Exception ex)
        {
            Result.Set(context, result ?? "<empty>");
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error invoking SOAP web service: {ex.Message}");
        }
    }
}
