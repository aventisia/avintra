using CodeActivitiesLibrary.Enums;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.Models;
using CodeActivitiesLibrary.Utils;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.WorkflowLogics.FlowControlActivities
{
    [ActivityMetaData(nodeType: "branchNode1")]
    [DisplayName("Conditional Branch")]
    [Description("Evaluates one or more groups of conditions. Each group is treated as an AND block, and the activity returns true if any group evaluates to true (OR logic between groups). Use this activity to create branching logic in your workflow based on custom conditions.")]
    public class ConditionalBranchActivity : BaseCodeActivity
    {

        [DisplayName("Conditions")]
        [Description("Add one or more groups of conditions. Each group is evaluated as AND, and the activity returns true if any group is true.")]
        public InArgument<List<List<ResolvedConditionObj>>> Conditions { get; set; }


        [DisplayName("Condition Result")]
        [Description("Returns true if any group of conditions evaluates to true, otherwise false.")]
        public OutArgument<bool> ConditionResult { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var allGroups = Conditions.Get(context);
                bool result = false;
                var groupsObject = new Dictionary<string, object>();
                int groupIndex = 1;

                string statusMessage = "No conditions provided.";

                if (allGroups != null)
                {
                    foreach (var group in allGroups)
                    {
                        bool groupResult = true;
                        if (group != null)
                        {
                            var conditionResultList = new List<string>();
                            foreach (var condition in group)
                            {
                                var (isConditionTrue, conditionStatusMessage) = EvaluateCondition(condition);

                                var firstValueFormatted = ConvertValueForLoggingUtil.ConvertValueForLogging("FirstValue", condition.FirstValue, "Input", true);
                                var secondValueFormatted = ConvertValueForLoggingUtil.ConvertValueForLogging("SecondValue", condition.SecondValue, "Input", true);
                                conditionResultList.Add($"{firstValueFormatted} {condition.ComparisonOperator} {secondValueFormatted} ? {conditionStatusMessage}");

                                if (!isConditionTrue)
                                {
                                    groupResult = false;
                                    break;
                                }
                            }
                            groupsObject[$"Group {groupIndex++}"] = conditionResultList;
                        }
                        else
                        {
                            groupResult = false;
                        }

                        if (groupResult)
                        {
                            result = true;
                            break; // OR logic: if any group is true, return true
                        }
                    }

                    statusMessage = JsonConvert.SerializeObject(new[] { groupsObject }, Formatting.Indented);
                }

                ConditionResult.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, statusMessage);
            }
            catch (Exception ex)
            {
                ConditionResult.Set(context, false);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error evaluating conditions: {ex.Message}");
            }
        }

        private (bool, string) EvaluateCondition(ResolvedConditionObj condition)
        {
            if (condition == null)
                return (false, "Condition is null.");

            object first = condition.FirstValue;
            object second = condition.SecondValue;
            var op = condition.ComparisonOperator;

            try
            {
                switch (op)
                {
                    // General equality check that handles nulls, objects, numbers, booleans, DateTimes, and falls back to string comparison
                    case ComparisonOperatorEnum.EqualTo:
                        return CompareEqual(first, second);
                    case ComparisonOperatorEnum.NotEqualTo:
                        return CompareEqual(first, second, true);
                    // Text-specific operators (only work if both values are non-null and can be treated as strings)
                    case ComparisonOperatorEnum.TextStartsWith:
                    case ComparisonOperatorEnum.TextDoesNotStartWith:
                    case ComparisonOperatorEnum.TextEndsWith:
                    case ComparisonOperatorEnum.TextDoesNotEndWith:
                    case ComparisonOperatorEnum.TextContains:
                    case ComparisonOperatorEnum.TextDoesNotContain:
                        return CompareText(first, second, op);
                    // List-specific operators (first value must be IEnumerable)
                    case ComparisonOperatorEnum.ListContains:
                        return ListContains(first, second);
                    case ComparisonOperatorEnum.ListDoesNotContain:
                        return ListContains(first, second, true);
                    case ComparisonOperatorEnum.IsListEmpty:
                        return IsListEmpty(first);
                    case ComparisonOperatorEnum.IsListNotEmpty:
                        return IsListEmpty(first, true);
                    // Number and DateTime operators (both values must be parseable as numbers or DateTimes)
                    case ComparisonOperatorEnum.GreaterThan:
                    case ComparisonOperatorEnum.LessThan:
                    case ComparisonOperatorEnum.GreaterThanOrEqualTo:
                    case ComparisonOperatorEnum.LessThanOrEqualTo:
                        return CompareNumbersOrDateTimes(first, second, op);
                    // File-specific operators (first value must be a file path)
                    case ComparisonOperatorEnum.FileExists:
                        return FileExists(first);
                    case ComparisonOperatorEnum.FileDoesNotExist:
                        return FileExists(first, true);
                    default:
                        return (false, "Unsupported comparison operator.");
                }
            }
            catch
            {
                return (false, "Error evaluating condition.");
            }
        }

        private (bool, string) CompareEqual(object first, object second, bool initialValue = false)
        {
            try
            {
                // First is null
                if (first == null)
                    return (false, "First value is null.");

                // Second is null
                if (second == null)
                    return (false, "Second value is null.");

                bool isEqual = initialValue;

                // If both are the same type, try direct object equality first
                // This handles objects that implement Equals properly (including custom types)
                if (first.GetType() == second.GetType() && first.Equals(second)) isEqual = true;

                // Try number comparison (handles cases where "23" should equal 23)
                double d1, d2;
                if (double.TryParse(first.ToString(), out d1) && double.TryParse(second.ToString(), out d2))
                {
                    isEqual = d1 == d2;
                }

                // Try boolean comparison (handles cases where "true" should equal true)
                bool b1, b2;
                if (bool.TryParse(first.ToString(), out b1) && bool.TryParse(second.ToString(), out b2))
                {
                    isEqual = b1 == b2;
                }

                // Try DateTime comparison (handles cases where date strings should equal DateTime objects)
                DateTime dt1, dt2;
                if (DateTime.TryParse(first.ToString(), out dt1) && DateTime.TryParse(second.ToString(), out dt2))
                {
                    isEqual = dt1 == dt2;
                }

                // Fall back to string comparison
                isEqual = first.ToString().Equals(second.ToString());

                return isEqual ? (true, "Both values are equal.") : (false, "Values are not equal.");
            }
            catch
            {
                return (false, "Error comparing values.");
            }
        }

        private (bool, string) CompareText(object first, object second, ComparisonOperatorEnum op)
        {
            // First is null
            if (first == null)
                return (false, "First value is null.");

            // Second is null
            if (second == null)
                return (false, "Second value is null.");

            // If first is not text, return false            
            if (!(first is string))
                return (false, "First value is not text.");

            // If second is not text, return false
            if (!(second is string))
                return (false, "Second value is not text.");

            switch (op)
            {
                case ComparisonOperatorEnum.TextStartsWith:
                    return first.ToString().StartsWith(second.ToString()) ? (true, "First value starts with the second value.") : (false, "First value does not start with the second value.");
                case ComparisonOperatorEnum.TextDoesNotStartWith:
                    return !first.ToString().StartsWith(second.ToString()) ? (true, "First value does not start with the second value.") : (false, "First value starts with the second value.");
                case ComparisonOperatorEnum.TextEndsWith:
                    return first.ToString().EndsWith(second.ToString()) ? (true, "First value ends with the second value.") : (false, "First value does not end with the second value.");
                case ComparisonOperatorEnum.TextDoesNotEndWith:
                    return !first.ToString().EndsWith(second.ToString()) ? (true, "First value does not end with the second value.") : (false, "First value ends with the second value.");
                case ComparisonOperatorEnum.TextContains:
                    return first.ToString().Contains(second.ToString()) ? (true, "First value contains the second value.") : (false, "First value does not contain the second value.");
                case ComparisonOperatorEnum.TextDoesNotContain:
                    return !first.ToString().Contains(second.ToString()) ? (true, "First value does not contain the second value.") : (false, "First value contains the second value.");
                default:
                    return (false, "Invalid text comparison operator.");
            }
        }

        private (bool, string) ListContains(object list, object value, bool initialValue = false)
        {
            // If list not IEnumerable, return false
            if (!(list is IEnumerable enumerable))
                return (false, "List is not enumerable.");

            // if value is null, check if any item in list is null
            if (value == null)
                return (false, "Item to check in the list is null.");

            bool isFound = initialValue;

            // Check if any item in the list equals the value (using Equals for proper object comparison)   
            foreach (var item in enumerable)
            {
                if (item != null && item.Equals(value))
                {
                    isFound = true;
                    break;
                }
            }

            return isFound ? (true, "Item found in the list.") : (false, "Item not found in the list.");
        }

        private (bool, string) IsListEmpty(object list, bool initialValue = false)
        {
            // If list not IEnumerable, return false
            if (!(list is IEnumerable enumerable))
                return (false, "List is not enumerable.");

            bool isListEmpty = initialValue;

            foreach (var _ in enumerable)
            {
                isListEmpty = false; ;
                break;
            }

            return isListEmpty ? (true, "List is empty.") : (false, "List is not empty.");
        }

        private (bool, string) CompareNumbersOrDateTimes(object first, object second, ComparisonOperatorEnum op)
        {
            // First is null
            if (first == null)
                return (false, "First value is null.");

            // Second is null
            if (second == null)
                return (false, "Second value is null.");

            // If first is not text, return false            
            if (!(first is string))
                return (false, "First value is not valid.");

            // If second is not text, return false
            if (!(second is string))
                return (false, "Second value is not valid.");


            // Try number comparison
            double d1, d2;
            if (double.TryParse(first.ToString(), out d1) && double.TryParse(second.ToString(), out d2))
            {
                switch (op)
                {
                    case ComparisonOperatorEnum.GreaterThan:
                        return (d1 > d2, $"First value {(d1 > d2 ? "is" : "is not")} greater than the second value.");
                    case ComparisonOperatorEnum.LessThan:
                        return (d1 < d2, $"First value {(d1 < d2 ? "is" : "is not")} less than the second value.");
                    case ComparisonOperatorEnum.GreaterThanOrEqualTo:
                        return (d1 >= d2, $"First value {(d1 >= d2 ? "is" : "is not")} greater than or equal to the second value.");
                    case ComparisonOperatorEnum.LessThanOrEqualTo:
                        return (d1 <= d2, $"First value {(d1 <= d2 ? "is" : "is not")} less than or equal to the second value.");
                }
                return (false, "Invalid comparison operator.");
            }

            // Try DateTime comparison
            DateTime dt1, dt2;
            if (DateTime.TryParse(first.ToString(), out dt1) && DateTime.TryParse(second.ToString(), out dt2))
            {
                switch (op)
                {
                    case ComparisonOperatorEnum.GreaterThan:
                        return (dt1 > dt2, $"First value {(dt1 > dt2 ? "is" : "is not")} greater than the second value.");
                    case ComparisonOperatorEnum.LessThan:
                        return (dt1 < dt2, $"First value {(dt1 < dt2 ? "is" : "is not")} less than the second value.");
                    case ComparisonOperatorEnum.GreaterThanOrEqualTo:
                        return (dt1 >= dt2, $"First value {(dt1 >= dt2 ? "is" : "is not")} greater than or equal to the second value.");
                    case ComparisonOperatorEnum.LessThanOrEqualTo:
                        return (dt1 <= dt2, $"First value {(dt1 <= dt2 ? "is" : "is not")} less than or equal to the second value.");
                }
                return (false, "Invalid comparison operator.");
            }

            return (false, "Values are not comparable as numbers or DateTimes.");
        }

        private (bool, string) FileExists(object filePath, bool initialValue = false)
        {
            if (filePath == null)
                return (false, "File path is null.");

            if (!(filePath is string))
                return (false, "File path is not valid.");

            bool exists = initialValue;
            
            exists = System.IO.File.Exists(filePath.ToString());
            return exists ? (true, "File exists.") : (false, "File does not exist.");
        }
    }
}