using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Find Common List Items")]
    [Description("Finds common items between two lists and returns them as a new list.")]
    public class FindCommonListItemsActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("First List")]
        [Description("The variable that contains the first list to compare.")]
        public InArgument<List<string>> FirstList { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Second List")]
        [Description("The variable that contains the second list to compare.")]
        public InArgument<List<string>> SecondList { get; set; }


        [Category("Output")]
        [DisplayName("Intersection List Output")]
        [Description("The output list containing common items from both input lists.")]
        public OutArgument<List<string>> IntersectionListOutput { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var firstList = FirstList.Get(context);
                var secondList = SecondList.Get(context);

                if (firstList == null || secondList == null)
                    throw new ArgumentException("Both lists must be initialized.");

                // Find common items using LINQ
                var commonItems = firstList.Intersect(secondList).ToList();

                IntersectionListOutput.Set(context, commonItems);

                status += $" Found {commonItems.Count} common item(s) between the two lists.";
            }
            catch (Exception ex)
            {
                status = $"Error finding common items: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }
}