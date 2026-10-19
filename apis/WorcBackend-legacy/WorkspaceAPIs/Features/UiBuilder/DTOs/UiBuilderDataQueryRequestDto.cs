namespace WorkspaceAPIs.DTOs;

/// <summary>
/// Represents a declarative query over the work items of a queue bound to a custom UI builder project:
/// shared filters plus one or more named result sets (aggregates, time series, or filtered rows).
/// </summary>
public class UiBuilderDataQueryRequestDto
{
    /// <summary>
    /// Gets or sets the filters applied to every named query (for example the selected date range).
    /// </summary>
    public List<UiBuilderDataFilterDto>? Filters { get; set; }

    /// <summary>
    /// Gets or sets the named queries to run in one pass, at most 10.
    /// </summary>
    public Dictionary<string, UiBuilderDataQueryDto> Queries { get; set; } = new();
}

/// <summary>
/// Represents one filter on a work item field. Fields are schema field names or the system fields
/// $status, $createdOn, $lastModifiedOn, and $assignee.
/// </summary>
public class UiBuilderDataFilterDto
{
    /// <summary>
    /// Gets or sets the field the filter applies to.
    /// </summary>
    public string Field { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the operator: eq, neq, in, nin, contains, startsWith, gt, gte, lt, lte, between, isNull, or notNull.
    /// </summary>
    public string Op { get; set; } = "eq";

    /// <summary>
    /// Gets or sets the comparison value; an array for in, nin, and between ([from, to], either may be null).
    /// </summary>
    public JsonElement? Value { get; set; }
}

/// <summary>
/// Represents one named query: an aggregate when metrics are given (optionally grouped), otherwise filtered rows.
/// </summary>
public class UiBuilderDataQueryDto
{
    /// <summary>
    /// Gets or sets filters applied to this query only, on top of the shared filters.
    /// </summary>
    public List<UiBuilderDataFilterDto>? Filters { get; set; }

    /// <summary>
    /// Gets or sets the fields to group by; date fields may be bucketed by day, week, month, or year.
    /// </summary>
    public List<UiBuilderDataGroupByDto>? GroupBy { get; set; }

    /// <summary>
    /// Gets or sets the metrics computed for each group (or for all matching items when there is no grouping).
    /// </summary>
    public List<UiBuilderDataMetricDto>? Metrics { get; set; }

    /// <summary>
    /// Gets or sets the sort order, by group field or metric name (or by field for row queries).
    /// </summary>
    public List<UiBuilderDataSortDto>? Sort { get; set; }

    /// <summary>
    /// Gets or sets the maximum number of rows returned (groups: default 100, max 1000; rows: default 50, max 500).
    /// </summary>
    public int? Limit { get; set; }
}

/// <summary>
/// Represents one grouping key.
/// </summary>
public class UiBuilderDataGroupByDto
{
    /// <summary>
    /// Gets or sets the field to group by.
    /// </summary>
    public string Field { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the date bucket (day, week, month, or year) for date fields.
    /// </summary>
    public string? Bucket { get; set; }

    /// <summary>
    /// Gets or sets the result column name; defaults to the field name.
    /// </summary>
    public string? As { get; set; }
}

/// <summary>
/// Represents one computed metric.
/// </summary>
public class UiBuilderDataMetricDto
{
    /// <summary>
    /// Gets or sets the result column name.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the function: count, countDistinct, sum, avg, min, or max.
    /// </summary>
    public string Fn { get; set; } = "count";

    /// <summary>
    /// Gets or sets the field the function reads; optional for count (counts items).
    /// </summary>
    public string? Field { get; set; }

    /// <summary>
    /// Gets or sets conditions that limit which items this metric includes (for example only unanswered emails).
    /// </summary>
    public List<UiBuilderDataFilterDto>? Where { get; set; }
}

/// <summary>
/// Represents one sort key.
/// </summary>
public class UiBuilderDataSortDto
{
    /// <summary>
    /// Gets or sets the group field, metric name, or (for row queries) field to sort by.
    /// </summary>
    public string By { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the direction: asc or desc.
    /// </summary>
    public string? Dir { get; set; }
}

/// <summary>
/// Represents the results of a data query.
/// </summary>
public class UiBuilderDataQueryResultDto
{
    /// <summary>
    /// Gets or sets the result set of each named query.
    /// </summary>
    public Dictionary<string, UiBuilderDataQueryResultSetDto> Queries { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of work items scanned.
    /// </summary>
    public int Scanned { get; set; }

    /// <summary>
    /// Gets or sets whether the scan stopped at the item limit, so results cover only the newest items.
    /// </summary>
    public bool Truncated { get; set; }

    /// <summary>
    /// Gets or sets a plain-language description of the shared filters, or null when there are none.
    /// </summary>
    public string? FilterDescription { get; set; }
}

/// <summary>
/// Represents the rows of one named query.
/// </summary>
public class UiBuilderDataQueryResultSetDto
{
    /// <summary>
    /// Gets or sets the result rows.
    /// </summary>
    public List<Dictionary<string, object?>> Rows { get; set; } = new();

    /// <summary>
    /// Gets or sets the number of rows before the limit was applied.
    /// </summary>
    public int TotalRows { get; set; }

    /// <summary>
    /// Gets or sets a plain-language description of how this result set is built (filters, grouping, sorting).
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Gets or sets the plain-language formula of each metric, keyed by metric name, including every filter that applies.
    /// </summary>
    public Dictionary<string, string> Formulas { get; set; } = new();
}
