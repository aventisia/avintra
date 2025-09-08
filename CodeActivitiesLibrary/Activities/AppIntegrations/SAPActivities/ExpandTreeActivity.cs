using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace CodeActivitiesLibrary.AppIntegrations.UIActivities
{
   
    [DisplayName("Expand Tree")]
    [Description("Expands a tree node using a specified path (e.g., 'Menu → Submenu → Item').")]
    public class ExpandTreeActivity : BaseCodeActivity
    {        
        [RequiredArgument]
        [DisplayName("Tree Path")]
        [Description("The full path to the tree node to expand (e.g., 'Menu → Submenu → Item').")]
        public InArgument<string> TreePath { get; set; }

        [DisplayName("Delay Before")]
        [Description("Delay before executing the action (in seconds). Default is 0.2 seconds.")]
        [DefaultValue(0.2)]
        public InArgument<double> DelayBefore { get; set; }

        [DisplayName("Delay After")]
        [Description("Delay after executing the action (in seconds). Default is 0.3 seconds.")]
        [DefaultValue(0.3)]
        public InArgument<double> DelayAfter { get; set; }

        [DisplayName("Timeout")]
        [Description("Maximum time to wait for the operation to complete (in seconds). Default is 30 seconds.")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("Alter disabled element")]
        [Description("Whether to allow interaction with disabled elements.")]
        public InArgument<bool> AlterDisabledElement { get; set; } = false;

        [DisplayName("Healing Agent mode")]
        [Description("Controls how the Healing Agent behaves during this activity.")]
        [DefaultValue(HealingAgentModeEnum.SameAsAppBrowser)]
        public InArgument<HealingAgentModeEnum> HealingAgentMode { get; set; } 

        [DisplayName("Continue on error")]
        [Description("Whether to continue execution if this activity fails.")]
        [DefaultValue(false)]
        public InArgument<bool> ContinueOnError { get; set; }

        [DisplayName("Input element")]
        [Description("The UI element representing the tree or container (e.g., a treeview control).")]
        public InArgument<object> InputElement { get; set; }
  
        [DisplayName("Result")]
        [Description("Result of the operation.")]
        public OutArgument<string> Result { get; set; }
    
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var treePath = TreePath.Get(context);
                var delayBefore = DelayBefore.Get(context);
                var delayAfter = DelayAfter.Get(context);
                var timeout = Timeout.Get(context);
                var alterDisabled = AlterDisabledElement.Get(context);
                var healingMode = HealingAgentMode.Get(context);
                var continueOnError = ContinueOnError.Get(context);
                var inputElement = InputElement.Get(context);

                // Apply delay before
                if (delayBefore > 0)
                    System.Threading.Thread.Sleep((int)(delayBefore * 1000));

                try
                {
                    // Simulate expanding tree (replace with actual UI automation logic)
                    Console.WriteLine($"Expanding tree path: {treePath}");
                    Console.WriteLine($"Healing Agent Mode: {healingMode}");

                    // Example: Handle Healing Agent mode
                    switch (healingMode)
                    {
                        case HealingAgentModeEnum.Disabled:
                            Console.WriteLine("Healing Agent: Disabled");
                            break;
                        case HealingAgentModeEnum.InheritJobSettings:
                            Console.WriteLine("Healing Agent: Inherit job settings");
                            break;
                        case HealingAgentModeEnum.RecommendationOnly:
                            Console.WriteLine("Healing Agent: Recommendation only");
                            break;
                        case HealingAgentModeEnum.SameAsAppBrowser:
                            Console.WriteLine("Healing Agent: Same as App/Browser");
                            break;
                    }

                    // Wait for expansion
                    System.Threading.Thread.Sleep(timeout * 1000);

                    Result.Set(context, $"Expanded tree path '{treePath}' successfully.");
                    StatusMessage.Set(context, $"Expanded '{treePath}'.");
                    IsSuccess.Set(context, true);
                }
                catch (Exception ex)
                {
                    string errorMsg = $"Error expanding tree: {ex.Message}";
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
    }
}