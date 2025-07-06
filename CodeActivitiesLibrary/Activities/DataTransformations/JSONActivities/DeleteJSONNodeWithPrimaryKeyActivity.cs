using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;
using System.Linq;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Delete JSON Node by Primary Key")]
    [Description("Recursively searches for an object with a matching primary key-value pair and deletes it from the structure.")]
   
    public class DeleteJSONNodeWithPrimaryKeyActivity : BaseCodeActivity
    {
        // Input Arguments
       
        [RequiredArgument]
        [DisplayName("JSON Token")]
        [Description("The root JSON token to begin searching. This can be a JObject, JArray, or any valid JToken type.")]
        public InArgument<JToken> JsonToken { get; set; }

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
                // Retrieve inputs
                JToken jsonToken = JsonToken.Get(context);
                string primaryKey = PrimaryKeyName.Get(context);
                string primaryValue = PrimaryKeyValue.Get(context);

                // Validate inputs
                if (jsonToken == null || string.IsNullOrWhiteSpace(primaryKey) || string.IsNullOrWhiteSpace(primaryValue))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid input: JSON Token, Primary Key Name, or Primary Key Value is missing.");
                    return;
                }

                // Perform deletion
                bool success = DeleteNodeHelper(jsonToken, primaryKey, primaryValue);

                // Set outputs
                IsSuccess.Set(context, success);
                StatusMessage.Set(context, success
                    ? $"Successfully deleted object with '{primaryKey}={primaryValue}'."
                    : $"No matching object found with '{primaryKey}={primaryValue}'.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting JSON node: {ex.Message}");
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Recursively finds an object where the primary key matches the given value,
        /// then deletes it from the parent array or object.
        /// </summary>
        private static bool DeleteNodeHelper(JToken token, string primaryKey, string primaryValue)
        {
            if (token.Type == JTokenType.Object)
            {
                JObject obj = (JObject)token;

                // Check if this object has the matching primary key
                JToken pkToken;
                if (obj.TryGetValue(primaryKey, out pkToken) && pkToken.ToString() == primaryValue)
                {
                    // Found match: remove from parent
                    if (obj.Parent is JArray array)
                    {
                        array.Remove(obj);
                        return true;
                    }
                    else if (obj.Parent is JObject parentObj)
                    {
                        foreach (var prop in parentObj.Properties())
                        {
                            if (prop.Value == obj)
                            {
                                prop.Remove();
                                return true;
                            }
                        }
                    }
                }

                // Search child properties
                foreach (var prop in obj.Properties().ToList())
                {
                    if (prop.Value != null)
                    {
                        bool result = DeleteNodeHelper(prop.Value, primaryKey, primaryValue);
                        if (result) return true;
                    }
                }
            }
            else if (token.Type == JTokenType.Array)
            {
                foreach (var item in token.Children().ToList())
                {
                    bool result = DeleteNodeHelper(item, primaryKey, primaryValue);
                    if (result) return true;
                }
            }

            return false;
        }
    }
}