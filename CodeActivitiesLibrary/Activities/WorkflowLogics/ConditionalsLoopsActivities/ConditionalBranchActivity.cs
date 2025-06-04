using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace CodeActivitiesLibrary.WorkflowLogics.ConditionalsLoopsActivities
{

    [NodeType("branchNode1")]
    [DisplayName("Conditional Branch")]
    [Description("Evaluates one or more groups of conditions. Each group is treated as an AND block, and the activity returns true if any group evaluates to true (OR logic between groups). Use this activity to create branching logic in your workflow based on custom conditions.")]
    public class ConditionalBranchActivity : BaseCodeActivity
    {

        [DisplayName("Conditions")]
        [Description("Add one or more groups of conditions. Each group is evaluated as AND, and the activity returns true if any group is true.")]
        public InArgument<List<List<ConditionObjectGroup>>> Conditions { get; set; }


        [DisplayName("Condition Result")]
        [Description("Returns true if any group of conditions evaluates to true, otherwise false.")]
        public OutArgument<bool> ConditionResult { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var allGroups = Conditions.Get(context);
            bool result = false;

            if (allGroups != null)
            {
                foreach (var group in allGroups)
                {
                    bool groupResult = true;
                    if (group != null)
                    {
                        foreach (var condition in group)
                        {
                            if (!EvaluateCondition(condition))
                            {
                                groupResult = false;
                                break;
                            }
                        }
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
            }

            ConditionResult.Set(context, result);
        }

        private bool EvaluateCondition(ConditionObjectGroup condition)
        {
            if (condition == null)
                return false;

            object first = condition.FirstValue;
            object second = condition.SecondValue;
            var op = condition.ComparisonOperator;

            try
            {
                switch (op)
                {
                    case ComparisonOperatorEnum.Exists:
                        return first != null && System.IO.File.Exists(first.ToString());
                    case ComparisonOperatorEnum.DoesNotExist:
                        return first == null || !System.IO.File.Exists(first.ToString());
                    case ComparisonOperatorEnum.ContainsText:
                        return first != null && second != null && first.ToString().Contains(second.ToString());
                    case ComparisonOperatorEnum.DoesNotContainText:
                        return first != null && second != null && !first.ToString().Contains(second.ToString());
                    case ComparisonOperatorEnum.ExactlyMatches:
                        return first != null && second != null && first.ToString().Equals(second.ToString());
                    case ComparisonOperatorEnum.DoesNotExactlyMatch:
                        return first != null && second != null && !first.ToString().Equals(second.ToString());
                    case ComparisonOperatorEnum.StartsWith:
                        return first != null && second != null && first.ToString().StartsWith(second.ToString());
                    case ComparisonOperatorEnum.DoesNotStartWith:
                        return first != null && second != null && !first.ToString().StartsWith(second.ToString());
                    case ComparisonOperatorEnum.EndsWith:
                        return first != null && second != null && first.ToString().EndsWith(second.ToString());
                    case ComparisonOperatorEnum.DoesNotEndWith:
                        return first != null && second != null && !first.ToString().EndsWith(second.ToString());
                    case ComparisonOperatorEnum.ContainsList:
                        return first is IEnumerable list1 && second != null && ListContains(list1, second);
                    case ComparisonOperatorEnum.DoesNotContainList:
                        return first is IEnumerable list2 && second != null && !ListContains(list2, second);
                    case ComparisonOperatorEnum.IsEmpty:
                        return first is IEnumerable list3 && !ListHasAny(list3);
                    case ComparisonOperatorEnum.IsNotEmpty:
                        return first is IEnumerable list4 && ListHasAny(list4);
                    case ComparisonOperatorEnum.GreaterThan:
                        return CompareNumbers(first, second) > 0;
                    case ComparisonOperatorEnum.LessThan:
                        return CompareNumbers(first, second) < 0;
                    case ComparisonOperatorEnum.EqualTo:
                        return CompareNumbers(first, second) == 0;
                    case ComparisonOperatorEnum.After:
                        return CompareDateTimes(first, second) > 0;
                    case ComparisonOperatorEnum.Before:
                        return CompareDateTimes(first, second) < 0;
                    case ComparisonOperatorEnum.EqualsDateTime:
                        return CompareDateTimes(first, second) == 0;
                    case ComparisonOperatorEnum.IsTrue:
                        return first is bool b1 && b1;
                    case ComparisonOperatorEnum.IsFalse:
                        return first is bool b2 && !b2;
                    default:
                        return false;
                }
            }
            catch
            {
                return false;
            }
        }

        private bool ListContains(IEnumerable list, object value)
        {
            foreach (var item in list)
            {
                if (item != null && item.Equals(value))
                    return true;
            }
            return false;
        }

        private bool ListHasAny(IEnumerable list)
        {
            foreach (var item in list)
            {
                return true;
            }
            return false;
        }

        private int CompareNumbers(object first, object second)
        {
            if (first == null || second == null)
                return -1;

            double d1, d2;
            if (double.TryParse(first.ToString(), out d1) && double.TryParse(second.ToString(), out d2))
            {
                return d1.CompareTo(d2);
            }
            return -1;
        }

        private int CompareDateTimes(object first, object second)
        {
            if (first == null || second == null)
                return -1;

            DateTime dt1, dt2;
            if (DateTime.TryParse(first.ToString(), out dt1) && DateTime.TryParse(second.ToString(), out dt2))
            {
                return dt1.CompareTo(dt2);
            }
            return -1;
        }
    }

    public class ConditionObjectGroup
    {
        public object FirstValue { get; set; }
        public ComparisonOperatorEnum ComparisonOperator { get; set; }
        public object SecondValue { get; set; }
    }

    public enum ComparisonOperatorEnum
    {
        [Display(Name = "Exists", Description = "Checks if the file exists.")]
        Exists = 0,

        [Display(Name = "Does Not Exist", Description = "Checks if the file does not exist.")]
        DoesNotExist = 1,

        [Display(Name = "Contains (Text)", Description = "Checks if the text contains the given value.")]
        ContainsText = 2,

        [Display(Name = "Does Not Contain (Text)", Description = "Checks if the text does not contain the given value.")]
        DoesNotContainText = 3,

        [Display(Name = "Exactly Matches", Description = "Checks if the text exactly matches the given value.")]
        ExactlyMatches = 4,

        [Display(Name = "Does Not Exactly Match", Description = "Checks if the text does not exactly match the given value.")]
        DoesNotExactlyMatch = 5,

        [Display(Name = "Starts With", Description = "Checks if the text starts with the given value.")]
        StartsWith = 6,

        [Display(Name = "Does Not Start With", Description = "Checks if the text does not start with the given value.")]
        DoesNotStartWith = 7,

        [Display(Name = "Ends With", Description = "Checks if the text ends with the given value.")]
        EndsWith = 8,

        [Display(Name = "Does Not End With", Description = "Checks if the text does not end with the given value.")]
        DoesNotEndWith = 9,

        [Display(Name = "Contains (List)", Description = "Checks if the list contains the given item.")]
        ContainsList = 10,

        [Display(Name = "Does Not Contain (List)", Description = "Checks if the list does not contain the given item.")]
        DoesNotContainList = 11,

        [Display(Name = "Is Empty", Description = "Checks if the list is empty.")]
        IsEmpty = 12,

        [Display(Name = "Is Not Empty", Description = "Checks if the list is not empty.")]
        IsNotEmpty = 13,

        [Display(Name = "Is Greater Than", Description = "Checks if the number is greater than the given value.")]
        GreaterThan = 14,

        [Display(Name = "Is Less Than", Description = "Checks if the number is less than the given value.")]
        LessThan = 15,

        [Display(Name = "Is Equal To", Description = "Checks if the number is equal to the given value.")]
        EqualTo = 16,

        [Display(Name = "After", Description = "Checks if the date/time is after the given value.")]
        After = 17,

        [Display(Name = "Before", Description = "Checks if the date/time is before the given value.")]
        Before = 18,

        [Display(Name = "Equals (DateTime)", Description = "Checks if the date/time equals the given value.")]
        EqualsDateTime = 19,

        [Display(Name = "Is True", Description = "Checks if the value is true.")]
        IsTrue = 20,

        [Display(Name = "Is False", Description = "Checks if the value is false.")]
        IsFalse = 21
    }
}