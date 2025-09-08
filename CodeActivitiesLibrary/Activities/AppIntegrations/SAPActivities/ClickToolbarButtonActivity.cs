using CodeActivitiesLibrary.AppIntegrations.SAPActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace CodeActivitiesLibrary.AppIntegrations.UIActivities
{
    [DisplayName("Click Toolbar Button")]
    [Description("Clicks a specified toolbar button. Supports Healing Agent mode.")]

    public class ClickToolbarButtonActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Toolbar Button")]
        [Description("The toolbar button to click (e.g., 'Save', 'New', 'Close')")]
        public InArgument<string> ToolbarButton { get; set; }

        [DisplayName("Delay Before")]
        [Description("Delay before execution (in seconds)")]
        [DefaultValue(0.2)]
        public InArgument<double> DelayBefore { get; set; } = 0.2;

        [DisplayName("Delay After")]
        [Description("Delay after execution (in seconds)")]
        [DefaultValue(0.3)]
        public InArgument<double> DelayAfter { get; set; }

        [DisplayName("Timeout")]
        [Description("Timeout for operation (in seconds)")]
        [DefaultValue(30)]
        public InArgument<int> Timeout { get; set; }

        [DisplayName("Alter disabled element")]
        [Description("Whether to allow clicking disabled elements")]
        [DefaultValue(false)]
        public InArgument<bool> AlterDisabledElement { get; set; }

        [DisplayName("Healing Agent mode")]
        [Description("Healing Agent mode for this activity")]
        [DefaultValue(HealingAgentModeEnum.SameAsAppBrowser)]
        public InArgument<HealingAgentModeEnum> HealingAgentMode { get; set; }

        [DisplayName("Continue on error")]
        [Description("Whether to continue on error")]
        [DefaultValue(false)]
        public InArgument<bool> ContinueOnError { get; set; } = false;

        [DisplayName("Input element")]
        [Description("Input element (e.g., UI element or selector)")]
        public InArgument<object> InputElement { get; set; }

        [DisplayName("Result")]
        [Description("Result of the operation")]
        public OutArgument<string> Result { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var buttonName = ToolbarButton.Get(context);
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

                // Simulate click logic (replace with actual UI automation)
                try
                {
                    // Example: Simulate UI action
                    // In real world, use UiPath's UIAutomation or other framework
                    Console.WriteLine($"Clicking toolbar button: {buttonName}");
                    Console.WriteLine($"Healing Agent Mode: {healingMode}");

                    // You can add logic here based on healing mode
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

                    // Wait for completion
                    System.Threading.Thread.Sleep(timeout * 1000);

                    Result.Set(context, $"Clicked toolbar button '{buttonName}' successfully.");
                    StatusMessage.Set(context, $"Clicked '{buttonName}'.");
                    IsSuccess.Set(context, true);
                }
                catch (Exception ex)
                {
                    string errorMsg = $"Error clicking toolbar button: {ex.Message}";
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