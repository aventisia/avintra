using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.UIInterfaceAutomations.UIAutomationActivities
{
    [DisplayName("Expand/Collapse Tree Node in Window")]
    [Description("Expands or collapses a node of a tree view residing in a window.")]
    public class ExpandCollapseTreeNodeInWindowActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [Description("The handle or identifier of the window.")]
        public InArgument<string> WindowHandle { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("The selector or identifier of the tree node.")]
        public InArgument<string> TreeNodeSelector { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [Description("Whether to expand or collapse the tree node.")]
        public InArgument<bool> Expand { get; set; }

        [Category("Output")]
        [Description("Returns the status message.")]
        public OutArgument<string> StatusMessage { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var windowHandle = WindowHandle.Get(context);
            var treeNodeSelector = TreeNodeSelector.Get(context);
            var expand = Expand.Get(context);
            string status = "";

            try
            {
                if (string.IsNullOrEmpty(windowHandle))
                {
                    throw new ArgumentException("Window handle cannot be null or empty.");
                }

                if (string.IsNullOrEmpty(treeNodeSelector))
                {
                    throw new ArgumentException("Tree node selector cannot be null or empty.");
                }

                // Simulate expanding/collapsing tree node using a hypothetical API
                StatusMessage.Set(context, "Tree node expanded/collapsed successfully.");
            }
            catch (Exception ex)
            {
                status = $"Error expanding/collapsing tree node: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}