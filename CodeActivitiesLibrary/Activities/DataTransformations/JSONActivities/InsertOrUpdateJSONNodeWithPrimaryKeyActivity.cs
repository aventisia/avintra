using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Insert or Update JSON Node by Primary Key")]
    [Description("Searches recursively through a JSON structure to find an object where a primary key matches a given value. If found, inserts or updates a specified key-value pair.")]
    public class InsertOrUpdateJSONNodeWithPrimaryKeyActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("JSON Content")]
        [Description("The root JSON token to begin searching. This can be a JSON string or a JToken.")]
        public InArgument<object> JsonContent { get; set; }

        [RequiredArgument]
        [DisplayName("Primary Key Name")]
        [Description("The name of the property used to identify the target object (e.g., 'id', 'name').")]
        public InArgument<string> PrimaryKeyName { get; set; }

        [RequiredArgument]
        [DisplayName("Primary Key Value")]
        [Description("The value of the primary key used to locate the target object.")]
        public InArgument<string> PrimaryKeyValue { get; set; }

        [RequiredArgument]
        [DisplayName("Target Key Name")]
        [Description("The name of the key to insert or update in the matched object.")]
        public InArgument<string> TargetKeyName { get; set; }

        [RequiredArgument]
        [DisplayName("Target Key Value")]
        [Description("The value to assign to the target key in the matched object.")]
        public InArgument<object> TargetKeyValue { get; set; }

        [DisplayName("Updated JSON Content")]
        [Description("The updated JSON content after inserting or updating the node.")]
        public OutArgument<JToken> UpdatedJsonContent { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Get input values
                var jsonInput = JsonContent.Get(context);
                var primaryKey = PrimaryKeyName.Get(context);
                var primaryValue = PrimaryKeyValue.Get(context)?.Trim();
                var targetKey = TargetKeyName.Get(context);
                var targetValue = TargetKeyValue.Get(context);

                if (jsonInput == null || string.IsNullOrWhiteSpace(primaryKey) || string.IsNullOrWhiteSpace(primaryValue))
                {
                    SetError(context, "JSON Content, Primary Key Name, or Primary Key Value is missing.");
                    return;
                }

                // Convert to JToken
                JToken jsonToken;
                if (jsonInput is string jsonString)
                {
                    jsonToken = JToken.Parse(jsonString);
                }
                else if (jsonInput is JToken jt)
                {
                    jsonToken = jt;
                }
                else
                {
                    SetError(context, "Unsupported JSON Content type. Please provide string or JToken.");
                    return;
                }

                // Convert value to JToken
                var jTargetValue = JToken.FromObject(targetValue);

                // Perform recursive update
                bool isUpdated = UpdateNode(jsonToken, primaryKey, primaryValue, targetKey, jTargetValue);

                // Set result
                UpdatedJsonContent.Set(context, jsonToken);
                if (isUpdated)
                {
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, $"Updated '{targetKey}' for matching node where {primaryKey} = {primaryValue}.");
                }
                else
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, $"No matching object found with {primaryKey} = {primaryValue}.");
                }
            }
            catch (Exception ex)
            {
                SetError(context, $"Error occurred: {ex.Message}");
            }
        }

        private static bool UpdateNode(JToken token, string primaryKey, string primaryValue, string targetKey, JToken targetValue)
        {
            switch (token.Type)
            {
                case JTokenType.Array:
                    foreach (var item in token.Children())
                    {
                        if (UpdateNode(item, primaryKey, primaryValue, targetKey, targetValue))
                            return true;
                    }
                    return false;

                case JTokenType.Object:
                    JObject obj = (JObject)token;

                    if (obj.TryGetValue(primaryKey, out var pkToken))
                    {
                        var tokenVal = pkToken?.ToString()?.Trim();
                        if (string.Equals(tokenVal, primaryValue, StringComparison.OrdinalIgnoreCase))
                        {
                            obj[targetKey] = targetValue;
                            return true;
                        }
                    }

                    // Recurse into all properties
                    foreach (var prop in obj.Properties())
                    {
                        if (UpdateNode(prop.Value, primaryKey, primaryValue, targetKey, targetValue))
                            return true;
                    }
                    return false;

                default:
                    return false;
            }
        }

        private void SetError(CodeActivityContext context, string message)
        {
            UpdatedJsonContent.Set(context, null);
            IsSuccess.Set(context, false);
            StatusMessage.Set(context, message);
        }
    }
}