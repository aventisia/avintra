using System.Globalization;

namespace WorkspaceAPIs.Helpers;

/// <summary>
/// A queue work item prepared for a UI builder data query.
/// </summary>
public sealed record UiBuilderDataQueryItem(
    Guid Id,
    string? Status,
    JObject Data,
    DateTimeOffset CreatedOn,
    DateTimeOffset? LastModifiedOn,
    string? Assignee);

/// <summary>
/// Runs declarative UI builder data queries (filters, grouping, date buckets, and metrics) over queue work items.
/// Every referenced field is validated against the queue schema; invalid specs throw <see cref="ArgumentException"/>.
/// </summary>
public static class UiBuilderDataQueryHelpers
{
    /// <summary>
    /// Maximum number of work items scanned per query request (newest first).
    /// </summary>
    public const int MaxScannedItems = 100_000;

    private const int MaxQueries = 10;
    private const int MaxFilters = 20;
    private const int MaxMetrics = 20;
    private const int MaxGroupBy = 3;
    private const int DefaultGroupLimit = 100;
    private const int MaxGroupLimit = 1000;
    private const int DefaultRowLimit = 50;
    private const int MaxRowLimit = 500;
    private const char KeySeparator = '\u001f';

    private static readonly Regex NamePattern = new("^[A-Za-z_][A-Za-z0-9_]{0,63}$", RegexOptions.Compiled);
    private static readonly string[] NumberTypes = ["int", "long", "short", "decimal", "double", "float", "number"];
    private static readonly string[] DateTypes = ["date", "datetime"];
    private static readonly string[] Buckets = ["day", "week", "month", "year"];
    private static readonly string[] MetricFunctions = ["count", "countDistinct", "sum", "avg", "min", "max"];

    private enum FieldKind
    {
        Text,
        Number,
        Date
    }

    private sealed record QueryField(string Name, FieldKind Kind, string? SystemField, string Label);

    private sealed record FilterValue(object? Value, bool IsDateOnly);

    private sealed class MetricAccumulator
    {
        public long Count;
        public long NumericCount;
        public double Sum;
        public double? Min;
        public double? Max;
        public DateTimeOffset? MinDate;
        public DateTimeOffset? MaxDate;
        public HashSet<string>? Distinct;
    }

    private sealed record CompiledMetric(UiBuilderDataMetricDto Metric, QueryField? Field, Func<UiBuilderDataQueryItem, bool> Where);

    private sealed record CompiledGroup(QueryField Field, string? Bucket, string Column);

    /// <summary>
    /// Runs every named query in the request over the supplied work items.
    /// </summary>
    public static UiBuilderDataQueryResultDto Run(
        IReadOnlyList<QueueSchemaDefinitionDto> schema,
        IReadOnlyList<UiBuilderDataQueryItem> items,
        UiBuilderDataQueryRequestDto request,
        bool isTruncated)
    {
        if (request.Queries.Count == 0)
        {
            throw new ArgumentException("At least one named query is required.");
        }

        if (request.Queries.Count > MaxQueries)
        {
            throw new ArgumentException($"At most {MaxQueries} named queries are allowed per request.");
        }

        var fields = BuildFieldMap(schema);
        var sharedFilter = CompileFilters(fields, request.Filters);
        var matching = items.Where(sharedFilter).ToList();

        var result = new UiBuilderDataQueryResultDto
        {
            Scanned = items.Count,
            Truncated = isTruncated,
            FilterDescription = DescribeConditions(fields, request.Filters)
        };
        foreach (var (name, query) in request.Queries)
        {
            if (!NamePattern.IsMatch(name))
            {
                throw new ArgumentException($"Query name '{name}' must start with a letter or underscore and use letters, digits, or underscores.");
            }

            var queryFilter = CompileFilters(fields, query.Filters);
            var queryItems = matching.Where(queryFilter).ToList();
            var hasAggregation = (query.Metrics?.Count ?? 0) > 0 || (query.GroupBy?.Count ?? 0) > 0;

            var resultSet = hasAggregation
                ? RunAggregate(fields, queryItems, query, name)
                : RunRows(fields, queryItems, query);
            DescribeResultSet(resultSet, fields, request.Filters, query, hasAggregation);
            result.Queries[name] = resultSet;
        }

        return result;
    }

    /// <summary>
    /// Derives the creation-date window implied by the request's shared <c>$createdOn</c> filters, so the scan can be narrowed in the database.
    /// The window is never narrower than the in-memory filters it is derived from.
    /// </summary>
    public static (DateTimeOffset? From, DateTimeOffset? Before) GetCreatedOnScanWindow(UiBuilderDataQueryRequestDto request)
    {
        DateTimeOffset? from = null;
        DateTimeOffset? before = null;

        foreach (var filter in request.Filters ?? [])
        {
            if (!string.Equals(filter.Field?.Trim(), "$createdOn", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            var op = (filter.Op ?? "eq").Trim().ToLowerInvariant();
            var bounds = op == "between" ? ParseFilterArray(filter, FieldKind.Date) : [ParseFilterValue(filter.Value ?? default, FieldKind.Date)];
            if (op == "between" && bounds.Count != 2)
            {
                continue;
            }

            var (lower, upper) = op switch
            {
                "eq" => (StartOf(bounds[0]), EndOf(bounds[0])),
                "gt" or "gte" => (StartOf(bounds[0]), null),
                "lt" => (null, StartOf(bounds[0])),
                "lte" => (null, EndOf(bounds[0])),
                "between" => (StartOf(bounds[0]), EndOf(bounds[1])),
                _ => ((DateTimeOffset?)null, (DateTimeOffset?)null)
            };

            if (lower != null && (from == null || lower > from))
            {
                from = lower;
            }

            if (upper != null && (before == null || upper < before))
            {
                before = upper;
            }
        }

        return (from, before);
    }

    private static DateTimeOffset? StartOf(FilterValue filterValue)
    {
        return filterValue.Value as DateTimeOffset?;
    }

    private static DateTimeOffset? EndOf(FilterValue filterValue)
    {
        return filterValue.Value is DateTimeOffset date
            ? filterValue.IsDateOnly ? date.AddDays(1) : date.AddTicks(1)
            : null;
    }

    private static Dictionary<string, QueryField> BuildFieldMap(IReadOnlyList<QueueSchemaDefinitionDto> schema)
    {
        var fields = new Dictionary<string, QueryField>(StringComparer.OrdinalIgnoreCase)
        {
            ["$status"] = new("$status", FieldKind.Text, "status", "Status"),
            ["$createdOn"] = new("$createdOn", FieldKind.Date, "createdOn", "Date added to the queue"),
            ["$lastModifiedOn"] = new("$lastModifiedOn", FieldKind.Date, "lastModifiedOn", "Last updated"),
            ["$assignee"] = new("$assignee", FieldKind.Text, "assignee", "Assignee"),
        };

        foreach (var definition in schema.Where(definition => !string.IsNullOrWhiteSpace(definition.Name)))
        {
            var type = (definition.Type ?? string.Empty).Trim().ToLowerInvariant();
            var kind = NumberTypes.Contains(type) ? FieldKind.Number : DateTypes.Contains(type) ? FieldKind.Date : FieldKind.Text;
            var label = string.IsNullOrWhiteSpace(definition.Label) ? definition.Name : definition.Label.Trim();
            fields[definition.Name] = new QueryField(definition.Name, kind, null, label);
        }

        return fields;
    }

    private static QueryField ResolveField(Dictionary<string, QueryField> fields, string? name)
    {
        if (!string.IsNullOrWhiteSpace(name) && fields.TryGetValue(name.Trim(), out var field))
        {
            return field;
        }

        var available = string.Join(", ", fields.Keys.Order(StringComparer.OrdinalIgnoreCase));
        throw new ArgumentException($"Unknown field '{name}'. Available fields: {available}.");
    }

    private static object? ReadValue(UiBuilderDataQueryItem item, QueryField field)
    {
        switch (field.SystemField)
        {
            case "status":
                return string.IsNullOrEmpty(item.Status) ? null : item.Status;
            case "createdOn":
                return item.CreatedOn;
            case "lastModifiedOn":
                return item.LastModifiedOn;
            case "assignee":
                return string.IsNullOrEmpty(item.Assignee) ? null : item.Assignee;
        }

        var token = item.Data.GetValue(field.Name, StringComparison.OrdinalIgnoreCase);
        if (token == null || token.Type == JTokenType.Null || token.Type == JTokenType.Undefined)
        {
            return null;
        }

        return field.Kind switch
        {
            FieldKind.Number => ToNumber(token),
            FieldKind.Date => ToDate(token),
            _ => ToText(token)
        };
    }

    private static double? ToNumber(JToken token)
    {
        if (token.Type is JTokenType.Integer or JTokenType.Float)
        {
            return token.Value<double>();
        }

        return double.TryParse(token.ToString(), NumberStyles.Float, CultureInfo.InvariantCulture, out var number) ? number : null;
    }

    private static DateTimeOffset? ToDate(JToken token)
    {
        if (token.Type == JTokenType.Date)
        {
            var value = token.Value<object>();
            return value is DateTimeOffset offset ? offset : new DateTimeOffset(DateTime.SpecifyKind((DateTime)value!, DateTimeKind.Utc));
        }

        return ParseDate(token.ToString());
    }

    private static DateTimeOffset? ParseDate(string? text)
    {
        return DateTimeOffset.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.AssumeUniversal | DateTimeStyles.AdjustToUniversal, out var date)
            ? date
            : null;
    }

    private static string? ToText(JToken token)
    {
        var text = token.Type == JTokenType.String ? token.Value<string>() : token.ToString(Formatting.None);
        return string.IsNullOrEmpty(text) ? null : text;
    }

    private static FilterValue ParseFilterValue(JsonElement element, FieldKind kind)
    {
        if (element.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
        {
            return new FilterValue(null, false);
        }

        var raw = element.ValueKind == JsonValueKind.String ? element.GetString() ?? string.Empty : element.GetRawText();
        switch (kind)
        {
            case FieldKind.Number:
                if (element.ValueKind == JsonValueKind.Number)
                {
                    return new FilterValue(element.GetDouble(), false);
                }

                return double.TryParse(raw, NumberStyles.Float, CultureInfo.InvariantCulture, out var number)
                    ? new FilterValue(number, false)
                    : throw new ArgumentException($"'{raw}' is not a number.");
            case FieldKind.Date:
                var date = ParseDate(raw) ?? throw new ArgumentException($"'{raw}' is not a date.");
                return new FilterValue(date, raw.Trim().Length <= 10);
            default:
                return new FilterValue(raw, false);
        }
    }

    private static int CompareValues(object left, object right)
    {
        return (left, right) switch
        {
            (double a, double b) => a.CompareTo(b),
            (DateTimeOffset a, DateTimeOffset b) => a.CompareTo(b),
            _ => string.Compare(Convert.ToString(left, CultureInfo.InvariantCulture), Convert.ToString(right, CultureInfo.InvariantCulture), StringComparison.OrdinalIgnoreCase)
        };
    }

    private static int CompareToFilter(object value, FilterValue filterValue)
    {
        if (filterValue.IsDateOnly && value is DateTimeOffset date && filterValue.Value is DateTimeOffset dayStart)
        {
            return date < dayStart ? -1 : date < dayStart.AddDays(1) ? 0 : 1;
        }

        return CompareValues(value, filterValue.Value!);
    }

    private static List<FilterValue> ParseFilterArray(UiBuilderDataFilterDto filter, FieldKind kind)
    {
        if (filter.Value is not { ValueKind: JsonValueKind.Array } array)
        {
            throw new ArgumentException($"The '{filter.Op}' filter on '{filter.Field}' needs an array value.");
        }

        return array.EnumerateArray().Select(element => ParseFilterValue(element, kind)).ToList();
    }

    private static Func<UiBuilderDataQueryItem, bool> CompileFilter(Dictionary<string, QueryField> fields, UiBuilderDataFilterDto filter)
    {
        var field = ResolveField(fields, filter.Field);
        var op = (filter.Op ?? "eq").Trim();

        if (op.Equals("isNull", StringComparison.OrdinalIgnoreCase))
        {
            return item => ReadValue(item, field) == null;
        }

        if (op.Equals("notNull", StringComparison.OrdinalIgnoreCase))
        {
            return item => ReadValue(item, field) != null;
        }

        if (op.Equals("in", StringComparison.OrdinalIgnoreCase) || op.Equals("nin", StringComparison.OrdinalIgnoreCase))
        {
            var values = ParseFilterArray(filter, field.Kind);
            var isIn = op.Equals("in", StringComparison.OrdinalIgnoreCase);
            return item =>
            {
                var value = ReadValue(item, field);
                var found = values.Any(candidate => candidate.Value == null ? value == null : value != null && CompareToFilter(value, candidate) == 0);
                return isIn ? found : !found;
            };
        }

        if (op.Equals("between", StringComparison.OrdinalIgnoreCase))
        {
            var bounds = ParseFilterArray(filter, field.Kind);
            if (bounds.Count != 2)
            {
                throw new ArgumentException($"The 'between' filter on '{filter.Field}' needs [from, to].");
            }

            var (from, to) = (bounds[0], bounds[1]);
            return item =>
            {
                var value = ReadValue(item, field);
                if (value == null)
                {
                    return false;
                }

                return (from.Value == null || CompareToFilter(value, from) >= 0) && (to.Value == null || CompareToFilter(value, to) <= 0);
            };
        }

        var target = ParseFilterValue(filter.Value ?? default, op.Equals("contains", StringComparison.OrdinalIgnoreCase) || op.Equals("startsWith", StringComparison.OrdinalIgnoreCase) ? FieldKind.Text : field.Kind);

        return op.ToLowerInvariant() switch
        {
            "eq" => item => target.Value == null ? ReadValue(item, field) == null : ReadValue(item, field) is { } value && CompareToFilter(value, target) == 0,
            "neq" => item => target.Value == null ? ReadValue(item, field) != null : ReadValue(item, field) is not { } value || CompareToFilter(value, target) != 0,
            "contains" => item => ReadValue(item, field) is { } value && Convert.ToString(value, CultureInfo.InvariantCulture)!.Contains(Convert.ToString(target.Value, CultureInfo.InvariantCulture) ?? string.Empty, StringComparison.OrdinalIgnoreCase),
            "startswith" => item => ReadValue(item, field) is { } value && Convert.ToString(value, CultureInfo.InvariantCulture)!.StartsWith(Convert.ToString(target.Value, CultureInfo.InvariantCulture) ?? string.Empty, StringComparison.OrdinalIgnoreCase),
            "gt" => item => target.Value != null && ReadValue(item, field) is { } value && CompareToFilter(value, target) > 0,
            "gte" => item => target.Value != null && ReadValue(item, field) is { } value && CompareToFilter(value, target) >= 0,
            "lt" => item => target.Value != null && ReadValue(item, field) is { } value && CompareToFilter(value, target) < 0,
            "lte" => item => target.Value != null && ReadValue(item, field) is { } value && CompareToFilter(value, target) <= 0,
            _ => throw new ArgumentException($"Unknown filter operator '{filter.Op}'. Use eq, neq, in, nin, contains, startsWith, gt, gte, lt, lte, between, isNull, or notNull.")
        };
    }

    private static Func<UiBuilderDataQueryItem, bool> CompileFilters(Dictionary<string, QueryField> fields, List<UiBuilderDataFilterDto>? filters)
    {
        if (filters == null || filters.Count == 0)
        {
            return _ => true;
        }

        if (filters.Count > MaxFilters)
        {
            throw new ArgumentException($"At most {MaxFilters} filters are allowed.");
        }

        var compiled = filters.Select(filter => CompileFilter(fields, filter)).ToList();
        return item => compiled.All(predicate => predicate(item));
    }

    private static string BucketDate(DateTimeOffset date, string? bucket)
    {
        var day = date.UtcDateTime.Date;
        return bucket switch
        {
            "week" => day.AddDays(-(((int)day.DayOfWeek + 6) % 7)).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
            "month" => day.ToString("yyyy-MM", CultureInfo.InvariantCulture),
            "year" => day.ToString("yyyy", CultureInfo.InvariantCulture),
            _ => day.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
        };
    }

    private static object? GroupValue(UiBuilderDataQueryItem item, CompiledGroup group)
    {
        var value = ReadValue(item, group.Field);
        return value is DateTimeOffset date ? BucketDate(date, group.Bucket) : value;
    }

    private static UiBuilderDataQueryResultSetDto RunAggregate(
        Dictionary<string, QueryField> fields,
        List<UiBuilderDataQueryItem> items,
        UiBuilderDataQueryDto query,
        string queryName)
    {
        var groups = CompileGroups(fields, query.GroupBy);
        var metrics = CompileMetrics(fields, query.Metrics, groups, queryName);

        var buckets = new Dictionary<string, (object?[] Keys, MetricAccumulator[] Accumulators)>();
        if (groups.Count == 0)
        {
            buckets[string.Empty] = ([], metrics.Select(_ => new MetricAccumulator()).ToArray());
        }

        foreach (var item in items)
        {
            var keys = groups.Select(group => GroupValue(item, group)).ToArray();
            var bucketKey = string.Join(KeySeparator, keys.Select(key => Convert.ToString(key, CultureInfo.InvariantCulture) ?? "\0"));
            if (!buckets.TryGetValue(bucketKey, out var bucket))
            {
                bucket = (keys, metrics.Select(_ => new MetricAccumulator()).ToArray());
                buckets[bucketKey] = bucket;
            }

            for (var index = 0; index < metrics.Count; index++)
            {
                Accumulate(bucket.Accumulators[index], metrics[index], item);
            }
        }

        var rows = buckets.Values.Select(bucket =>
        {
            var row = new Dictionary<string, object?>();
            for (var index = 0; index < groups.Count; index++)
            {
                row[groups[index].Column] = bucket.Keys[index];
            }

            for (var index = 0; index < metrics.Count; index++)
            {
                row[metrics[index].Metric.Name] = Finalize(bucket.Accumulators[index], metrics[index]);
            }

            return row;
        }).ToList();

        var defaultSort = groups.FirstOrDefault(group => group.Bucket != null || group.Field.Kind == FieldKind.Date) is { } timeGroup
            ? new List<UiBuilderDataSortDto> { new() { By = timeGroup.Column, Dir = "asc" } }
            : metrics.Count > 0 && groups.Count > 0
                ? new List<UiBuilderDataSortDto> { new() { By = metrics[0].Metric.Name, Dir = "desc" } }
                : new List<UiBuilderDataSortDto>();

        var columns = groups.Select(group => group.Column).Concat(metrics.Select(metric => metric.Metric.Name)).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var sorted = SortRows(rows, query.Sort is { Count: > 0 } ? query.Sort : defaultSort, columns, queryName);
        var limit = Math.Clamp(query.Limit ?? DefaultGroupLimit, 1, MaxGroupLimit);

        return new UiBuilderDataQueryResultSetDto { Rows = sorted.Take(limit).ToList(), TotalRows = rows.Count };
    }

    private static List<CompiledGroup> CompileGroups(Dictionary<string, QueryField> fields, List<UiBuilderDataGroupByDto>? groupBy)
    {
        if (groupBy == null)
        {
            return [];
        }

        if (groupBy.Count > MaxGroupBy)
        {
            throw new ArgumentException($"At most {MaxGroupBy} groupBy fields are allowed.");
        }

        return groupBy.Select(group =>
        {
            var field = ResolveField(fields, group.Field);
            var bucket = string.IsNullOrWhiteSpace(group.Bucket) ? null : group.Bucket.Trim().ToLowerInvariant();
            if (bucket != null && !Buckets.Contains(bucket))
            {
                throw new ArgumentException($"Unknown bucket '{group.Bucket}'. Use day, week, month, or year.");
            }

            if (bucket != null && field.Kind != FieldKind.Date)
            {
                throw new ArgumentException($"Field '{field.Name}' is not a date, so it cannot be bucketed.");
            }

            var column = string.IsNullOrWhiteSpace(group.As) ? field.Name : group.As.Trim();
            if (!NamePattern.IsMatch(column.TrimStart('$')))
            {
                throw new ArgumentException($"Group column name '{column}' is not valid.");
            }

            return new CompiledGroup(field, bucket, column);
        }).ToList();
    }

    private static List<CompiledMetric> CompileMetrics(
        Dictionary<string, QueryField> fields,
        List<UiBuilderDataMetricDto>? metrics,
        List<CompiledGroup> groups,
        string queryName)
    {
        if (metrics == null)
        {
            return [];
        }

        if (metrics.Count > MaxMetrics)
        {
            throw new ArgumentException($"Query '{queryName}' has more than {MaxMetrics} metrics.");
        }

        var names = new HashSet<string>(groups.Select(group => group.Column), StringComparer.OrdinalIgnoreCase);
        return metrics.Select(metric =>
        {
            if (!NamePattern.IsMatch(metric.Name ?? string.Empty) || !names.Add(metric.Name!))
            {
                throw new ArgumentException($"Metric name '{metric.Name}' in query '{queryName}' is missing, invalid, or duplicated.");
            }

            var function = MetricFunctions.FirstOrDefault(name => name.Equals(metric.Fn?.Trim(), StringComparison.OrdinalIgnoreCase))
                ?? throw new ArgumentException($"Unknown metric function '{metric.Fn}'. Use count, countDistinct, sum, avg, min, or max.");
            metric.Fn = function;

            var field = string.IsNullOrWhiteSpace(metric.Field) ? null : ResolveField(fields, metric.Field);
            if (field == null && function != "count")
            {
                throw new ArgumentException($"Metric '{metric.Name}' needs a field for {function}.");
            }

            if (field != null && function is "sum" or "avg" && field.Kind != FieldKind.Number)
            {
                throw new ArgumentException($"Metric '{metric.Name}' uses {function} on '{field.Name}', which is not a number field.");
            }

            if (field != null && function is "min" or "max" && field.Kind == FieldKind.Text)
            {
                throw new ArgumentException($"Metric '{metric.Name}' uses {function} on '{field.Name}', which is a text field.");
            }

            return new CompiledMetric(metric, field, CompileFilters(fields, metric.Where));
        }).ToList();
    }

    private static void Accumulate(MetricAccumulator accumulator, CompiledMetric metric, UiBuilderDataQueryItem item)
    {
        if (!metric.Where(item))
        {
            return;
        }

        if (metric.Field == null)
        {
            accumulator.Count++;
            return;
        }

        var value = ReadValue(item, metric.Field);
        if (value == null)
        {
            return;
        }

        accumulator.Count++;
        switch (value)
        {
            case double number:
                accumulator.NumericCount++;
                accumulator.Sum += number;
                accumulator.Min = accumulator.Min is { } min ? Math.Min(min, number) : number;
                accumulator.Max = accumulator.Max is { } max ? Math.Max(max, number) : number;
                break;
            case DateTimeOffset date:
                accumulator.MinDate = accumulator.MinDate is { } minDate && minDate <= date ? minDate : date;
                accumulator.MaxDate = accumulator.MaxDate is { } maxDate && maxDate >= date ? maxDate : date;
                break;
        }

        if (metric.Metric.Fn == "countDistinct")
        {
            accumulator.Distinct ??= new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            accumulator.Distinct.Add(Convert.ToString(value, CultureInfo.InvariantCulture) ?? string.Empty);
        }
    }

    private static object? Finalize(MetricAccumulator accumulator, CompiledMetric metric)
    {
        return metric.Metric.Fn switch
        {
            "count" => accumulator.Count,
            "countDistinct" => accumulator.Distinct?.Count ?? 0,
            "sum" => Math.Round(accumulator.Sum, 4),
            "avg" => accumulator.NumericCount > 0 ? Math.Round(accumulator.Sum / accumulator.NumericCount, 2) : null,
            "min" => metric.Field?.Kind == FieldKind.Date ? accumulator.MinDate?.ToString("o", CultureInfo.InvariantCulture) : accumulator.Min,
            "max" => metric.Field?.Kind == FieldKind.Date ? accumulator.MaxDate?.ToString("o", CultureInfo.InvariantCulture) : accumulator.Max,
            _ => null
        };
    }

    private static List<Dictionary<string, object?>> SortRows(
        List<Dictionary<string, object?>> rows,
        List<UiBuilderDataSortDto> sort,
        HashSet<string> columns,
        string queryName)
    {
        IOrderedEnumerable<Dictionary<string, object?>>? ordered = null;
        foreach (var key in sort)
        {
            var column = columns.FirstOrDefault(name => name.Equals(key.By?.Trim(), StringComparison.OrdinalIgnoreCase))
                ?? throw new ArgumentException($"Query '{queryName}' cannot sort by '{key.By}'; sort by a group column or metric name.");
            var descending = string.Equals(key.Dir?.Trim(), "desc", StringComparison.OrdinalIgnoreCase);
            var comparer = Comparer<object?>.Create((left, right) => CompareNullable(left, right, descending));

            ordered = ordered == null
                ? rows.OrderBy(row => row.GetValueOrDefault(column), comparer)
                : ordered.ThenBy(row => row.GetValueOrDefault(column), comparer);
        }

        return ordered?.ToList() ?? rows;
    }

    private static int CompareNullable(object? left, object? right, bool descending)
    {
        if (left == null && right == null)
        {
            return 0;
        }

        if (left == null)
        {
            return 1;
        }

        if (right == null)
        {
            return -1;
        }

        var comparison = left is IConvertible && right is IConvertible && IsNumeric(left) && IsNumeric(right)
            ? Convert.ToDouble(left, CultureInfo.InvariantCulture).CompareTo(Convert.ToDouble(right, CultureInfo.InvariantCulture))
            : CompareValues(left, right);
        return descending ? -comparison : comparison;
    }

    private static bool IsNumeric(object value)
    {
        return value is double or long or int or float or decimal;
    }

    private static UiBuilderDataQueryResultSetDto RunRows(
        Dictionary<string, QueryField> fields,
        List<UiBuilderDataQueryItem> items,
        UiBuilderDataQueryDto query)
    {
        IEnumerable<UiBuilderDataQueryItem> ordered = items;
        if (query.Sort is { Count: > 0 })
        {
            IOrderedEnumerable<UiBuilderDataQueryItem>? sorted = null;
            foreach (var key in query.Sort)
            {
                var field = ResolveField(fields, key.By);
                var descending = string.Equals(key.Dir?.Trim(), "desc", StringComparison.OrdinalIgnoreCase);
                var comparer = Comparer<object?>.Create((left, right) => CompareNullable(left, right, descending));
                sorted = sorted == null
                    ? items.OrderBy(item => ReadValue(item, field), comparer)
                    : sorted.ThenBy(item => ReadValue(item, field), comparer);
            }

            ordered = sorted!;
        }

        var limit = Math.Clamp(query.Limit ?? DefaultRowLimit, 1, MaxRowLimit);
        var rows = ordered.Take(limit).Select(item => new Dictionary<string, object?>
        {
            ["id"] = item.Id,
            ["status"] = item.Status,
            ["createdOn"] = item.CreatedOn,
            ["lastModifiedOn"] = item.LastModifiedOn,
            ["assignee"] = item.Assignee,
            ["data"] = ToPlainValue(item.Data)
        }).ToList();

        return new UiBuilderDataQueryResultSetDto { Rows = rows, TotalRows = items.Count };
    }

    private static string DescribeValue(JsonElement? value)
    {
        if (value is not { } element || element.ValueKind is JsonValueKind.Null or JsonValueKind.Undefined)
        {
            return "empty";
        }

        return element.ValueKind == JsonValueKind.String ? $"\"{element.GetString()}\"" : element.GetRawText();
    }

    private static string DescribeList(JsonElement? value)
    {
        return value is { ValueKind: JsonValueKind.Array } array
            ? string.Join(", ", array.EnumerateArray().Select(element => DescribeValue(element)))
            : DescribeValue(value);
    }

    private static string DescribeCondition(Dictionary<string, QueryField> fields, UiBuilderDataFilterDto filter)
    {
        var label = fields.TryGetValue(filter.Field?.Trim() ?? string.Empty, out var field) ? field.Label : filter.Field;
        var op = (filter.Op ?? "eq").Trim().ToLowerInvariant();

        if (op == "between" && filter.Value is { ValueKind: JsonValueKind.Array } bounds && bounds.GetArrayLength() == 2)
        {
            var from = bounds[0];
            var to = bounds[1];
            var hasFrom = from.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined);
            var hasTo = to.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined);
            return (hasFrom, hasTo) switch
            {
                (true, true) => $"{label} is between {DescribeValue(from)} and {DescribeValue(to)} (inclusive)",
                (true, false) => $"{label} is on or after {DescribeValue(from)}",
                (false, true) => $"{label} is on or before {DescribeValue(to)}",
                _ => $"{label} is any value"
            };
        }

        return op switch
        {
            "eq" => $"{label} is {DescribeValue(filter.Value)}",
            "neq" => $"{label} is not {DescribeValue(filter.Value)}",
            "in" => $"{label} is one of {DescribeList(filter.Value)}",
            "nin" => $"{label} is not one of {DescribeList(filter.Value)}",
            "contains" => $"{label} contains {DescribeValue(filter.Value)}",
            "startswith" => $"{label} starts with {DescribeValue(filter.Value)}",
            "gt" => $"{label} is greater than {DescribeValue(filter.Value)}",
            "gte" => $"{label} is at least {DescribeValue(filter.Value)}",
            "lt" => $"{label} is less than {DescribeValue(filter.Value)}",
            "lte" => $"{label} is at most {DescribeValue(filter.Value)}",
            "isnull" => $"{label} is empty",
            "notnull" => $"{label} has a value",
            _ => $"{label} {filter.Op} {DescribeValue(filter.Value)}"
        };
    }

    private static string? DescribeConditions(Dictionary<string, QueryField> fields, IEnumerable<UiBuilderDataFilterDto>? filters)
    {
        var parts = (filters ?? []).Select(filter => DescribeCondition(fields, filter)).ToList();
        return parts.Count == 0 ? null : string.Join(" and ", parts);
    }

    private static string DescribeMetricExpression(Dictionary<string, QueryField> fields, UiBuilderDataMetricDto metric)
    {
        var label = string.IsNullOrWhiteSpace(metric.Field)
            ? null
            : fields.TryGetValue(metric.Field.Trim(), out var field) ? field.Label : metric.Field;

        return metric.Fn switch
        {
            "count" => label == null ? "Number of work items" : $"Number of work items where {label} has a value",
            "countDistinct" => $"Number of distinct {label} values",
            "sum" => $"Sum of {label}",
            "avg" => $"Average of {label} (items without a value are left out)",
            "min" => $"Lowest {label}",
            "max" => $"Highest {label}",
            _ => metric.Fn
        };
    }

    private static void DescribeResultSet(
        UiBuilderDataQueryResultSetDto resultSet,
        Dictionary<string, QueryField> fields,
        List<UiBuilderDataFilterDto>? sharedFilters,
        UiBuilderDataQueryDto query,
        bool hasAggregation)
    {
        var scope = DescribeConditions(fields, (sharedFilters ?? []).Concat(query.Filters ?? []));
        var grouping = (query.GroupBy ?? []).Select(group =>
        {
            var label = fields.TryGetValue(group.Field.Trim(), out var field) ? field.Label : group.Field;
            return string.IsNullOrWhiteSpace(group.Bucket) ? label : $"{group.Bucket.Trim().ToLowerInvariant()} of {label}";
        }).ToList();
        var sorting = (query.Sort ?? []).Select(key =>
        {
            var label = fields.TryGetValue(key.By?.Trim() ?? string.Empty, out var field) ? field.Label : key.By;
            return $"{label} {(string.Equals(key.Dir?.Trim(), "desc", StringComparison.OrdinalIgnoreCase) ? "(highest first)" : "(lowest first)")}";
        }).ToList();

        var description = new List<string>
        {
            hasAggregation
                ? grouping.Count > 0 ? $"One row per {string.Join(" and ", grouping)}" : "Totals across all matching work items"
                : "Matching work items"
        };
        if (scope != null) description.Add($"including work items where {scope}");
        if (sorting.Count > 0) description.Add($"sorted by {string.Join(", then ", sorting)}");
        resultSet.Description = string.Join(", ", description) + ".";

        foreach (var metric in query.Metrics ?? [])
        {
            var conditions = DescribeConditions(fields, (sharedFilters ?? []).Concat(query.Filters ?? []).Concat(metric.Where ?? []));
            var perGroup = grouping.Count > 0 ? $", per {string.Join(" and ", grouping)}" : string.Empty;
            resultSet.Formulas[metric.Name] = conditions == null
                ? $"{DescribeMetricExpression(fields, metric)}{perGroup}."
                : $"{DescribeMetricExpression(fields, metric)}{perGroup}, counting only work items where {conditions}.";
        }
    }

    private static object? ToPlainValue(JToken? token)
    {
        return token switch
        {
            null => null,
            JObject jsonObject => jsonObject.Properties().ToDictionary(property => property.Name, property => ToPlainValue(property.Value)),
            JArray jsonArray => jsonArray.Select(ToPlainValue).ToList(),
            JValue jsonValue => jsonValue.Value,
            _ => token.ToString(Formatting.None)
        };
    }
}
