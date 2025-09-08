//using CodeActivitiesLibrary.Extensions;
//using System;
//using System.Activities;
//using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Enums;
//using System.ComponentModel;
//using System.ComponentModel.DataAnnotations;
//using Microsoft.OData.Client;
//using System.Net.Http;
//using System.Text;

//namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
//{
//    [DisplayName("Connect to SAP OData")]
//    [Description("Establishes a connection to SAP OData service (C4C or S/4HANA) using Basic Authentication.")]
//    public class ConnectToSAPODATAActivity : BaseCodeActivity
//    {
//        // ======================= INPUT ARGUMENTS =======================

//        [RequiredArgument]
//        [DisplayName("Site URL")]
//        [Description("The base URL of the SAP system (e.g., https://myXXXXXX.sap.ondemand.com).")]
//        public InArgument<string> SiteUrl { get; set; }

//        [RequiredArgument]
//        [DisplayName("Service Path")]
//        [Description("The OData service path (e.g., /sap/c4c/odata/v1/c4codataapi). Do not include leading/trailing slashes.")]
//        public InArgument<string> ServicePath { get; set; }

//        [RequiredArgument]
//        [DisplayName("Username")]
//        [Description("Username for SAP system authentication.")]
//        public InArgument<string> Username { get; set; }

//        [RequiredArgument]
//        [DisplayName("Password")]
//        [Description("Password for SAP system authentication.")]
//        [EditorBrowsable(EditorBrowsableState.Never)]
//        public InArgument<string> Password { get; set; }

//        [RequiredArgument]
//        [DisplayName("SAP Product")]
//        [Description("Type of SAP system: C4C or S/4HANA.")]
//        [DefaultValue(SAPProduct.C4C)]
//        public InArgument<SAPProduct> Product { get; set; }

//        [DisplayName("Timeout (seconds)")]
//        [Description("Connection timeout in seconds.")]
//        [DefaultValue(60)]
//        public InArgument<int> TimeoutInSeconds { get; set; } = 60;

//        [DisplayName("Continue on Error")]
//        [Description("If true, the workflow continues even if the activity fails.")]
//        [DefaultValue(false)]
//        public InArgument<bool> ContinueOnError { get; set; } = false;

//        // ======================= OUTPUT ARGUMENTS =======================

//        [DisplayName("OData Client")]
//        [Description("The connected OData client instance for further operations.")]
//        public OutArgument<ODataClient> ODataClient { get; set; }

//        [DisplayName("Result")]
//        [Description("Result message indicating success or failure.")]
//        public OutArgument<string> Result { get; set; }


//        // ======================= EXECUTION LOGIC =======================
//        protected override void Execute(CodeActivityContext context)
//        {
//            bool isSuccess = false;
//            string resultMessage = "";
//            Exception exception = null;

//            try
//            {
//                // Get input values
//                var siteUrl = SiteUrl.Get(context)?.Trim();
//                var servicePath = ServicePath.Get(context)?.Trim();
//                var username = Username.Get(context);
//                var password = Password.Get(context);
//                var product = Product.Get(context);
//                var timeoutInSeconds = TimeoutInSeconds.Get(context);
//                var continueOnError = ContinueOnError.Get(context);

//                // Validate required inputs
//                if (string.IsNullOrWhiteSpace(siteUrl))
//                    throw new ArgumentException("Site URL is required.");

//                if (string.IsNullOrWhiteSpace(servicePath))
//                    throw new ArgumentException("Service Path is required.");

//                if (string.IsNullOrWhiteSpace(username))
//                    throw new ArgumentException("Username is required.");

//                if (string.IsNullOrWhiteSpace(password))
//                    throw new ArgumentException("Password is required.");

//                if (timeoutInSeconds <= 0)
//                    throw new ArgumentException("Timeout must be greater than zero.");

//                // Construct full endpoint
//                string endpoint = $"{siteUrl.TrimEnd('/')}/{servicePath.Trim('/')}";
//                resultMessage = $"Connecting to SAP {product} at: {endpoint}";

//                // Create HttpClient with Basic Auth
//                var httpClient = new HttpClient();
//                var credentials = Encoding.ASCII.GetBytes($"{username}:{password}");
//                var base64Credentials = Convert.ToBase64String(credentials);

//                httpClient.DefaultRequestHeaders.Authorization =
//                    new System.Net.Http.Headers.AuthenticationHeaderValue("Basic", base64Credentials);

//                // Create OData Client (Note: Replace with actual OData context if you have a generated proxy)
//                var client = new ODataClient(new Uri(endpoint), httpClient)
//                {
//                    Timeout = TimeSpan.FromSeconds(timeoutInSeconds)
//                };

//                // Set output
//                ODataClient.Set(context, client);
//                resultMessage += " - Connection successful.";
//                isSuccess = true;
//            }
//            catch (Exception ex)
//            {
//                exception = ex;
//                resultMessage = $"Failed to connect to SAP OData: {ex.Message}";
//                isSuccess = false;
//            }
//            finally
//            {
//                // Set outputs
//                Result.Set(context, resultMessage);
//                StatusMessage.Set(context, resultMessage);
//                IsSuccess.Set(context, isSuccess);

//                if (!isSuccess && !ContinueOnError.Get(context))
//                {
//                    throw new InvalidOperationException(resultMessage, exception);
//                }
//            }
//        }
//    }
//}