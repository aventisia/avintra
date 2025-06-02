using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Get Window")]
    [Description("Finds a desktop window by name using UI Automation.")]
    public class GetWindowActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Window Name")]
        [Description("The name (title) of the window to find.")]
        public InArgument<string> WindowName { get; set; }

        [Category("Input")]
        [DisplayName("Max Wait Time (seconds)")]
        [Description("Maximum time to wait for the window (in seconds).")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;

        [Category("Output")]
        [DisplayName("Automation Element")]
        [Description("The found AutomationElement for the window.")]
        public OutArgument<AutomationElement> WindowElement { get; set; }

        

        protected override void Execute(CodeActivityContext context)
        {
            string windowName = WindowName.Get(context);
            int maxWaitTime = MaxWaitTime.Get(context);
            AutomationElement windowElement = null;
            string status = "";

            try
            {
                for (int i = 0; i <= (maxWaitTime * 2); i++)
                {
                    AutomationElement rootElement = AutomationElement.RootElement;
                    AutomationElement element = TreeWalker.ContentViewWalker.GetFirstChild(rootElement);
                    do
                    {
                        if (element != null && element.Current.Name != null && element.Current.Name.Contains(windowName))
                        {
                            windowElement = element;
                            break;
                        }
                        element = TreeWalker.ContentViewWalker.GetNextSibling(element);
                    }
                    while (element != null);

                    if (windowElement != null)
                        break;
                    else
                        Thread.Sleep(500);
                }

                status = windowElement != null
                    ? "Window found successfully."
                    : "Window not found within the specified time.";
            }
            catch (Exception ex)
            {
                status = $"Error: {ex.Message}";
            }

            WindowElement.Set(context, windowElement);
            StatusMessage.Set(context, status);
        }
    }
}