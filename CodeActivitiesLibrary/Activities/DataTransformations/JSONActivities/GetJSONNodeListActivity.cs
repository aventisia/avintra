using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json.Linq;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;

namespace CodeActivitiesLibrary.DataTransformations.JSONActivities
{
    [DisplayName("Find JSON Nodes by Key")]
    [Description("Recursively searches through a JSON structure and returns all values associated with the specified key.")]
   
    public class GetJSONNodeListActivity : BaseCodeActivity
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

        [DisplayName("Result List")]
        [Description("A list of matching JTokens found under the specified key. If no matches are found, returns an empty list.")]     
        public OutArgument<List<JToken>> ResultList { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                // Retrieve input values
                JToken jToken = JsonToken.Get(context);
                string keyToFind = KeyToFind.Get(context);

                // Validate inputs
                if (jToken == null || string.IsNullOrWhiteSpace(keyToFind))
                {
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid input: JsonToken or KeyToFind is null/empty.");
                    ResultList.Set(context, new List<JToken>());
                    return;
                }

                // Perform recursive search
                List<JToken> result = FindAllValuesHelper(jToken, keyToFind);

                // Set outputs
                ResultList.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Found {result.Count} matching nodes for key '{keyToFind}'.");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error finding JSON nodes: {ex.Message}");
                ResultList.Set(context, new List<JToken>());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error: {ex.Message}");
            }
        }

        /// Recursively searches through the JToken for all occurrences of the given key.
        private static List<JToken> FindAllValuesHelper(JToken token, string keyToFind)
        {
            List<JToken> results = new List<JToken>();
            switch (token.Type)
            {
                case JTokenType.Object:
                    foreach (JProperty property in token.Children<JProperty>())
                    {
                        if (property.Name == keyToFind)
                            results.Add(property.Value);
                        results.AddRange(FindAllValuesHelper(property.Value, keyToFind));
                    }
                    break;

                case JTokenType.Array:
                    foreach (JToken element in token.Children())
                    {
                        results.AddRange(FindAllValuesHelper(element, keyToFind));
                    }
                    break;
            }
            return results;
        }
    }
}