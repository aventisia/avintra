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
        public InArgument<JToken> TargetKeyValue { get; set; }
        [DisplayName("Updated JSON Content")]
        [Description("The updated JSON content after inserting or updating the node.")]
        public OutArgument<JToken> UpdatedJsonContent { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                object jsonContent = JsonContent.Get(context);
                string primaryKey = PrimaryKeyName.Get(context);
                string primaryValue = PrimaryKeyValue.Get(context);
                string targetKey = TargetKeyName.Get(context);
                JToken targetValue = TargetKeyValue.Get(context);
                if (jsonContent == null || string.IsNullOrWhiteSpace(primaryKey) || string.IsNullOrWhiteSpace(primaryValue))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid input: JSON Content, Primary Key Name, or Primary Key Value is missing.");
                    return;
                }
                JToken jToken = jsonContent is string
                    ? JToken.Parse((string)jsonContent)
                    : (JToken)jsonContent;
                bool success = InsertOrUpdateNodeHelper(jToken, primaryKey, primaryValue, targetKey, targetValue);
                IsSuccess.Set(context, success);
                StatusMessage.Set(context, success
                    ? $"Successfully updated '{targetKey}' in object where '{primaryKey}={primaryValue}'."
                    : $"No matching object found with '{primaryKey}={primaryValue}'.");
                UpdatedJsonContent.Set(context, jToken);
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
                throw;
            }
        }
        private static bool InsertOrUpdateNodeHelper(JToken token, string primaryKey, string primaryValue, string targetKey, JToken targetValue)
        {
            if (token == null)
            {
                return false;
            }
            if (token.Type == JTokenType.Array)
            {
                foreach (var item in token.Children())
                {
                    if (InsertOrUpdateNodeHelper(item, primaryKey, primaryValue, targetKey, targetValue))
                    {
                        return true;
                    }
                }
            }
            else if (token.Type == JTokenType.Object)
            {
                JObject obj = (JObject)token;
                if (obj.TryGetValue(primaryKey, out JToken pkToken))
                {
                    string tokenValue = pkToken.Value<string>();
                    if (string.Equals(tokenValue, primaryValue, StringComparison.OrdinalIgnoreCase))
                    {
                        obj[targetKey] = targetValue;
                        return true;
                    }
                }
                foreach (var prop in obj.Properties())
                {
                    if (InsertOrUpdateNodeHelper(prop.Value, primaryKey, primaryValue, targetKey, targetValue))
                    {
                        return true;
                    }
                }
            }
            return false;
        }
    }
}