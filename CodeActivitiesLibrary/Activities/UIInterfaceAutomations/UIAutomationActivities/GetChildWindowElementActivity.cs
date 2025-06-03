using System;
using System.Activities;
using System.ComponentModel;
using System.Threading;
using System.Windows.Automation;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Find Child Window")]
    [Description("Finds a child window inside a parent window by its name.")]
    public class GetChildWindowElementActivity : Extensions.BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Parent Window")]
        [Description("Select the parent window where you want to search for the child window.")]
        public InArgument<AutomationElement> ParentWindow { get; set; }

        [RequiredArgument]
        [DisplayName("Child Window Name")]
        [Description("Enter the name (title) of the child window you want to find.")]
        public InArgument<string> ChildWindowName { get; set; }


        [DisplayName("Max Wait Time (seconds)")]
        [Description("How many seconds to wait while searching for the child window.")]
        [DefaultValue(5)]
        public InArgument<int> MaxWaitTime { get; set; } = 5;


        [DisplayName("Child Window Element")]
        [Description("The found child window AutomationElement.")]
        public OutArgument<AutomationElement> ChildWindowElement { get; set; }



        protected override void Execute(CodeActivityContext context)
        {
            var parentWindow = ParentWindow.Get(context);
            var childWindowName = ChildWindowName.Get(context);
            var maxWaitTime = MaxWaitTime.Get(context);

            AutomationElement childWindowElement = null;
            string status = "";

            try
            {
                if (parentWindow == null)
                {
                    status = "No parent window was provided.";
                }
                else
                {
                    for (int i = 0; i <= (maxWaitTime * 2); i++)
                    {
                        AutomationElement element = TreeWalker.ContentViewWalker.GetFirstChild(parentWindow);
                        do
                        {
                            if (element != null && element.Current.Name != null && element.Current.Name.Contains(childWindowName))
                            {
                                childWindowElement = element;
                                break;
                            }
                            element = TreeWalker.ContentViewWalker.GetNextSibling(element);
                        }
                        while (element != null);

                        if (childWindowElement != null)
                        {
                            status = "Child window found successfully.";
                            break;
                        }
                        else
                        {
                            Thread.Sleep(500);
                        }
                    }

                    if (childWindowElement == null)
                    {
                        status = "Could not find the child window within the specified time.";
                    }
                }
            }
            catch (Exception ex)
            {
                status = $"Error while searching for the child window: {ex.Message}";
            }

            ChildWindowElement.Set(context, childWindowElement);
            StatusMessage.Set(context, status);
        }
    }
}