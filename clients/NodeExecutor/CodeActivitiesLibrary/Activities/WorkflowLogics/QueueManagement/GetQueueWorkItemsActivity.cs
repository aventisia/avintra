using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Net.Http;
using CodeActivitiesLibrary.Activities.WorkflowLogics.Q.Enums;
using CodeActivitiesLibrary.Enums;
using CodeActivitiesLibrary.Extensions;
using CodeActivitiesLibrary.Models;
using CodeActivitiesLibrary.WorkflowLogics.QueueManagement.Helpers;
using MailKit.Search;

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
        [Description("Select the new status to assign to the work item.")]
        public InArgument<WorkItemStatusEnum> Status { get; set; }

        [DisplayName("Enable Sorting")]
        [Description("Indicates whether the retrieved work items should be sorted.")]
        [DefaultValue(false)]
        public InArgument<bool> EnableSorting { get; set; }

        [DisplayName("Sort Field")]
        [Description("Specifies the field name to sort the retrieved work items by.")]
        [RenderIfCondition(nameof(EnableSorting), true)]
        public InArgument<string> SortField { get; set; }

        [DisplayName("Sort Order")]
        [Description("Specifies the sort order for the retrieved work items.")]
        [DefaultValue(FieldSortOrder.Ascending)]
        [RenderIfCondition(nameof(EnableSorting), true)]
        public InArgument<FieldSortOrder> SortOrder { get; set; }

        [DisplayName("Enable Filtering")]
        [Description("Indicates whether a filter should be applied when retrieving work items.")]
        [DefaultValue(false)]
        public InArgument<bool> EnableFiltering { get; set; }

        [DisplayName("Filter Field")]
        [Description("Specifies the field name to filter the retrieved work items by.")]
        [RenderIfCondition(nameof(EnableFiltering), true)]
        public InArgument<string> FilterField { get; set; }

        [DisplayName("Comparison Operator")]
        [Description("Specifies the comparison operator to use when filtering work items.")]
        [DefaultValue(FilterComparisonOperator.EqualTo)]
        [RenderIfCondition(nameof(EnableFiltering), true)]
        public InArgument<FilterComparisonOperator> ComparisonOperator { get; set; }

        [DisplayName("Filter Value")]
        [Description("Specifies the value to compare against the selected field.")]
        [RenderIfCondition(nameof(EnableFiltering), true)]
        public InArgument<string> FilterValue { get; set; }

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
                // Retrieve input arguments
                var queueName = QueueName.Get(context);
                var accessToken = AccessToken.Get(context);

                var status = Status.Get(context);
                var top = Top.Get(context);
                var skip = Skip.Get(context);

                var enableSorting = EnableSorting.Get(context);
                var sortField = SortField.Get(context);
                var sortOrder = SortOrder.Get(context);

                var enableFiltering = EnableFiltering.Get(context);
                var filterField = FilterField.Get(context);
                var comparisonOperator = ComparisonOperator.Get(context);
                var filterValue = FilterValue.Get(context);

                object queuePriority = null;

                if (enableSorting)
                {
                    if (string.IsNullOrWhiteSpace(sortField))
                    {
                        throw new ArgumentException("Sort Field is required when sorting is enabled.");
                    }

                    queuePriority = new[]
                    {
                        new
                        {
                            field = sortField,
                            orderBy = sortOrder.ToString()
                        }
                    };
                }

                object conditions = null;

                if (enableFiltering)
                {
                    if (string.IsNullOrWhiteSpace(filterField))
                    {
                        throw new ArgumentException("Filter Field is required when filtering is enabled.");
                    }

                    if (string.IsNullOrWhiteSpace(filterValue))
                    {
                        throw new ArgumentException("Filter Value is required when filtering is enabled.");
                    }

                    conditions = new[]
                    {
                        new
                        {
                            field = filterField,
                            comparisonOperator = comparisonOperator.ToString(),
                            value = filterValue
                        }
                    };
                }

                var payload = new
                {
                    queueName = queueName,
                    status = status,
                    queuePriority = queuePriority,
                    comparisonOperator = comparisonOperator,
                    top = Top,
                    skip = Skip,
                };

                // Construct the API endpoint URL to retrieve the work items from the queue
                var queueWorkItemsEndpoint = $"workspace/api/queue/workitem/list";

                // Execute the API call to retrieve the work items from the queue
                var retrievedWorkItems = QueueApiExecutor.Execute(queueWorkItemsEndpoint, HttpMethod.Post, accessToken, payload).Result;

                // Set the output arguments
                Result.Set(context, retrievedWorkItems);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, "Work item retrieved successfully.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error retrieving work item: {ex.Message}");
                throw;
            }
        }
    }
}