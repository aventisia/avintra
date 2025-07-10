using CodeActivitiesLibrary.Extensions;
using Newtonsoft.Json;
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
        [RequiredArgument]
        [DisplayName("JSON Content")]
        [Description("The JSON content to begin searching. This can be a JSON string or a JToken.")]
        public InArgument<object> JsonContent { get; set; }
        [RequiredArgument]
        [DisplayName("Key to Find")]
        [Description("The name of the JSON key to locate in the structure. Search is recursive and case-sensitive.")]
        public InArgument<string> KeyToFind { get; set; }
        [DisplayName("Result List")]
        [Description("A list of matching JTokens found under the specified key. If no matches are found, returns an empty list.")]
        public OutArgument<List<JToken>> ResultList { get; set; }
        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                object jsonContent = JsonContent.Get(context);
                string keyToFind = KeyToFind.Get(context);
                if (jsonContent == null || string.IsNullOrWhiteSpace(keyToFind))
                {
                    ResultList.Set(context, new List<JToken>());
                    IsSuccess.Set(context, false);
                    StatusMessage.Set(context, "Invalid input: JsonContent or KeyToFind is null/empty.");
                    return;
                }
                JToken jToken = jsonContent is string
                    ? JToken.Parse((string)jsonContent)
                    : (JToken)jsonContent;
                List<JToken> result = FindAllValuesHelper(jToken, keyToFind);
                ResultList.Set(context, result);
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Found {result.Count} matching nodes for key '{keyToFind}'.");
            }
            catch (Exception ex)
            {
                ResultList.Set(context, new List<JToken>());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error finding JSON nodes: {ex.Message}");
            }
        }
        private static List<JToken> FindAllValuesHelper(JToken token, string keyToFind)
        {
            List<JToken> results = new List<JToken>();
            if (token.Type == JTokenType.Object)
            {
                foreach (JProperty property in token.Children<JProperty>())
                {
                    if (property.Name == keyToFind)
                        results.Add(property.Value);
                    results.AddRange(FindAllValuesHelper(property.Value, keyToFind));
                }
            }
            else if (token.Type == JTokenType.Array)
            {
                foreach (JToken element in token.Children())
                {
                    results.AddRange(FindAllValuesHelper(element, keyToFind));
                }
            }
            return results;
        }
    }
}