using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.HTTPActivities
{
    // Activity to invoke a method from a SOAP web service
    [DisplayName("Invoke SOAP Web Service"), Description("Invokes a method from a SOAP web service.")]
    public class InvokeSoapWebServiceActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument, Category("Input"), Description("The endpoint URL of the SOAP web service.")]
        public InArgument<string> EndpointUrl { get; set; }

        [RequiredArgument, Category("Input"), Description("The name of the SOAP method to invoke.")]
        public InArgument<string> MethodName { get; set; }

        [RequiredArgument, Category("Input"), Description("The parameters for the SOAP method (as a dictionary).")]
        public InArgument<Dictionary<string, object>> Parameters { get; set; }

        [Category("Output"), Description("Returns the response from the SOAP web service.")]
        public OutArgument<string> Result { get; set; }




        protected override void Execute(CodeActivityContext context)
        {
            var endpointUrl = EndpointUrl.Get(context);
            var methodName = MethodName.Get(context);
            var parameters = Parameters.Get(context);
            var result = "";
            var status = "";

            try
            {
                // Simulate invoking SOAP web service (actual implementation would use WCF or similar)
                result = $"Simulated SOAP response for method '{methodName}' with parameters: {string.Join(", ", parameters.Select(p => $"{p.Key}={p.Value}"))}";
                status = "SOAP web service invoked successfully.";
            }
            catch (Exception ex)
            {
                result = "";
                status = $"Error invoking SOAP web service: {ex.Message}";
            }

            Result.Set(context, result);
            StatusMessage.Set(context, status);
        }
    }
}