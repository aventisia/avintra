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
using System.Linq;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Get AWS DynamoDB Item")]
    [Description("Retrieves an item from AWS DynamoDB using the GetItem API. Always returns all attributes.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class DynamoDbGetActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name or ID")]
        [Description("The name of the DynamoDB table to retrieve an item from.")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Keys")]
        [Description("The primary key(s) of the item to retrieve.")]
        public InArgument<Dictionary<string, object>> Keys { get; set; }

        [DisplayName("Simplify")]
        [Description("If enabled, returns only the key values of the retrieved item.")]
        public InArgument<bool> Simplify { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the DynamoDB table is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS DynamoDB.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Retrieved Item")]
        [Description("The retrieved item's attribute values.")]
        public OutArgument<string> RetrievedItem { get; set; }

        [DisplayName("Key Values")]
        [Description("The key values of the retrieved item (if Simplify is enabled).")]
        public OutArgument<string> KeyValues { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string tableName = TableName.Get(context);
                Dictionary<string, object> keys = Keys.Get(context);
                bool simplify = Simplify.Get(context);
                string regionName = Region.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

                if (keys == null || keys.Count == 0)
                    throw new ArgumentException("Keys are required to retrieve an item.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonDynamoDBClient(awsCreds, regionEndpoint))
                {
                    var request = new GetItemRequest
                    {
                        TableName = tableName,
                        Key = ConvertToAttributeValueMap(keys),
                        ConsistentRead = true
                    };

                    var response = client.GetItemAsync(request).GetAwaiter().GetResult();

                    // Output based on result
                    if (response.Item != null && response.Item.Count > 0)
                    {
                        string jsonItem = JsonConvert.SerializeObject(response.Item, Formatting.Indented);

                        RetrievedItem.Set(context, jsonItem);
                        Response.Set(context, JsonConvert.SerializeObject(new
                        {
                            Success = true,
                            Message = "Item retrieved successfully.",
                            RetrievedItem = jsonItem,
                            RequestedAt = DateTime.UtcNow
                        }, Formatting.Indented));

                        // If Simplify is enabled, return only keys
                        if (simplify)
                        {
                            var keyValues = new Dictionary<string, object>();
                            foreach (var kvp in keys)
                            {
                                keyValues[kvp.Key] = kvp.Value;
                            }
                            KeyValues.Set(context, JsonConvert.SerializeObject(keyValues));
                        }
                    }
                    else
                    {
                        RetrievedItem.Set(context, "{}");
                        Response.Set(context, JsonConvert.SerializeObject(new
                        {
                            Success = true,
                            Message = "Item not found.",
                            RetrievedItem = "{}",
                            RequestedAt = DateTime.UtcNow
                        }, Formatting.Indented));
                    }

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Retrieved item from table: {tableName}");
                }
            }
            catch (Exception ex)
            {
                string errorResponse = JsonConvert.SerializeObject(new
                {
                    Success = false,
                    Error = ex.Message,
                    InnerException = ex.InnerException?.Message,
                    Type = ex.GetType().Name
                }, Formatting.Indented);

                Response.Set(context, errorResponse);
                RetrievedItem.Set(context, null);
                KeyValues.Set(context, null);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to retrieve DynamoDB item: {ex.Message}");
            }
        }

        // Helper: Convert dictionary to AttributeValue map
        private Dictionary<string, AttributeValue> ConvertToAttributeValueMap(Dictionary<string, object> dict)
        {
            var result = new Dictionary<string, AttributeValue>();
            foreach (var kvp in dict)
            {
                result[kvp.Key] = ConvertToAttributeValue(kvp.Value);
            }
            return result;
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
}