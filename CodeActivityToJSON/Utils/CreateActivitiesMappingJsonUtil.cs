using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;

namespace CodeActivityToJSON.Utils
{
    public static class CreateActivitiesMappingJsonUtil
    {
        public static void CreateActivitiesMappingJson(string outputDir, List<Type> categoryMetadataTypes, List<Type> activities)
        {
            // Get primary json file path
            var baseJsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "BaseJSONs", "PrimaryCategory.json");

            if (!File.Exists(baseJsonFilePath))
            {
                Console.WriteLine("Base JSON file not found at: " + baseJsonFilePath);
                return;
            }

            // Read base JSON files first
            var baseJsonContent = File.ReadAllText(baseJsonFilePath);

            var settings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            };

            // Deserialize the base JSON content
            var primaryCategories = JsonConvert.DeserializeObject<List<PrimaryCategory>>(baseJsonContent, settings);

            // Loop through each primary category and find all sub categories and their activities
            foreach (var category in primaryCategories)
            {
                if (category.Label == null || category.Label == "AI Integrations") continue;

                // Initialize ActionCategories list if it is null
                category.ActionCategories = new List<ActionCategory>();

                // Get sub categories using ActivityCategoryMetadata attribute
                foreach (var categoryMetadataType in categoryMetadataTypes)
                {
                    // Get ActivityCategoryMetadata attribute from the type
                    var attribute = categoryMetadataType.GetCustomAttributes(typeof(ActivityCategoryMetadataAttribute), false).FirstOrDefault() as ActivityCategoryMetadataAttribute;
                    if (attribute == null) continue;

                    // Check if the attribute is not null and matches the primary category
                    if (attribute != null && attribute.PrimaryCategory == category.Label)
                    {
                        // Create ActionCategory object
                        var actionCategory = new ActionCategory
                        {
                            Label = attribute.Label,
                            Description = attribute.Description,
                            Icon = attribute.Icon,
                            Img = attribute.Img,
                            ListType = attribute.ListType,
                            Actions = new List<NodeAction>()
                        };

                        // Find all activities that belong to this sub category
                        foreach (var activity in activities)
                        {
                            // Not the same namespace as the category metadata type
                            if (categoryMetadataType.Namespace != activity.Namespace) continue;

                            // Get the DisplayName and Description attributes from the activity
                            var nodeType = activity.GetCustomAttributes(typeof(NodeTypeAttribute), false).FirstOrDefault() as NodeTypeAttribute;
                            var displayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                            var description = activity.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault() as DescriptionAttribute;
                            if (displayName == null || description == null) continue;

                            // Add the activity to the action category
                            actionCategory.Actions.Add(new NodeAction
                            {
                                Type = nodeType == null ? "activityNode" : nodeType.NodeType,
                                Name = activity.Name,
                                Label = displayName.DisplayName,
                                Description = description.Description,
                                DocsLink = "https://docs.aventisia.com",
                                Img = "/function.png",
                            });
                        }

                        // Add the action category to the primary category
                        category.ActionCategories.Add(actionCategory);
                    }
                }
            }

            // Save the primary categories to JSON file
            // var outputFilePath = Path.Combine(outputDir, "_ActionSelectorData.json");
            var outputFilePath = @"C:\My Space\Gitea\Aventisia\studio\src\features\action-selector\constants\_ActionSelectorData.json";
            using (var writer = new StreamWriter(outputFilePath))
            {
                var json = JsonConvert.SerializeObject(primaryCategories, Formatting.Indented, settings);
                writer.Write(json);
                Console.WriteLine($"Activities mapping JSON saved");
            }
        }
    }
}
