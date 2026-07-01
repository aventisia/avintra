using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Net.Http;
using System.Text.RegularExpressions;
using CodeActivitiesLibrary.Activities.WorkflowLogics.QueueManagement.Enums;
using CodeActivitiesLibrary.Enums;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.Models;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using MailKit.Search;
using Newtonsoft.Json;

namespace CodeActivitiesLibrary.WorkflowLogics.QueueManagement
{
    [DisplayName("Get Work Items")]
    [Description("Retrieves work items from the specified queue using its identifier.")]
    [ActivityMetaData(nodeImg: "/assets/Queue.svg")]
    public class GetQueueWorkItemsActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Select Queue")]
        [Description("Choose the queue from which to retrieve work items.")]
        [FieldType(FieldType.QueueSelect)]
        public InArgument<string> QueueName { get; set; }

        [DisplayName("Status")]
        [Description("Select the status of the work items to retrieve.")]
        public InArgument<WorkItemStatusEnum> Status { get; set; }

        [DisplayName("Sort By")]
        [Description("Specifies how work items are sorted. Enter one or more sort expressions in the format '<Field> [ASC|DESC]', separated by commas. If no sort direction is specified, DESC is used by default. Examples: 'CreatedOn DESC', 'Priority ASC', 'CreatedOn DESC, Name ASC', or 'DueDate'.")]
        public InArgument<string> SortBy { get; set; }

        [DisplayName("Filter By")]
        [Description("Specifies the criteria for filtering work items. Enter one or more filter expressions in the format '<Field> <Operator> <Value>', separated by logical operators (AND/OR). Supported operators: =, !=, >, >=, <, <=, contains, notcontains, startswith, endswith, dateafter, datebefore, dateonorafter, dateonorbefore, isnull, and isnotnull. Examples: 'Priority = High', 'Amount >= 1000', 'Name contains John', 'Email isnotnull', or 'Priority = High AND Amount >= 1000'.")]
        public InArgument<string> FilterBy { get; set; }

        [DisplayName("Top")]
        [Description("Specifies the maximum number of work items to retrieve.")]
        [DefaultValue(10)]
        public InArgument<int> Top { get; set; }

        [DisplayName("Skip")]
        [Description("Specifies the number of work items to skip before retrieving results.")]
        [DefaultValue(0)]
        public InArgument<int> Skip { get; set; }

        [DisplayName("Result")]
        [Description("Returns the retrieved work items.")]
        public OutArgument<object> Result { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve required input arguments from the activity context
                var queueName = QueueName.Get(context);
                var accessToken = AccessToken.Get(context);

                // Retrieve optional inputs: status and pagination
                var status = Status.Get(context);
                var top = Top.Get(context);
                var skip = Skip.Get(context);

                // Prepare collections used in the request payload
                var sortBy = SortBy.Get(context);
                var filterBy = FilterBy.Get(context);

                // Parse Sort By JSON
                List<object> queuePriority = string.IsNullOrWhiteSpace(sortBy)
                    ? new List<object>()
                    : ParseSort(sortBy);

                // Parse Filter By JSON
                List<object> conditions = string.IsNullOrWhiteSpace(filterBy)
                    ? new List<object>()
                    : ParseFilter(filterBy);

                // Build the request payload for the queue API
                var payload = new
                {
                    // queueId = queueId,
                    queueName = queueName,
                    status = status.ToString(),
                    queuePriority = queuePriority,
                    conditions = conditions,
                    top = top,
                    skip = skip,
                };

                // API endpoint to retrieve work items from the queue
                var queueWorkItemsEndpoint = $"workspace/api/queue/workitem/list";

                // Execute the API call and wait for the result
                var retrievedWorkItems = QueueApiExecutor.Execute(queueWorkItemsEndpoint, HttpMethod.Post, accessToken, payload).Result;

                // Set outputs for the activity: result, success flag and status message    
                Result.Set(context, retrievedWorkItems);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item retrieved successfully.");
            }
            catch (Exception ex)
            {
                // On error, set failure outputs and rethrow so the workflow runtime handles the exception
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving work item: {ex.Message}");
                throw;
            }
        }

        // Parses a comma-separated sort expression into the queue API sort format.
        // Example: "CreatedOn DESC, Name ASC, Priority"
        private static List<object> ParseSort(string sortBy)
        {
            var queuePriority = new List<object>();

            // Return an empty collection when no sort expression is provided.
            if (string.IsNullOrWhiteSpace(sortBy))
                return queuePriority;

            // Split the input into individual sort expressions.
            var sortExpressions = sortBy.Split(new[] { ',' }, StringSplitOptions.RemoveEmptyEntries);

            foreach (var sortExpression in sortExpressions)
            {
                var tokens = sortExpression.Trim()
                                           .Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                if (tokens.Length == 0)
                    continue;

                if (tokens.Length > 2)
                {
                    throw new ArgumentException(
                        $"Invalid sort expression '{sortExpression}'. Expected format: '<Field> [ASC|DESC]'.");
                }

                var field = tokens[0];

                // Default to Descending when no sort direction is specified.
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

        // Maps supported filter operators to the corresponding queue API comparison operators.
        private static readonly Dictionary<string, string> OperatorMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            // Equality
            { "!=", "NotEqualTo" },
            { "=", "EqualTo" },

            // Numeric comparison
            { ">=", "GreaterThanOrEqual" },
            { "<=", "LessThanOrEqual" },
            { ">", "GreaterThan" },
            { "<", "LessThan" },

            // String operators
            { "contains", "Contains" },
            { "notcontains", "DoesNotContain" },
            { "startswith", "StartsWith" },
            { "endswith", "EndsWith" },

            // Date operators
            { "dateafter", "DateAfter" },
            { "datebefore", "DateBefore" },
            { "dateonorafter", "DateOnOrAfter" },
            { "dateonorbefore", "DateOnOrBefore" },

            // Null operators
            { "isnull", "IsNull" },
            { "isnotnull", "IsNotNull" }
        };

        // Parses a comma-separated filter expression into the queue API filter format.
        //
        // Supported examples:
        // "Priority = High"
        // "Amount >= 1000"
        // "Name contains John"
        // "Email is not null"
        // "Priority = High, Amount >= 1000"
        private static List<object> ParseFilter(string filterBy)
        {
            var conditions = new List<object>();

            // Return an empty collection when no filter expression is provided.
            if (string.IsNullOrWhiteSpace(filterBy))
                return conditions;

            // Split the input into individual filter expressions.
            // Filters can be separated by logical operators (AND, OR, &&, ||, &, |).
            var filterExpressions = Regex.Split(
                filterBy,
                @"\s*(?:AND|and|OR|or|&&|\|\||&|\|)\s*",
                RegexOptions.IgnoreCase)
                .Where(expression => !string.IsNullOrWhiteSpace(expression));

            foreach (var filterExpression in filterExpressions)
            {
                var expression = filterExpression.Trim();
                var isMatched = false;

                // Match the longest operator first to avoid partial matches
                // (e.g. ">=" before ">", "is not null" before "isnull").
                foreach (var op in OperatorMap.Keys.OrderByDescending(x => x.Length))
                {
                    var index = expression.IndexOf(op, StringComparison.OrdinalIgnoreCase);

                    if (index < 0)
                        continue;

                    // Extract the field name and comparison value.
                    var field = expression.Substring(0, index).Trim();
                    var value = expression.Substring(index + op.Length).Trim();
                    var comparisonOperator = OperatorMap[op];

                    // Validate that a field name is specified.
                    if (string.IsNullOrWhiteSpace(field))
                    {
                        throw new ArgumentException(
                            $"Missing field name in filter expression '{expression}'.");
                    }

                    // Validate the comparison value unless the operator does not require one.
                    if (comparisonOperator != "IsNull" &&
                        comparisonOperator != "IsNotNull" &&
                        string.IsNullOrWhiteSpace(value))
                    {
                        throw new ArgumentException(
                            $"Missing filter value in filter expression '{expression}'.");
                    }

                    // Add the parsed filter condition to the request payload.
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

                // No supported operator was found in the expression.
                if (!isMatched)
                {
                    throw new ArgumentException(
                        $"Invalid filter expression '{expression}'. Expected format: '<Field> <Operator> <Value>'.");
                }
            }

            return conditions;
        }
    }
}