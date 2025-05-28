using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Remove Item From List")]
    [Description("Removes an item from a list by index or value.")]
    public class RemoveItemFromListActivity : CodeActivity
    {
        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Remove Items By")]
        [Description("Specifies whether to remove the item at a specified index or the item(s) with specific value.")]
        public InArgument<RemoveMode> RemoveItemsBy { get; set; } = new InArgument<RemoveMode>(RemoveMode.Index);

        [Category("Input")]
        [DisplayName("At Index")]
        [Description("The index number of the item to remove.")]
        public InArgument<int> AtIndex { get; set; }

        [Category("Input")]
        [DisplayName("With Value")]
        [Description("The item value to remove from the list.")]
        public InArgument<string> WithValue { get; set; }

        [Category("Input")]
        [DisplayName("Remove All Occurrences")]
        [Description("Remove all items that match the specified value.")]
        [DefaultValue(false)]
        public InArgument<bool> RemoveAllItemOccurrences { get; set; }

        [RequiredArgument]
        [Category("Input")]
        [DisplayName("Form List")]
        [Description("The list with items to remove.")]
        public InArgument<List<string>> FormList { get; set; }


        [Category("Output")]
        [Description("Returns the status message of the operation.")]
        public OutArgument<string> StatusMessage { get; set; }

        [Category("Output")]
        [DisplayName("Modified List")]
        [Description("The resulting list after removing the item(s).")]
        public OutArgument<List<string>> ModifiedList { get; set; }


        protected override void Execute(CodeActivityContext context)
        {
            var status = "Operation completed successfully.";

            try
            {
                var mode = RemoveItemsBy.Get(context);
                var formList = FormList.Get(context);

                if (formList == null)
                    throw new ArgumentException("Input list cannot be null.");

                switch (mode)
                {
                    case RemoveMode.Index:
                        var index = AtIndex.Get(context);

                        if (index < 0 || index >= formList.Count)
                            throw new ArgumentOutOfRangeException(nameof(context));

                        formList.RemoveAt(index);
                        status += $" Removed item at index {index}.";
                        break;

                    case RemoveMode.Value:
                        var value = WithValue.Get(context);
                        var removeAll = RemoveAllItemOccurrences.Get(context);

                        if (string.IsNullOrEmpty(value))
                            throw new ArgumentException("Value to remove cannot be empty.");

                        if (removeAll)
                        {
                            formList.RemoveAll(item => item == value);
                            status += $" Removed all occurrences of '{value}'.";
                        }
                        else
                        {
                            var firstIndex = formList.IndexOf(value);
                            if (firstIndex >= 0)
                            {
                                formList.RemoveAt(firstIndex);
                                status += $" Removed first occurrence of '{value}'.";
                            }
                            else
                            {
                                status += $" No occurrence of '{value}' found.";
                            }
                        }

                        break;

                    default:
                        throw new InvalidOperationException("Invalid remove mode selected.");
                }

                ModifiedList.Set(context, formList);
            }
            catch (Exception ex)
            {
                status = $"Error removing item from list: {ex.Message}";
            }

            StatusMessage.Set(context, status);
        }
    }

    public enum RemoveMode
    {
        [Display(Name = "Index", Description = "Remove item based on its position in the list.")]
        Index,

        [Display(Name = "Value", Description = "Remove item(s) based on their value.")]
        Value
    }
}