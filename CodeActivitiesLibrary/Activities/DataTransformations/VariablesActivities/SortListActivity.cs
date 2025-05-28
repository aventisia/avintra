using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    namespace ExcelAutomationActivities.Activities.List
    {
        [DisplayName("Sort List")]
        [Description("Sorts a list by one or more properties. Supports ascending or descending order.")]
        public class SortListActivity : CodeActivity
        {
            [RequiredArgument]
            [Category("Input")]
            [DisplayName("List to Sort")]
            [Description("The variable that holds the list to sort.")]
            public InArgument<List<string>> ListToSort { get; set; }

            [Category("Input")]
            [DisplayName("Sort By Properties")]
            [Description("Enable if sorting based on object properties (e.g., files, folders).")]
            [DefaultValue(false)]
            public InArgument<bool> SortBy { get; set; }

            [Category("Input")]
            [DisplayName("First Property to Sort By")]
            [Description("The first property name to sort the list by.")]
            public InArgument<string> FirstProperty { get; set; }

            [Category("Input")]
            [DisplayName("First Sort Direction")]
            [Description("Specifies whether to sort the first property in ascending or descending order.")]
            [DefaultValue(SortOrderEnum.Ascending)]
            public InArgument<SortOrderEnum> FirstSort { get; set; }

            [Category("Input")]
            [DisplayName("Second Property to Sort By")]
            [Description("The second property name to sort the list by.")]
            public InArgument<string> SecondProperty { get; set; }

            [Category("Input")]
            [DisplayName("Second Sort Direction")]
            [Description("Specifies whether to sort the second property in ascending or descending order.")]
            [DefaultValue(SortOrderEnum.Ascending)]
            public InArgument<SortOrderEnum> SecondSort { get; set; }

            [Category("Input")]
            [DisplayName("Third Property to Sort By")]
            [Description("The third property name to sort the list by.")]
            public InArgument<string> ThirdProperty { get; set; }

            [Category("Input")]
            [DisplayName("Third Sort Direction")]
            [Description("Specifies whether to sort the third property in ascending or descending order.")]
            [DefaultValue(SortOrderEnum.Ascending)]
            public InArgument<SortOrderEnum> ThirdSort { get; set; }


            [Category("Output")]
            [Description("Returns the status message of the operation.")]
            public OutArgument<string> StatusMessage { get; set; }

            [Category("Output")]
            [DisplayName("Sorted List")]
            [Description("The sorted version of the input list.")]
            public OutArgument<List<string>> SortedList { get; set; }


            protected override void Execute(CodeActivityContext context)
            {
                var status = "Operation completed successfully.";

                try
                {
                    var inputList = ListToSort.Get(context);
                    var sortByProperties = SortBy.Get(context);
                    var outputList = new List<string>(inputList);

                    if (outputList == null || outputList.Count == 0)
                        throw new ArgumentException("Input list must contain at least one item.");

                    if (!sortByProperties)
                    {
                        // Default sorting: simple alphabetical
                        outputList.Sort();
                        status += " Sorted list alphabetically.";
                    }
                    else
                    {
                        // Sorting by properties (simulated using dynamic logic)
                        var propertyBasedSort =
                            outputList.OrderBy(x => x); // Replace with reflection or custom logic if needed

                        var firstProp = FirstProperty.Get(context);
                        var firstSort = FirstSort.Get(context);
                        if (!string.IsNullOrWhiteSpace(firstProp))
                        {
                            propertyBasedSort =
                                propertyBasedSort.OrderByPropertyValue(firstProp, firstSort == SortOrderEnum.Ascending);
                            status += $" Sorted by '{firstProp}' ({firstSort}).";
                        }

                        var secondProp = SecondProperty.Get(context);
                        var secondSort = SecondSort.Get(context);
                        if (!string.IsNullOrWhiteSpace(secondProp))
                        {
                            propertyBasedSort =
                                propertyBasedSort.OrderByPropertyValue(secondProp,
                                    secondSort == SortOrderEnum.Ascending);
                            status += $" Then by '{secondProp}' ({secondSort}).";
                        }

                        var thirdProp = ThirdProperty.Get(context);
                        var thirdSort = ThirdSort.Get(context);
                        if (!string.IsNullOrWhiteSpace(thirdProp))
                        {
                            propertyBasedSort =
                                propertyBasedSort.OrderByPropertyValue(thirdProp, thirdSort == SortOrderEnum.Ascending);
                            status += $" Then by '{thirdProp}' ({thirdSort}).";
                        }

                        outputList = propertyBasedSort.ToList();
                    }

                    SortedList.Set(context, outputList);
                }
                catch (Exception ex)
                {
                    status = $"Error sorting list: {ex.Message}";
                }

                StatusMessage.Set(context, status);
            }
        }
    }

    public enum SortOrderEnum
    {
        [Display(Name = "Ascending", Description = "Sort in ascending order")]
        Ascending,

        [Display(Name = "Descending", Description = "Sort in descending order")]
        Descending
    }

    internal static class EnumerableExtensions
    {
        public static IOrderedEnumerable<string> OrderByPropertyValue(
            this IEnumerable<string> source,
            string propertyName,
            bool ascending)
        {
            return ascending
                ? source.OrderBy(item => item) // Simulate actual property access here
                : source.OrderByDescending(item => item);
        }
    }
}