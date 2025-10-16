using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;


namespace CodeActivitiesLibrary.Activities.AppIntegrations.SAPActivities
{
    [DisplayName("Read Status Bar")]
    [Description("Reads the status bar message from the active SAP session.")]
    [ActivityMetaData(nodeImg: "/assets/SAP.svg")]
    public class ReadStatusBarActivity : CodeActivity
    {
        [DisplayName("Delay Before")]
        [Description("Time to wait before executing the activity, in seconds. Default is 0.2 seconds.")]
        [DefaultValue(0.2)]
        public InArgument<double> DelayBefore { get; set; }

        [DisplayName("Delay After")]
        [Description("Time to wait after executing the activity, in seconds. Default is 0.3 seconds.")]
        [DefaultValue(0.3)]
        public InArgument<double> DelayAfter { get; set; }

        [DisplayName("Timeout")]
        [Description("Maximum time to wait for the operation to complete, in seconds. Default is 30 seconds.")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; }

        // ------------------------
        // Output
        // ------------------------

        [DisplayName("Message Type")]
        [Description("The type of message shown in the status bar (e.g., 'I' for Info, 'E' for Error, 'S' for Success).")]
        public OutArgument<string> MessageType { get; set; }

        [DisplayName("Message Text")]
        [Description("The main message text displayed in the SAP status bar (e.g., 'Transaction completed successfully').")]
        public OutArgument<string> MessageText { get; set; }

        [DisplayName("Message ID")]
        [Description("The internal message ID (e.g., 'M001'), used in SAP for message classification.")]
        public OutArgument<string> MessageID { get; set; }

        [DisplayName("Message Number")]
        [Description("The message number (e.g., '001'), part of the SAP message ID system.")]
        public OutArgument<string> MessageNumber { get; set; }

        // ------------------------
        // Execute
        // ------------------------
        protected override void Execute(CodeActivityContext context)
        {
            //double delayBefore = DelayBefore.Get(context);
            //double delayAfter = DelayAfter.Get(context);
            //int timeout = Timeout.Get(context);

            //// Delay before
            //if (delayBefore > 0)
            //    System.Threading.Thread.Sleep(TimeSpan.FromSeconds(delayBefore));

            //GuiSession session = GetActiveSession();
            //if (session == null)
            //    throw new InvalidOperationException("No active SAP session found.");

            //DateTime startTime = DateTime.Now;
            //GuiStatusbar statusBar = null;

            //// Wait for status bar to be available
            //while ((DateTime.Now - startTime).TotalSeconds < timeout)
            //{
            //    try
            //    {
            //        statusBar = (GuiStatusbar)session.FindById("wnd[0]/sbar");
            //        if (statusBar != null && !string.IsNullOrEmpty(statusBar.Text))
            //            break;
            //    }
            //    catch
            //    {
            //        // Ignore and retry
            //    }

            //    System.Threading.Thread.Sleep(200);
            //}

            //if (statusBar == null)
            //    throw new TimeoutException("Could not read SAP status bar within the timeout.");

            //// Set output arguments
            //MessageType.Set(context, statusBar.MessageType);
            //MessageText.Set(context, statusBar.Text);
            //MessageID.Set(context, statusBar.MessageId);
            //MessageNumber.Set(context, statusBar.MessageNumber);

            //// Delay after
            //if (delayAfter > 0)
            //    System.Threading.Thread.Sleep(TimeSpan.FromSeconds(delayAfter));
        }

        // ------------------------
        // Helper: Get Active SAP Session
        // ------------------------
        //private GuiSession GetActiveSession()
        //{
        //    try
        //    {
        //        var sapGuiAuto = Activator.CreateInstance(Type.GetTypeFromProgID("SapGui.ScriptingCtrl.1"));
        //        var application = (GuiApplication)sapGuiAuto.GetType().InvokeMember(
        //            "GetScriptingEngine",
        //            System.Reflection.BindingFlags.InvokeMethod,
        //            null,
        //            sapGuiAuto,
        //            null);

        //        if (application.Connections.Count > 0)
        //        {
        //            var connection = (GuiConnection)application.Connections.ElementAt(0);
        //            if (connection.Sessions.Count > 0)
        //            {
        //                return (GuiSession)connection.Sessions.ElementAt(0);
        //            }
        //        }
        //    }
        //    catch
        //    {
        //        return null;
        //    }
        //    return null;
        //}
    }
}