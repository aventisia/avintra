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
using System.Reflection;

namespace CodeActivitiesLibrary.AppIntegrations.AwsActivities
{
    [DisplayName("Create or Update AWS DynamoDB Item")]
    [Description("Creates or updates an item in AWS DynamoDB using the PutItem API.")]
    [ActivityMetaData(nodeImg:"/assets/AWS.svg")]
    public class DynamoDbCreateOrUpdateActivity : BaseCodeActivity
    {
        #region Inputs

        [RequiredArgument]
        [DisplayName("Credential to connect with")]
        [Description("Select the AWS credential to use for authentication (AWSServiceVaultId).")]
        public InArgument<string> AWSServiceVaultId { get; set; }

        [RequiredArgument]
        [DisplayName("Table Name or ID")]
        [Description("The name of the DynamoDB table to create or update an item in.")]
        public InArgument<string> TableName { get; set; }

        [RequiredArgument]
        [DisplayName("Data to Send")]
        [Description("Choose how to send data: auto-map all inputs or define each column manually.")]
        public InArgument<DataToSendModeEnum> DataToSend { get; set; }

        [DisplayName("Inputs to ignore")]
        [Description("Comma-separated list of input property names to ignore when auto-mapping.")]
        [RenderIfCondition(nameof(DataToSend), DataToSendModeEnum.AutoMap)]
        public InArgument<string> InputsToIgnore { get; set; }

        [DisplayName("Fields to Send")]
        [Description("List of fields to send when manually defining columns.")]
        [RenderIfCondition(nameof(DataToSend), DataToSendModeEnum.DefineBelowForEachColumn)]
        public InArgument<Dictionary<string, object>> FieldsToSend { get; set; }

        [DisplayName("Additional Fields")]
        [Description("Optional additional fields to include in the item.")]
        public InArgument<Dictionary<string, object>> AdditionalFields { get; set; }

        [DisplayName("AWS Region")]
        [Description("The AWS region where the DynamoDB table is located (e.g., us-east-1). Default: us-east-1.")]
        public InArgument<string> Region { get; set; }

        #endregion

        #region Outputs

        [DisplayName("API Response")]
        [Description("Raw JSON response from AWS DynamoDB.")]
        public OutArgument<string> Response { get; set; }

        [DisplayName("Item Key")]
        [Description("The primary key of the created/updated item.")]
        public OutArgument<string> ItemKey { get; set; }

        #endregion

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var vaultId = AWSServiceVaultId.Get(context);
                var tableName = TableName.Get(context);
                var dataToSend = DataToSend.Get(context);
                var inputsToIgnore = InputsToIgnore.Get(context);
                var fieldsToSend = FieldsToSend.Get(context);
                var additionalFields = AdditionalFields.Get(context);
                var regionName = Region.Get(context) ?? "us-east-1";

                // Validate inputs
                if (string.IsNullOrWhiteSpace(tableName))
                    throw new ArgumentException("Table Name is required.");

                var regionEndpoint = RegionEndpoint.GetBySystemName(regionName);

                // Fetch AWS credentials from AWE Vault
                AWSCredentials awsCreds = AwsCredentialManager.GetCredentials(vaultId);

                using (var client = new AmazonDynamoDBClient(awsCreds, regionEndpoint))
                {
                    var request = new PutItemRequest
                    {
                        TableName = tableName,
                        Item = new Dictionary<string, AttributeValue>()
                    };

                    // Build item attributes
                    if (dataToSend == DataToSendModeEnum.AutoMap)
                    {
                        // Auto-map all input arguments except ignored ones
                        var ignoredNames = string.IsNullOrWhiteSpace(inputsToIgnore)
                            ? new HashSet<string>()
                            : new HashSet<string>(inputsToIgnore.Split(',').Select(s => s.Trim()), StringComparer.OrdinalIgnoreCase);

                        // Get all input values from context
                        var inputValues = GetAllInputValues(context);

                        foreach (var kvp in inputValues)
                        {
                            string name = kvp.Key;
                            object value = kvp.Value;

                            // Skip system or ignored fields
                            if (ignoredNames.Contains(name))
                                continue;

                            if (value != null)
                            {
                                request.Item[name] = ConvertToAttributeValue(value);
                            }
                        }
                    }
                    else if (dataToSend == DataToSendModeEnum.DefineBelowForEachColumn)
                    {
                        // Manually defined fields
                        if (fieldsToSend != null)
                        {
                            foreach (var kvp in fieldsToSend)
                            {
                                request.Item[kvp.Key] = ConvertToAttributeValue(kvp.Value);
                            }
                        }
                    }

                    // Add additional fields
                    if (additionalFields != null)
                    {
                        foreach (var kvp in additionalFields)
                        {
                            request.Item[kvp.Key] = ConvertToAttributeValue(kvp.Value);
                        }
                    }

                    // Call DynamoDB API
                    var response = client.PutItemAsync(request).GetAwaiter().GetResult();

                    // Extract primary key (first attribute in Item)
                    string itemKey = request.Item.FirstOrDefault().Key;

                    // Output
                    this.Response.Set(context, JsonConvert.SerializeObject(new
                    {
                        Success = true,
                        Message = "Item created or updated successfully.",
                        ItemKey = itemKey,
                        RequestedAt = DateTime.UtcNow
                    }, Formatting.Indented));

                    this.ItemKey.Set(context, itemKey);

                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Created/Updated item in table: {tableName}");
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
                ItemKey.Set(context, null);

                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Failed to create/update DynamoDB item: {ex.Message}");
            }
        }

        // Helper: Get all input argument values using reflection
        private Dictionary<string, object> GetAllInputValues(CodeActivityContext context)
        {
            var values = new Dictionary<string, object>();
            var properties = this.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);

            foreach (var prop in properties)
            {
                var inArg = prop.GetValue(this) as InArgument;
                if (inArg != null)
                {
                    try
                    {
                        var value = inArg.Get(context);
                        values[prop.Name] = value;
                    }
                    catch
                    {
                        // Ignore if value can't be retrieved
                        IsSuccess.Set(context, false);
                    }
                }
            }

            return values;
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

            // Fallback: convert to string
            return new AttributeValue { S = value.ToString() };
        }
    }

    // Enum for Data to Send mode
    public enum DataToSendModeEnum
    {
        [Display(Name = "Auto-Map Input Data to Columns")]
        AutoMap,

        [Display(Name = "Define Below for Each Column")]
        DefineBelowForEachColumn
    }
}