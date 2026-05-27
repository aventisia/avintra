using CodeActivitiesLibrary.Extensions;
using CodeActivityToJSON.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace CodeActivityToJSON.Utils
{
    public static class CreateActivitiesMappingJsonUtil
    {
        public static List<string> _excludedCategories = new List<string>
        {
            "CodeActivitiesLibrary.AppIntegrations.AzureActivities",
            "CodeActivitiesLibrary.AppIntegrations.OutlookActivities"
        };

        public static List<string> _excludedActivities = new List<string>
        {
            "InvokeSoapWebServiceActivity",
            "ConditionalBranchActivity",
        };

        public static void CreateActivitiesMappingJson(List<Type> categoryMetadataTypes, List<Type> activities)
        {
            // Get initial base files/folders path
            var baseJsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "BaseJSONs", "PrimaryCategory.json");
            var localAppDataPath = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);

            if (!File.Exists(baseJsonFilePath))
            {
                Console.WriteLine("Base JSON file not found at: " + baseJsonFilePath);
                return;
            }

            // Read base JSON files first
            var baseJsonContent = File.ReadAllText(baseJsonFilePath);

            var settings = new JsonSerializerSettings
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver(),
                NullValueHandling = NullValueHandling.Ignore
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
                    var activityCategoryMetadataAttribute = categoryMetadataType.GetCustomAttributes(typeof(ActivityCategoryMetadataAttribute), false).FirstOrDefault() as ActivityCategoryMetadataAttribute;
                    if (activityCategoryMetadataAttribute == null) continue;

                    // Skip excluded categories
                    if (_excludedCategories.Contains(categoryMetadataType.Namespace))
                    {
                        Console.WriteLine($"Skipping category {categoryMetadataType.Namespace} for prod mapping file");
                        continue;
                    }

                    // Check if the attribute is not null and matches the primary category
                    if (activityCategoryMetadataAttribute != null && activityCategoryMetadataAttribute.PrimaryCategory == category.Label)
                    {
                        // Create ActionCategory object
                        var actionCategory = new ActionCategory
                        {
                            Label = activityCategoryMetadataAttribute?.Label,
                            Description = activityCategoryMetadataAttribute?.Description,
                            Icon = activityCategoryMetadataAttribute?.Icon,
                            Img = activityCategoryMetadataAttribute?.Img,
                            ListType = activityCategoryMetadataAttribute?.ListType,
                            DoNotRenderIf = activityCategoryMetadataAttribute?.DoNotRenderIf != null ? activityCategoryMetadataAttribute?.DoNotRenderIf.Split(',').ToList() : null,
                            Actions = new List<NodeAction>()
                        };

                        // Find all activities that belong to this sub category
                        foreach (var activity in activities)
                        {
                            // Not the same namespace as the category metadata type
                            if (categoryMetadataType.Namespace != activity.Namespace) continue;

                            // Skip excluded activities
                            if (_excludedActivities.Contains(activity.Name))
                            {
                                Console.WriteLine($"Skipping activity {activity.Name} for Prod mapping file");
                                continue;
                            }

                            // Get the DisplayName and Description attributes from the activity
                            var activityMetaData = activity.GetCustomAttributes(typeof(ActivityMetaDataAttribute), false).FirstOrDefault() as ActivityMetaDataAttribute;
                            var displayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                            var description = activity.GetCustomAttributes(typeof(DescriptionAttribute), false).FirstOrDefault() as DescriptionAttribute;
                            if (displayName == null || description == null) continue;


                            var actionSupportedPlatforms = activityMetaData?.SupportedPlatforms != null ? activityMetaData?.SupportedPlatforms.Split(',').ToList() : activityCategoryMetadataAttribute.SupportedPlatforms.Split(',').ToList();

                            // Add the activity to the action category
                            actionCategory.Actions.Add(new NodeAction
                            {
                                Type = activityMetaData?.NodeType ?? "activityNode",
                                Name = activity.Name,
                                Label = displayName.DisplayName,
                                Description = description.Description,
                                DocsLink = activityMetaData?.DocsLink ?? "https://docs.aventisia.com",
                                Img = activityMetaData?.NodeImg ?? "/function.png",
                                Icon = activityMetaData?.NodeIcon ?? null,
                                SupportedPlatforms = actionSupportedPlatforms,
                                DoNotRenderIf = activityMetaData?.DoNotRenderIf != null ? activityMetaData?.DoNotRenderIf.Split(',').ToList() : null,
                            });

                            // Convert activity to JSON and save to file
                            // Skip if activity is ConditionalActivity. TODO: Find a better way to skip ConditionalActivity or generate json from it 
                            if (activity.Name == "ConditionalActivity" ||
                                activity.Name == "ConditionalBranchActivity" ||
                                activity.Name == "LoopActivity" ||
                                activity.Name == "GetWorkItemActivity")
                            {
                                continue;
                            }

                            // If any CodeActivity has no display name which means we don't want to generate JSON for it
                            var activityDisplayName = activity.GetCustomAttributes(typeof(DisplayNameAttribute), false).FirstOrDefault() as DisplayNameAttribute;
                            if (activityDisplayName == null || string.IsNullOrEmpty(activityDisplayName.DisplayName))
                            {
                                continue;
                            }

                            var json = ConvertActivityToJsonUtil.ConvertActivityToJson(activity, actionSupportedPlatforms);
                            if (string.IsNullOrEmpty(json) || json == "[]")
                            {
                                Console.WriteLine($"Failed to convert {activity.Name} to JSON.");
                                continue;
                            }

                            // --- STARTS (For documentation generation)

                            // Split the namespace to get the folder structure 
                            var namespaceParts = activity.Namespace.Replace("CodeActivitiesLibrary", "").Trim().Split('.');

                            // Loop through the namespace parts to create a directory structure
                            for (int i = 0; i < namespaceParts.Length; i++)
                            {
                                // If the part is empty, skip it
                                if (string.IsNullOrEmpty(namespaceParts[i]))
                                    continue;

                                // Replace "Activities" with an empty string
                                namespaceParts[i] = namespaceParts[i].Replace("Activities", "").Trim();

                                // Convert PascalCase to kebab-case (lowercase with hyphens)
                                namespaceParts[i] = Regex.Replace(namespaceParts[i], "(?<!^)([A-Z])", "-$1").ToLower();
                            }

                            //Directory.CreateDirectory(directoryPath);
                            //var fileName = Path.Combine(directoryPath, activityDisplayName.DisplayName + ".json");

                            // --- ENDS (For documentation generation)

                            // Replace \r\n with \n to ensure Unix line endings in the generated JSON files
                            var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");

                            // Create the file WSL2 repo (for form generation)
                            var fileName = Path.Combine($@"\\wsl$\Ubuntu\home\{Environment.UserName.ToLower()}\gitea\aventisia\worc-platform\clients\worc-web-legacy\studio\src\features\dynamic-config-panel\constants\config-json", activity.Name + ".json");
                            File.WriteAllText(fileName, jsonWithUnixLineEndings);

                            // Create the file in Windows repo (for form generation)
                            var repofileName = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "worc-web-legacy", "studio", "src", "features", "dynamic-config-panel", "constants", "config-json", activity.Name + ".json"));
                            File.WriteAllText(repofileName, jsonWithUnixLineEndings);

                            // Create the file in %LOCALAPPDATA%\AvintraDesktopApp\config-files\desktop-nodes (for form generation)
                            var localAppDatadesktopNodesOutputDir = Path.Combine(localAppDataPath, "AvintraDesktopApp", "config-files", "desktop-nodes");
                            Directory.CreateDirectory(localAppDatadesktopNodesOutputDir);
                            var localAppDataFileName = Path.Combine(localAppDatadesktopNodesOutputDir, activity.Name + ".json");
                            File.WriteAllText(localAppDataFileName, jsonWithUnixLineEndings);

                            // Create the file in worc-desktop-app\config-files\desktop-nodes (for form generation)
                            var winRepofileDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "worc-desktop-app", "src-tauri", "config-files", "desktop-nodes");
                            Directory.CreateDirectory(winRepofileDir);
                            var winRepofileName = Path.Combine(winRepofileDir, activity.Name + ".json");
                            File.WriteAllText(winRepofileName, jsonWithUnixLineEndings);
                        }

                        // Add the action category to the primary category
                        category.ActionCategories.Add(actionCategory);
                    }
                }
            }

            // Save the primary categories JSON file to wsl2
            var outputFilePath = $@"\\wsl$\Ubuntu\home\{Environment.UserName.ToLower()}\gitea\aventisia\worc-platform\clients\worc-web-legacy\studio\src\features\action-selector\constants\_ActionSelectorData.json";
            using (var writer = new StreamWriter(outputFilePath))
            {
                // Set NewLine to Unix line ending (LF)
                writer.NewLine = "\n";
                var json = JsonConvert.SerializeObject(primaryCategories, Formatting.Indented, settings);
                var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");
                writer.Write(jsonWithUnixLineEndings);
                Console.WriteLine($"Activities mapping JSON saved");
            }

            // Save the primary categories JSON file to Windows repo
            var repoOutputFilePath = Path.GetFullPath(Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "worc-web-legacy", "studio", "src", "features", "action-selector", "constants", "_ActionSelectorData.json"));
            using (var writer = new StreamWriter(repoOutputFilePath))
            {
                // Set NewLine to Unix line ending (LF)
                writer.NewLine = "\n";
                var json = JsonConvert.SerializeObject(primaryCategories, Formatting.Indented, settings);
                var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");
                writer.Write(jsonWithUnixLineEndings);
                Console.WriteLine($"Activities mapping JSON saved to Windows repo");
            }

            // Save the primary categories JSON file to %LOCALAPPDATA%\AvintraDesktopApp\config-files\action-selector
            var localAppDataActionSelectorOutputDir = Path.Combine(localAppDataPath, "AvintraDesktopApp", "config-files", "action-selector");
            Directory.CreateDirectory(localAppDataActionSelectorOutputDir);
            var localAppDataActionSelectorOutputFilePath = Path.Combine(localAppDataActionSelectorOutputDir, "_ActionSelectorData.json");
            using (var writer = new StreamWriter(localAppDataActionSelectorOutputFilePath))
            {
                // Set NewLine to Unix line ending (LF)
                writer.NewLine = "\n";
                var json = JsonConvert.SerializeObject(primaryCategories, Formatting.Indented, settings);
                var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");
                writer.Write(jsonWithUnixLineEndings);
                Console.WriteLine($"Activities mapping JSON saved to local app data");
            }

            // Save the primary categories JSON file to worc-desktop-app\config-files\action-selector
            var winRepoActionSelectorOutputDir = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "..", "worc-desktop-app", "src-tauri", "config-files", "action-selector");
            Directory.CreateDirectory(winRepoActionSelectorOutputDir);
            var winRepoActionSelectorOutputFilePath = Path.Combine(winRepoActionSelectorOutputDir, "_ActionSelectorData.json");
            using (var writer = new StreamWriter(winRepoActionSelectorOutputFilePath))
            {
                // Set NewLine to Unix line ending (LF)
                writer.NewLine = "\n";
                var json = JsonConvert.SerializeObject(primaryCategories, Formatting.Indented, settings);
                var jsonWithUnixLineEndings = json.Replace("\r\n", "\n");
                writer.Write(jsonWithUnixLineEndings);
                Console.WriteLine($"Activities mapping JSON saved to worc-desktop-app");
            }
        }
    }
}
