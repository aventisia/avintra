using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Call Transaction")]
    [Description("Calls an SAP transaction code with optional prefix (/n, /o, or none).")]

    public class CallTransactionActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Transaction Code")]
        [Description("SAP Transaction Code (e.g., SE38, MM01)")]
        public InArgument<string> TransactionCode { get; set; }

        [RequiredArgument]
        [DisplayName("Prefix")]
        [Description("Prefix to use: /n (same window), /o (new session), or no prefix")]
        public InArgument<PrefixType> Prefix { get; set; } = PrefixType.NewTransaction;

        [DisplayName("Timeout")]
        [Description("Timeout for transaction execution (in seconds)")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("Delay Before")]
        [Description("Delay before execution (in seconds)")]
        [DefaultValue(0.2)]
        public InArgument<double> DelayBefore { get; set; }

        [DisplayName("Delay After")]
        [Description("Delay after execution (in seconds)")]
        [DefaultValue(0.3)]
        public InArgument<double> DelayAfter { get; set; }

        [DisplayName("Continue on Error")]
        [Description("Whether to continue on error")]
        [DefaultValue(false)]
        public InArgument<bool> ContinueOnError { get; set; }

        [DisplayName("Result")]
        [Description("Result of the operation")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var transactionCode = TransactionCode.Get(context);
                var prefixEnum = Prefix.Get(context);
                var timeout = Timeout.Get(context);
                var delayBefore = DelayBefore.Get(context);
                var delayAfter = DelayAfter.Get(context);
                var continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(transactionCode))
                {
                    throw new ArgumentException("Transaction Code is required.");
                }

                // Apply delay before
                if (delayBefore > 0)
                    System.Threading.Thread.Sleep((int)(delayBefore * 1000));

                object session = GetActiveSession();
                if (session == null)
                {
                    throw new Exception("No active SAP session found. Please log in first.");
                }

                // Generate prefix string
                string prefix;
                switch (prefixEnum)
                {
                    case PrefixType.NewTransaction:
                        prefix = "/n";
                        break;
                    case PrefixType.NewSession:
                        prefix = "/o";
                        break;
                    case PrefixType.NoPrefix:
                        prefix = "";
                        break;
                    default:
                        prefix = "/n"; // fallback
                        break;
                }

                string command = prefix + transactionCode; // Safe concatenation

                try
                {
                    // Execute the command
                    session.GetType().InvokeMember("ExecuteCommand",
                        BindingFlags.InvokeMethod, null, session, new object[] { command });

                    // Wait for screen to load
                    System.Threading.Thread.Sleep(timeout * 1000);

                    // Get status text
                    var infoTextObj = session.GetType().InvokeMember("InfoText",
                        BindingFlags.GetProperty, null, session, null);
                    string infoText = infoTextObj?.ToString();

                    // Check for errors (case-insensitive)
                    if (!string.IsNullOrEmpty(infoText) &&
                        infoText.IndexOf("Error", StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        throw new Exception($"Transaction error: {infoText}");
                    }

                    // Success
                    Result.Set(context, $"Transaction '{transactionCode}' executed with prefix '{prefix}'.");
                    StatusMessage.Set(context, $"Transaction '{transactionCode}' executed successfully.");
                    IsSuccess.Set(context, true);
                }
                catch (Exception ex)
                {
                    string errorMsg = $"Error executing transaction: {ex.Message}";
                    Result.Set(context, errorMsg);
                    StatusMessage.Set(context, errorMsg);
                    IsSuccess.Set(context, false);

                    if (!continueOnError)
                        throw new InvalidOperationException(errorMsg);
                }

                // Apply delay after
                if (delayAfter > 0)
                    System.Threading.Thread.Sleep((int)(delayAfter * 1000));
            }
            catch (Exception ex)
            {
                string errorMsg = $"Critical error: {ex.Message}";
                Result.Set(context, errorMsg);
                StatusMessage.Set(context, errorMsg);
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw;
            }
        }

        public enum PrefixType
        {
            [Display(Name = "NewTransaction", Description = "/ n - New transaction in same window")]
            NewTransaction,

            [Display(Name = "NewSession ", Description = "/ o - Open in new session")]
            NewSession,

            [Display(Name = "NoPrefix", Description = "No prefix - Use current context")]
            NoPrefix
        }


        /// <summary>
        /// Gets the first available SAP session from any open connection.
        /// </summary>
        private object GetActiveSession()
        {
            object sapGuiAuto = null;
            object application = null;
            object connections = null;
            object connection = null;
            object sessions = null;
            object session = null;

            try
            {
                // Get SAP GUI scripting object
                var type = Type.GetTypeFromProgID("SAPGUI.ScriptingCtrl", throwOnError: false);
                if (type == null)
                    return null;

                sapGuiAuto = type.InvokeMember("GetScriptingObject",
                    BindingFlags.InvokeMethod, null, null, null);
                if (sapGuiAuto == null)
                    return null;

                application = sapGuiAuto.GetType().InvokeMember("GetApplication",
                    BindingFlags.InvokeMethod, null, sapGuiAuto, null);
                if (application == null)
                    return null;

                connections = application.GetType().InvokeMember("Connections",
                    BindingFlags.GetProperty, null, application, null);
                if (connections == null || (int)connections.GetType().InvokeMember("Count",
                    BindingFlags.GetProperty, null, connections, null) == 0)
                    return null;

                connection = connections.GetType().InvokeMember("Item",
                    BindingFlags.InvokeMethod, null, connections, new object[] { 0 });
                if (connection == null)
                    return null;

                sessions = connection.GetType().InvokeMember("Sessions",
                    BindingFlags.GetProperty, null, connection, null);
                if (sessions == null || (int)sessions.GetType().InvokeMember("Count",
                    BindingFlags.GetProperty, null, sessions, null) == 0)
                    return null;

                session = sessions.GetType().InvokeMember("Item",
                    BindingFlags.InvokeMethod, null, sessions, new object[] { 0 });

                return session;
            }
            catch
            {
                return null;
            }
            finally
            {
                // Clean up COM objects
                if (session != null) Marshal.ReleaseComObject(session);
                if (sessions != null) Marshal.ReleaseComObject(sessions);
                if (connection != null) Marshal.ReleaseComObject(connection);
                if (connections != null) Marshal.ReleaseComObject(connections);
                if (application != null) Marshal.ReleaseComObject(application);
                if (sapGuiAuto != null) Marshal.ReleaseComObject(sapGuiAuto);

                GC.Collect();
                GC.WaitForPendingFinalizers();
            }
        }
    }
}