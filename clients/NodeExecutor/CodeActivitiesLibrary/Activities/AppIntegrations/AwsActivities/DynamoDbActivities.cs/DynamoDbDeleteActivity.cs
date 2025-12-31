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
    [DisplayName("Delete AWS DynamoDB Item")]
    [Description("Deletes an item from AWS DynamoDB using the DeleteItem API.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class DynamoDbDeleteActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name or ID")]
        [Description("The name of the DynamoDB table to delete an item from.")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Return")]
        [Description("Specifies whether to return attribute values of the deleted item.")]
        public InArgument<ReturnEnum> Return { get; set; }

        [DisplayName("Keys")]
        [Description("The primary key(s) of the item to delete.")]
        [RenderIfCondition(nameof(Return), ReturnEnum.AttributeValues)]
        public InArgument<Dictionary<string, object>> Keys { get; set; }

        [DisplayName("Simplify")]
        [Description("If enabled, returns only the key values of the deleted item.")]
        public InArgument<bool> Simplify { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Optional additional fields to include in the request.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the DynamoDB table is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS DynamoDB.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Deleted Item")]
        [Description("The deleted item's attribute values (if Return = Attribute Values).")]
        public OutArgument<string> DeletedItem { get; set; }

        [DisplayName("Key Values")]
        [Description("The key values of the deleted item (if Simplify is enabled).")]
        public OutArgument<string> KeyValues { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                string vaultId = AWSServiceVaultId.Get(context);
                string tableName = TableName.Get(context);
                ReturnEnum returnMode = Return.Get(context);
                Dictionary<string, object> keys = Keys.Get(context);
                bool simplify = Simplify.Get(context);
                Dictionary<string, object> additionalFields = AdditionalFields.Get(context);
                string regionName = Region.Get(context);

                // Validate inputs
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

                if (keys == null || keys.Count == 0)
                    throw new ArgumentException("Keys are required to delete an item.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonDynamoDBClient(awsCreds, regionEndpoint))
                {
                    var request = new DeleteItemRequest
                    {
                        TableName = tableName,
                        Key = ConvertToAttributeValueMap(keys),
                        ReturnValues = returnMode == ReturnEnum.AttributeValues ? "ALL_OLD" : "NONE"
                    };

                    // Add additional fields
                    if (additionalFields != null)
                    {
                        foreach (var kvp in additionalFields)
                        {
                            request.Expected[kvp.Key] = new ExpectedAttributeValue
                            {
                                Value = ConvertToAttributeValue(kvp.Value)
                            };
                        }
                    }

                    var response = client.DeleteItemAsync(request).GetAwaiter().GetResult();

                    // Output based on mode
                    if (returnMode == ReturnEnum.AttributeValues)
                    {
                        var attributeValues = response.Attributes;
                        string jsonAttributes = JsonConvert.SerializeObject(attributeValues, Formatting.Indented);

                        DeletedItem.Set(context, jsonAttributes);
                        Response.Set(context, JsonConvert.SerializeObject(new
                        {
                            Success = true,
                            Message = "Item deleted successfully.",
                            DeletedItem = jsonAttributes,
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
                        // Return Nothing
                        DeletedItem.Set(context, null);
                        Response.Set(context, JsonConvert.SerializeObject(new
                        {
                            Success = true,
                            Message = "Item deleted successfully.",
                            RequestedAt = DateTime.UtcNow
                        }, Formatting.Indented));
                    }

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Deleted item from table: {tableName}");
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
                DeletedItem.Set(context, null);
                KeyValues.Set(context, null);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to delete DynamoDB item: {ex.Message}");
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

            // For complex objects (e.g., dictionaries)
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

    // Enum for Return mode
    public enum ReturnEnum
    {
        [Display(Name = "Attribute Values")]
        AttributeValues,

        [Display(Name = "Nothing")]
        Nothing
    }
}