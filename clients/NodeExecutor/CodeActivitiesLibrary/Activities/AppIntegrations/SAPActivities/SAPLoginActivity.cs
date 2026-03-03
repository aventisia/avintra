using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("SAP Login")]
    [Description("Logs into SAP GUI using provided credentials.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class SAPLoginActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Client")]
        [Description("SAP Client number (e.g., 800)")]
        public InArgument<string> Client { get; set; }

        [RequiredArgument]
        [DisplayName("Username")]
        [Description("SAP Username")]
        public InArgument<string> Username { get; set; }

        [RequiredArgument]
        [DisplayName("Secure Password")]
        [Description("SAP Secure Password")]
        public InArgument<SecureString> Password { get; set; }

        [RequiredArgument]
        [DisplayName("Language")]
        [Description("Language code (e.g., EN, DE, FR)")]
        public InArgument<string> Language { get; set; }

        [DisplayName("Multiple Logon Option")]
        [Description("Multiple Logon Option: Continue with this logon and end any other logons")]
        public InArgument<string> MultipleLogonOption { get; set; } = "Continue with this logon and end any other logons";

        [DisplayName("Delay before")]
        [Description("Delay before execution (in seconds)")]
        [DefaultValue(0.2)]
        public InArgument<double> DelayBefore { get; set; }

        [DisplayName("Delay after")]
        [Description("Delay after execution (in seconds)")]
        [DefaultValue(0.3)]
        public InArgument<double> DelayAfter { get; set; }

        [DisplayName("Timeout")]
        [Description("Timeout for login operation (in seconds)")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; }

        [Description("Whether to continue on error")]
        [DisplayName("Continue on error")]
        [DefaultValue(false)]
        public InArgument<bool> ContinueOnError { get; set; }

        [DisplayName("Result")]
        [Description("Result of the operation")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Get input values
                string client = Client.Get(context);
                string username = Username.Get(context);
                var password = Password.Get(context);
                string language = Language.Get(context);
                string multipleLogon = MultipleLogonOption.Get(context);
                double delayBefore = DelayBefore.Get(context);
                double delayAfter = DelayAfter.Get(context);
                int timeout = Timeout.Get(context);
                bool continueOnError = ContinueOnError.Get(context);

                // Apply delay before
                System.Threading.Thread.Sleep((int)(delayBefore * 1000));

                // Initialize SAP GUI connection
                object sapGuiAuto = null;
                object application = null;
                object connection = null;
                object session = null;

                try
                {
                    // Connect to SAP GUI
                    sapGuiAuto = Type.GetTypeFromProgID("SAPGUI.ScriptingCtrl").InvokeMember("GetScriptingObject", System.Reflection.BindingFlags.InvokeMethod, null, null, null);
                    application = sapGuiAuto.GetType().InvokeMember("GetApplication", System.Reflection.BindingFlags.InvokeMethod, null, sapGuiAuto, null);
                    connection = application.GetType().InvokeMember("OpenConnection", System.Reflection.BindingFlags.InvokeMethod, null, application, new object[] { "SAP", true });
                    session = connection.GetType().InvokeMember("Sessions", System.Reflection.BindingFlags.GetProperty, null, connection, null).GetType().InvokeMember("Item", System.Reflection.BindingFlags.InvokeMethod, null, connection.GetType().InvokeMember("Sessions", System.Reflection.BindingFlags.GetProperty, null, connection, null), new object[] { 0 });

                    // Set properties
                    session.GetType().InvokeMember("Client", System.Reflection.BindingFlags.SetProperty, null, session, new object[] { client });
                    session.GetType().InvokeMember("UserName", System.Reflection.BindingFlags.SetProperty, null, session, new object[] { username });
                    session.GetType().InvokeMember("Password", System.Reflection.BindingFlags.SetProperty, null, session, new object[] { password });
                    session.GetType().InvokeMember("Language", System.Reflection.BindingFlags.SetProperty, null, session, new object[] { language });

                    // Handle multiple logon option
                    if (multipleLogon.Contains("end"))
                    {
                        session.GetType().InvokeMember("SetProperty", System.Reflection.BindingFlags.InvokeMethod, null, session, new object[] { "MultiLogon", "false" });
                    }
                    else
                    {
                        session.GetType().InvokeMember("SetProperty", System.Reflection.BindingFlags.InvokeMethod, null, session, new object[] { "MultiLogon", "true" });
                    }

                    // Log in
                    session.GetType().InvokeMember("Logon", System.Reflection.BindingFlags.InvokeMethod, null, session, new object[] { 0, false });

                    // Wait for login
                    System.Threading.Thread.Sleep(timeout * 1000);

                    // Check if logged in successfully
                    var status = session.GetType().InvokeMember("InfoText", System.Reflection.BindingFlags.GetProperty, null, session, null);
                    if (status != null && status.ToString().Contains("Logon"))
                    {
                        throw new Exception($"Login failed: {status}");
                    }
                    System.Threading.Thread.Sleep((int)(delayAfter * 1000));

                    Result.Set(context, "SAP login successful.");
                    StatusMessage.Set(context, "SAP login successful.");
                    IsSuccess.Set(context, true);
                }
                catch (Exception ex)
                {
                    Result.Set(context, $"Error during SAP login: {ex.Message}");
                    StatusMessage.Set(context, $"Error during SAP login: {ex.Message}");
                    IsSuccess.Set(context, false);

                    if (!continueOnError)
                    {
                        throw new InvalidOperationException($"SAP Login Failed: {ex.Message}");
                    }
                }
                finally
                {
                    // Clean up
                    if (session != null) Marshal.ReleaseComObject(session);
                    if (connection != null) Marshal.ReleaseComObject(connection);
                    if (application != null) Marshal.ReleaseComObject(application);
                    if (sapGuiAuto != null) Marshal.ReleaseComObject(sapGuiAuto);
                }
            }
            catch (Exception ex)
            {
                Result.Set(context, $"Critical error: {ex.Message}");
                StatusMessage.Set(context, $"Critical error to Login: {ex.Message}");
                IsSuccess.Set(context, false);
                if (!ContinueOnError.Get(context))
                {
                    throw;
                }
            }
        }
    }
}