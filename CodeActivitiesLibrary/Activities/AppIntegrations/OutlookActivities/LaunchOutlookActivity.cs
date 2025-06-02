using System;
using System.Activities;
using System.ComponentModel;
using System.Reflection;
using Outlook = Microsoft.Office.Interop.Outlook;

namespace CodeActivitiesLibrary.AppIntegrations.OutlookActivities
{
    [DisplayName("Launch Outlook Application")]
    [Description("Launches an Outlook application instance. Optionally connects to a specific profile.")]
    public class LaunchOutlookActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [Category("Input")]
        [DefaultValue(null)]
        [DisplayName("Profile Name")]
        [Description("Optional: The Outlook profile name to use when launching Outlook.")]
        public InArgument<string> ProfileName { get; set; }

        [Category("Input")]
        [DefaultValue(true)]
        [DisplayName("Create New Instance")]
        [Description("Determines whether to create a new Outlook instance or reuse an existing one.")]
        public InArgument<bool> CreateNewInstance { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Output")]
        [DisplayName("Outlook Application")]
        [Description("The Outlook Application object created or reused by this activity.")]
        public OutArgument<Outlook.Application> OutlookApplication { get; set; }

        [Category("Output")] 

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";
            Outlook.Application outlookApp = null;

            try
            {
                var profile = ProfileName.Get(context);
                var createNew = CreateNewInstance.Get(context);

                if (createNew)
                {
                    // Create a new Outlook application instance
                    outlookApp = new Outlook.Application();

                    // If profile is provided, logon using it
                    var namespaceObj = outlookApp.GetNamespace("MAPI");
                    if (!string.IsNullOrEmpty(profile))
                    {
                        namespaceObj.Logon(profile, Missing.Value, false, true);
                    }
                    else
                    {
                        namespaceObj.Logon(Missing.Value, Missing.Value, false, true);
                    }
                }
                else
                {
                    // Try to get an existing instance of Outlook
                    try
                    {
                        outlookApp =
                            (Outlook.Application)System.Runtime.InteropServices.Marshal.GetActiveObject(
                                "Outlook.Application");
                    }
                    catch
                    {
                        throw new InvalidOperationException("No running Outlook instance found.");
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error launching Outlook: {ex.Message}";
            }

            OutlookApplication.Set(context, outlookApp);
            StatusMessage.Set(context, status);
        }
    }
}