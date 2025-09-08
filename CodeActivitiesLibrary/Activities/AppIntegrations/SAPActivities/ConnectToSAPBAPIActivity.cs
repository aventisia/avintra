//using CodeActivitiesLibrary.Extensions;
//using System;
//using System.Activities;
//using System.Collections.Generic;
//using System.ComponentModel;
//using System.Diagnostics;
//using System.Linq;
//using System.Text;
//using System.Threading.Tasks;
//using SapNwRfc.Middleware.Connector;

//namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
//{
//    [DisplayName("Connect to SAP BAPI")]
//    [Description("Establishes a connection to an on-premise SAP system using RFC for BAPI operations.")]
//    public class ConnectToSAPBAPIActivity : BaseCodeActivity
//    {
//        // ======================= INPUT ARGUMENTS =======================

//        [RequiredArgument]
//        [DisplayName("Hostname")]
//        [Description("Hostname or IP address of the SAP application server.")]
//        public InArgument<string> Hostname { get; set; }

//        [RequiredArgument]
//        [DisplayName("Client")]
//        [Description("SAP client number (e.g., '100').")]
//        public InArgument<string> Client { get; set; }

//        [RequiredArgument]
//        [DisplayName("Instance Number")]
//        [Description("Two-digit SAP instance number (e.g., '00').")]
//        public InArgument<string> InstanceNumber { get; set; }

//        [RequiredArgument]
//        [DisplayName("Username")]
//        [Description("SAP username for authentication.")]
//        public InArgument<string> Username { get; set; }

//        [RequiredArgument]
//        [DisplayName("Password")]
//        [Description("SAP password for authentication.")]
//        [EditorBrowsable(EditorBrowsableState.Never)]
//        public InArgument<string> Password { get; set; }

//        [DisplayName("Language")]
//        [Description("SAP logon language code (e.g., 'EN' for English). Default: EN.")]
//        [DefaultValue("EN")]
//        public InArgument<string> Language { get; set; } = "EN";

//        [DisplayName("Continue on Error")]
//        [Description("If true, workflow continues even if connection fails.")]
//        [DefaultValue(false)]
//        public InArgument<bool> ContinueOnError { get; set; } = false;

//        // ======================= OUTPUT ARGUMENTS =======================

//        [DisplayName("RFC Destination")]
//        [Description("The connected RFC destination object for further BAPI calls.")]
//        public OutArgument<RfcDestination> RfcDestination { get; set; }

//        [DisplayName("Result")]
//        [Description("Connection result message.")]
//        public OutArgument<string> Result { get; set; }

//        // ======================= EXECUTION LOGIC =======================
//        protected override void Execute(CodeActivityContext context)
//        {
//            bool isSuccess = false;
//            string resultMessage = "";
//            Exception exception = null;

//            try
//            {
//                var hostname = Hostname.Get(context)?.Trim();
//                var client = Client.Get(context)?.Trim();
//                var instanceNumber = InstanceNumber.Get(context)?.Trim();
//                var username = Username.Get(context);
//                var password = Password.Get(context);
//                var language = Language.Get(context)?.Trim() ?? "EN";
//                var continueOnError = ContinueOnError.Get(context);

//                // Validate inputs
//                if (string.IsNullOrWhiteSpace(hostname))
//                    throw new ArgumentException("Hostname is required.");

//                if (string.IsNullOrWhiteSpace(client))
//                    throw new ArgumentException("Client number is required.");

//                if (string.IsNullOrWhiteSpace(instanceNumber))
//                    throw new ArgumentException("Instance number is required.");

//                if (string.IsNullOrWhiteSpace(username))
//                    throw new ArgumentException("Username is required.");

//                if (string.IsNullOrWhiteSpace(password))
//                    throw new ArgumentException("Password is required.");

//                // Build connection parameters
//                var config = new RfcConfigParameters
//                {
//                    // RFC Connection Parameters
//                    RfcSystem = "ABAP",
//                    RfcHost = hostname,
//                    RfcClient = client,
//                    RfcSystemNumber = instanceNumber,
//                    RfcUser = username,
//                    RfcPassword = password,
//                    RfcLanguage = language,
//                    RfcTraceLevel = TraceLevel.None,
//                    RfcConnectionMode = ConnectionMode.Direct,
//                    RfcConnectionType = ConnectionType.Standard,
//                    RfcUseSSL = false
//                };

//                // Create destination
//                var destination = RfcDestinationManager.GetDestination(config);

//                // Test connection
//                destination.Open();

//                resultMessage = $"Successfully connected to SAP system at {hostname} (Client: {client}, Instance: {instanceNumber})";
//                isSuccess = true;

//                // Set output
//                RfcDestination.Set(context, destination);
//            }
//            catch (Exception ex)
//            {
//                exception = ex;
//                resultMessage = $"Failed to connect to SAP BAPI: {ex.Message}";
//                isSuccess = false;
//            }
//            finally
//            {
//                // Set outputs
//                Result.Set(context, resultMessage);
//                StatusMessage.Set(context, resultMessage);
//                IsSuccess.Set(context, isSuccess);

//                if (!isSuccess && !continueOnError)
//                {
//                    throw new InvalidOperationException(resultMessage, exception);
//                }
//            }
//        }
//    }
//}