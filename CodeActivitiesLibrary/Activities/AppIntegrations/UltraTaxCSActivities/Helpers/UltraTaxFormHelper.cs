using FlaUI.Core.AutomationElements;
using System.Linq;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System;

namespace CodeActivitiesLibrary.AppIntegrations.UltraTaxCSActivities.Helpers
{
    public class FormElementDetails
    {
        public int TabIndex { get; set; }
        public List<string> UniqueId { get; set; }
        public string Name { get; set; }
        public string ClassName { get; set; }
        public string ControlType { get; set; }
        public string FrameworkId { get; set; }
        public string AutomationId { get; set; }
        public bool IsEnabled { get; set; }
        public bool IsOffscreen { get; set; }
        public bool IsPassword { get; set; }
        public JObject BoundingRectangle { get; set; }
        public string LabelText { get; set; }
        public JArray SupportedPatterns { get; set; }
    }

    public static class UltraTaxFormHelper
    {
        public static HashSet<string> excludedAutomationIds = new HashSet<string>
        {
            "NonClientVerticalScrollBar", "UpButton", "DownButton", "UpPageButton", "DownPageButton", "ScrollbarThumb", "DropDown"
        };

        public static HashSet<string> excludedNames = new HashSet<string>
        {
            "Vertical", "Line up", "Line down", "Page up", "Page down", "Position", "Open"
        };

        public static HashSet<string> excludedControlTypes = new HashSet<string>
        {
            "ScrollBar", "Thumb", "Button"
        };

        public static List<string> GetUniqueId(int fieldIndex, AutomationElement element)
        {
            string uniqueId = $"{fieldIndex}";
            string fieldName = "";

            if (element.Properties.Name.ValueOrDefault != null)
            {
                fieldName = element.Properties.Name.ValueOrDefault.Trim();
                // Replace spaces and newlines in the name to create a unique identifier
                fieldName = fieldName.Replace(" ", "").Replace("\n", "").Replace("\r", "").Replace("\t", "").Replace("  ", "");
                fieldName = fieldName.Replace(":", "").Replace(";", "").Replace(",", "").Replace(".", "");
                fieldName = fieldName.Replace("-", "").Replace("(", "").Replace(")", "").Replace("+", "");
                fieldName = fieldName.Replace("'", "").Replace("\"", "").Replace("/", "").Replace("\\", "");
                fieldName = fieldName.Replace("?", "").Replace("!", "").Replace("&", "").Replace("#", "").Replace("$", "");
                fieldName = fieldName.Replace("@", "").Replace("*", "").Replace("=", "").Replace("<", "").Replace(">", "");
                fieldName = fieldName.Replace("`", "").Replace("~", "").Replace("|", "").Replace("{", "").Replace("}", "");
                fieldName = fieldName.Replace("+", "").Replace("*", "");
            }
            else
            {
                fieldName = "_NO_NAME";
            }
            // Generate a unique ID List based on the element's properties
            var uniqueIdList = new List<string>
            {
                $"{uniqueId}_{fieldName}_{element.Properties.ClassName.ValueOrDefault}_{element.Properties.ControlType.ToString()}_{element.Properties.FrameworkId.ValueOrDefault}",
                $"{uniqueId}_{element.Properties.ClassName.ValueOrDefault}_{element.Properties.ControlType.ToString()}_{element.Properties.FrameworkId.ValueOrDefault}",
            };

            return uniqueIdList;
        }

        public static JArray GetSupportedPatterns(AutomationElement element)
        {
            var patternNames = element.GetSupportedPatterns()
                    .Select(pattern => pattern.ToString().Split('[')[0].Trim())
                    .Where(name => !string.Equals(name, "LegacyIAccessible", StringComparison.OrdinalIgnoreCase))
                    .ToList();

            // Replace "Text2" and "Text" with "GetValue", and "Value" with "SetValue"
            for (int i = 0; i < patternNames.Count; i++)
            {
                if (patternNames[i] == "Text2" || patternNames[i] == "Text")
                    patternNames[i] = "GetValue";
                else if (patternNames[i] == "Value")
                    patternNames[i] = "SetValue";
                else if (patternNames[i] == "Invoke")
                    patternNames[i] = "Click";
            }

            // Ensure distinct after replacements
            return JArray.FromObject(patternNames.Distinct().ToList());
        }

        public static JObject GetBoundingRectangle(AutomationElement element)
        {
            var rect = element.Properties.BoundingRectangle.ValueOrDefault;
            return JObject.FromObject(new
            {
                X = rect.X,
                Y = rect.Y,
                Width = rect.Width,
                Height = rect.Height
            });
        }

        // Compare the two JObject instances for equality
        public static bool AreJObjectsEqual(JObject jObject1, JObject jObject2)
        {
            return JToken.DeepEquals(jObject1, jObject2);
        }

        // Returns a dictionary mapping UniqueId to the value from the JSON data
        public static Dictionary<string, string> GetFormFieldValuesFromMapping(JArray mappingArray, JObject jsonData)
        {
            var result = new Dictionary<string, string>();

            foreach (var mapping in mappingArray)
            {
                var uniqueIdsToken = mapping["UniqueId"];
                var apiFieldKey = mapping["ApiFieldKey"]?.ToString();

                if (uniqueIdsToken != null && uniqueIdsToken.Type == JTokenType.Array && !string.IsNullOrEmpty(apiFieldKey))
                {
                    var value = jsonData[apiFieldKey]?.ToString();
                    if (!string.IsNullOrEmpty(value))
                    {
                        foreach (var uniqueId in uniqueIdsToken)
                        {
                            var uniqueIdStr = uniqueId?.ToString();
                            if (!string.IsNullOrEmpty(uniqueIdStr))
                            {
                                result[uniqueIdStr] = value;
                            }
                        }
                    }
                }
            }

            return result;
        }
    }
}