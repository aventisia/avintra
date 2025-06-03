using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Sort List")]
    [Description("Sorts a list by one or more properties. Supports ascending or descending order.")]
    public class SortListActivity : Extensions.BaseCodeActivity
    {
        // ----------------------
        // Input Arguments
        // ----------------------

        [RequiredArgument]
        [DisplayName("List to Sort")]
        [Description("The variable that holds the list to sort.")]
        public InArgument<List<object>> ListToSort { get; set; }


        [DisplayName("Sort By Properties")]
        [Description("Enable if sorting based on object properties (e.g., files, folders).")]
        [DefaultValue(false)]
        public InArgument<bool> SortByProperties { get; set; }


        [DisplayName("First Property to Sort By")]
        [Description("The first property name to sort the list by.")]
        [RenderIfCondition(nameof(SortByProperties), "true")]
        public InArgument<string> FirstProperty { get; set; }


        [DisplayName("First Sort Direction")]
        [Description("Specifies whether to sort the first property in ascending or descending order.")]
        [DefaultValue(SortOrderEnum.Ascending)]
        [RenderIfCondition(nameof(SortByProperties), "true")]
        public InArgument<SortOrderEnum> FirstSort { get; set; }


        [DisplayName("Second Property to Sort By")]
        [Description("The second property name to sort the list by.")]
        [RenderIfCondition(nameof(SortByProperties), "true")]
        public InArgument<string> SecondProperty { get; set; }


        [DisplayName("Second Sort Direction")]
        [Description("Specifies whether to sort the second property in ascending or descending order.")]
        [DefaultValue(SortOrderEnum.Ascending)]
        [RenderIfCondition(nameof(SortByProperties), "true")]
        public InArgument<SortOrderEnum> SecondSort { get; set; }


        [DisplayName("Third Property to Sort By")]
        [Description("The third property name to sort the list by.")]
        [RenderIfCondition(nameof(SortByProperties), "true")]
        public InArgument<string> ThirdProperty { get; set; }


        [DisplayName("Third Sort Direction")]
        [Description("Specifies whether to sort the third property in ascending or descending order.")]
        [DefaultValue(SortOrderEnum.Ascending)]
        [RenderIfCondition(nameof(SortByProperties), "true")]
        public InArgument<SortOrderEnum> ThirdSort { get; set; }

        // ----------------------
        // Output Arguments
        // ----------------------


        [DisplayName("Sorted List")]
        [Description("The sorted version of the input list.")]
        public OutArgument<List<object>> SortedList { get; set; }

        // ----------------------
        // Execution Logic
        // ----------------------
        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var inputList = ListToSort.Get(context);
                var sortByProperties = SortByProperties.Get(context);

                if (inputList == null || !inputList.Any())
                    throw new ArgumentException("Input list must contain at least one item.");

                var outputList = inputList;

                if (!sortByProperties)
                {
                    // Default sorting: simple alphabetical
                    outputList = inputList.Cast<string>().OrderBy(x => x).Cast<object>().ToList();
                    status += " Sorted list alphabetically.";
                }
                else
                {
                    // Sorting by properties
                    var firstProp = FirstProperty.Get(context);
                    var firstSort = FirstSort.Get(context);
                    if (!string.IsNullOrWhiteSpace(firstProp))
                    {
                        outputList = outputList.OrderByPropertyValue(firstProp, firstSort == SortOrderEnum.Ascending)
                            .ToList();
                        status += $" Sorted by '{firstProp}' ({firstSort}).";
                    }

                    var secondProp = SecondProperty.Get(context);
                    var secondSort = SecondSort.Get(context);
                    if (!string.IsNullOrWhiteSpace(secondProp))
                    {
                        outputList = outputList.OrderByPropertyValue(secondProp, secondSort == SortOrderEnum.Ascending)
                            .ToList();
                        status += $" Then by '{secondProp}' ({secondSort}).";
                    }

                    var thirdProp = ThirdProperty.Get(context);
                    var thirdSort = ThirdSort.Get(context);
                    if (!string.IsNullOrWhiteSpace(thirdProp))
                    {
                        outputList = outputList.OrderByPropertyValue(thirdProp, thirdSort == SortOrderEnum.Ascending)
                            .ToList();
                        status += $" Then by '{thirdProp}' ({thirdSort}).";
                    }
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

    public enum SortOrderEnum
    {
        [Display(Name = "Ascending", Description = "Sort in ascending order")]
        Ascending,

        [Display(Name = "Descending", Description = "Sort in descending order")]
        Descending
    }

    internal static class EnumerableExtensions
    {
        public static IOrderedEnumerable<T> OrderByPropertyValue<T>(
            this IEnumerable<T> source,
            string propertyName,
            bool ascending)
        {
            return ascending
                ? source.OrderBy(item => GetPropertyValue(item, propertyName))
                : source.OrderByDescending(item => GetPropertyValue(item, propertyName));
        }

        private static object GetPropertyValue(object obj, string propertyName)
        {
            if (obj == null)
                return null;

            var type = obj.GetType();
            var property = type.GetProperty(propertyName);

            if (property == null)
                throw new ArgumentException($"Property '{propertyName}' not found on type '{type.Name}'.");

            return property.GetValue(obj);
        }
    }
}