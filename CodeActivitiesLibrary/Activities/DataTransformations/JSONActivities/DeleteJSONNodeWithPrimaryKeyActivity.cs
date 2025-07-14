using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;
namespace CodeActaivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Delete JSON Node by Primary Key")]
    [Description("Recursively searches for an object with a matching primary key-value pair and deletes it from the structure.")]

    public class DeleteJSONNodeWithPrimaryKeyActivity : BaseCodeActivity
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
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                object jsonContent = JsonContent.Get(context);
                string primaryKey = PrimaryKeyName.Get(context);
                string primaryValue = PrimaryKeyValue.Get(context);
                if (jsonContent == null || string.IsNullOrWhiteSpace(primaryKey) || string.IsNullOrWhiteSpace(primaryValue))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid input: JSON Content, Primary Key Name, or Primary Key Value is missing.");
                    return;
                }
                JToken jToken = jsonContent is string
                    ? JToken.Parse((string)jsonContent)
                    : (JToken)jsonContent;
                bool success = DeleteNodeHelper(jToken, primaryKey, primaryValue);

                // Set outputs
                IsSuccess.Set(context, success);
                StatusMessage.Set(context, success
                    ? $"Successfully deleted object with '{primaryKey}={primaryValue}'."
                    : $"No matching object found with '{primaryKey}={primaryValue}'.");
            }
            catch (Exception ex)
            {
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error deleting JSON node: {ex.Message}");
            }
        }
        
        private static bool DeleteNodeHelper(JToken token, string primaryKey, string primaryValue)
        {
            if (token.Type == JTokenType.Object)
            {
                JObject obj = (JObject)token;
                if (obj.TryGetValue(primaryKey, out JToken pkToken))
                {
                    // Extract the raw string value of the token
                    string pkStringValue = pkToken.Value<string>();

                    // Compare the extracted value with the primary key value
                    if (pkStringValue != null && pkStringValue.Equals(primaryValue, StringComparison.OrdinalIgnoreCase))
                    {
                        if (obj.Parent is JArray array)
                        {
                            array.Remove(obj);
                            return true;
                        }
                        else if (obj.Parent is JObject parentObj)
                        {
                            parentObj.Remove(obj.Path);
                            return true;
                        }
                    }
                }

                // Recursively search child properties
                foreach (var prop in obj.Properties().ToList())
                {
                    if (prop.Value != null && DeleteNodeHelper(prop.Value, primaryKey, primaryValue))
                    {
                        return true;
                    }
                }
            }
            else if (token.Type == JTokenType.Array)
            {
                foreach (var item in token.Children().ToList())
                {
                    if (DeleteNodeHelper(item, primaryKey, primaryValue))
                    {
                        return true;
                    }
                }
            }

            return false;
        }
    }
}