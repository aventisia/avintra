using System.Collections;
using NodeLibrary.Models;

namespace ExecutorLibrary.FlowProcessor.Helpers;

public static class ConditionEvaluator
{
    public static bool Evaluate(List<List<ResolvedConditionModel>> conditionGroups)
    {
        if (conditionGroups is null || conditionGroups.Count == 0)
            return false;

        foreach (var group in conditionGroups)
        {
            if (group is null || group.Count == 0)
                continue;

            var groupResult = true;
            foreach (var condition in group)
            {
                if (!EvaluateSingle(condition))
                {
                    groupResult = false;
                    break;
                }
            }

            if (groupResult)
                return true;
        }

        return false;
    }

    private static bool EvaluateSingle(ResolvedConditionModel condition)
    {
        if (condition is null)
            return false;

        var first = condition.FirstValue;
        var second = condition.SecondValue;
        var op = condition.ComparisonOperator;

        return op switch
        {
            ComparisonOperatorEnum.EqualTo => CompareEqual(first, second),
            ComparisonOperatorEnum.NotEqualTo => !CompareEqual(first, second),
            ComparisonOperatorEnum.TextStartsWith => CompareText(first, second, out var r) && r,
            ComparisonOperatorEnum.TextDoesNotStartWith => !CompareText(first, second, out var _),
            ComparisonOperatorEnum.TextEndsWith => CompareText(first, second, out var r2) && r2,
            ComparisonOperatorEnum.TextDoesNotEndWith => !CompareText(first, second, out var _),
            ComparisonOperatorEnum.TextContains => CompareText(first, second, out var r3) && r3,
            ComparisonOperatorEnum.TextDoesNotContain => !CompareText(first, second, out var _),
            ComparisonOperatorEnum.ListContains => ListContains(first, second),
            ComparisonOperatorEnum.ListDoesNotContain => !ListContains(first, second),
            ComparisonOperatorEnum.IsListEmpty => IsListEmpty(first),
            ComparisonOperatorEnum.IsListNotEmpty => !IsListEmpty(first),
            ComparisonOperatorEnum.GreaterThan => CompareNumbersOrDateTimes(first, second, out var cmp) && cmp > 0,
            ComparisonOperatorEnum.LessThan => CompareNumbersOrDateTimes(first, second, out var cmp2) && cmp2 < 0,
            ComparisonOperatorEnum.GreaterThanOrEqualTo => CompareNumbersOrDateTimes(first, second, out var cmp3) && cmp3 >= 0,
            ComparisonOperatorEnum.LessThanOrEqualTo => CompareNumbersOrDateTimes(first, second, out var cmp4) && cmp4 <= 0,
            ComparisonOperatorEnum.FileExists => FileExists(first),
            ComparisonOperatorEnum.FileDoesNotExist => !FileExists(first),
            _ => false
        };
    }

    private static bool CompareEqual(object? first, object? second)
    {
        if (first is null || second is null)
            return false;

        if (first.GetType() == second.GetType() && first.Equals(second))
            return true;

        if (double.TryParse(first.ToString(), out var d1) && double.TryParse(second.ToString(), out var d2))
            return d1 == d2;

        if (bool.TryParse(first.ToString(), out var b1) && bool.TryParse(second.ToString(), out var b2))
            return b1 == b2;

        if (DateTime.TryParse(first.ToString(), out var dt1) && DateTime.TryParse(second.ToString(), out var dt2))
            return dt1 == dt2;

        return string.Equals(first.ToString(), second.ToString(), StringComparison.OrdinalIgnoreCase);
    }

    private static bool CompareText(object? first, object? second, out bool result)
    {
        result = false;
        if (first is null || second is null)
            return false;

        var text1 = first.ToString()!;
        var text2 = second.ToString()!;

        result = text1.StartsWith(text2, StringComparison.OrdinalIgnoreCase)
            || text1.EndsWith(text2, StringComparison.OrdinalIgnoreCase)
            || text1.Contains(text2, StringComparison.OrdinalIgnoreCase);

        return true;
    }

    private static bool ListContains(object? list, object? value)
    {
        if (list is not IEnumerable enumerable || value is null)
            return false;

        foreach (var item in enumerable)
        {
            if (item is not null && item.Equals(value))
                return true;
        }

        return false;
    }

    private static bool IsListEmpty(object? list)
    {
        if (list is not IEnumerable enumerable)
            return false;

        foreach (var _ in enumerable)
            return false;

        return true;
    }

    private static bool CompareNumbersOrDateTimes(object? first, object? second, out int comparison)
    {
        comparison = 0;

        if (first is null || second is null)
            return false;

        if (double.TryParse(first.ToString(), out var d1) && double.TryParse(second.ToString(), out var d2))
        {
            comparison = d1.CompareTo(d2);
            return true;
        }

        if (DateTime.TryParse(first.ToString(), out var dt1) && DateTime.TryParse(second.ToString(), out var dt2))
        {
            comparison = dt1.CompareTo(dt2);
            return true;
        }

        return false;
    }

    private static bool FileExists(object? filePath)
    {
        if (filePath is null)
            return false;

        return System.IO.File.Exists(filePath.ToString());
    }
}
