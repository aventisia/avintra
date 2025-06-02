using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Shuffle List")]
    [Description("Randomly reorders the items in a list.")]
    public class ShuffleListActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("List to Shuffle")]
        [Description("The list to be randomly reordered.")]
        public InArgument<IEnumerable<object>> ListToShuffle { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------

        [Category("Output")]
        [DisplayName("Shuffled List")]
        [Description("The shuffled version of the input list.")]
        public OutArgument<IEnumerable<object>> ShuffledList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            string status = "Operation completed successfully.";

            try
            {
                var inputList = ListToShuffle.Get(context);

                if (inputList == null || !inputList.Any())
                    throw new ArgumentException("The list must contain at least one item.");

                // Shuffle the list using Fisher-Yates algorithm
                var random = new Random();
                var shuffled = inputList.OrderBy(item => random.Next()).ToList();

                // Set output
                ShuffledList.Set(context, shuffled);
                status += $" List with {shuffled.Count()} items has been shuffled.";
            }
            catch (Exception ex)
            {
                status = $"Error shuffling list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}