using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Xml.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.HttpActivities
{
    //[DisplayName("Invoke SOAP Web Service")]
    //[Description("Invokes a specified method from a SOAP web service and returns the response.")]
    public class InvokeSoapWebServiceActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("Endpoint URL")]
        [Description("The endpoint URL of the SOAP web service (e.g., http://example.com/Service.asmx).")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument]
        [DisplayName("Method Name")]
        [Description("The name of the method to invoke on the SOAP service.")]
        public InArgument<string> MethodName { get; set; }

        [RequiredArgument]
        [DisplayName("Parameters")]
        [Description("The parameters for the method as a Dictionary<string, object>.")]
        public InArgument<Dictionary<string, object>> Parameters { get; set; }


        [DisplayName("Timeout Seconds")]
        [Description("Maximum time in seconds to wait for the web service to respond.")]
        [DefaultValue(60)]
        public InArgument<int> TimeoutSeconds { get; set; }


        [DisplayName("Use Custom Action Namespace")]
        [Description("Enable this if the service requires a specific namespace for the SOAP action.")]
        public InArgument<bool> UseCustomActionNamespace { get; set; }


        [DisplayName("Action Namespace")]
        [Description("Optional namespace for the action (if required by the service).")]
        [RenderIfCondition(nameof(UseCustomActionNamespace), true)]
        public InArgument<string> ActionNamespace { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [DisplayName("Result")]
        [Description("Returns the raw XML response from the SOAP service.")]
        public OutArgument<string> Result { get; set; }


        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed.";
            string result = null;

            try
            {
                var url = EndpointUrl.Get(context);
                var method = MethodName.Get(context);
                var parameters = Parameters.Get(context);
                var timeout = TimeSpan.FromSeconds(TimeoutSeconds.Get(context));
                var useCustomNs = UseCustomActionNamespace.Get(context);
                var actionNamespace = ActionNamespace.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(url))
                    throw new ArgumentException("Endpoint URL must be provided.");

                if (string.IsNullOrWhiteSpace(method))
                    throw new ArgumentException("Method name must be provided.");

                if (parameters == null || parameters.Count == 0)
                    throw new ArgumentException("At least one parameter is required.");

                // Build the SOAP envelope
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

                // Log request body for debugging
                Console.WriteLine($"SOAP Request Body:\n{requestBody}");

                // Configure HTTP Client
                using (var handler = new HttpClientHandler())
                {
                    // Optional: handle insecure certificates during development
                    // handler.ServerCertificateCustomValidationCallback = (_, _, _, _) => true;

                    using (var client = new HttpClient(handler) { Timeout = timeout })
                    {
                        var request = new StringContent(requestBody, System.Text.Encoding.UTF8, "text/xml");

                        string soapAction = $"\"{actionNs}{method}\"";
                        request.Headers.TryAddWithoutValidation("SOAPAction", soapAction);

                        // Avoid deadlock by wrapping in Task.Run
                        var response = Task.Run(() => client.PostAsync(url, request)).Result;

                        result = response.Content.ReadAsStringAsync().Result;

                        if (response.IsSuccessStatusCode)
                        {
                            status = $"Successfully invoked '{method}' on '{url}'.";
                        }
                        else
                        {
                            status = $"Failed to invoke '{method}': {response.ReasonPhrase}. Response: {result}";
                        }
                    }
                }
                Result.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {
                status = $"Error invoking SOAP web service: {ex.Message}";
                Result.Set(context, result ?? "<empty>");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, status);
            }
        }
    }
}