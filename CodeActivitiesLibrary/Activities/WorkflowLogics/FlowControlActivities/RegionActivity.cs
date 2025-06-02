using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [DisplayName("Region"), Description("Defines a labeled region in the workflow.")]
    public class RegionActivity : Extensions.BaseNativeActivity
    {
        [RequiredArgument, Category("Input"), Description("Name of the region.")]
        public InArgument<string> RegionName { get; set; }

        
        

        protected override void Execute(NativeActivityContext context)
        {
            try
            {
                var name = RegionName.Get(context);
                StatusMessage.Set(context, $"Region '{name}' started.");
            }
            catch (Exception ex)
            {
                StatusMessage.Set(context, $"Error starting region: {ex.Message}");
            }
        }
    }
}