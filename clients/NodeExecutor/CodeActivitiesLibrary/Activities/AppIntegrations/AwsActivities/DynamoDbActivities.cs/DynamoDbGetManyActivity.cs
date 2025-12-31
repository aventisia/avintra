using Amazon;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Runtime;
using CodeActivitiesLibrary.AppIntegrations.AwsActivities.Helper;
using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Get Many AWS DynamoDB Items")]
    [Description("Retrieves multiple items from AWS DynamoDB using Query or Scan API.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class DynamoDbGetManyActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name or ID")]
        [Description("The name of the DynamoDB table to retrieve items from.")]
        public InArgument<string> TableName { get; set; }

        [DisplayName("Scan")]
        [Description("If enabled, performs a full table scan instead of a query.")]
        public InArgument<bool> Scan { get; set; }

        [DisplayName("Key Condition Expression")]
        [Description("The condition expression for querying items (e.g., 'id = :id').")]
        [RenderIfCondition(nameof(Scan), false)]
        public InArgument<string> KeyConditionExpression { get; set; }

        [DisplayName("Filter Expression")]
        [Description("The filter expression to apply after scanning (e.g., 'status = 'active'').")]
        [RenderIfCondition(nameof(Scan), true)]
        public InArgument<string> FilterExpression { get; set; }

        [DisplayName("Expression Attribute Values")]
        [Description("Values for placeholders in condition or filter expressions.")]
        public InArgument<Dictionary<string, object>> ExpressionAttributeValues { get; set; }

        [DisplayName("Return All")]
        [Description("If enabled, retrieves all items (with pagination). Otherwise, limits results by 'Limit'.")]
        public InArgument<bool> ReturnAll { get; set; }

        [DisplayName("Limit")]
        [Description("Maximum number of items to return per page (max 100). Default: 50.")]
        [DefaultValue(50)]
        [RenderIfCondition(nameof(ReturnAll), false)]
        public InArgument<int> Limit { get; set; }

        [DisplayName("Select")]
        [Description("Specifies which attributes to return.")]
        public InArgument<SelectEnum> Select { get; set; }

        [DisplayName("Simplify")]
        [Description("If enabled, returns only the key values of the retrieved items.")]
        public InArgument<bool> Simplify { get; set; }

        [DisplayName("Options")]
        [Description("Additional options for the request.")]
        public InArgument<Dictionary<string, object>> Options { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the DynamoDB table is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("Items")]
        [Description("List of retrieved items (attribute values).")]
        public OutArgument<string> Items { get; set; }

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS DynamoDB.")]
        public OutArgument<string> Response { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string tableName = TableName.Get(context);
                bool scan = Scan.Get(context);
                string keyConditionExpression = KeyConditionExpression.Get(context);
                string filterExpression = FilterExpression.Get(context);
                Dictionary<string, object> expressionAttributeValues = ExpressionAttributeValues.Get(context);
                bool returnAll = ReturnAll.Get(context);
                int limit = Limit.Get(context);
                SelectEnum selectMode = Select.Get(context);
                bool simplify = Simplify.Get(context);
                Dictionary<string, object> options = Options.Get(context);
                string regionName = Region.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

                if (limit < 1 || limit > 100)
                    throw new ArgumentException("Limit must be between 1 and 100.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // ✅ Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonDynamoDBClient(awsCreds, regionEndpoint))
                {
                    var allItems = new List<Dictionary<string, AttributeValue>>();

                    if (scan)
                    {
                        var scanRequest = new ScanRequest
                        {
                            TableName = tableName,
                            FilterExpression = filterExpression,
                            Limit = limit,
                            ConsistentRead = true
                        };

                        // Set Select mode
                        switch (selectMode)
                        {
                            case SelectEnum.AllAttributes:
                                scanRequest.Select = "ALL_ATTRIBUTES";
                                break;
                            case SelectEnum.AllProjectedAttributes:
                                scanRequest.Select = "ALL_PROJECTED_ATTRIBUTES";
                                break;
                            case SelectEnum.SpecificAttributes:
                                scanRequest.Select = "SPECIFIC_ATTRIBUTES";
                                break;
                        }

                        // Add expression attribute values
                        if (expressionAttributeValues != null)
                        {
                            foreach (var kvp in expressionAttributeValues)
                            {
                                scanRequest.ExpressionAttributeValues[kvp.Key] = ConvertToAttributeValue(kvp.Value);
                            }
                        }

                        // Add options (if any)
                        if (options != null)
                        {
                            // Example: add IndexName
                            if (options.TryGetValue("IndexName", out object indexName))
                            {
                                scanRequest.IndexName = indexName.ToString();
                            }
                        }

                        // Handle pagination
                        do
                        {
                            var response = client.ScanAsync(scanRequest).GetAwaiter().GetResult();
                            allItems.AddRange(response.Items);

                            // Update for next page
                            scanRequest.ExclusiveStartKey = response.LastEvaluatedKey;
                        } while (returnAll && scanRequest.ExclusiveStartKey != null && allItems.Count < 1000);
                    }
                    else
                    {
                        var queryRequest = new QueryRequest
                        {
                            TableName = tableName,
                            KeyConditionExpression = keyConditionExpression,
                            Limit = limit,
                            ConsistentRead = true
                        };

                        // Set Select mode
                        switch (selectMode)
                        {
                            case SelectEnum.AllAttributes:
                                queryRequest.Select = "ALL_ATTRIBUTES";
                                break;
                            case SelectEnum.AllProjectedAttributes:
                                queryRequest.Select = "ALL_PROJECTED_ATTRIBUTES";
                                break;
                            case SelectEnum.SpecificAttributes:
                                queryRequest.Select = "SPECIFIC_ATTRIBUTES";
                                break;
                        }

                        // Add expression attribute values
                        if (expressionAttributeValues != null)
                        {
                            foreach (var kvp in expressionAttributeValues)
                            {
                                queryRequest.ExpressionAttributeValues[kvp.Key] = ConvertToAttributeValue(kvp.Value);
                            }
                        }

                        // Add options (if any)
                        if (options != null)
                        {
                            if (options.TryGetValue("IndexName", out object indexName))
                            {
                                queryRequest.IndexName = indexName.ToString();
                            }
                        }

                        // Handle pagination
                        do
                        {
                            var response = client.QueryAsync(queryRequest).GetAwaiter().GetResult();
                            allItems.AddRange(response.Items);

                            // Update for next page
                            queryRequest.ExclusiveStartKey = response.LastEvaluatedKey;
                        } while (returnAll && queryRequest.ExclusiveStartKey != null && allItems.Count < 1000);
                    }

                    // Apply limit if not returning all
                    if (!returnAll && allItems.Count > limit)
                    {
                        allItems = allItems.Take(limit).ToList();
                    }

                    // Convert to JSON output
                    string jsonResponse = JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = $"Retrieved {allItems.Count} items.",
                        Items = allItems.Select(item => JsonConvert.SerializeObject(item, Formatting.Indented)).ToList(),
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented);

                    Items.Set(context, JsonConvert.SerializeObject(allItems));
                    Response.Set(context, jsonResponse);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved {allItems.Count} items.");
                }
            }
            catch (Exception ex)
            {

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve Many AWS DynamoDB Item : {ex.Message}");
            }
        }

        // Helper: Convert .NET object to DynamoDB AttributeValue
        private AttributeValue ConvertToAttributeValue(object value)
        {
            if (value == null) return null;

            if (value is string str) return new AttributeValue { S = str };
            if (value is int intVal) return new AttributeValue { N = intVal.ToString() };
            if (value is long longVal) return new AttributeValue { N = longVal.ToString() };
            if (value is double doubleVal) return new AttributeValue { N = doubleVal.ToString() };
            if (value is bool boolVal) return new AttributeValue { BOOL = boolVal };
            if (value is DateTime dt) return new AttributeValue { S = dt.ToString("o") };
            if (value is Guid guid) return new AttributeValue { S = guid.ToString() };

            if (value is IDictionary<string, object> dict)
            {
                var av = new AttributeValue { M = new Dictionary<string, AttributeValue>() };
                foreach (var kvp in dict)
                {
                    av.M[kvp.Key] = ConvertToAttributeValue(kvp.Value);
                }
                return av;
            }

            return new AttributeValue { S = value.ToString() };
        }
    }

    // Enum for Select mode
    public enum SelectEnum
    {
        [Display(Name = "All Attributes")]
        AllAttributes,

        [Display(Name = "All Projected Attributes")]
        AllProjectedAttributes,

        [Display(Name = "Specific Attributes")]
        SpecificAttributes
    }
}