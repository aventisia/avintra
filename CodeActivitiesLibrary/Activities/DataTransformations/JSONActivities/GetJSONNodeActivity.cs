using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Get First JSON Node by Key")]
    [Description("Recursively searches through a JSON structure and returns the first value associated with the specified key.")]
    public class GetJSONNodeActivity : BaseCodeActivity
    {
        // Input Arguments
          
        [RequiredArgument]
        [DisplayName("JSON Token")]
        [Description("The root JSON token to begin searching. This can be a JObject, JArray, or any valid JToken type.")]
        public InArgument<JToken> JsonToken { get; set; }

        [RequiredArgument]
        [DisplayName("Key to Find")]
        [Description("The name of the JSON key to locate in the structure. Search is recursive and case-sensitive.")]
        public InArgument<string> KeyToFind { get; set; }

        // Output Arguments
        [DisplayName("Result Node")]
        [Description("The first matching JToken found under the specified key. Returns null if no match is found or an error occurs.")]

        public OutArgument<JToken> ResultNode { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve inputs from context
                JToken jToken = JsonToken.Get(context);
                string keyToFind = KeyToFind.Get(context);

                // Validate inputs
                if (jToken == null || string.IsNullOrWhiteSpace(keyToFind))
                {
                    ResultNode.Set(context, null);
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid input: JsonToken or KeyToFind is null/empty.");
                    return;
                }

                // Perform the recursive search
                JToken result = FindValueHelper(jToken, keyToFind);

                // Set output values
                ResultNode.Set(context, result);
                IsSuccess.Set(context, result != null);
                StatusMessage.Set(context, result != null
                    ? $"Found matching node for key '{keyToFind}'."
                    : $"No matching node found for key '{keyToFind}'.");
            }
            catch (Exception ex)
            {
                ResultNode.Set(context, null);
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error finding JSON node: {ex.Message}");
            }
        }

          /// Recursively searches through the JToken for the first occurrence of the given key.
        private static JToken FindValueHelper(JToken token, string keyToFind)
        {
            if (token.Type == JTokenType.Object)
            {
                foreach (JProperty property in token.Children<JProperty>())
                {
                    if (property.Name == keyToFind)
                        return property.Value;
                    JToken result = FindValueHelper(property.Value, keyToFind);
                    if (result != null)
                        return result;
                }
            }
            else if (token.Type == JTokenType.Array)
            {
                foreach (JToken element in token.Children())
                {
                    JToken result = FindValueHelper(element, keyToFind);
                    if (result != null)
                        return result;
                }
            }

            return null;
        }
    }
}