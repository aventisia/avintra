using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;

namespace CodeActivityToJSON.Utils
{
    public static class CreateDevActivitiesMappingJsonUtil
    {
        private static List<string> _excludedCategories = new List<string>
        {
            "None",
        };

        private static List<string> _excludedActivities = new List<string>
        {
            "ConditionalBranchActivity",
        };

        public static void CreateDevActivitiesMappingJson(string outputDir, List<Type> categoryMetadataTypes, List<Type> activities)
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
                if (category.Label == null) continue;

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
                        if (_excludedCategories.Contains(attribute.Label))
                        {
                            Console.WriteLine($"Skipping category {attribute.Label} for dev mapping file");
                            continue;
                        }

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

                            // Skip excluded categories
                            if (_excludedCategories.Contains(activity.Namespace))
                            {
                                Console.WriteLine($"Skipping category {activity.Namespace} for prod mapping file");
                                continue;
                            }

                            // Skip excluded activities
                            if (_excludedActivities.Contains(activity.Name))
                            {
                                Console.WriteLine($"Skipping activity {activity.Name} for dev mapping file");
                                continue;
                            }

                            // Get the DisplayName and Description attributes from the activity
                            var activityMetaData = activity.GetCustomAttributes(typeof(ActivityMetaDataAttribute), false).FirstOrDefault() as ActivityMetaDataAttribute;
                            var displayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                            var description = activity.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault() as DescriptionAttribute;
                            if (displayName == null || description == null) continue;

                            // Add the activity to the action category
                            actionCategory.Actions.Add(new NodeAction
                            {
                                Type = activityMetaData?.NodeType ?? "activityNode",
                                Name = activity.Name,
                                Label = displayName.DisplayName,
                                Description = description.Description,
                                DocsLink = activityMetaData?.DocsLink ?? "https://docs.aventisia.com",
                                Img = activityMetaData?.NodeImg ?? "/function.png",
                                Icon = activityMetaData?.NodeIcon ?? null
                            });
                        }

                        // Add the action category to the primary category
                        category.ActionCategories.Add(actionCategory);
                    }
                }
            }

            // Save the primary categories to JSON file
            // var outputFilePath = Path.Combine(outputDir, "_ActionSelectorData.json");
            var outputFilePath = Path.Combine(
                Environment.GetFolderPath(Environment.SpecialFolder.UserProfile),
                "Gitea",
                "Aventisia",
                "agent-builder",
                "src",
                "features",
                "action-selector",
                "constants",
                "_DevActionSelectorData.json"
            );

            using (var writer = new StreamWriter(outputFilePath))
            {
                var json = JsonConvert.SerializeObject(primaryCategories, Formatting.Indented, settings);
                writer.Write(json);
                Console.WriteLine($"Activities mapping JSON saved");
            }
        }
    }
}
