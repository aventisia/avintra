using NodeLibrary.WorkflowLogics.QueueManagement.Helpers;

namespace NodeLibrary.WorkflowLogics.QueueManagement;

[DisplayName("Get Next Work Item")]
[Description("Retrieves the next available work item from the selected queue based on the specified status, sorting, and filtering criteria.")]
[NodeMetadata(icon: "/assets/Queue.svg")]
public class GetNextQueueWorkItemNode : BaseNode
{
    [DisplayName("Select Queue")]
    [Description("Choose the queue from which to retrieve work items.")]
    [NodeFieldType(NodeFieldTypeEnum.QueueSelect)]
    public required InArgument<string> QueueName { get; set; }

    [DisplayName("Status")]
    [Description("Select the status of the work items to retrieve. Custom statuses defined on the queue are supported.")]
    public InArgument<string> Status { get; set; } = new InArgument<string>();

    [DisplayName("Sort By")]
    [Description("Specifies how work items are sorted. Enter one or more sort expressions in the format '<Field> [ASC|DESC]', separated by commas. If no sort direction is specified, DESC is used by default. Examples: 'CreatedOn DESC', 'Priority ASC', 'CreatedOn DESC, Name ASC', or 'DueDate'.")]
    public InArgument<string> SortBy { get; set; } = new InArgument<string>();

    [DisplayName("Filter By")]
    [Description("Specifies the criteria for filtering work items. Enter one or more filter expressions in the format '<Field> <Operator> <Value>', separated by logical operators (AND/OR). Supported operators: =, !=, >, >=, <, <=, contains, notcontains, startswith, endswith, dateafter, datebefore, dateonorafter, dateonorbefore, isnull, and isnotnull. Examples: 'Priority = High', 'Amount >= 1000', 'Name contains John', 'Email isnotnull', or 'Priority = High AND Amount >= 1000'.")]
    public InArgument<string> FilterBy { get; set; } = new InArgument<string>();

    [DisplayName("Result")]
    [Description("Returns the next work item that matches the specified queue, status, sorting, and filtering criteria.")]
    public OutArgument<JsonElement> Result { get; set; } = new OutArgument<JsonElement>();

    protected override async Task ExecuteAsync(INodeContext context)
    {
        try
        {
            var queueName = QueueName.Get(context);
            var status = Status.Get(context);
            var sortBy = SortBy.Get(context);
            var filterBy = FilterBy.Get(context);
            var callerContext = CallerContext.Get(context) ?? throw new InvalidOperationException("Caller context is required");
            var baseUrl = callerContext.AppBaseUrl ?? throw new InvalidOperationException("App base URL is required");
            var accessToken = callerContext.AccessToken ?? throw new InvalidOperationException("Access token is required");

            var queuePriority = string.IsNullOrWhiteSpace(sortBy)
                ? new List<object>()
                : ParseSort(sortBy);

            var conditions = string.IsNullOrWhiteSpace(filterBy)
                ? new List<object>()
                : ParseFilter(filterBy);

            var payload = new
            {
                queueName = queueName,
                status = status,
                queuePriority = queuePriority,
                conditions = conditions
            };

            var nextWorkItem = await QueueApiExecutor.ExecuteAsync(
                baseUrl,
                "workspace/api/queue/workitem/next",
                HttpMethod.Put,
                accessToken,
                payload);

            Result.Set(context, nextWorkItem);
            IsSuccess.Set(context, true);
            StatusMessage.Set(context, "Next work item retrieved successfully.");
        }
        catch (Exception ex)
        {
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, $"Error retrieving work item: {ex.Message}");
            throw;
        }
    }

    private static List<object> ParseSort(string sortBy)
    {
        var queuePriority = new List<object>();

        if (string.IsNullOrWhiteSpace(sortBy))
            return queuePriority;

        var sortExpressions = sortBy.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

        foreach (var sortExpression in sortExpressions)
        {
            var tokens = sortExpression.Trim().Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (tokens.Length == 0)
                continue;

            if (tokens.Length > 2)
            {
                throw new ArgumentException(
                    $"Invalid sort expression '{sortExpression}'. Expected format: '<Field> [ASC|DESC]'.");
            }

            var field = tokens[0];
            var orderBy = "Descending";

            if (tokens.Length == 2)
            {
                var sortDirection = tokens[1].ToUpperInvariant();

                switch (sortDirection)
                {
                    case "ASC":
                        orderBy = "Ascending";
                        break;

                    case "DESC":
                        orderBy = "Descending";
                        break;

                    default:
                        throw new ArgumentException(
                            $"Invalid sort direction '{tokens[1]}' for field '{field}'. Supported values are ASC and DESC.");
                }
            }

            queuePriority.Add(new
            {
                field,
                orderBy
            });
        }

        return queuePriority;
    }

    private static readonly Dictionary<string, string> OperatorMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        { "!=", "NotEqualTo" },
        { "=", "EqualTo" },
        { ">=", "GreaterThanOrEqual" },
        { "<=", "LessThanOrEqual" },
        { ">", "GreaterThan" },
        { "<", "LessThan" },
        { "contains", "Contains" },
        { "notcontains", "DoesNotContain" },
        { "startswith", "StartsWith" },
        { "endswith", "EndsWith" },
        { "dateafter", "DateAfter" },
        { "datebefore", "DateBefore" },
        { "dateonorafter", "DateOnOrAfter" },
        { "dateonorbefore", "DateOnOrBefore" },
        { "isnull", "IsNull" },
        { "isnotnull", "IsNotNull" }
    };

    private static List<object> ParseFilter(string filterBy)
    {
        var conditions = new List<object>();

        if (string.IsNullOrWhiteSpace(filterBy))
            return conditions;

        var filterExpressions = Regex.Split(
            filterBy,
            @"\s*(?:AND|and|OR|or|&&|\|\||&|\|)\s*",
            RegexOptions.IgnoreCase)
            .Where(expression => !string.IsNullOrWhiteSpace(expression));

        foreach (var filterExpression in filterExpressions)
        {
            var expression = filterExpression.Trim();
            var isMatched = false;

            foreach (var op in OperatorMap.Keys.OrderByDescending(x => x.Length))
            {
                var index = expression.IndexOf(op, StringComparison.OrdinalIgnoreCase);

                if (index < 0)
                    continue;

                var field = expression.Substring(0, index).Trim();
                var value = expression.Substring(index + op.Length).Trim();
                var comparisonOperator = OperatorMap[op];

                if (string.IsNullOrWhiteSpace(field))
                {
                    throw new ArgumentException(
                        $"Missing field name in filter expression '{expression}'.");
                }

                if (comparisonOperator != "IsNull" &&
                    comparisonOperator != "IsNotNull" &&
                    string.IsNullOrWhiteSpace(value))
                {
                    throw new ArgumentException(
                        $"Missing filter value in filter expression '{expression}'.");
                }

                conditions.Add(new
                {
                    field,
                    comparisonOperator,
                    value = comparisonOperator == "IsNull" || comparisonOperator == "IsNotNull"
                        ? null
                        : value
                });

                isMatched = true;
                break;
            }

            if (!isMatched)
            {
                throw new ArgumentException(
                    $"Invalid filter expression '{expression}'. Expected format: '<Field> <Operator> <Value>'.");
            }
        }

        return conditions;
    }
}
