using CodeActivitiesLibrary.Extensions;
using System;
using System.Activities;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using Newtonsoft.Json;

namespace CodeActivitiesLibrary.DataTransformations.VariablesActivities
{
    [DisplayName("Parse Fragmented JSON List")]
    [Description("Converts a list of JSON string fragments (e.g., from Add Item to List) into a list of proper objects.")]
    public class ParseFragmentedJsonListActivity : BaseCodeActivity
    {
        [RequiredArgument]
        [DisplayName("Fragmented List")]
        [Description("The list containing JSON fragments like \"{prop:\\\"value\\\"}\".")]
        public InArgument<List<object>> FragmentedList { get; set; }

        [DisplayName("Parsed List")]
        [Description("The reconstructed list of objects ready for sorting.")]
        public OutArgument<List<object>> ParsedList { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            try
            {
                var inputList = FragmentedList.Get(context);

                if (inputList == null || !inputList.Any())
                {
                    ParsedList.Set(context, new List<object>());
                    IsSuccess.Set(context, true);
                    StatusMessage.Set(context, "Input list is empty.");
                    return;
                }

                // Ensure all items are strings
                if (!inputList.All(item => item is string))
                {
                    throw new ArgumentException("All items in the input list must be strings.");
                }

                var stringList = inputList.Cast<string>().ToList();
                var reconstructed = ReconstructObjectsFromFragments(stringList);

                ParsedList.Set(context, reconstructed.Cast<object>().ToList());
                IsSuccess.Set(context, true);
                StatusMessage.Set(context, $"Successfully parsed {reconstructed.Count} object(s).");
            }
            catch (Exception ex)
            {
                ParsedList.Set(context, new List<object>());
                IsSuccess.Set(context, false);
                StatusMessage.Set(context, $"Error parsing fragmented JSON list: {ex.Message}");
            }
        }

        private List<Dictionary<string, object>> ReconstructObjectsFromFragments(List<string> fragments)
        {
            var objects = new List<Dictionary<string, object>>();
            var currentLines = new List<string>();

            foreach (var fragment in fragments)
            {
                var clean = fragment.Trim().Trim('"');

                // Finalize previous object if last line ended with '}'
                if (currentLines.Count > 0)
                {
                    string lastLine = currentLines[currentLines.Count - 1];
                    if (lastLine.EndsWith("}"))
                    {
                        TryBuildObject(currentLines, objects);
                        currentLines.Clear();
                    }
                }

                clean = clean.TrimStart('{').TrimEnd('}').Trim();
                if (!string.IsNullOrEmpty(clean))
                {
                    currentLines.Add(clean);
                }

                // Finalize if fragment contains '}'
                if (fragment.Contains("}"))
                {
                    if (currentLines.Count > 0)
                    {
                        TryBuildObject(currentLines, objects);
                        currentLines.Clear();
                    }
                }
            }

            // Handle leftover
            if (currentLines.Count > 0)
            {
                TryBuildObject(currentLines, objects);
            }

            return objects;
        }

        private void TryBuildObject(List<string> lines, List<Dictionary<string, object>> target)
        {
            try
            {
                string json = "{" + string.Join(",", lines) + "}";
                var obj = JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
                if (obj != null)
                {
                    target.Add(obj);
                }
            }
            catch
            {
                // Skip invalid
            }
        }
    }
}