using CodeActivitiesLibrary.DataTransformations.VariablesActivities.Enums;
using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Remove Item From List")]
    [Description("Removes an item from a list by index or value.")]
    [ActivityMetaData(nodeImg: "/assets/Variables.svg")]
    public class RemoveItemFromListActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Remove Mode")]
        [Description("Specifies whether to remove by Index or Value.")]
        public InArgument<RemoveModeEnum> RemoveMode { get; set; }

        [DisplayName("Index To Remove")]
        [Description("The zero-based index of the item to remove.")]
        [RenderIfCondition(nameof(RemoveMode), RemoveModeEnum.Index)]
        public InArgument<int> IndexToRemove { get; set; }

        [DisplayName("Value To Remove")]
        [Description("The value of the item to remove from the list.")]
        [RenderIfCondition(nameof(RemoveMode), RemoveModeEnum.Value)]
        public InArgument<object> ValueToRemove { get; set; }

        [RequiredArgument]
        [DisplayName("Source List")]
        [Description("The list from which the item will be removed.")]
        public InArgument<List<object>> SourceList { get; set; }

        [DisplayName("Modified List")]
        [Description("Returns the updated list after removing the item(s).")]
        public OutArgument<List<object>> ModifiedList { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var status = "Success";

            try
            {
                var mode = RemoveMode.Get(context);
                var sourceList = SourceList.Get(context);

                if (sourceList == null)
                    throw new ArgumentException("Source list cannot be null.");

                switch (mode)
                {
                    case RemoveModeEnum.Index:
                        var index = IndexToRemove.Get(context);

                        if (index < 0 || index >= sourceList.Count)
                            throw new ArgumentOutOfRangeException(nameof(index),
                                $"Index must be between 0 and {sourceList.Count - 1}");

                        sourceList.RemoveAt(index);
                        status = $"Removed item at index {index}.";
                        break;

                    case RemoveModeEnum.Value:
                        var value = ValueToRemove.Get(context);

                        if (!sourceList.Contains(value))
                            throw new InvalidOperationException($"Value '{value}' not found in list.");

                        sourceList.Remove(value);
                        status = $"Removed item '{value}'.";
                        break;

                    default:
                        throw new InvalidOperationException("Invalid remove mode selected.");
                }

                ModifiedList.Set(context, sourceList.ToList());
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, status);
            }
            catch (Exception ex)
            {

                ModifiedList.Set(context, new List<object>()); // Safer fallback
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error removing item from list: {ex.Message}");
            }
        }
    }
}