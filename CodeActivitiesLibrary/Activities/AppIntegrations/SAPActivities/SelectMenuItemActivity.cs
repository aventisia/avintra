using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.InteropServices;

namespace CodeActivitiesLibrary.AppIntegrations.SAPActivities
{
    [DisplayName("Select Menu Item")]
    [Description("Selects a menu item from the SAP GUI menu bar using a path (e.g., 'System → Log Off').")]
    public class SelectMenuItemActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Menu Item")]
        [Description("Path to the menu item using '→' as separator (e.g., 'System → User Profile → Own Data').")]
        public InArgument<string> MenuItem { get; set; }

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

        [DisplayName("Alter disabled element")]
        [Description("Whether to allow interaction with disabled menu items.")]
        public InArgument<bool> AlterDisabledElement { get; set; } = false;

        [DisplayName("Continue on error")]
        [Description("Whether to continue execution if this activity fails.")]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        [DisplayName("Result")]
        [Description("Result of the operation: success or error message.")]
        public OutArgument<string> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string menuItem = MenuItem.Get(context);
                double delayBefore = DelayBefore.Get(context);
                double delayAfter = DelayAfter.Get(context);
                int timeout = Timeout.Get(context);
                bool alterDisabled = AlterDisabledElement.Get(context);
                bool continueOnError = ContinueOnError.Get(context);

                if (string.IsNullOrWhiteSpace(menuItem))
                {
                    throw new ArgumentException("Menu Item is required.");
                }

                // Apply delay before
                if (delayBefore > 0)
                    System.Threading.Thread.Sleep((int)(delayBefore * 1000));

                object session = GetActiveSession(context);
                if (session == null)
                {
                    throw new Exception("No active SAP session found. Please log in first.");
                }

                try
                {
                    // Convert "System → User Profile → Own Data" to SAP format
                    string sapMenuPath = ConvertToSapMenuPath(menuItem);

                    // Get the main window
                    object mainWindow = session.GetType().InvokeMember("FindById",
                        BindingFlags.InvokeMethod, null, session, new object[] { "wnd[0]" });

                    // Select the menu path
                    mainWindow.GetType().InvokeMember("SelectMenuPath",
                        BindingFlags.InvokeMethod, null, mainWindow, new object[] { sapMenuPath });

                    // Wait for completion
                    System.Threading.Thread.Sleep(timeout * 1000);

                    Result.Set(context, $"Selected menu item '{menuItem}' successfully.");
                    StatusMessage.Set(context, $"Menu item selected: {menuItem}");
                    IsSuccess.Set(context, true);
                }
                catch (Exception ex)
                {
                    string errorMsg = $"Error selecting menu item: {ex.Message}";
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
                Result.Set(context, $"Critical error: {ex.Message}");
                StatusMessage.Set(context, $"Critical error: {ex.Message}");
                IsSuccess.Set(context, false);

                if (!ContinueOnError.Get(context))
                    throw;
            }
        }

        /// <summary>
        /// Converts a user-friendly menu path (e.g., "System → User Profile → Own Data")
        /// into SAP's internal format (e.g., "System[16]==User Profile[17]==Own Data[18]")
        /// </summary>
        private string ConvertToSapMenuPath(string userPath)
        {
            // Simple placeholder: in real world, you'd map known menu items to IDs
            // For now, assume flat structure with dummy indices
            var parts = userPath.Split(new[] { "→" }, StringSplitOptions.RemoveEmptyEntries)
                                .Select(p => p.Trim());

            return string.Join("==", parts.Select((part, index) => $"{part}[{index + 16}]"));
        }

        /// <summary>
        /// Gets the active SAP session using late binding.
        /// </summary>
        private object GetActiveSession(CodeActivityContext context)
        {
            object sapGuiAuto = null;
            object application = null;
            object connections = null;
            object connection = null;
            object sessions = null;
            object session = null;

            try
            {
                var type = Type.GetTypeFromProgID("SAPGUI.ScriptingCtrl", throwOnError: false);
                if (type == null) return null;

                sapGuiAuto = type.InvokeMember("GetScriptingObject",
                    BindingFlags.InvokeMethod, null, null, null);
                if (sapGuiAuto == null) return null;

                application = sapGuiAuto.GetType().InvokeMember("GetApplication",
                    BindingFlags.InvokeMethod, null, sapGuiAuto, null);
                if (application == null) return null;

                connections = application.GetType().InvokeMember("Connections",
                    BindingFlags.GetProperty, null, application, null);
                if (connections == null || (int)connections.GetType().InvokeMember("Count",
                    BindingFlags.GetProperty, null, connections, null) == 0)
                    return null;

                connection = connections.GetType().InvokeMember("Item",
                    BindingFlags.InvokeMethod, null, connections, new object[] { 0 });
                if (connection == null) return null;

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