using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Find Common List Items")]
    [Description("Finds common items between two lists and returns them as a new list.")]
    public class FindCommonListItemsActivity : BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("First List")]
        [Description("The first list to compare.")]
        public InArgument<IEnumerable<object>> FirstList { get; set; }

        [RequiredArgument]
        [DisplayName("Second List")]
        [Description("The second list to compare.")]
        public InArgument<IEnumerable<object>> SecondList { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Intersection List")]
        [Description("Returns a list containing the common items from both input lists.")]
        public OutArgument<List<object>> IntersectionList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var firstList = FirstList.Get(context);
                var secondList = SecondList.Get(context);

                if (firstList == null || secondList == null)
                    throw new ArgumentException("Both lists must be initialized.");

                // Find common items using LINQ
                var commonItems = firstList.Intersect(secondList).ToList();

                IntersectionList.Set(context, commonItems);
                status = $"Found {commonItems.Count} common item(s) between the two lists.";
            }
            catch (Exception ex)
            {
                status = $"Error finding common items: {ex.Message}";
                IntersectionList.Set(context, new List<object>());
            }

            StatusMessage.Set(context, status);
        }
    }
}